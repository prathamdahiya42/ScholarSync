import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getScholarshipById } from '@/lib/config-loader';
import { isDocumentRequired } from '@/lib/eligibility-engine/engine';
import { sendScholarshipNotification } from '@/lib/notifications';
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
      answers: true,
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

  const config = await getScholarshipById(app.scholarshipId);
  if (!config) {
    return NextResponse.json({ error: 'Scholarship config not found' }, { status: 404 });
  }

  const answerMap: Record<string, string> = {};
  app.answers.forEach((a) => {
    answerMap[a.questionId] = a.answer;
  });

  // 1. Identify which documents are required
  const requiredDocIds: string[] = [];
  (config.documents || []).forEach((doc: any) => {
    if (
      isDocumentRequired(
        doc,
        answerMap,
        {
          hasDisability: app.student.hasDisability,
          isHosteller: app.student.isHosteller
        }
      )
    ) {
      requiredDocIds.push(doc.id);
    }
  });

  // 2. Check each required document
  const uploadedTypeMap = new Map<string, any>();
  app.documents.forEach((d) => {
    uploadedTypeMap.set(d.docTypeId, d);
  });

  const missingDocs: string[] = [];
  const failingDocs: string[] = [];
  const unacknowledgedWarns: string[] = [];

  for (const docId of requiredDocIds) {
    const doc = uploadedTypeMap.get(docId);
    if (!doc) {
      missingDocs.push(docId);
      continue;
    }

    const latestCheck = doc.aiChecks[0];
    const status = latestCheck?.status || 'WARN';

    if (status === 'FAIL') {
      failingDocs.push(docId);
    } else if (status === 'WARN' && !doc.warnAcked) {
      unacknowledgedWarns.push(docId);
    }
  }

  if (missingDocs.length > 0) {
    return NextResponse.json(
      {
        error: `Missing required documents: ${missingDocs.join(', ')}. Please upload all mandatory certificates.`,
        missingDocs
      },
      { status: 400 }
    );
  }

  if (failingDocs.length > 0) {
    return NextResponse.json(
      {
        error: `Submission blocked: The following documents did not pass verification: ${failingDocs.join(', ')}. Please retake or replace them.`,
        failingDocs
      },
      { status: 400 }
    );
  }

  if (unacknowledgedWarns.length > 0) {
    return NextResponse.json(
      {
        error: `Please review and acknowledge the inspection notes on: ${unacknowledgedWarns.join(', ')} before submitting.`,
        unacknowledgedWarns
      },
      { status: 400 }
    );
  }

  // 3. State Machine Transition: -> SUBMITTED
  const updatedApp = await prisma.application.update({
    where: { id: app.id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date()
    }
  });

  // 4. Dispatch Submission Notification
  await sendScholarshipNotification({
    studentId: app.studentId,
    applicationId: app.id,
    scholarshipId: app.scholarshipId,
    event: 'APPLICATION_SUBMITTED'
  });

  // 5. Audit Log
  await logAudit({
    actorType: 'student',
    actorId: session.studentId,
    action: 'SUBMIT_APPLICATION',
    entity: 'Application',
    entityId: app.id
  });

  return NextResponse.json({
    success: true,
    message: 'Application submitted successfully to management review queue.',
    application: updatedApp
  });
}
