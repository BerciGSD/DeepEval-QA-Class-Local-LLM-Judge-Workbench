import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Brain,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

export interface QuizQuestion {
  id: string;
  moduleId: number;
  question: string;
  istqbConceptBridge: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    rationale: string;
  }[];
  deepExplanation: string;
}

const MODULE_QUIZZES: Record<number, { title: string; questions: QuizQuestion[] }> = {
  1: {
    title: 'Module 1 Checkpoint: 100% Local Environment & Test Harness',
    questions: [
      {
        id: 'm1_q1',
        moduleId: 1,
        question:
          'Why must enterprise QA teams often mandate 100% local LLM evaluation with Ollama rather than sending test cases to cloud API providers?',
        istqbConceptBridge:
          'ISTQB Test Environment Control & Data Confidentiality (ISO/IEC 29119)',
        options: [
          {
            id: 'a',
            text: 'Because cloud API providers do not support Python or Pytest test runners.',
            isCorrect: false,
            rationale:
              'Cloud APIs support Python SDKs, but the primary constraint is privacy and cost.',
          },
          {
            id: 'b',
            text: 'To avoid transmitting proprietary internal test data/PII externally and to eliminate per-token API cost during continuous CI/CD regression suites.',
            isCorrect: true,
            rationale:
              'Correct! Running continuous test suites against cloud APIs exposes internal knowledge bases and incurs unpredictable operational expenditure.',
          },
          {
            id: 'c',
            text: 'Because local models have zero score variance, while cloud models have high randomness.',
            isCorrect: false,
            rationale:
              'Incorrect. Smaller local models actually have higher variance than large cloud frontier models.',
          },
          {
            id: 'd',
            text: 'Because DeepEval cannot connect to internet endpoints.',
            isCorrect: false,
            rationale:
              'DeepEval supports cloud endpoints, but our offline setup guarantees complete air-gapped autonomy.',
          },
        ],
        deepExplanation:
          'In regulated industries (finance, healthcare, defense), automated regression suites run thousands of test cases per pull request. Sending proprietary company context over external APIs violates data governance policies and generates steep recurring token bills. Running 100% local via Ollama guarantees $0 variable cost and total test data containment.',
      },
      {
        id: 'm1_q2',
        moduleId: 1,
        question:
          'Why do we configure the local judge globally via "deepeval set-ollama" instead of hardcoding model="deepseek-r1:1.5b" in every metric instantiation?',
        istqbConceptBridge:
          'Test Automation Maintainability & Configuration Decoupling (ISO 25010)',
        options: [
          {
            id: 'a',
            text: 'Because hardcoding model parameters in test files tightly couples tests to specific developer hardware, breaking cross-platform portability.',
            isCorrect: true,
            rationale:
              'Correct! Decoupling environment configuration from test assertions allows a developer on 8GB RAM to use deepseek-r1:1.5b while a 32GB CI runner uses qwen2.5:14b without altering test code.',
          },
          {
            id: 'b',
            text: 'Because DeepEval throws a syntax error if model= is passed to metric constructors.',
            isCorrect: false,
            rationale:
              'DeepEval permits passing model=, but doing so violates maintainability best practices.',
          },
          {
            id: 'c',
            text: 'Because Ollama only allows one global model to exist on a machine.',
            isCorrect: false,
            rationale:
              'Ollama can store dozens of pulled models concurrently.',
          },
        ],
        deepExplanation:
          'Separating test logic from environment configuration is a core test automation principle. If 50 test cases hardcode a specific model string, switching models requires modifying 50 test files. A global CLI default keeps test code clean and environment-agnostic.',
      },
    ],
  },
  2: {
    title: 'Module 2 Checkpoint: Core Single-Turn Oracles & Grounding',
    questions: [
      {
        id: 'm2_q1',
        moduleId: 2,
        question:
          'From an ISTQB defect perspective, what is the precise distinction between FaithfulnessMetric and HallucinationMetric, and when do you use each?',
        istqbConceptBridge:
          'Test Oracles: Precision of Retrieved Facts vs Detection of Fabricated Claims',
        options: [
          {
            id: 'a',
            text: 'They are identical metrics with different names for backwards compatibility.',
            isCorrect: false,
            rationale: 'They calculate completely different mathematical ratios.',
          },
          {
            id: 'b',
            text: 'Faithfulness verifies that generated claims are substantiated by retrieval_context (factual precision), whereas Hallucination specifically identifies invented statements that contradict or exceed the provided reference context.',
            isCorrect: true,
            rationale:
              'Spot on! Faithfulness answers "Are the model claims backed by reference truth?", while Hallucination flags "Did the model invent unsubstantiated assertions?".',
          },
          {
            id: 'c',
            text: 'Faithfulness is only used for unit testing, while Hallucination is used for manual exploratory testing.',
            isCorrect: false,
            rationale: 'Both are automated metrics evaluated by LLM-as-a-judge.',
          },
        ],
        deepExplanation:
          'Faithfulness measures the ratio of claims in actual_output that can be directly derived from retrieval_context truths (truthful statements / total generated claims). Hallucination focuses on detecting ungrounded statements or outright contradictions. In RAG QA, Faithfulness is your primary acceptance gate.',
      },
      {
        id: 'm2_q2',
        moduleId: 2,
        question:
          'When tuning acceptance thresholds for AnswerRelevancyMetric, why might a QA Engineer choose 0.70 rather than a 1.00 zero-defect threshold?',
        istqbConceptBridge:
          'Boundary Value Analysis & False Positive vs False Negative Trade-offs',
        options: [
          {
            id: 'a',
            text: 'Because DeepEval algorithms cannot mathematically calculate scores above 0.80.',
            isCorrect: false,
            rationale: 'Scores are normalized 0.0 to 1.0.',
          },
          {
            id: 'b',
            text: 'Because natural language answers often contain polite conversational framing or clarifying caveats that drop mathematical similarity without degrading real-world user value.',
            isCorrect: true,
            rationale:
              'Exactly. A 1.00 threshold requires robotically minimal exact responses, triggering false alarms whenever the model adds helpful polite greetings.',
          },
          {
            id: 'c',
            text: 'Because local Ollama judges automatically cap scores at 0.70.',
            isCorrect: false,
            rationale: 'Local judges can output up to 1.00.',
          },
        ],
        deepExplanation:
          'Traditional QA tests use binary exact match (expected == actual). In generative AI testing, natural language possesses inherent variation. Setting a 1.00 boundary produces extreme false positives (failing valid polite responses), while setting 0.70 provides a robust boundary that catches real topic drift while accepting natural variations.',
      },
    ],
  },
  3: {
    title: 'Module 3 Checkpoint: Custom Rubrics with G-Eval',
    questions: [
      {
        id: 'm3_q1',
        moduleId: 3,
        question:
          'Why does G-Eval generate intermediate chain-of-thought grading steps rather than directly predicting a single numeric score?',
        istqbConceptBridge:
          'Evaluation Traceability, Auditability & Static Analysis Step Generation',
        options: [
          {
            id: 'a',
            text: 'Generating intermediate evaluation steps forces the judge model to reason systematically across criteria, significantly improving score reliability and explainability.',
            isCorrect: true,
            rationale:
              'Correct! Direct score prediction produces high hallucination in judges. Step-by-step reasoning mimics human rubric grading.',
          },
          {
            id: 'b',
            text: 'Because Pytest requires at least 3 sentences of output to pass an assertion.',
            isCorrect: false,
            rationale: 'Pytest only inspects the boolean return of the assertion.',
          },
          {
            id: 'c',
            text: 'To increase token execution time and delay test results.',
            isCorrect: false,
            rationale: 'It increases latency slightly, but the goal is scoring accuracy.',
          },
        ],
        deepExplanation:
          'When an LLM is asked to give a direct score (e.g. "Rate 1-5"), it relies on statistical probability rather than logical evaluation. G-Eval breaks down your plain-English criteria into an explicit rubric sequence: (1) Identify claims, (2) Evaluate constraint adherence, (3) Weight deviations, (4) Calculate score. This gives QA engineers full defect traceability.',
      },
      {
        id: 'm3_q2',
        moduleId: 3,
        question:
          'Why must you explicitly pass evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT] to a G-Eval instance?',
        istqbConceptBridge:
          'Test Oracle Input Scope & Information Boundary Restriction',
        options: [
          {
            id: 'a',
            text: 'To tell the judge model which specific parameters of the test case to inspect and evaluate against the rubric, preventing unnecessary context leakage.',
            isCorrect: true,
            rationale:
              'Correct! If you only evaluate tone of the response, passing retrieval_context or expected_output wastes judge tokens and can introduce reasoning bias.',
          },
          {
            id: 'b',
            text: 'Because Python lists cannot be empty in DeepEval.',
            isCorrect: false,
            rationale: 'This is an intentional API design for scoping test inputs.',
          },
        ],
        deepExplanation:
          'In testing, test oracles should only ingest the data needed to evaluate the specific quality attribute. Restricting parameters ensures the judge model focuses strictly on what matters (e.g., input query vs actual answer for tone, rather than confusing it with internal knowledge bases).',
      },
    ],
  },
  4: {
    title: 'Module 4 Checkpoint: Test Automation, Pytest & Score Variance',
    questions: [
      {
        id: 'm4_q1',
        moduleId: 4,
        question:
          'You notice a test case running on a local 1.5B judge passes with score 0.72 on Run 1, but fails with 0.68 on Run 2 (threshold: 0.70). What is the root cause and the QA engineering solution?',
        istqbConceptBridge:
          'Flakiness Root-Cause Analysis: Stochastic Evaluator Variance vs Application Defect',
        options: [
          {
            id: 'a',
            text: 'The test case has a fatal application defect and should be escalated as a blocker.',
            isCorrect: false,
            rationale:
              'The application output did not change; the judge score varied by only 0.04 across the threshold.',
          },
          {
            id: 'b',
            text: 'The local judge model exhibits stochastic variance around the boundary. Solution: Set judge temperature to 0.0, calibrate the boundary threshold slightly (e.g., 0.65), or implement retry tolerances.',
            isCorrect: true,
            rationale:
              'Spot on! Distinguishing between test flakiness caused by the evaluator vs actual defects in the system-under-test is crucial for AI QA Engineers.',
          },
          {
            id: 'c',
            text: 'Pytest is corrupted and needs reinstallation.',
            isCorrect: false,
            rationale: 'This is typical LLM-as-judge variance, not a pytest issue.',
          },
        ],
        deepExplanation:
          'Traditional tests are deterministic. In AI evaluation with small quantized local models, sampling temperature introduces minor score noise (±0.05). If your threshold is placed right at the center of the model score distribution, half the runs pass and half fail. Mitigate this by enforcing temperature=0, using tolerance bands, or retry plugins.',
      },
    ],
  },
  5: {
    title: 'Module 5 Checkpoint: Enterprise Deliverables & Test Governance',
    questions: [
      {
        id: 'm5_q1',
        moduleId: 5,
        question:
          'How does transitioning from manual LLM prompt testing to an automated DeepEval + Pytest suite change test coverage and reporting?',
        istqbConceptBridge:
          'Test Reporting, Continuous Regression & Test Automation ROI (ISTQB Chapter 5)',
        options: [
          {
            id: 'a',
            text: 'It eliminates the need for any human testing forever.',
            isCorrect: false,
            rationale:
              'Exploratory human testing remains valuable for UX and novel edge cases.',
          },
          {
            id: 'b',
            text: 'It transforms subjective, ad-hoc "eyeball" checks into quantifiable, reproducible quality gates executed automatically on every prompt change or RAG indexing update.',
            isCorrect: true,
            rationale:
              'Exactly. Automated evaluation turns qualitative vibes into auditable pass/fail metrics integrated into continuous delivery.',
          },
          {
            id: 'c',
            text: 'It guarantees the LLM will never hallucinate again.',
            isCorrect: false,
            rationale: 'Tests detect defects; they do not eliminate model non-determinism.',
          },
        ],
        deepExplanation:
          'Manual testing cannot scale across hundreds of prompt changes, model updates, and knowledge base revisions. An automated evaluation suite acts as a persistent regression safety net, detecting semantic drift and factual hallucinations before deployment.',
      },
    ],
  },
};

export const AssessmentPortal: React.FC = () => {
  const { progress, recordQuizResult } = useStudentProgress();
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(() => {
    const existing = progress.quizResults[1]?.answers;
    return existing || {};
  });
  const [submittedModules, setSubmittedModules] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    Object.keys(progress.quizResults).forEach((k) => {
      initial[Number(k)] = true;
    });
    return initial;
  });

  const quiz = MODULE_QUIZZES[selectedModule] || MODULE_QUIZZES[1];

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submittedModules[selectedModule]) return; // locked after submission until reset
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = () => {
    const scoreData = getModuleScore(selectedModule);
    setSubmittedModules((prev) => ({
      ...prev,
      [selectedModule]: true,
    }));
    recordQuizResult(
      selectedModule,
      scoreData.correct,
      scoreData.total,
      scoreData.passed,
      userAnswers
    );
  };

  const handleResetQuiz = () => {
    const updatedAnswers = { ...userAnswers };
    quiz.questions.forEach((q) => {
      delete updatedAnswers[q.id];
    });
    setUserAnswers(updatedAnswers);
    setSubmittedModules((prev) => ({
      ...prev,
      [selectedModule]: false,
    }));
  };

  const getModuleScore = (moduleId: number) => {
    const modQuiz = MODULE_QUIZZES[moduleId];
    if (!modQuiz) return { correct: 0, total: 0, passed: false };
    let correct = 0;
    modQuiz.questions.forEach((q) => {
      const selected = userAnswers[q.id];
      const opt = q.options.find((o) => o.id === selected);
      if (opt && opt.isCorrect) correct++;
    });
    const total = modQuiz.questions.length;
    return {
      correct,
      total,
      passed: correct === total,
    };
  };

  const isSubmitted = !!submittedModules[selectedModule];
  const currentScore = getModuleScore(selectedModule);
  const allAnswered = quiz.questions.every((q) => !!userAnswers[q.id]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>Assessment Portal</span>
              <span>·</span>
              <span>Understanding the &ldquo;Why&rdquo; Before the &ldquo;How&rdquo;</span>
              <span>·</span>
              <span>ISTQB Concept Gates</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Module Conceptual Mastery Checkpoints
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Verify your comprehension of test oracles, boundary values, air-gapped test harnesses,
              and evaluator variance before progressing across modules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-right">
              <div className="text-[11px] text-slate-400">Current Module Score</div>
              <div className="text-sm font-bold font-mono text-indigo-300">
                {isSubmitted
                  ? `${currentScore.correct} / ${currentScore.total} Passed`
                  : `${quiz.questions.length} Questions`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Selector Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((mNum) => {
          const score = getModuleScore(mNum);
          const submitted = !!submittedModules[mNum];
          const isSelected = selectedModule === mNum;

          return (
            <button
              key={mNum}
              onClick={() => setSelectedModule(mNum)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-slate-300">
                  Module 0{mNum}
                </span>
                {submitted && score.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : submitted ? (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {mNum === 1
                  ? 'Local Setup'
                  : mNum === 2
                  ? 'Core Oracles'
                  : mNum === 3
                  ? 'G-Eval Rubrics'
                  : mNum === 4
                  ? 'Automation'
                  : 'Portfolio'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quiz Questions Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">{quiz.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the best answer for each conceptual QA challenge.
            </p>
          </div>

          {isSubmitted && (
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry Quiz</span>
            </button>
          )}
        </div>

        {/* Questions list */}
        <div className="space-y-8">
          {quiz.questions.map((q, qIndex) => {
            const selectedOptId = userAnswers[q.id];

            return (
              <div key={q.id} className="space-y-4">
                {/* Question title & ISTQB concept bridge */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 shrink-0 mt-0.5">
                      Q{qIndex + 1}.
                    </span>
                    <span className="text-sm font-semibold text-slate-100 leading-snug">
                      {q.question}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-amber-400/90 pl-6">
                    ISTQB Bridge: {q.istqbConceptBridge}
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-2 pl-6">
                  {q.options.map((opt) => {
                    const isSelected = selectedOptId === opt.id;
                    let optionStyle =
                      'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60';

                    if (isSubmitted) {
                      if (opt.isCorrect) {
                        optionStyle =
                          'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                      } else if (isSelected && !opt.isCorrect) {
                        optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                      } else {
                        optionStyle = 'bg-slate-950/40 border-slate-800/40 text-slate-600';
                      }
                    } else if (isSelected) {
                      optionStyle =
                        'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-sm';
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
                      >
                        <span className="font-mono font-bold uppercase shrink-0 mt-0.5">
                          {opt.id}.
                        </span>
                        <div className="flex-1 space-y-1">
                          <div>{opt.text}</div>
                          {isSubmitted && isSelected && (
                            <div className="text-[11px] font-mono mt-1 opacity-90">
                              Rationale: {opt.rationale}
                            </div>
                          )}
                        </div>
                        {isSubmitted && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {isSubmitted && isSelected && !opt.isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Deep QA Explanation revealed on submission */}
                {isSubmitted && (
                  <div className="ml-6 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Senior AI Quality Engineer Deep Dive:</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {q.deepExplanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Bottom Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isSubmitted ? (
              <span className="font-mono">
                Status:{' '}
                {currentScore.passed ? (
                  <strong className="text-emerald-400">Module Passed! Concept Retained.</strong>
                ) : (
                  <strong className="text-rose-400">Review Rationale Above and Retry.</strong>
                )}
              </span>
            ) : (
              <span>Answer all questions to unlock the explanation and check your mastery.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                Submit Answers & Evaluate
              </button>
            ) : (
              selectedModule < 5 && (
                <button
                  onClick={() => setSelectedModule((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <span>Proceed to Module 0{selectedModule + 1} Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
