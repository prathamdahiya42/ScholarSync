import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || !['admin', 'management_reviewer'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const notifications = await prisma.notification.findMany({
    include: {
      student: { select: { fullName: true, mobile: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return NextResponse.json({ notifications });
}
