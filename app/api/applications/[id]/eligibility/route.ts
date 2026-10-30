import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getScholarshipById } from '@/lib/config-loader';
import { evaluateEligibility } from '@/lib/eligibility-engine/engine';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';

const answerSchema = z.object({
  answers: z.record(z.string(), z.string())
});

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
    include: { student: true }
  });

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  if (app.studentId !== session.studentId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Legal state check: DRAFT or ELIGIBILITY_FAILED can submit questionnaire
  if (!['DRAFT', 'ELIGIBILITY_FAILED'].includes(app.status)) {
    return NextResponse.json(
      { error: `Cannot evaluate eligibility from current state ${app.status}.` },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const result = answerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { answers } = result.data;
    const config = await getScholarshipById(app.scholarshipId);

    if (!config) {
      return NextResponse.json({ error: 'Scholarship config not found' }, { status: 404 });
    }

    // Evaluate answers with pure engine
    const evalResult = evaluateEligibility(config, answers, app.student.socialCategory);

    // Save/update answers in DB
    await prisma.eligibilityAnswer.deleteMany({
      where: { applicationId: app.id }
    });

    const answerRecords = Object.entries(answers).map(([qId, val]) => ({
      applicationId: app.id,
      questionId: qId,
      answer: val
    }));

    await prisma.eligibilityAnswer.createMany({
      data: answerRecords
    });

    // Compute benefits rate based on student profile
    const rates = config.benefits?.rates;
    const rateCategory = app.student.isHosteller ? 'hosteller' : 'dayScholar';
    const chosenRate = rates?.[rateCategory] || {};

    const benefitData = {
      category: rateCategory,
      currency: config.benefits?.currency || 'INR',
      monthly: chosenRate.monthly || 0,
      annual: chosenRate.annual || 0,
      booksGrant: chosenRate.booksAndAdhocGrant || 0,
      total: (chosenRate.annual || 0) + (chosenRate.booksAndAdhocGrant || 0)
    };

    // State Transition: DRAFT -> ELIGIBILITY_FAILED or DOCS_IN_PROGRESS
    const nextStatus = evalResult.eligible ? 'DOCS_IN_PROGRESS' : 'ELIGIBILITY_FAILED';

    await prisma.application.update({
      where: { id: app.id },
      data: {
        status: nextStatus,
        type: evalResult.applicationType,
        eligibilityResult: JSON.stringify(evalResult),
        benefitRate: JSON.stringify(benefitData)
      }
    });

    await logAudit({
      actorType: 'student',
      actorId: session.studentId,
      action: 'SUBMIT_ELIGIBILITY_QUESTIONNAIRE',
      entity: 'Application',
      entityId: app.id,
      meta: { eligible: evalResult.eligible, failedCount: evalResult.failedQuestions.length }
    });

    return NextResponse.json({
      success: true,
      eligible: evalResult.eligible,
      status: nextStatus,
      evalResult,
      benefitRate: benefitData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
