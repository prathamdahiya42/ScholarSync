import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { encryptBankAccount, maskBankAccount } from '@/lib/crypto';

const profileUpdateSchema = z.object({
  fullName: z.string().min(2),
  fatherName: z.string().min(2),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email().optional().or(z.literal('')),
  socialCategory: z.enum(['ST', 'SC', 'OBC', 'GENERAL', 'EWS', 'OTHER']),
  domicileState: z.string().min(2),
  district: z.string().min(2),
  currentClass: z.string().min(2),
  schoolName: z.string().min(2),
  isHosteller: z.boolean(),
  hasDisability: z.boolean(),
  disabilityType: z.string().optional(),
  aadhaarLast4: z.string().regex(/^\d{4}$/, 'Must provide exactly last 4 digits of Aadhaar'),
  bankAccountNumber: z.string().min(9).max(18).optional(),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  bankName: z.string().min(2),
  bankHolderName: z.string().min(2),
  language: z.enum(['en', 'hi']),
  parentConsent: z.boolean().refine((val) => val === true, 'Parent/guardian consent is required for minor students')
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'student' || !session.studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.studentId }
  });

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Never return encrypted or plain bank account! Return masked only.
  const { bankAccountEnc, ...safeProfile } = student;
  return NextResponse.json(safeProfile);
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'student' || !session.studentId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;
    const updateData: any = {
      fullName: data.fullName,
      fatherName: data.fatherName,
      dob: data.dob,
      gender: data.gender,
      email: data.email || null,
      socialCategory: data.socialCategory,
      domicileState: data.domicileState,
      district: data.district,
      currentClass: data.currentClass,
      schoolName: data.schoolName,
      isHosteller: data.isHosteller,
      hasDisability: data.hasDisability,
      disabilityType: data.disabilityType || null,
      aadhaarLast4: data.aadhaarLast4,
      ifsc: data.ifsc.toUpperCase(),
      bankName: data.bankName,
      bankHolderName: data.bankHolderName,
      language: data.language,
      guardianConsentAt: new Date()
    };

    if (data.bankAccountNumber && !data.bankAccountNumber.includes('X')) {
      updateData.bankAccountEnc = encryptBankAccount(data.bankAccountNumber);
      updateData.bankAccountMasked = maskBankAccount(data.bankAccountNumber);
    }

    const updated = await prisma.student.update({
      where: { id: session.studentId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      student: {
        id: updated.id,
        fullName: updated.fullName,
        socialCategory: updated.socialCategory,
        bankAccountMasked: updated.bankAccountMasked,
        guardianConsentAt: updated.guardianConsentAt
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
