import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { validateScholarshipConfig } from '@/lib/schema-validator';
import { logAudit } from '@/lib/audit';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const scholarships = await prisma.scholarship.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({
    scholarships: scholarships.map((s) => ({
      ...s,
      name: JSON.parse(s.nameJson),
      config: JSON.parse(s.configJson)
    }))
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  try {
    const rawBody = await req.text();
    let jsonConfig: any;

    try {
      jsonConfig = JSON.parse(rawBody);
    } catch (parseErr) {
      return NextResponse.json(
        {
          error: 'Invalid JSON format. Please ensure the uploaded file contains syntactically valid JSON.',
          details: String(parseErr)
        },
        { status: 400 }
      );
    }

    // AJV Schema Validation
    const validation = validateScholarshipConfig(jsonConfig);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Scholarship JSON does not conform to scholarship.schema.json',
          validationErrors: validation.errors
        },
        { status: 400 }
      );
    }

    // Save to disk in config/scholarships/
    const configDir = path.join(process.cwd(), 'config/scholarships');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const fileName = `${jsonConfig.id}.json`;
    fs.writeFileSync(path.join(configDir, fileName), JSON.stringify(jsonConfig, null, 2));

    // Save/Upsert in Database
    const saved = await prisma.scholarship.upsert({
      where: { id: jsonConfig.id },
      update: {
        nameJson: JSON.stringify(jsonConfig.name),
        status: jsonConfig.status || 'active',
        academicYear: jsonConfig.academicYear || '2026-27',
        version: jsonConfig.schemaVersion || '1.0',
        configJson: JSON.stringify(jsonConfig)
      },
      create: {
        id: jsonConfig.id,
        nameJson: JSON.stringify(jsonConfig.name),
        status: jsonConfig.status || 'active',
        academicYear: jsonConfig.academicYear || '2026-27',
        version: jsonConfig.schemaVersion || '1.0',
        configJson: JSON.stringify(jsonConfig)
      }
    });

    await logAudit({
      actorType: 'admin',
      actorId: session.userId || 'admin',
      action: 'UPLOAD_SCHOLARSHIP_CONFIG',
      entity: 'Scholarship',
      entityId: saved.id,
      meta: { id: saved.id, version: saved.version }
    });

    return NextResponse.json({
      success: true,
      message: `Scholarship "${jsonConfig.id}" uploaded, validated, and activated with zero code changes.`,
      scholarship: saved
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
