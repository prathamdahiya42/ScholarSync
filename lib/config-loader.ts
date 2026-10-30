import fs from 'fs';
import path from 'path';
import { validateScholarshipConfig } from './schema-validator';
import { ScholarshipConfig } from './eligibility-engine/engine';
import { prisma } from './db';

const CONFIG_DIR = path.join(process.cwd(), 'config/scholarships');

let cachedConfigs: Map<string, ScholarshipConfig> = new Map();

/**
 * Loads all scholarship configs from disk and synchronizes them into the database
 */
export async function loadAndSyncScholarships(): Promise<ScholarshipConfig[]> {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const files = fs.readdirSync(CONFIG_DIR);
  const configs: ScholarshipConfig[] = [];

  for (const file of files) {
    if (file.endsWith('.json') && file !== 'scholarship.schema.json') {
      try {
        const fullPath = path.join(CONFIG_DIR, file);
        const raw = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(raw);

        const validation = validateScholarshipConfig(parsed);
        if (!validation.valid) {
          console.warn(`[ConfigLoader] Scholarship in ${file} failed validation:`, validation.errors);
          continue;
        }

        cachedConfigs.set(parsed.id, parsed);
        configs.push(parsed);

        // Sync to database if available
        try {
          await prisma.scholarship.upsert({
            where: { id: parsed.id },
            update: {
              nameJson: JSON.stringify(parsed.name),
              status: parsed.status || 'active',
              academicYear: parsed.academicYear || '2026-27',
              version: parsed.schemaVersion || '1.0',
              configJson: JSON.stringify(parsed)
            },
            create: {
              id: parsed.id,
              nameJson: JSON.stringify(parsed.name),
              status: parsed.status || 'active',
              academicYear: parsed.academicYear || '2026-27',
              version: parsed.schemaVersion || '1.0',
              configJson: JSON.stringify(parsed)
            }
          });
        } catch (dbErr) {
          // DB may not be seeded or migrated yet during cold boot
        }
      } catch (err) {
        console.error(`[ConfigLoader] Error loading config from ${file}:`, err);
      }
    }
  }

  return configs;
}

/**
 * Get scholarship by ID (from cache, DB, or disk)
 */
export async function getScholarshipById(id: string): Promise<ScholarshipConfig | null> {
  if (cachedConfigs.has(id)) {
    return cachedConfigs.get(id)!;
  }

  // Try DB
  try {
    const dbRecord = await prisma.scholarship.findUnique({ where: { id } });
    if (dbRecord) {
      const parsed = JSON.parse(dbRecord.configJson) as ScholarshipConfig;
      cachedConfigs.set(id, parsed);
      return parsed;
    }
  } catch (err) {
    // DB error fallback to file
  }

  // Try file directly
  const files = fs.readdirSync(CONFIG_DIR);
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'scholarship.schema.json') {
      try {
        const fullPath = path.join(CONFIG_DIR, file);
        const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (parsed.id === id) {
          cachedConfigs.set(id, parsed);
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return null;
}

/**
 * Get all active/visible scholarships
 */
export async function getAllScholarships(): Promise<ScholarshipConfig[]> {
  if (cachedConfigs.size === 0) {
    await loadAndSyncScholarships();
  }
  return Array.from(cachedConfigs.values());
}
