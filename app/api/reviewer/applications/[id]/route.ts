import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getScholarshipById } from '@/lib/config-loader';
import { decryptBankAccount } from '@/lib/crypto';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !['management_reviewer', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized: Reviewer access required' }, { status: 403 });
  }

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      answers: true,
      documents: {
        include: {
          aiChecks: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { uploadedAt: 'asc' }
      },
      crossChecks: true,
      reviews: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const config = await getScholarshipById(app.scholarshipId);

  // Transition SUBMITTED -> UNDER_REVIEW upon opening by reviewer
  if (app.status === 'SUBMITTED') {
    await prisma.application.update({
      where: { id: app.id },
      data: { status: 'UNDER_REVIEW' }
    });
    app.status = 'UNDER_REVIEW';
  }

  // Audit log document view
  await logAudit({
    actorType: 'reviewer',
    actorId: session.userId || 'reviewer',
    action: 'VIEW_APPLICATION',
    entity: 'Application',
    entityId: app.id
  });

  // Decrypt bank account for reviewer cross-check
  let decryptedAccount = '';
  if (app.student.bankAccountEnc) {
    decryptedAccount = decryptBankAccount(app.student.bankAccountEnc);
  }

  const checklist = config?.manualVerification?.levels?.[0]?.checklist || [
    'Verify student name matches government certificates',
    'Verify family annual income certificate from competent authority',
    'Verify Scheduled Tribe community against State notification',
    'Confirm bank account is linked to student/parent and active'
  ];

  return NextResponse.json({
    application: {
      ...app,
      student: {
        ...app.student,
        bankAccountEnc: undefined,
        decryptedAccountNumber: decryptedAccount
      }
    },
    config,
    checklist
  });
}
