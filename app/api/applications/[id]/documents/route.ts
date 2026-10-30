import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { storageProvider, ocrProvider, documentExtractor } from '@/lib/providers';
import { analyzeImageQuality } from '@/lib/ai-pipeline/image-quality';
import { checkDocumentRules } from '@/lib/ai-pipeline/per-document-rules';
import { runCrossDocumentChecks } from '@/lib/ai-pipeline/cross-document-checks';
import { getScholarshipById } from '@/lib/config-loader';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== 'student' || !session.studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      documents: {
        include: { aiChecks: { orderBy: { createdAt: 'desc' }, take: 1 } }
      }
    }
  });

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  if (app.studentId !== session.studentId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check state machine: allow uploads only in DOCS_IN_PROGRESS, READY_TO_SUBMIT, or DEFECTIVE
  if (!['DOCS_IN_PROGRESS', 'READY_TO_SUBMIT', 'DEFECTIVE'].includes(app.status)) {
    return NextResponse.json(
      { error: `Cannot upload documents when application is in ${app.status} status.` },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const docTypeId = formData.get('docTypeId') as string | null;

    if (!file || !docTypeId) {
      return NextResponse.json({ error: 'Missing file or docTypeId parameter.' }, { status: 400 });
    }

    const config = await getScholarshipById(app.scholarshipId);
    const docConfig = config?.documents?.find((d: any) => d.id === docTypeId);

    if (!docConfig) {
      return NextResponse.json({ error: `Unknown document slot: ${docTypeId}` }, { status: 400 });
    }

    // 1. File Type and Size Validation
    const maxSizeMB = docConfig.maxSizeMB || 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File size exceeds the maximum allowed limit of ${maxSizeMB}MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || 'image/jpeg';

    // 2. Storage: Save in private storage outside public
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const storageFileName = `${app.id}_${docTypeId}_v${timestamp}.${ext}`;
    await storageProvider.put(storageFileName, buffer);

    // 3. Image Quality Analysis
    const qualityReport = await analyzeImageQuality(buffer, mime, config?.aiVerification?.imageQuality);

    // 4. OCR Extraction
    const ocrLangs = config?.aiVerification?.ocr?.languages || ['eng', 'hin'];
    const ocrResult = await ocrProvider.extractText(buffer, mime, ocrLangs);

    // 5. Structured Extraction
    const wantedFields = docConfig.ocrFields || ['name', 'number'];
    const extractedData = await documentExtractor.extract(buffer, mime, docTypeId, wantedFields, ocrResult.text);

    // 6. Per-Document Rules
    const incomeLimit = config?.eligibility?.income?.limitInr || 250000;
    const ruleEvaluation = checkDocumentRules(
      docTypeId,
      ocrResult.text,
      extractedData.fields,
      {
        fullName: app.student.fullName,
        fatherName: app.student.fatherName,
        dob: app.student.dob,
        domicileState: app.student.domicileState,
        currentClass: app.student.currentClass,
        schoolName: app.student.schoolName
      },
      incomeLimit
    );

    // Combine Quality & Rule status
    let finalStatus: 'PASS' | 'WARN' | 'FAIL' = ruleEvaluation.status;
    const studentMessages = [...ruleEvaluation.studentMessages];
    const reviewerFlags = [...ruleEvaluation.reviewerFlags];

    if (!qualityReport.isAcceptable) {
      if (qualityReport.issues.some((i) => i.includes('too dark') || i.includes('blurry'))) {
        finalStatus = finalStatus === 'FAIL' ? 'FAIL' : 'WARN';
      }
      qualityReport.issues.forEach((issue) => {
        studentMessages.push({ en: issue, hi: issue });
        reviewerFlags.push(`Quality alert: ${issue}`);
      });
    }

    if (finalStatus === 'PASS' && studentMessages.length === 0) {
      studentMessages.push({
        en: 'Document checked and readable.',
        hi: 'दस्तावेज़ की जाँच पूरी हुई और यह पठनीय है।'
      });
    }

    // 7. Save Document record (preserving previous version history)
    const existingDoc = app.documents.find((d) => d.docTypeId === docTypeId);
    const newVersion = existingDoc ? existingDoc.version + 1 : 1;

    const savedDoc = await prisma.document.create({
      data: {
        applicationId: app.id,
        docTypeId,
        storagePath: storageFileName,
        fileName: file.name,
        mime,
        sizeBytes: file.size,
        version: newVersion,
        warnAcked: false,
        aiChecks: {
          create: {
            status: finalStatus,
            confidence: extractedData.confidence || ocrResult.avgConfidence || 0.8,
            qualityJson: JSON.stringify(qualityReport),
            ocrText: ocrResult.text,
            extractedJson: JSON.stringify(ruleEvaluation.extractedFields),
            messagesJson: JSON.stringify(studentMessages),
            flagsJson: JSON.stringify(reviewerFlags)
          }
        }
      },
      include: {
        aiChecks: true
      }
    });

    // 8. Re-evaluate Cross-Document Checks across all current documents
    const allLatestDocs = await prisma.document.findMany({
      where: { applicationId: app.id },
      include: { aiChecks: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    const docExtracts = allLatestDocs
      .filter((d) => d.aiChecks.length > 0 && d.aiChecks[0].extractedJson)
      .map((d) => ({
        docTypeId: d.docTypeId,
        extractedFields: JSON.parse(d.aiChecks[0].extractedJson!)
      }));

    const crossChecks = runCrossDocumentChecks(
      {
        fullName: app.student.fullName,
        fatherName: app.student.fatherName,
        domicileState: app.student.domicileState
      },
      docExtracts
    );

    // Save cross checks
    if (crossChecks.length > 0) {
      await prisma.crossCheck.deleteMany({ where: { applicationId: app.id } });
      await prisma.crossCheck.createMany({
        data: crossChecks.map((cc) => ({
          applicationId: app.id,
          checkId: cc.checkId,
          status: cc.status,
          detailJson: JSON.stringify(cc.detail)
        }))
      });
    }

    await logAudit({
      actorType: 'student',
      actorId: session.studentId,
      action: 'UPLOAD_DOCUMENT',
      entity: 'Document',
      entityId: savedDoc.id,
      meta: { docTypeId, status: finalStatus, version: newVersion }
    });

    return NextResponse.json({
      success: true,
      document: savedDoc,
      aiCheck: savedDoc.aiChecks[0],
      crossChecks
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
