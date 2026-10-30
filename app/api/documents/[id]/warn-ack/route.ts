import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session || session.role !== 'student' || !session.studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { application: true }
  });

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (doc.application.studentId !== session.studentId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.document.update({
    where: { id },
    data: { warnAcked: true }
  });

  return NextResponse.json({ success: true, message: 'Warning acknowledged.' });
}
