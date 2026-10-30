import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getScholarshipById } from '@/lib/config-loader';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';

const createSchema = z.object({
  scholarshipId: z.string().min(1)
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'student' || !session.studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { scholarshipId } = result.data;
    const config = await getScholarshipById(scholarshipId);

    if (!config) {
      return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    }

    let student: any = null;
    try {
      student = await prisma.student.findUnique({
        where: { id: session.studentId }
      });
    } catch {
      const { PERMANENT_DEMO_STUDENTS } = await import('@/lib/demo-store');
      student = PERMANENT_DEMO_STUDENTS[session.identifier] || PERMANENT_DEMO_STUDENTS['9876543210'];
    }

    if (!student) {
      const { PERMANENT_DEMO_STUDENTS } = await import('@/lib/demo-store');
      student = PERMANENT_DEMO_STUDENTS[session.identifier] || PERMANENT_DEMO_STUDENTS['9876543210'];
    }

    // SERVER-SIDE CATEGORY RULE ENFORCEMENT
    const mode = config.categoryRule?.mode;
    const norm = student.socialCategory.toUpperCase();

    if (mode === 'ST_ONLY' && norm !== 'ST') {
      return NextResponse.json(
        {
          error: `Category restriction: This scholarship is strictly for ST students. Your profile category is ${student.socialCategory}.`
        },
        { status: 403 }
      );
    }

    if (mode === 'ALLOWED_LIST') {
      const allowed = (config.categoryRule?.allowedCategories || []).map((c: string) => c.toUpperCase());
      if (!allowed.includes(norm)) {
        return NextResponse.json(
          {
            error: `Category restriction: Available only for ${allowed.join(', ')}. Your profile category is ${student.socialCategory}.`
          },
          { status: 403 }
        );
      }
    }

    // Check existing open application for this scholarship
    const existing = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        scholarshipId,
        status: { notIn: ['REJECTED'] }
      }
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        applicationId: existing.id,
        isExisting: true
      });
    }

    // Generate human-friendly ID: SCH-2026-XXXXXX
    const count = await prisma.application.count();
    const humanId = `SCH-2026-${String(count + 101).padStart(6, '0')}`;

    const app = await prisma.application.create({
      data: {
        id: humanId,
        studentId: student.id,
        scholarshipId: config.id,
        configVersion: config.schemaVersion || '1.0',
        status: 'DRAFT',
        type: 'fresh'
      }
    });

    await logAudit({
      actorType: 'student',
      actorId: student.id,
      action: 'CREATE_APPLICATION',
      entity: 'Application',
      entityId: app.id
    });

    return NextResponse.json({
      success: true,
      applicationId: app.id,
      isExisting: false
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student' || !session.studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { studentId: session.studentId },
    include: {
      scholarship: true,
      documents: { select: { id: true, docTypeId: true, version: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ applications });
}
