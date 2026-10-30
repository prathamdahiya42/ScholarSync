import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getScholarshipById } from '@/lib/config-loader';
import { sendScholarshipNotification } from '@/lib/notifications';
import { logAudit } from '@/lib/audit';
import { z } from 'zod';

const reviewSchema = z.object({
  action: z.enum(['approve', 'mark_defective', 'reject']),
  reason: z.string().optional(),
  viewedDocIds: z.array(z.string()).default([]),
  checkedItems: z.array(z.string()).default([])
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !['management_reviewer', 'admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized: Reviewer role required' }, { status: 403 });
  }

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      documents: true
    }
  });

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { action, reason, viewedDocIds, checkedItems } = result.data;
    const config = await getScholarshipById(app.scholarshipId);
    const requiredChecklist = config?.manualVerification?.levels?.[0]?.checklist || [];

    // APPROVE GATE:
    // 1. Must have viewed all uploaded documents
    // 2. Must have ticked all checklist items
    if (action === 'approve') {
      const allDocIds = app.documents.map((d) => d.id);
      const unviewedDocs = allDocIds.filter((docId) => !viewedDocIds.includes(docId));

      if (unviewedDocs.length > 0) {
        return NextResponse.json(
          {
            error: 'Approval blocked: Reviewer must inspect and open every uploaded document before approving.',
            unviewedDocs
          },
          { status: 400 }
        );
      }

      const untickedItems = requiredChecklist.filter((item: string) => !checkedItems.includes(item));
      if (untickedItems.length > 0) {
        return NextResponse.json(
          {
            error: 'Approval blocked: Every manual verification checklist item must be verified and checked.',
            untickedItems
          },
          { status: 400 }
        );
      }

      await prisma.application.update({
        where: { id: app.id },
        data: {
          status: 'APPROVED',
          decidedAt: new Date(),
          decidedBy: session.userId || session.name,
          decisionReason: reason || 'All documents and eligibility criteria verified successfully.'
        }
      });

      await prisma.review.create({
        data: {
          applicationId: app.id,
          reviewerId: session.userId || 'reviewer',
          level: 'l1_verification',
          action: 'approve',
          checklistJson: JSON.stringify(checkedItems),
          reason: reason || 'Approved'
        }
      });

      await sendScholarshipNotification({
        studentId: app.studentId,
        applicationId: app.id,
        scholarshipId: app.scholarshipId,
        event: 'APPLICATION_APPROVED'
      });

      await logAudit({
        actorType: 'reviewer',
        actorId: session.userId || 'reviewer',
        action: 'APPROVE_APPLICATION',
        entity: 'Application',
        entityId: app.id
      });

      return NextResponse.json({ success: true, message: 'Application approved successfully.' });
    }

    if (action === 'mark_defective') {
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json(
          { error: 'A specific explanation is required when marking an application as defective.' },
          { status: 400 }
        );
      }

      await prisma.application.update({
        where: { id: app.id },
        data: {
          status: 'DEFECTIVE',
          defectiveNotes: reason,
          decidedAt: new Date(),
          decidedBy: session.userId || session.name
        }
      });

      await prisma.review.create({
        data: {
          applicationId: app.id,
          reviewerId: session.userId || 'reviewer',
          level: 'l1_verification',
          action: 'mark_defective',
          checklistJson: JSON.stringify(checkedItems),
          reason
        }
      });

      await sendScholarshipNotification({
        studentId: app.studentId,
        applicationId: app.id,
        scholarshipId: app.scholarshipId,
        event: 'APPLICATION_DEFECTIVE',
        reason
      });

      await logAudit({
        actorType: 'reviewer',
        actorId: session.userId || 'reviewer',
        action: 'MARK_APPLICATION_DEFECTIVE',
        entity: 'Application',
        entityId: app.id,
        meta: { reason }
      });

      return NextResponse.json({ success: true, message: 'Application marked as defective and sent back to student.' });
    }

    if (action === 'reject') {
      if (!reason || reason.trim().length < 5) {
        return NextResponse.json(
          { error: 'A formal rejection reason is required.' },
          { status: 400 }
        );
      }

      await prisma.application.update({
        where: { id: app.id },
        data: {
          status: 'REJECTED',
          decisionReason: reason,
          decidedAt: new Date(),
          decidedBy: session.userId || session.name
        }
      });

      await prisma.review.create({
        data: {
          applicationId: app.id,
          reviewerId: session.userId || 'reviewer',
          level: 'l1_verification',
          action: 'reject',
          checklistJson: JSON.stringify(checkedItems),
          reason
        }
      });

      await sendScholarshipNotification({
        studentId: app.studentId,
        applicationId: app.id,
        scholarshipId: app.scholarshipId,
        event: 'APPLICATION_REJECTED',
        reason
      });

      await logAudit({
        actorType: 'reviewer',
        actorId: session.userId || 'reviewer',
        action: 'REJECT_APPLICATION',
        entity: 'Application',
        entityId: app.id,
        meta: { reason }
      });

      return NextResponse.json({ success: true, message: 'Application rejected.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
