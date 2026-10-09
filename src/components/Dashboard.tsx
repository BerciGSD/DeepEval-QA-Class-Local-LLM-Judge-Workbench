import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Sparkles,
  Award,
  Terminal,
  Clock,
  RotateCcw
} from 'lucide-react';
import { HardwareConfig } from '../types/curriculum';
import { useStudentProgress } from '../context/ProgressContext';

interface DashboardProps {
  hardwareConfig: HardwareConfig;
  onNavigateTab: (tabId: string) => void;
  onStartModule: (moduleId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  hardwareConfig,
  onNavigateTab,
  onStartModule,
}) => {
  const { progress, overallPercent, completedMilestonesCount, totalMilestonesCount } =
    useStudentProgress();

  const currentJudgeModel =
    hardwareConfig.ram === '8gb' ? 'deepseek-r1:1.5b' : 'qwen2.5:7b';
  const currentMemory = hardwareConfig.ram === '8gb' ? '1.8 GB' : '4.7 GB';

  // Real Test Suite Stats
  const totalRuns = progress.testExecutions.length;
  const passedRuns = progress.testExecutions.filter((t) => t.passed).length;
  const realPassRate =
    totalRuns > 0 ? ((passedRuns / totalRuns) * 100).toFixed(1) : '0.0';

  // Real Measured Metrics from MetricSandbox
  const relevancyMeasure = progress.metricMeasurements['answer_relevancy'];
  const faithfulnessMeasure = progress.metricMeasurements['faithfulness'];
  const hallucinationMeasure = progress.metricMeasurements['hallucination'];
  const gevalMeasure = progress.metricMeasurements['geval_rubric'];

  // Real Module Status Computation
  const getModuleStatus = (modId: number) => {
    if (modId === 1) {
      if (progress.hardwareConfigured && progress.quizResults[1]?.passed) return 'Completed';
      if (progress.hardwareConfigured || progress.copiedSetupCommands.length > 0) return 'In Progress';
      return 'Not Started';
    }
    if (modId === 2) {
      if (progress.quizResults[2]?.passed && progress.completedExerciseIds.includes('m2_task1'))
        return 'Completed';
      if (relevancyMeasure || faithfulnessMeasure || progress.completedExerciseIds.includes('m2_task1'))
        return 'In Progress';
      return 'Not Started';
    }
    if (modId === 3) {
      if (progress.quizResults[3]?.passed && gevalMeasure) return 'Completed';
      if (gevalMeasure || progress.completedExerciseIds.includes('m3_task1')) return 'In Progress';
      return 'Not Started';
    }
    if (modId === 4) {
      if (progress.quizResults[4]?.passed && progress.suiteRunCount > 0) return 'Completed';
      if (progress.suiteRunCount > 0 || progress.varianceSimulationsCount > 0) return 'In Progress';
      return 'Not Started';
    }
    if (modId === 5) {
      if (progress.portfolioReadmeCopied && progress.portfolioGitCopied) return 'Completed';
      if (progress.portfolioReadmeCopied || progress.portfolioGitCopied) return 'In Progress';
      return 'Not Started';
    }
    return 'Not Started';
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Executive Status Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <span>AI Quality Engineering Workspace</span>
              <span aria-hidden="true">·</span>
              <span>ISTQB QA Transition</span>
              <span aria-hidden="true">·</span>
              <span>Live Student Telemetry</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              DeepEval LLM Evaluation Quality Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your real-time command center. Every metric reflects your actual hands-on test runs,
              measurements, and quiz completions starting from 0%.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('suite')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Local Suite</span>
            </button>
            <button
              onClick={() => onNavigateTab('curriculum')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Resume Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Primary Metric Cards - Real Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Token Cost Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total API Token Cost</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              Zero Budget
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-white tabular-nums">
            $0.00
          </div>
          <div className="text-xs text-slate-400">
            100% local Ollama inference · Zero cloud tokens billed
          </div>
        </div>

        {/* Quality Gate Pass Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Suite Quality Gate</span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
              {totalRuns > 0 ? `${totalRuns} Tests Run` : 'Pending Run'}
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
            {realPassRate}%
          </div>
          <div className="text-xs text-slate-400">
            {totalRuns > 0
              ? `${passedRuns} of ${totalRuns} test cases passed acceptance threshold`
              : 'No test runs yet. Execute test suite in Suite tab.'}
          </div>
        </div>

        {/* Active Local Judge */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Local Judge</span>
            <span className="text-[10px] font-mono text-slate-500">
              {currentMemory} RAM
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-indigo-300 truncate">
            {currentJudgeModel}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Air-Gapped & Telemetry Disabled</span>
          </div>
        </div>

        {/* Curriculum Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Curriculum Mastery</span>
            <span className="text-[10px] font-mono text-indigo-400 font-bold">
              {completedMilestonesCount} / {totalMilestonesCount} Milestones
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-white tabular-nums">
            {overallPercent}%
          </div>
          <div className="text-xs text-slate-400">
            {overallPercent === 0
              ? 'Start by configuring hardware in Module 1'
              : `${completedMilestonesCount} real milestones completed`}
          </div>
        </div>
      </div>

      {/* Main Two-Zone Section: Metrics Calibration vs Recent Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Evaluation Metrics Health & Calibration */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Core Quality Oracles & Acceptance Boundaries
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reflects your actual measured scores from the Metric Sandbox
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('sandbox')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
            >
              Open Sandbox to Measure →
            </button>
          </div>

          <div className="space-y-4">
            {/* Metric 1: Answer Relevancy */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold font-mono text-slate-200">
                    AnswerRelevancyMetric
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Checks semantic adherence to user input without drift
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      relevancyMeasure
                        ? relevancyMeasure.passed
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {relevancyMeasure ? relevancyMeasure.score.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {' '}
                    / Cutoff: {relevancyMeasure ? relevancyMeasure.threshold.toFixed(2) : '0.70'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    relevancyMeasure
                      ? relevancyMeasure.passed
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    width: relevancyMeasure ? `${relevancyMeasure.score * 100}%` : '0%',
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{
                    left: `${(relevancyMeasure ? relevancyMeasure.threshold : 0.7) * 100}%`,
                  }}
                  title="Cutoff"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {relevancyMeasure
                    ? `Status: ${relevancyMeasure.passed ? 'PASSED' : 'FAILED'}`
                    : 'Unmeasured (Go to Sandbox)'}
                </span>
                <span className="text-amber-400">
                  ▲ Cutoff ({relevancyMeasure ? relevancyMeasure.threshold.toFixed(2) : '0.70'})
                </span>
                <span>1.0 (Exact Focus)</span>
              </div>
            </div>

            {/* Metric 2: RAG Faithfulness */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold font-mono text-slate-200">
                    FaithfulnessMetric (Grounding)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Verifies claims strictly match retrieved reference documents
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      faithfulnessMeasure
                        ? faithfulnessMeasure.passed
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {faithfulnessMeasure ? faithfulnessMeasure.score.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {' '}
                    / Cutoff: {faithfulnessMeasure ? faithfulnessMeasure.threshold.toFixed(2) : '0.80'}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    faithfulnessMeasure
                      ? faithfulnessMeasure.passed
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    width: faithfulnessMeasure ? `${faithfulnessMeasure.score * 100}%` : '0%',
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{
                    left: `${(faithfulnessMeasure ? faithfulnessMeasure.threshold : 0.8) * 100}%`,
                  }}
                  title="Cutoff"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {faithfulnessMeasure
                    ? `Status: ${faithfulnessMeasure.passed ? 'PASSED' : 'FAILED'}`
                    : 'Unmeasured (Go to Sandbox)'}
                </span>
                <span className="text-amber-400">
                  ▲ Cutoff ({faithfulnessMeasure ? faithfulnessMeasure.threshold.toFixed(2) : '0.80'})
                </span>
                <span>1.0 (100% Grounded)</span>
              </div>
            </div>

            {/* Metric 3: Hallucination */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold font-mono text-slate-200">
                    HallucinationMetric (Negative Testing)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Flags invented statements absent from source context
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      hallucinationMeasure
                        ? hallucinationMeasure.passed
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {hallucinationMeasure ? hallucinationMeasure.score.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {' '}
                    / Cutoff:{' '}
                    {hallucinationMeasure ? hallucinationMeasure.threshold.toFixed(2) : '0.50'}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    hallucinationMeasure
                      ? hallucinationMeasure.passed
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    width: hallucinationMeasure
                      ? `${hallucinationMeasure.score * 100}%`
                      : '0%',
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{
                    left: `${(hallucinationMeasure ? hallucinationMeasure.threshold : 0.5) * 100}%`,
                  }}
                  title="Cutoff"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {hallucinationMeasure
                    ? `Status: ${hallucinationMeasure.passed ? 'PASSED' : 'FAILED'}`
                    : 'Unmeasured (Go to Sandbox)'}
                </span>
                <span className="text-amber-400">
                  ▲ Cutoff ({hallucinationMeasure ? hallucinationMeasure.threshold.toFixed(2) : '0.50'})
                </span>
                <span>1.0 (Zero Fabrication)</span>
              </div>
            </div>

            {/* Metric 4: G-Eval Rubric */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold font-mono text-slate-200">
                    GEval (Tone & Formatting Rubric)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Evaluates empathy, sentence count, and brand constraints
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      gevalMeasure
                        ? gevalMeasure.passed
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {gevalMeasure ? gevalMeasure.score.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {' '}
                    / Cutoff: {gevalMeasure ? gevalMeasure.threshold.toFixed(2) : '0.75'}
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    gevalMeasure
                      ? gevalMeasure.passed
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    width: gevalMeasure ? `${gevalMeasure.score * 100}%` : '0%',
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{
                    left: `${(gevalMeasure ? gevalMeasure.threshold : 0.75) * 100}%`,
                  }}
                  title="Cutoff"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {gevalMeasure
                    ? `Status: ${gevalMeasure.passed ? 'PASSED' : 'FAILED'}`
                    : 'Unmeasured (Go to Sandbox)'}
                </span>
                <span className="text-amber-400">
                  ▲ Cutoff ({gevalMeasure ? gevalMeasure.threshold.toFixed(2) : '0.75'})
                </span>
                <span>1.0 (Flawless)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Actual Test Executions */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Recent Test Suite Results</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live execution logs from your local test runner
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('parser')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
              >
                Log Parser →
              </button>
            </div>

            {progress.testExecutions.length === 0 ? (
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3">
                <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-semibold text-slate-300">
                  No Local Test Runs Recorded Yet
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Go to the Test Suite tab and click &ldquo;Run deepeval CLI&rdquo; to execute the
                  cumulative test suite against your local judge.
                </p>
                <button
                  onClick={() => onNavigateTab('suite')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Run First Test Suite
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {progress.testExecutions.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      t.passed
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-rose-950/20 border-rose-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono font-semibold text-slate-200 truncate max-w-[200px]">
                        {t.testName}
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        {t.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className={t.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>
                        {t.metric} · Score: {t.score.toFixed(2)} / {t.cutoff.toFixed(2)}
                      </span>
                      <span className="text-slate-500">{t.timestamp}</span>
                    </div>

                    {t.diagnosis && (
                      <div className="text-[10px] text-amber-400/90 font-mono">
                        Diagnosis: {t.diagnosis}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('suite')}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
            >
              Open Cumulative Test Suite Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Roadmap Quick Launcher Strip - Dynamic Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              Curriculum Roadmap Quick Launch
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Jump directly to any learning module or milestone
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('curriculum')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
          >
            View Full Curriculum →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            {
              id: 1,
              title: 'Module 1: Setup',
              desc: 'Ollama & CLI Defaults',
              status: getModuleStatus(1),
            },
            {
              id: 2,
              title: 'Module 2: Oracles',
              desc: 'Faithfulness & Boundaries',
              status: getModuleStatus(2),
            },
            {
              id: 3,
              title: 'Module 3: Rubrics',
              desc: 'G-Eval Chain of Thought',
              status: getModuleStatus(3),
            },
            {
              id: 4,
              title: 'Module 4: Pytest',
              desc: 'Automation & Variance',
              status: getModuleStatus(4),
            },
            {
              id: 5,
              title: 'Module 5: Portfolio',
              desc: 'GitHub & QA Resume',
              status: getModuleStatus(5),
            },
          ].map((m) => {
            const isDone = m.status === 'Completed';
            const isInProg = m.status === 'In Progress';
            const colorClass = isDone
              ? 'border-emerald-500/40 bg-emerald-950/10 text-emerald-300'
              : isInProg
              ? 'border-indigo-500/50 bg-indigo-950/20 text-indigo-300'
              : 'border-slate-800 bg-slate-950 text-slate-400';

            return (
              <button
                key={m.id}
                onClick={() => {
                  onStartModule(m.id);
                  onNavigateTab('curriculum');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all hover:border-indigo-500 cursor-pointer ${colorClass}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold">MOD 0{m.id}</span>
                  <span className="text-[10px] font-mono">{m.status}</span>
                </div>
                <div className="text-xs font-semibold text-slate-100">{m.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
