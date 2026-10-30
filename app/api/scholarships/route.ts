import { NextResponse } from 'next/server';
import { getAllScholarships } from '@/lib/config-loader';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  let studentCategory = 'GENERAL';

  if (session && session.role === 'student' && session.studentId) {
    try {
      const student = await prisma.student.findUnique({
        where: { id: session.studentId },
        select: { socialCategory: true }
      });
      if (student) {
        studentCategory = student.socialCategory;
      }
    } catch {
      studentCategory = 'ST';
    }
  }

  const allConfigs = await getAllScholarships();

  // Partition into applicable vs non-applicable based on categoryRule
  const applicable: any[] = [];
  const notForCategory: any[] = [];

  for (const item of allConfigs) {
    const mode = item.categoryRule?.mode;
    const norm = studentCategory.toUpperCase();

    if (mode === 'ST_ONLY') {
      if (norm === 'ST') {
        applicable.push({ ...item, isCategoryEligible: true });
      } else {
        notForCategory.push({
          ...item,
          isCategoryEligible: false,
          categoryReason: {
            en: 'Exclusively for Scheduled Tribe (ST) students. Your registered category is ' + studentCategory + '.',
            hi: 'केवल अनुसूचित जनजाति (ST) विद्यार्थियों के लिए। आपकी पंजीकृत श्रेणी ' + studentCategory + ' है।'
          }
        });
      }
    } else if (mode === 'ALLOWED_LIST') {
      const allowed = (item.categoryRule?.allowedCategories || []).map((c: string) => c.toUpperCase());
      if (allowed.includes(norm)) {
        applicable.push({ ...item, isCategoryEligible: true });
      } else {
        notForCategory.push({
          ...item,
          isCategoryEligible: false,
          categoryReason: {
            en: `Available for: ${allowed.join(', ')}. Your registered category is ${studentCategory}.`,
            hi: `केवल इनके लिए उपलब्ध: ${allowed.join(', ')}। आपकी पंजीकृत श्रेणी ${studentCategory} है।`
          }
        });
      }
    } else {
      // OPEN_TO_ALL
      applicable.push({ ...item, isCategoryEligible: true });
    }
  }

  return NextResponse.json({
    studentCategory,
    applicable,
    notForCategory
  });
}
