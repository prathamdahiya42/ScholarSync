'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export default function EligibilityQuestionnairePage() {
  const { id } = useParams() as { id: string };
  const { t, lang } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [evalResult, setEvalResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setAppData(data.application);
          setConfig(data.config);

          // Populate existing answers if any
          const ansMap: Record<string, string> = {};
          data.application.answers?.forEach((a: any) => {
            ansMap[a.questionId] = a.answer;
          });
          setAnswers(ansMap);

          if (data.application.eligibilityResult) {
            try {
              const parsed = JSON.parse(data.application.eligibilityResult);
              setEvalResult(parsed);
            } catch (e) {}
          }
        }
      })
      .catch((err) => toast.error('Failed to load questionnaire'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !config) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-slate-500">
        Loading questionnaire...
      </div>
    );
  }

  // Combine questionnaire questions
  const allQuestions = config.questionnaire?.questions || [];

  // Compute active question list handling skipIf logic dynamically
  const activeQuestions = allQuestions.filter((q: any) => {
    if (q.skipIf && q.skipIf.question) {
      const targetVal = answers[q.skipIf.question];
      if (q.skipIf.equals !== undefined && targetVal === q.skipIf.equals) {
        return false;
      }
      if (q.skipIf.notEquals !== undefined && targetVal !== q.skipIf.notEquals) {
        return false;
      }
    }
    return true;
  });

  const currentQ = activeQuestions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

  const handleAnswer = (val: 'yes' | 'no') => {
    const updated = { ...answers, [currentQ.id]: val };
    setAnswers(updated);

    // If more questions, advance to next
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed last question, submit for evaluation
      submitEvaluation(updated);
    }
  };

  const submitEvaluation = async (answersToSubmit: Record<string, string>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${id}/eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersToSubmit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvalResult(data.evalResult);

      if (data.eligible) {
        toast.success('Congratulations! You are eligible for this scholarship.');
        setTimeout(() => {
          router.push(`/student/applications/${id}/documents`);
        }, 1200);
      } else {
        toast.error('Eligibility criteria not met.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Evaluation error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setEvalResult(null);
    setCurrentIndex(0);
    setAnswers({});
  };

  // Render Result Screen if evaluated
  if (evalResult) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md text-center glow-card">
          {evalResult.eligible ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#D62828] border border-red-100 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                You are Eligible!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Based on your self-declaration answers, you meet all core guidelines for the{' '}
                <strong>{t(config.name)}</strong> ({evalResult.applicationType === 'renewal' ? 'Renewal' : 'Fresh'} Applicant).
              </p>
              <div className="pt-4">
                <button
                  onClick={() => router.push(`/student/applications/${id}/documents`)}
                  className="w-full py-3 px-6 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-red-600/20 active:scale-[0.98]"
                >
                  <span>Proceed to Document Upload</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-left">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#D62828] border border-red-100 flex items-center justify-center shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Not Eligible Under Current Guidelines
                  </h2>
                  <p className="text-xs text-slate-500">
                    Your answers do not satisfy the statutory criteria for this specific scheme.
                  </p>
                </div>
              </div>

              {/* Specific plain language failure reasons */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Unmet Criteria:
                </span>
                {evalResult.failedQuestions?.map((fq: any) => (
                  <div
                    key={fq.id}
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs"
                  >
                    <span className="font-semibold text-red-950 block mb-0.5">
                      Question: {t(fq.text)}
                    </span>
                    <p className="text-[#B91C1C] font-medium">
                      Reason: {t(fq.failMessage)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-slate-200 text-xs text-slate-600 space-y-1">
                <strong>Next Steps / Alternate Schemes:</strong>
                <p>
                  If you are in Class XI or XII, please browse the <strong>Post-Matric ST Scholarship</strong>. If your family income has changed or was misentered, you can retake the questionnaire.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Questionnaire</span>
                </button>
                <button
                  onClick={() => router.push('/student/catalog')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <span>Explore Other Scholarships</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Questionnaire Screen (One Question Per Screen)
  return (
    <div className="max-w-xl mx-auto py-6 sm:py-12">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden glow-card">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>
              Question {currentIndex + 1} of {activeQuestions.length}
            </span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D62828] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Question */}
        <div className="min-h-[160px] flex flex-col justify-center my-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-[#D62828] border border-red-100 text-[11px] font-bold w-fit mb-3">
            <Sparkles className="w-3 h-3" />
            Eligibility Assessment
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {t(currentQ.text)}
          </h2>

          {currentQ.helpText && (
            <p className="text-xs text-slate-500 mt-3 p-3 rounded-xl bg-[#F8F9FB] border border-slate-100 leading-relaxed">
              💡 {t(currentQ.helpText)}
            </p>
          )}
        </div>

        {/* Big Touch Yes / No Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => handleAnswer('yes')}
            disabled={submitting}
            className={`py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 border-2 active:scale-[0.98] ${
              answers[currentQ.id] === 'yes'
                ? 'bg-[#D62828] text-white border-[#D62828] shadow-lg shadow-red-600/30'
                : 'border-slate-200 hover:border-[#D62828] hover:bg-red-50/50 text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>YES / हाँ</span>
          </button>

          <button
            onClick={() => handleAnswer('no')}
            disabled={submitting}
            className={`py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 border-2 active:scale-[0.98] ${
              answers[currentQ.id] === 'no'
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/30'
                : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800'
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>NO / नहीं</span>
          </button>
        </div>

        {/* Back / Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0 || submitting}
            className="flex items-center gap-1 hover:text-slate-900 disabled:opacity-30"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Question</span>
          </button>
          <span>Self-declaration mode</span>
        </div>
      </div>
    </div>
  );
}
