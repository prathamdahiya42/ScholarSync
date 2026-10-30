export interface QuestionCondition {
  question?: string;
  profileQuestion?: string;
  equals?: string;
  notEquals?: string;
}

export interface QuestionnaireQuestion {
  id: string;
  text: { en: string; hi?: string };
  helpText?: { en: string; hi?: string };
  type: string;
  eligibleAnswer: 'yes' | 'no' | null;
  knockout?: boolean;
  skipIf?: QuestionCondition;
  failMessage?: { en: string; hi?: string };
  effect?: string;
}

export interface CategoryRule {
  mode: 'ST_ONLY' | 'OPEN_TO_ALL' | 'ALLOWED_LIST';
  allowedCategories?: string[];
  note?: string;
}

export interface ScholarshipConfig {
  id: string;
  categoryRule: CategoryRule;
  questionnaire: {
    answerType: string;
    questions: QuestionnaireQuestion[];
    resultRule?: string;
    onIneligible?: string;
  };
  [key: string]: any;
}

export interface EvaluationResult {
  eligible: boolean;
  categoryEligible: boolean;
  categoryFailureReason?: { en: string; hi: string };
  failedQuestions: Array<{
    id: string;
    text: { en: string; hi?: string };
    failMessage?: { en: string; hi?: string };
  }>;
  applicationType: 'fresh' | 'renewal';
  answeredCount: number;
}

/**
 * Pure evaluation function for scholarship eligibility
 */
export function evaluateEligibility(
  config: ScholarshipConfig,
  answers: Record<string, string>,
  studentCategory?: string
): EvaluationResult {
  const failedQuestions: EvaluationResult['failedQuestions'] = [];
  let categoryEligible = true;
  let categoryFailureReason: { en: string; hi: string } | undefined;

  // 1. Category Gate Check
  const catRule = config.categoryRule;
  if (studentCategory && catRule) {
    const normCat = studentCategory.toUpperCase();
    if (catRule.mode === 'ST_ONLY') {
      if (normCat !== 'ST') {
        categoryEligible = false;
        categoryFailureReason = {
          en: 'This scholarship is exclusively reserved for Scheduled Tribe (ST) students.',
          hi: 'यह छात्रवृत्ति केवल अनुसूचित जनजाति (ST) विद्यार्थियों के लिए आरक्षित है।'
        };
      }
    } else if (catRule.mode === 'ALLOWED_LIST') {
      const allowed = (catRule.allowedCategories || []).map((c) => c.toUpperCase());
      if (!allowed.includes(normCat)) {
        categoryEligible = false;
        categoryFailureReason = {
          en: `This scholarship is only available for: ${allowed.join(', ')}.`,
          hi: `यह छात्रवृत्ति केवल इनके लिए उपलब्ध है: ${allowed.join(', ')}।`
        };
      }
    } else if (catRule.mode === 'OPEN_TO_ALL') {
      categoryEligible = true;
    }
  }

  // 2. Evaluate Questions with Skip logic
  const questions = config.questionnaire?.questions || [];

  for (const q of questions) {
    // Check skip condition
    if (q.skipIf) {
      if (q.skipIf.question) {
        const targetVal = answers[q.skipIf.question];
        if (q.skipIf.equals !== undefined && targetVal === q.skipIf.equals) {
          continue; // Skipped
        }
        if (q.skipIf.notEquals !== undefined && targetVal !== q.skipIf.notEquals) {
          continue; // Skipped
        }
      }
    }

    const answer = answers[q.id];

    // Informational question (no eligibleAnswer specified)
    if (q.eligibleAnswer === null || q.eligibleAnswer === undefined) {
      continue;
    }

    // Knockout evaluation
    if (q.knockout) {
      if (!answer || answer !== q.eligibleAnswer) {
        failedQuestions.push({
          id: q.id,
          text: q.text,
          failMessage: q.failMessage || {
            en: 'Requirement not met.',
            hi: 'आवश्यकता पूरी नहीं हुई।'
          }
        });
      }
    }
  }

  // 3. Determine Application Type (fresh vs renewal)
  // For Pre-Matric ST, q_prev_awardee indicates renewal if yes
  const isRenewal = answers['q_prev_awardee'] === 'yes';
  const applicationType: 'fresh' | 'renewal' = isRenewal ? 'renewal' : 'fresh';

  const eligible = categoryEligible && failedQuestions.length === 0;

  return {
    eligible,
    categoryEligible,
    categoryFailureReason,
    failedQuestions,
    applicationType,
    answeredCount: Object.keys(answers).length
  };
}

/**
 * Check if a specific document is required given the questionnaire & profile answers
 */
export function isDocumentRequired(
  doc: {
    required: boolean;
    requiredIf?: QuestionCondition;
    requiredUnless?: QuestionCondition;
  },
  answers: Record<string, string>,
  profile: { hasDisability?: boolean; isHosteller?: boolean } = {}
): boolean {
  if (doc.requiredUnless) {
    if (doc.requiredUnless.question && answers[doc.requiredUnless.question] === doc.requiredUnless.equals) {
      return false;
    }
    if (doc.requiredUnless.profileQuestion) {
      if (doc.requiredUnless.profileQuestion === 'p_disability' && !profile.hasDisability) {
        return false;
      }
    }
  }

  if (doc.requiredIf) {
    if (doc.requiredIf.question && answers[doc.requiredIf.question] === doc.requiredIf.equals) {
      return true;
    }
    if (doc.requiredIf.profileQuestion) {
      if (doc.requiredIf.profileQuestion === 'p_disability' && profile.hasDisability) {
        return true;
      }
    }
    return false;
  }

  return doc.required;
}
