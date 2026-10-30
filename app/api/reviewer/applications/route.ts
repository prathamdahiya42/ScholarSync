import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getScholarshipById } from '@/lib/config-loader';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session || !['management_reviewer', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized: Reviewer access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  const whereClause: any = {};
  if (statusFilter && statusFilter !== 'ALL') {
    whereClause.status = statusFilter;
  } else {
    whereClause.status = { in: ['SUBMITTED', 'UNDER_REVIEW', 'DEFECTIVE', 'APPROVED', 'REJECTED'] };
  }

  let applications: any[] = [];
  try {
    applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            fullName: true,
            mobile: true,
            socialCategory: true,
            domicileState: true,
            currentClass: true,
            schoolName: true
          }
        },
        documents: { select: { id: true, docTypeId: true } },
        reviews: { take: 1, orderBy: { createdAt: 'desc' } }
      },
      orderBy: { submittedAt: 'asc' } // Oldest submitted first
    });
  } catch (dbErr) {
    const { PERMANENT_DEMO_APPLICATIONS } = await import('@/lib/demo-store');
    applications = PERMANENT_DEMO_APPLICATIONS;
  }

  // Calculate SLA for each application
  const items = await Promise.all(
    applications.map(async (app) => {
      const config = await getScholarshipById(app.scholarshipId);
      const slaDays = config?.manualVerification?.levels?.[0]?.slaDays || 7;

      let daysInQueue = 0;
      let isOverdue = false;
      let daysRemaining = slaDays;

      if (app.submittedAt) {
        const diffMs = Date.now() - new Date(app.submittedAt).getTime();
        daysInQueue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        daysRemaining = slaDays - daysInQueue;
        isOverdue = daysRemaining <= 0;
      }

      return {
        id: app.id,
        studentName: app.student.fullName,
        mobile: app.student.mobile,
        socialCategory: app.student.socialCategory,
        domicileState: app.student.domicileState,
        currentClass: app.student.currentClass,
        schoolName: app.student.schoolName,
        scholarshipId: app.scholarshipId,
        scholarshipName: config?.name?.en || app.scholarshipId,
        type: app.type,
        status: app.status,
        submittedAt: app.submittedAt,
        documentsCount: app.documents.length,
        slaDays,
        daysInQueue,
        daysRemaining,
        isOverdue
      };
    })
  );

  return NextResponse.json({ applications: items });
}
