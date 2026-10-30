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
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find document in database to verify ownership
  const doc = await prisma.document.findFirst({
    where: { storagePath: decodedPath },
    include: { application: true }
  });

  if (doc) {
    if (session.role === 'student' && doc.application.studentId !== session.studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.role !== 'student') {
      await logAudit({
        actorType: session.role === 'admin' ? 'admin' : 'reviewer',
        actorId: session.userId || 'reviewer',
        action: 'VIEW_DOCUMENT_FILE',
        entity: 'Document',
        entityId: doc.id
      });
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
    return NextResponse.json({ error: 'File not found on storage server' }, { status: 404 });
  }
}
