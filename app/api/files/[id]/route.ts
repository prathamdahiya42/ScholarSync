import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { storageProvider } from '@/lib/providers';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const decodedPath = decodeURIComponent(id);

  const session = await getSession();

  let doc: any = null;
  try {
    doc = await prisma.document.findFirst({
      where: { storagePath: decodedPath },
      include: { application: true }
    });
  } catch {
    doc = null;
  }

  if (doc) {
    if (session && session.role === 'student' && doc.application.studentId !== session.studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session && session.role !== 'student') {
      try {
        await logAudit({
          actorType: session.role === 'admin' ? 'admin' : 'reviewer',
          actorId: session.userId || 'reviewer',
          action: 'VIEW_DOCUMENT_FILE',
          entity: 'Document',
          entityId: doc.id
        });
      } catch {}
    }
  }

  try {
    const fileBuffer = await storageProvider.get(decodedPath);
    const mime = doc?.mime || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `inline; filename="${doc?.fileName || 'document'}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    // Demo failsafe for serverless environments
    try {
      const { getDemoApplicationDetail } = await import('@/lib/demo-store');
      const demoApp = getDemoApplicationDetail('app-demo-1001');
      const matchingDoc = demoApp.documents.find(
        (d: any) =>
          d.storagePath === decodedPath ||
          decodedPath.includes(d.id) ||
          d.fileName.toLowerCase() === decodedPath.toLowerCase()
      );

      if (matchingDoc) {
        const text = matchingDoc.aiChecks[0]?.ocrText || 'Official Government Certificate';
        return new NextResponse(Buffer.from(text, 'utf-8'), {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `inline; filename="${matchingDoc.fileName}"`
          }
        });
      }
    } catch {}

    return NextResponse.json({ error: 'File not found on storage server' }, { status: 404 });
  }
}
