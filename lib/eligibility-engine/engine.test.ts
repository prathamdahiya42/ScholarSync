import { evaluateEligibility, type ScholarshipConfig } from './engine.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the pre-matric config
const configPath = path.join(__dirname, '../../config/scholarships/pre-matric-st.json');
const preMatricConfig: ScholarshipConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

export function runTests(): boolean {
  console.log('--- Starting Eligibility Engine Unit Tests ---');
  let passedCount = 0;
  let totalCount = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    totalCount++;
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${name} ${detail ? '- ' + detail : ''}`);
    }
  }

  // Base eligible answers for Pre-Matric ST
  const baseEligibleAnswers: Record<string, string> = {
    q_st: 'yes',
    q_class: 'yes',
    q_school: 'yes',
    q_orphan: 'no',
    q_income: 'yes',
    q_bank: 'yes',
    q_other: 'no',
    q_repeat: 'no',
    q_prev_awardee: 'no'
  };

  // Test 1: Eligible ST Class IX student
  const test1 = evaluateEligibility(preMatricConfig, baseEligibleAnswers, 'ST');
  assert(
    'Test 1: Eligible ST Class IX student',
    test1.eligible && test1.failedQuestions.length === 0 && test1.applicationType === 'fresh',
    JSON.stringify(test1)
  );

  // Test 2: Non-ST student fails q_st
  const answers2 = { ...baseEligibleAnswers, q_st: 'no' };
  const test2 = evaluateEligibility(preMatricConfig, answers2, 'ST');
  assert(
    'Test 2: Non-ST student fails q_st',
    !test2.eligible && test2.failedQuestions.some((q) => q.id === 'q_st')
  );

  // Test 3: Income "no" fails q_income
  const answers3 = { ...baseEligibleAnswers, q_income: 'no' };
  const test3 = evaluateEligibility(preMatricConfig, answers3, 'ST');
  assert(
    'Test 3: Income "no" fails q_income',
    !test3.eligible && test3.failedQuestions.some((q) => q.id === 'q_income')
  );

  // Test 4: Orphan skips income
  const answers4 = { ...baseEligibleAnswers, q_orphan: 'yes', q_income: 'no' };
  const test4 = evaluateEligibility(preMatricConfig, answers4, 'ST');
  assert(
    'Test 4: Orphan skips income (passes even if income is no/skipped)',
    test4.eligible && !test4.failedQuestions.some((q) => q.id === 'q_income')
  );

  // Test 5: Receiving another scholarship fails q_other
  const answers5 = { ...baseEligibleAnswers, q_other: 'yes' };
  const test5 = evaluateEligibility(preMatricConfig, answers5, 'ST');
  assert(
    'Test 5: Receiving another scholarship fails q_other',
    !test5.eligible && test5.failedQuestions.some((q) => q.id === 'q_other')
  );

  // Test 6: Repeating class fails q_repeat
  const answers6 = { ...baseEligibleAnswers, q_repeat: 'yes' };
  const test6 = evaluateEligibility(preMatricConfig, answers6, 'ST');
  assert(
    'Test 6: Repeating class fails q_repeat',
    !test6.eligible && test6.failedQuestions.some((q) => q.id === 'q_repeat')
  );

  // Test 7: Renewal without passing Class IX fails
  const answers7 = { ...baseEligibleAnswers, q_prev_awardee: 'yes', q_passed_ix: 'no' };
  const test7 = evaluateEligibility(preMatricConfig, answers7, 'ST');
  assert(
    'Test 7: Renewal without passing Class IX fails q_passed_ix',
    !test7.eligible &&
      test7.failedQuestions.some((q) => q.id === 'q_passed_ix') &&
      test7.applicationType === 'renewal'
  );

  // Test 8: Class XI student fails q_class
  const answers8 = { ...baseEligibleAnswers, q_class: 'no' };
  const test8 = evaluateEligibility(preMatricConfig, answers8, 'ST');
  assert(
    'Test 8: Class XI student fails q_class',
    !test8.eligible && test8.failedQuestions.some((q) => q.id === 'q_class')
  );

  // Category Gate Mode 1: ST_ONLY
  const catST_passes = evaluateEligibility(preMatricConfig, baseEligibleAnswers, 'ST');
  const catGeneral_fails = evaluateEligibility(preMatricConfig, baseEligibleAnswers, 'GENERAL');
  const catOBC_fails = evaluateEligibility(preMatricConfig, baseEligibleAnswers, 'OBC');
  assert('Category Gate ST_ONLY: ST passes', catST_passes.categoryEligible);
  assert('Category Gate ST_ONLY: GENERAL fails', !catGeneral_fails.categoryEligible && !catGeneral_fails.eligible);
  assert('Category Gate ST_ONLY: OBC fails', !catOBC_fails.categoryEligible && !catOBC_fails.eligible);

  // Category Gate Mode 2: OPEN_TO_ALL
  const openConfig: ScholarshipConfig = {
    ...preMatricConfig,
    categoryRule: { mode: 'OPEN_TO_ALL' }
  };
  const openGeneral = evaluateEligibility(openConfig, baseEligibleAnswers, 'GENERAL');
  const openST = evaluateEligibility(openConfig, baseEligibleAnswers, 'ST');
  const openOBC = evaluateEligibility(openConfig, baseEligibleAnswers, 'OBC');
  assert('Category Gate OPEN_TO_ALL: GENERAL passes', openGeneral.categoryEligible);
  assert('Category Gate OPEN_TO_ALL: ST passes', openST.categoryEligible);
  assert('Category Gate OPEN_TO_ALL: OBC passes', openOBC.categoryEligible);

  // Category Gate Mode 3: ALLOWED_LIST
  const listConfig: ScholarshipConfig = {
    ...preMatricConfig,
    categoryRule: { mode: 'ALLOWED_LIST', allowedCategories: ['SC', 'ST'] }
  };
  const listSC = evaluateEligibility(listConfig, baseEligibleAnswers, 'SC');
  const listST = evaluateEligibility(listConfig, baseEligibleAnswers, 'ST');
  const listOBC = evaluateEligibility(listConfig, baseEligibleAnswers, 'OBC');
  assert('Category Gate ALLOWED_LIST: SC passes', listSC.categoryEligible);
  assert('Category Gate ALLOWED_LIST: ST passes', listST.categoryEligible);
  assert('Category Gate ALLOWED_LIST: OBC fails', !listOBC.categoryEligible);

  console.log(`\nResults: ${passedCount}/${totalCount} tests passed.`);
  return passedCount === totalCount;
}

// Auto-run
const success = runTests();
process.exit(success ? 0 : 1);
