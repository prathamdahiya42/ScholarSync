import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  let profile = null;
  if (session.role === 'student' && session.studentId) {
    profile = await prisma.student.findUnique({
      where: { id: session.studentId },
      select: {
        id: true,
        fullName: true,
        fatherName: true,
        dob: true,
        gender: true,
        mobile: true,
        email: true,
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
        language: true,
        guardianConsentAt: true
      }
    });
  }

  return NextResponse.json({
    authenticated: true,
    session,
    profile
  });
}
