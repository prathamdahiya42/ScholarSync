import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { PERMANENT_DEMO_STUDENTS } from '@/lib/demo-store';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    let profile: any = null;
    if (session.role === 'student' && session.studentId) {
      try {
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
      } catch (dbErr) {
        profile = null;
      }

      if (!profile) {
        profile = PERMANENT_DEMO_STUDENTS[session.identifier] || {
          id: session.studentId,
          fullName: session.name,
          mobile: session.identifier,
          socialCategory: 'ST',
          domicileState: 'Jharkhand',
          district: 'Ranchi',
          currentClass: 'Class IX',
          schoolName: 'Govt Tribal High School, Khunti',
          isHosteller: false,
          hasDisability: false,
          aadhaarLast4: '4321',
          bankAccountMasked: 'XXXXXXXX4321',
          ifsc: 'SBIN0001234',
          bankName: 'State Bank of India',
          bankHolderName: session.name,
          language: 'en',
          guardianConsentAt: new Date().toISOString()
        };
      }
    }

    return NextResponse.json({
      authenticated: true,
      session,
      profile
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
