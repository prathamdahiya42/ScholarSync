import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { otpProvider } from '@/lib/providers';
import { prisma } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth/session';
import { encryptBankAccount, maskBankAccount } from '@/lib/crypto';

const verifySchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
  code: z.string().min(4).max(6)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { mobile, code } = result.data;
    const isValid = await otpProvider.verifyOtp(mobile, code);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP. For demo use 123456.' }, { status: 400 });
    }

    // Find or create student
    let student = await prisma.student.findUnique({ where: { mobile } });
    let isNew = false;

    if (!student) {
      isNew = true;
      student = await prisma.student.create({
        data: {
          mobile,
          fullName: 'New Student',
          fatherName: '',
          dob: '2010-01-01',
          gender: 'other',
          socialCategory: 'ST', // Default, prompt to update in profile
          domicileState: 'Jharkhand',
          district: '',
          currentClass: 'Class IX',
          schoolName: '',
          isHosteller: false,
          hasDisability: false,
          aadhaarLast4: '0000',
          bankAccountEnc: encryptBankAccount('0000000000'),
          bankAccountMasked: maskBankAccount('0000000000'),
          ifsc: '',
          bankName: '',
          bankHolderName: 'New Student',
          language: 'en'
        }
      });
    }

    await setSessionCookie({
      role: 'student',
      studentId: student.id,
      name: student.fullName,
      identifier: student.mobile
    });

    return NextResponse.json({
      success: true,
      isNew,
      student: {
        id: student.id,
        fullName: student.fullName,
        mobile: student.mobile,
        socialCategory: student.socialCategory,
        hasConsent: !!student.guardianConsentAt
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
