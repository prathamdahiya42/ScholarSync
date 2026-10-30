import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { mobile } = result.data;
    console.log(`🔑 [DEMO OTP] OTP generated for ${mobile}: 123456`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (Demo OTP: 123456)',
      mockOtp: '123456'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully (Demo OTP: 123456)',
      mockOtp: '123456'
    });
  }
}
