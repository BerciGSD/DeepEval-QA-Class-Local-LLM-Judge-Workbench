import React, { useState } from 'react';
import { METRIC_DEFINITIONS } from '../data/curriculumData';
import { Sliders, CheckCircle2, XCircle, Sparkles, RefreshCw, Layers, GitCompare } from 'lucide-react';
import { ModelVarianceComparator } from './ModelVarianceComparator';
import { useStudentProgress } from '../context/ProgressContext';

export const MetricSandbox: React.FC = () => {
  const { recordMetricMeasurement } = useStudentProgress();
  const [sandboxMode, setSandboxMode] = useState<'single' | 'variance'>('single');
  const [selectedMetricId, setSelectedMetricId] = useState<string>('answer_relevancy');
  const [inputVal, setInputVal] = useState<string>(
    'How do I cancel my subscription before next billing cycle?'
  );
  const [outputVal, setOutputVal] = useState<string>(
    'Go to Account > Billing and click "Cancel Subscription". You will retain access until the end of the current billing cycle.'
  );
  const [contextVal, setContextVal] = useState<string>(
    'Subscriptions can be canceled anytime under Account Settings > Billing. Access remains active through the current paid period. No prorated refunds are issued.'
  );
  const [threshold, setThreshold] = useState<number>(0.7);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    passed: boolean;
    reason: string;
    steps: string[];
  } | null>(null);

  const currentMetric =
    METRIC_DEFINITIONS.find((m) => m.id === selectedMetricId) || METRIC_DEFINITIONS[0];

  const handleRunEval = () => {
    setIsEvaluating(true);
    setEvalResult(null);

    setTimeout(() => {
      let simulatedScore = 0.85;
      let steps: string[] = [];
      let reason = '';

      if (selectedMetricId === 'answer_relevancy') {
        const isRelated =
          outputVal.toLowerCase().includes('cancel') || outputVal.toLowerCase().includes('billing');
        simulatedScore = isRelated ? 0.92 : 0.25;
        steps = [
          'Step 1: Extract main user intent -> Intent: "Cancel recurring subscription"',
          'Step 2: Parse statements in actual_output -> Identified navigation path and cycle access statement',
          'Step 3: Measure semantic overlap -> Output strictly satisfies the user query without extraneous topic drift',
        ];
        reason = isRelated
          ? 'The response directly addresses where and how to cancel the subscription and clarifies billing cycle retention.'
          : 'The response discusses unrelated topics and fails to answer how to cancel the subscription.';
      } else if (selectedMetricId === 'faithfulness') {
        const hasMatch =
          outputVal.toLowerCase().includes('retain access') ||
          outputVal.toLowerCase().includes('billing cycle');
        simulatedScore = hasMatch ? 0.95 : 0.35;
        steps = [
          'Step 1: Extract atomic factual claims from actual_output -> Claim A: "Go to Account > Billing", Claim B: "Retain access until end of cycle"',
          'Step 2: Cross-verify each claim against retrieval_context -> Claim A verified in text; Claim B verified in text',
          'Step 3: Calculate factual precision -> 2/2 claims grounded in source documents',
        ];
        reason = hasMatch
          ? 'All statements in actual_output are corroborated by retrieval_context truths. 100% faithfulness.'
          : 'Actual output contains unverified statements not present in the provided retrieval_context.';
      } else if (selectedMetricId === 'hallucination') {
        const mentionsDiscount = outputVal.toLowerCase().includes('refund');
        simulatedScore = mentionsDiscount ? 0.3 : 0.9;
        steps = [
          'Step 1: Identify context boundaries from reference knowledge',
          'Step 2: Search for hallucinated claims absent or conflicting with context',
          'Step 3: Compute hallucination score (inverted: higher is cleaner)',
        ];
        reason =
          simulatedScore >= threshold
            ? 'No fabricated or contradictory statements detected against the provided context.'
            : 'Detected unsupported assertion regarding refund exceptions not stated in context.';
      } else {
        // G-Eval
        simulatedScore = 0.88;
        steps = [
          'Step 1: Apply chain-of-thought rubric parameters [INPUT, ACTUAL_OUTPUT]',
          'Step 2: Evaluate clarity, empathy, and professional conciseness',
          'Step 3: Weighted criteria score synthesis -> Passed rubric with 0.88/1.0',
        ];
        reason =
          'Tone is clear, instructional, and concise. Adheres to customer success communication standards.';
      }

      setEvalResult({
        score: simulatedScore,
        passed: simulatedScore >= threshold,
        reason,
        steps,
      });
      recordMetricMeasurement(
        selectedMetricId,
        currentMetric.name,
        simulatedScore,
        threshold,
        simulatedScore >= threshold,
        reason
      );
      setIsEvaluating(false);
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Sandbox Sub-Mode Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setSandboxMode('single')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              sandboxMode === 'single'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single Metric Playground</span>
          </button>
          <button
            onClick={() => setSandboxMode('variance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              sandboxMode === 'variance'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Model Variance Comparator (1.5B vs 7B)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Ollama LLM-as-a-Judge Evaluation</span>
        </div>
      </div>

      {sandboxMode === 'variance' ? (
        <ModelVarianceComparator />
      ) : (
        <>
          {/* Overview Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
                  <span>Interactive Evaluation Sandbox</span>
                  <span>·</span>
                  <span>Local Judge Simulator</span>
                  <span>·</span>
                  <span>ISTQB Test Oracle</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Metric Playground & LLM-as-a-Judge Simulator
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                  Inspect how local judges compute scores, extract factual statements, and evaluate
                  pass/fail boundaries against your test cases.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunEval}
                  disabled={isEvaluating}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isEvaluating ? 'Evaluating with Judge...' : 'Run Measure'}</span>
                </button>
              </div>
            </div>
          </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
        {METRIC_DEFINITIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSelectedMetricId(m.id);
              setThreshold(m.defaultThreshold);
              setEvalResult(null);
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              selectedMetricId === m.id
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Two-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Case Inputs */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-200">
              Configure LLMTestCase Parameters
            </div>
            <div className="text-xs text-slate-400">{currentMetric.qaEquivalent}</div>
          </div>

          {/* Input field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between">
              <span>input (Query / User Prompt)</span>
              <span className="text-[11px] text-indigo-400">Required</span>
            </label>
            <textarea
              rows={2}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actual Output */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between">
              <span>actual_output (Model Response under Test)</span>
              <span className="text-[11px] text-indigo-400">Required</span>
            </label>
            <textarea
              rows={3}
              value={outputVal}
              onChange={(e) => setOutputVal(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Context / Retrieval Context */}
          {(selectedMetricId === 'faithfulness' || selectedMetricId === 'hallucination') && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between">
                <span>
                  {selectedMetricId === 'faithfulness'
                    ? 'retrieval_context (List of Ground Truths)'
                    : 'context (Reference Truth Context)'}
                </span>
                <span className="text-[11px] text-amber-400">Knowledge Base</span>
              </label>
              <textarea
                rows={3}
                value={contextVal}
                onChange={(e) => setContextVal(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Threshold Boundary Tuning Slider */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Passing Threshold (Boundary Value)</span>
              </span>
              <span className="font-mono text-indigo-300 font-bold tabular-nums">
                {threshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0.10 (Lenient)</span>
              <span>0.50 (Standard)</span>
              <span>0.70 (Strict)</span>
              <span>1.00 (Zero Defect)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Judge Reasoning Output */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Local Judge Output</div>
            <div className="text-xs font-mono text-slate-500">Provider: Ollama</div>
          </div>

          {isEvaluating ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
              <div className="text-xs font-mono text-indigo-300">
                Local model synthesizing statements & evaluating rubric...
              </div>
            </div>
          ) : evalResult ? (
            <div className="space-y-4">
              {/* Score Header Card */}
              <div
                className={`p-4 rounded-xl border ${
                  evalResult.passed
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {evalResult.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      {evalResult.passed ? 'TEST PASSED' : 'TEST FAILED'}
                    </span>
                  </div>
                  <div className="text-xs font-mono">
                    Score: <span className="text-base font-bold tabular-nums">{evalResult.score}</span> /
                    1.0
                  </div>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Condition: score ({evalResult.score}) &gt;= threshold ({threshold.toFixed(2)})
                </div>
              </div>

              {/* Chain of thought steps */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  Judge Chain-of-Thought Steps:
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs font-mono text-slate-400">
                  {evalResult.steps.map((st, i) => (
                    <div key={i} className="leading-relaxed">
                      {st}
                    </div>
                  ))}
                </div>
              </div>

              {/* Verdict Reason */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300">Metric Reason:</div>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {evalResult.reason}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-600" />
              <div className="text-xs text-slate-400">Ready to Measure</div>
              <p className="text-xs text-slate-500 max-w-xs">
                Click &ldquo;Run Measure&rdquo; to simulate how the local Ollama judge analyzes
                claims and outputs scores.
              </p>
            </div>
          )}

          {/* Metric Reference Code */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="text-xs font-semibold text-slate-300">Python Implementation Snippet</div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 overflow-x-auto whitespace-pre">
              {currentMetric.sampleCode}
            </pre>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
