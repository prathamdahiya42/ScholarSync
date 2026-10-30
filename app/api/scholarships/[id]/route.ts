import { NextRequest, NextResponse } from 'next/server';
import { getScholarshipById } from '@/lib/config-loader';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const config = await getScholarshipById(id);

  if (!config) {
    return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
  }

  // Check category rule against current student
  const session = await getSession();
  let isCategoryEligible = true;
  let categoryNote = '';

  if (session && session.role === 'student' && session.studentId) {
    const student = await prisma.student.findUnique({
      where: { id: session.studentId },
      select: { socialCategory: true }
    });
    if (student) {
      const mode = config.categoryRule?.mode;
      const cat = student.socialCategory.toUpperCase();
      if (mode === 'ST_ONLY' && cat !== 'ST') {
        isCategoryEligible = false;
        categoryNote = `This scheme is exclusively for ST students. Your profile category is ${student.socialCategory}.`;
      } else if (mode === 'ALLOWED_LIST') {
        const allowed = (config.categoryRule?.allowedCategories || []).map((c: string) => c.toUpperCase());
        if (!allowed.includes(cat)) {
          isCategoryEligible = false;
          categoryNote = `This scheme is for ${allowed.join(', ')}. Your profile category is ${student.socialCategory}.`;
        }
      }
    }
  }

  return NextResponse.json({
    config,
    isCategoryEligible,
    categoryNote
  });
}
