import React, { useState } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

export interface ParsedTestCase {
  id: string;
  name: string;
  file: string;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  metricName?: string;
  score?: number;
  threshold?: number;
  reason?: string;
  qaDiagnosis?: string;
}

export interface ParsedSession {
  total: number;
  passed: number;
  failed: number;
  duration?: string;
  pythonVersion?: string;
  deepevalVersion?: string;
  cases: ParsedTestCase[];
  rawText: string;
}

const SAMPLE_OUTPUT_PASSED = `============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0
rootdir: /workspace/deepeval-qa-portfolio
plugins: deepeval-1.2.0
collected 3 items

tests/test_qa_suite.py::test_customer_support_relevancy PASSED           [ 33%]
Metric: AnswerRelevancyMetric
Score: 0.88 (threshold: 0.70, evaluation: PASSED)
Reason: The actual output directly answers the user refund query regarding refurbished items without topic drift.

tests/test_qa_suite.py::test_rag_faithfulness_against_knowledge_base PASSED [ 66%]
Metric: FaithfulnessMetric
Score: 0.95 (threshold: 0.80, evaluation: PASSED)
Reason: All factual claims regarding 14-day return window are completely supported by the retrieved knowledge base documents.

tests/test_qa_suite.py::test_polite_tone_and_format_rubric PASSED        [100%]
Metric: GEval (Support Empathy Rubric)
Score: 0.84 (threshold: 0.75, evaluation: PASSED)
Reason: The tone is empathetic, acknowledges customer frustration, and provides a clear resolution timeline within 3 sentences.

======================= 3 passed in 4.12s =======================`;

const SAMPLE_OUTPUT_FAILED = `============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0
rootdir: /workspace/deepeval-qa-portfolio
plugins: deepeval-1.2.0
collected 3 items

tests/test_qa_suite.py::test_customer_support_relevancy PASSED           [ 33%]
Metric: AnswerRelevancyMetric
Score: 0.82 (threshold: 0.70, evaluation: PASSED)
Reason: The response stays on topic and addresses customer query.

tests/test_qa_suite.py::test_rag_faithfulness_against_knowledge_base FAILED [ 66%]
Metric: FaithfulnessMetric
Score: 0.50 (threshold: 0.80, evaluation: FAILED)
Reason: Claim "Free return shipping is provided for all international orders" directly contradicts the reference documentation stating international customers must cover postage.

tests/test_qa_suite.py::test_polite_tone_and_format_rubric FAILED        [100%]
Metric: GEval (Support Empathy Rubric)
Score: 0.62 (threshold: 0.75, evaluation: FAILED)
Reason: Response exceeded the 3-sentence constraint and adopted an argumentative tone regarding user error.

======================= 2 failed, 1 passed in 5.34s =======================`;

const SAMPLE_OUTPUT_FLAKY_VARIANCE = `============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0
rootdir: /workspace/deepeval-qa-portfolio
plugins: deepeval-1.2.0
collected 2 items

tests/test_qa_suite.py::test_customer_support_relevancy FAILED           [ 50%]
Metric: AnswerRelevancyMetric
Score: 0.68 (threshold: 0.70, evaluation: FAILED)
Reason: The local judge model extracted a minor auxiliary sentence regarding terms of service and penalized relevancy slightly. Marginal boundary miss of 0.02.

tests/test_qa_suite.py::test_rag_faithfulness_against_knowledge_base PASSED [100%]
Metric: FaithfulnessMetric
Score: 0.82 (threshold: 0.80, evaluation: PASSED)
Reason: Core statements confirmed against retrieved knowledge articles.

======================= 1 failed, 1 passed in 3.88s =======================`;

export const TerminalOutputParser: React.FC = () => {
  const { recordLogParsed } = useStudentProgress();
  const [rawInput, setRawInput] = useState<string>(SAMPLE_OUTPUT_FAILED);
  const [copiedReport, setCopiedReport] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'PASSED' | 'FAILED'>('all');

  // Parser function to convert raw pytest / deepeval stdout into structured QA metrics
  const parseTerminalOutput = (text: string): ParsedSession => {
    const lines = text.split('\n');
    const cases: ParsedTestCase[] = [];
    let currentCase: Partial<ParsedTestCase> | null = null;
    let passedCount = 0;
    let failedCount = 0;
    let duration = '';
    let pythonVersion = '';
    let deepevalVersion = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check python/pytest versions
      if (line.includes('Python') && line.includes('pytest')) {
        const pyMatch = line.match(/Python\s+([0-9.]+)/i);
        if (pyMatch) pythonVersion = pyMatch[1];
      }
      if (line.includes('deepeval-')) {
        const deMatch = line.match(/deepeval-([0-9.]+)/i);
        if (deMatch) deepevalVersion = deMatch[1];
      }

      // Check test run line: e.g. tests/test_qa_suite.py::test_customer_support_relevancy PASSED
      const testMatch = line.match(/([a-zA-Z0-9_/.]+\.py)::([a-zA-Z0-9_]+)\s+(PASSED|FAILED|ERROR)/i);
      if (testMatch) {
        if (currentCase && currentCase.name) {
          cases.push(enrichCase(currentCase as ParsedTestCase));
        }
        const file = testMatch[1];
        const name = testMatch[2];
        const status = testMatch[3].toUpperCase() as 'PASSED' | 'FAILED' | 'ERROR';
        if (status === 'PASSED') passedCount++;
        else failedCount++;

        currentCase = {
          id: `case_${cases.length + 1}`,
          file,
          name,
          status,
        };
        continue;
      }

      // Check Metric name line
      if (currentCase && line.startsWith('Metric:')) {
        currentCase.metricName = line.replace('Metric:', '').trim();
      }

      // Check Score line: e.g. Score: 0.88 (threshold: 0.70, evaluation: PASSED)
      if (currentCase && line.startsWith('Score:')) {
        const scoreMatch = line.match(/Score:\s*([0-9.]+)/i);
        const thresholdMatch = line.match(/threshold:\s*([0-9.]+)/i);
        if (scoreMatch) currentCase.score = parseFloat(scoreMatch[1]);
        if (thresholdMatch) currentCase.threshold = parseFloat(thresholdMatch[1]);
      }

      // Check Reason line
      if (currentCase && line.startsWith('Reason:')) {
        currentCase.reason = line.replace('Reason:', '').trim();
      }

      // Check test session footer: e.g. 2 failed, 1 passed in 5.34s
      if (line.includes('in ') && (line.includes('passed') || line.includes('failed'))) {
        const durMatch = line.match(/in\s+([0-9.]+s)/i);
        if (durMatch) duration = durMatch[1];
      }
    }

    if (currentCase && currentCase.name) {
      cases.push(enrichCase(currentCase as ParsedTestCase));
    }

    return {
      total: cases.length,
      passed: passedCount,
      failed: failedCount,
      duration: duration || '3.5s',
      pythonVersion: pythonVersion || '3.11',
      deepevalVersion: deepevalVersion || '1.2.0',
      cases,
      rawText: text,
    };
  };

  const enrichCase = (testCase: ParsedTestCase): ParsedTestCase => {
    let diagnosis = '';
    const score = testCase.score ?? 0;
    const threshold = testCase.threshold ?? 0.7;

    if (testCase.status === 'FAILED') {
      if (testCase.metricName?.toLowerCase().includes('faithfulness')) {
        diagnosis =
          'Defect Severity High: Model hallucinated or contradicted knowledge base facts. In traditional testing, this is a Ground Truth Violation defect.';
      } else if (testCase.metricName?.toLowerCase().includes('relevancy')) {
        const delta = threshold - score;
        if (delta <= 0.05) {
          diagnosis =
            'Boundary Value Alert (Variance): Score missed threshold by <= 0.05. Consider testing threshold calibration (0.65 instead of 0.70) or local judge sample temperature.';
        } else {
          diagnosis =
            'Defect Severity Medium: Semantic drift detected. Actual output wandered into off-topic territory.';
        }
      } else if (testCase.metricName?.toLowerCase().includes('geval')) {
        diagnosis =
          'Static Rubric Defect: Response violated non-functional constraints (tone, sentence limit, or style guide).';
      } else {
        diagnosis = 'Quality gate threshold not met.';
      }
    } else {
      diagnosis = 'Acceptance criteria fulfilled. Metric score meets or exceeds boundary threshold.';
    }

    return { ...testCase, qaDiagnosis: diagnosis };
  };

  const parsedData = parseTerminalOutput(rawInput);
  const passRate =
    parsedData.total > 0
      ? Math.round((parsedData.passed / parsedData.total) * 100)
      : 0;

  const filteredCases = parsedData.cases.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const handleCopyMarkdownReport = () => {
    const report = `# DeepEval Test Execution Report
Date: ${new Date().toISOString().split('T')[0]}
Total Cases: ${parsedData.total} | Passed: ${parsedData.passed} | Failed: ${parsedData.failed}
Pass Rate: ${passRate}% | Execution Duration: ${parsedData.duration}

## Test Case Breakdown
${parsedData.cases
  .map(
    (c) => `### ${c.name} [${c.status}]
- Metric: ${c.metricName || 'N/A'}
- Score: ${c.score ?? 'N/A'} (Threshold: ${c.threshold ?? 'N/A'})
- Reason: ${c.reason || 'None provided'}
- QA Assessment: ${c.qaDiagnosis || ''}
`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>Terminal Output Simulation & Log Analyzer</span>
              <span>·</span>
              <span>ISTQB Defect Analysis</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              DeepEval CLI Output Parser & Diagnostics
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Paste the console output from your local <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded font-mono text-xs">deepeval test run</code> command.
              The parser automatically extracts metrics, scores, judge reasoning, and translates failures
              into actionable QA defects.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyMarkdownReport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report Copied</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export QA Sign-off</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Pickers & Raw Input Terminal */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Paste Raw Terminal Output or Load QA Scenario:</span>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRawInput(SAMPLE_OUTPUT_FAILED)}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded transition-colors cursor-pointer"
            >
              Preset: Failures & Hallucination
            </button>
            <button
              onClick={() => setRawInput(SAMPLE_OUTPUT_FLAKY_VARIANCE)}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded transition-colors cursor-pointer"
            >
              Preset: Score Variance
            </button>
            <button
              onClick={() => setRawInput(SAMPLE_OUTPUT_PASSED)}
              className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded transition-colors cursor-pointer"
            >
              Preset: All Tests Passed
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste terminal stdout from 'deepeval test run ...' here..."
          className="w-full p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>

      {/* Analytics Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Total Test Cases</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {parsedData.total}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Collected by Pytest
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Passed Cases</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {parsedData.passed}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Above threshold
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Defects / Failed</div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {parsedData.failed}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Boundary violations
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Quality Gate Pass Rate</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              passRate === 100
                ? 'text-emerald-400'
                : passRate >= 70
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {passRate}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Duration: {parsedData.duration}
          </div>
        </div>
      </div>

      {/* Filter Controls & Parsed Test Results Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            Parsed Evaluation Analysis & Defect Diagnostic
          </h3>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({parsedData.total})
            </button>
            <button
              onClick={() => setFilterStatus('FAILED')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filterStatus === 'FAILED'
                  ? 'bg-rose-950/80 text-rose-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Failed ({parsedData.failed})
            </button>
            <button
              onClick={() => setFilterStatus('PASSED')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filterStatus === 'PASSED'
                  ? 'bg-emerald-950/80 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Passed ({parsedData.passed})
            </button>
          </div>
        </div>

        {/* List of Analyzed Test Cases */}
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
              No test cases matching the current filter.
            </div>
          ) : (
            filteredCases.map((tc) => {
              const isPassed = tc.status === 'PASSED';
              return (
                <div
                  key={tc.id}
                  className={`bg-slate-900 border rounded-xl p-5 space-y-4 transition-colors ${
                    isPassed
                      ? 'border-slate-800 hover:border-slate-700'
                      : 'border-rose-900/60 bg-rose-950/10'
                  }`}
                >
                  {/* Test Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                          {tc.file}
                        </span>
                        <span className="text-slate-600">::</span>
                        <span className="text-sm font-bold font-mono text-slate-100">
                          {tc.name}
                        </span>
                      </div>
                      <div className="text-xs text-indigo-400 font-mono">
                        Metric: {tc.metricName || 'Standard Metric'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Score vs Cutoff</div>
                        <div className="text-sm font-mono font-bold text-white tabular-nums">
                          {tc.score !== undefined ? tc.score.toFixed(2) : 'N/A'}{' '}
                          <span className="text-slate-500 font-normal">
                            / {tc.threshold !== undefined ? tc.threshold.toFixed(2) : '0.70'}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                          isPassed
                            ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span>{tc.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score vs Threshold Visual Bar */}
                  {tc.score !== undefined && tc.threshold !== undefined && (
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex relative">
                        <div
                          className={`h-full ${
                            isPassed ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(tc.score * 100, 100)}%` }}
                        />
                        {/* Threshold mark */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                          style={{ left: `${tc.threshold * 100}%` }}
                          title={`Threshold: ${tc.threshold}`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0.00</span>
                        <span className="text-amber-400">
                          ▲ Acceptance Cutoff ({tc.threshold.toFixed(2)})
                        </span>
                        <span>1.00</span>
                      </div>
                    </div>
                  )}

                  {/* Judge Reason */}
                  {tc.reason && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Local Judge Evaluation Reasoning:
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {tc.reason}
                      </p>
                    </div>
                  )}

                  {/* QA Engineering Diagnosis */}
                  {tc.qaDiagnosis && (
                    <div
                      className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                        isPassed
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                          : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      }`}
                    >
                      {isPassed ? (
                        <Sliders className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold">QA Root-Cause Analysis: </span>
                        <span>{tc.qaDiagnosis}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
