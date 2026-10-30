import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth/session';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    // Direct permanent demo staff credentials (zero DB required on Vercel)
    if (email === 'admin@demo.local' && password === 'Admin@123') {
      await setSessionCookie({
        role: 'admin',
        userId: 'demo-admin-id',
        name: 'Platform Admin',
        identifier: 'admin@demo.local'
      });
      return NextResponse.json({
        success: true,
        user: { id: 'demo-admin-id', email, name: 'Platform Admin', role: 'admin' }
      });
    }

    if (email === 'reviewer@demo.local' && password === 'Reviewer@123') {
      await setSessionCookie({
        role: 'management_reviewer',
        userId: 'demo-reviewer-id',
        name: 'Verification Officer',
        identifier: 'reviewer@demo.local'
      });
      return NextResponse.json({
        success: true,
        user: { id: 'demo-reviewer-id', email, name: 'Verification Officer', role: 'management_reviewer' }
      });
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch {
      // Ignore DB errors
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password. Use reviewer@demo.local / Reviewer@123 for demo.' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.passwordHash).catch(() => false);
    if (!match) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    await setSessionCookie({
      role: user.role as 'admin' | 'management_reviewer',
      userId: user.id,
      name: user.name,
      identifier: user.email
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
