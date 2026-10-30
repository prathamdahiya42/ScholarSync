import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getScholarshipById } from '@/lib/config-loader';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  let app: any = null;
  try {
    app = await prisma.application.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            fatherName: true,
            dob: true,
            gender: true,
            mobile: true,
            socialCategory: true,
            domicileState: true,
            district: true,
            currentClass: true,
            schoolName: true,
            isHosteller: true,
            hasDisability: true,
            disabilityType: true,
            aadhaarLast4: true,
            bankAccountMasked: true,
            ifsc: true,
            bankName: true,
            bankHolderName: true,
            guardianConsentAt: true
          }
        },
        answers: true,
        documents: {
          include: {
            aiChecks: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { uploadedAt: 'desc' }
        },
        crossChecks: true,
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  } catch (dbErr) {
    app = null;
  }

  if (!app) {
    const { getDemoApplicationDetail } = await import('@/lib/demo-store');
    app = getDemoApplicationDetail(id);
  }

  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  let config: any = null;
  try {
    config = await getScholarshipById(app.scholarshipId);
  } catch {}

  return NextResponse.json({
    application: app,
    config
  });
}
