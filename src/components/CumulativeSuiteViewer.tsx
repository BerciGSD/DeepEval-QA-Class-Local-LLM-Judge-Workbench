import React, { useState } from 'react';
import { CUMULATIVE_PROJECT_CODE } from '../data/curriculumData';
import { Play, Copy, Check, Terminal, FileCode, CheckCircle2, RotateCcw } from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

interface CumulativeSuiteViewerProps {
  onNavigateToParser?: () => void;
}

export const CumulativeSuiteViewer: React.FC<CumulativeSuiteViewerProps> = ({
  onNavigateToParser,
}) => {
  const { recordSuiteExecution } = useStudentProgress();
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'terminal'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(CUMULATIVE_PROJECT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSuite = () => {
    setIsRunning(true);
    setActiveTab('terminal');
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      recordSuiteExecution([
        {
          id: `run_${Date.now()}_1`,
          testName: 'test_customer_support_relevancy',
          metric: 'AnswerRelevancy',
          score: 0.88,
          cutoff: 0.70,
          passed: true,
          timestamp: nowStr,
        },
        {
          id: `run_${Date.now()}_2`,
          testName: 'test_rag_faithfulness_against_knowledge_base',
          metric: 'Faithfulness',
          score: 0.95,
          cutoff: 0.80,
          passed: true,
          timestamp: nowStr,
        },
        {
          id: `run_${Date.now()}_3`,
          testName: 'test_polite_tone_and_format_rubric',
          metric: 'GEval Empathy',
          score: 0.84,
          cutoff: 0.75,
          passed: true,
          timestamp: nowStr,
        },
      ]);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>Cumulative Project</span>
              <span>·</span>
              <span>tests/test_qa_suite.py</span>
              <span>·</span>
              <span>Pytest + DeepEval</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Production Test Suite Workspace
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              This running test file grows cumulatively across all modules. Rather than throwing
              isolated snippets away, each lesson refines and adds assertions to this single test suite.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-slate-300 bg-slate-850 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={handleRunSuite}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Executing via Local Judge...' : 'Run deepeval CLI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabbed Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Editor / Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>tests/test_qa_suite.py</span>
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTab === 'terminal'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>CLI Terminal Output {hasRun && '●'}</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Judge: Ollama (Offline) · Cost: $0.00
          </div>
        </div>

        {/* Tab 1: Python Code */}
        {activeTab === 'code' && (
          <div className="p-4 bg-slate-950">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto selection:bg-indigo-600/30">
              <code>{CUMULATIVE_PROJECT_CODE}</code>
            </pre>
          </div>
        )}

        {/* Tab 2: Simulated Terminal Output */}
        {activeTab === 'terminal' && (
          <div className="p-4 bg-slate-950 min-h-[420px] font-mono text-xs">
            {isRunning ? (
              <div className="space-y-2 text-indigo-400 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>$ deepeval test run tests/test_qa_suite.py</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  [Local Judge Engine] Loading weights into memory...
                </div>
                <div className="text-slate-400 text-[11px]">
                  [Ollama Provider] Evaluating test_customer_support_relevancy...
                </div>
              </div>
            ) : hasRun ? (
              <div className="space-y-3">
                <div className="text-slate-400">
                  <span className="text-emerald-400">$</span> deepeval test run tests/test_qa_suite.py
                </div>
                <div className="text-slate-500 text-[11px]">
                  ============================= test session starts ==============================<br />
                  platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0<br />
                  rootdir: /workspace/deepeval-qa-portfolio<br />
                  plugins: deepeval-1.2.0<br />
                  collected 3 items
                </div>

                <div className="py-2 space-y-2 border-y border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-300">
                      tests/test_qa_suite.py::test_customer_support_relevancy
                    </span>
                    <span className="text-emerald-400 font-bold">PASSED [ 33%]</span>
                  </div>
                  <div className="pl-4 text-[11px] text-slate-400 border-l border-slate-800 space-y-0.5">
                    <div>Metric: AnswerRelevancyMetric</div>
                    <div>Score: 0.88 (threshold: 0.70, evaluation: PASSED)</div>
                    <div className="text-slate-500">
                      Reason: The response directly addresses whether refurbished items can receive cash refunds and specifies store credit rules.
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-200 pt-2">
                    <span className="text-slate-300">
                      tests/test_qa_suite.py::test_rag_faithfulness_against_knowledge_base
                    </span>
                    <span className="text-emerald-400 font-bold">PASSED [ 66%]</span>
                  </div>
                  <div className="pl-4 text-[11px] text-slate-400 border-l border-slate-800 space-y-0.5">
                    <div>Metric: FaithfulnessMetric</div>
                    <div>Score: 1.00 (threshold: 0.80, evaluation: PASSED)</div>
                    <div className="text-slate-500">
                      Reason: All claims match reference documents regarding return shipping fees. Zero hallucinated claims detected.
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-200 pt-2">
                    <span className="text-slate-300">
                      tests/test_qa_suite.py::test_polite_tone_and_format_rubric
                    </span>
                    <span className="text-emerald-400 font-bold">PASSED [100%]</span>
                  </div>
                  <div className="pl-4 text-[11px] text-slate-400 border-l border-slate-800 space-y-0.5">
                    <div>Metric: GEval (Support Empathy Rubric)</div>
                    <div>Score: 0.92 (threshold: 0.75, evaluation: PASSED)</div>
                    <div className="text-slate-500">
                      Reason: Tone is apologetic and helpful without defensiveness. Clear 2-day resolution timeline provided within 3 sentences.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-emerald-400 font-bold">
                  <span>======================= 3 passed in 3.42s =======================</span>
                  <div className="flex items-center gap-3">
                    {onNavigateToParser && (
                      <button
                        onClick={onNavigateToParser}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
                      >
                        Analyze in Output Parser →
                      </button>
                    )}
                    <button
                      onClick={handleRunSuite}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-normal cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Re-run</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                <Terminal className="w-8 h-8 text-slate-600" />
                <div className="text-slate-400 text-sm">CLI Test Harness Ready</div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Click &ldquo;Run deepeval CLI&rdquo; above to execute the cumulative test suite
                  against the local judge and review test assertions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QA Concepts Mapping Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs font-semibold text-slate-200">
            ISTQB Test Fixtures ↔ RAG Context
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            `@pytest.fixture` functions supply mock knowledge bases (retrieval_context) without
            hitting live vector databases during local unit tests.
          </p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs font-semibold text-slate-200">
            assert_test ↔ Test Assertions
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            DeepEval&apos;s `assert_test()` checks the computed metric score against the metric
            threshold and integrates cleanly with pytest&apos;s runner.
          </p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs font-semibold text-slate-200">
            Boundary Thresholds (0.0 to 1.0)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tuning thresholds prevents false defect alerts. 0.70 is standard for relevancy, while
            0.80+ is recommended for factuality and compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
