import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';

let ajvInstance: Ajv | null = null;
let validateScholarshipSchema: any = null;

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    schemaPath: string;
    params?: any;
  }>;
}

/**
 * Initializes and caches AJV validator for scholarship configurations
 */
export function getValidator() {
  if (validateScholarshipSchema) {
    return validateScholarshipSchema;
  }

  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    verbose: true
  });
  addFormats(ajv);

  const schemaPath = path.join(process.cwd(), 'config/scholarships/scholarship.schema.json');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const rawSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  validateScholarshipSchema = ajv.compile(rawSchema);
  ajvInstance = ajv;

  return validateScholarshipSchema;
}

/**
 * Validate a scholarship JSON object against scholarship.schema.json
 */
export function validateScholarshipConfig(data: unknown): ValidationResult {
  const validator = getValidator();
  const valid = validator(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validator.errors || []).map((err: ErrorObject) => {
    const field = err.instancePath ? err.instancePath.replace(/^\//, '').replace(/\//g, '.') : (err.params as any)?.missingProperty || 'root';
    return {
      field,
      message: err.message || 'Validation error',
      schemaPath: err.schemaPath,
      params: err.params
    };
  });

  return { valid: false, errors };
}
