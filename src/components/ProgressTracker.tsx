import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Award,
  ArrowRight,
  TrendingUp,
  Download,
  RotateCcw,
  ShieldCheck,
  BookOpen,
  Cpu,
  Layers,
  FileCode,
  Terminal,
  FolderGit2
} from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

export interface AutomatedMilestone {
  id: string;
  moduleId: number;
  moduleName: string;
  title: string;
  description: string;
  istqbBridge: string;
  targetTab: string;
  isCompleted: boolean;
  completionProof?: string;
}

interface ProgressTrackerProps {
  onNavigateTab: (tabId: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ onNavigateTab }) => {
  const {
    progress,
    overallPercent,
    completedMilestonesCount,
    totalMilestonesCount,
    resetAllProgress,
  } = useStudentProgress();

  const [copiedAudit, setCopiedAudit] = useState(false);

  // Generate automated milestones directly from the student's real telemetry
  const milestones: AutomatedMilestone[] = [
    // Module 1
    {
      id: 'm1_hardware',
      moduleId: 1,
      moduleName: 'Module 1: 100% Local Environment',
      title: 'Hardware Sizing & Judge Sizing Model',
      description: 'Select workstation OS & RAM in Hardware Sizer to size the Ollama judge.',
      istqbBridge: 'Test Harness & Isolated Environment Configuration',
      targetTab: 'hardware',
      isCompleted: progress.hardwareConfigured,
      completionProof: progress.hardwareConfigured
        ? 'Verified: Workstation hardware selected'
        : undefined,
    },
    {
      id: 'm1_cli_config',
      moduleId: 1,
      moduleName: 'Module 1: 100% Local Environment',
      title: 'Global CLI Judge Configuration & Runbook',
      description: 'Copy and execute setup commands to configure deepeval set-ollama.',
      istqbBridge: 'Test Automation Maintainability & Decoupling',
      targetTab: 'hardware',
      isCompleted: progress.copiedSetupCommands.length >= 2,
      completionProof:
        progress.copiedSetupCommands.length >= 2
          ? `Verified: ${progress.copiedSetupCommands.length} setup commands copied`
          : undefined,
    },
    {
      id: 'm1_quiz',
      moduleId: 1,
      moduleName: 'Module 1: 100% Local Environment',
      title: 'Module 1 Checkpoint Quiz Mastery',
      description: 'Pass the Module 1 conceptual quiz in the Assessment Portal.',
      istqbBridge: 'Test Environment Governance & Confidentiality',
      targetTab: 'assessments',
      isCompleted: !!progress.quizResults[1]?.passed,
      completionProof: progress.quizResults[1]?.passed
        ? `Verified: Quiz passed (${progress.quizResults[1].score}/${progress.quizResults[1].total})`
        : undefined,
    },

    // Module 2
    {
      id: 'm2_exercise',
      moduleId: 2,
      moduleName: 'Module 2: Core Single-Turn Oracles',
      title: 'Spot the Bug: LLMTestCase Parameters',
      description: 'Complete the retrieval_context bug-fix task in the Exercise Workbench.',
      istqbBridge: 'Test Case Specification & Data Boundaries',
      targetTab: 'curriculum',
      isCompleted: progress.completedExerciseIds.includes('m2_task1'),
      completionProof: progress.completedExerciseIds.includes('m2_task1')
        ? 'Verified: Coding exercise completed correctly'
        : undefined,
    },
    {
      id: 'm2_relevancy',
      moduleId: 2,
      moduleName: 'Module 2: Core Single-Turn Oracles',
      title: 'Measure AnswerRelevancy in Sandbox',
      description: 'Evaluate semantic relevancy against acceptance threshold in Sandbox.',
      istqbBridge: 'Functional Acceptance Testing & Boundary Values',
      targetTab: 'sandbox',
      isCompleted: progress.metricMeasurements['answer_relevancy'] !== undefined,
      completionProof: progress.metricMeasurements['answer_relevancy']
        ? `Verified: Measured score ${progress.metricMeasurements['answer_relevancy'].score.toFixed(
            2
          )}`
        : undefined,
    },
    {
      id: 'm2_faithfulness',
      moduleId: 2,
      moduleName: 'Module 2: Core Single-Turn Oracles',
      title: 'Measure Faithfulness / Grounding in Sandbox',
      description: 'Verify factual claims against reference context truths in Sandbox.',
      istqbBridge: 'RAG Ground Truth Oracle & Defect Detection',
      targetTab: 'sandbox',
      isCompleted:
        progress.metricMeasurements['faithfulness'] !== undefined ||
        progress.metricMeasurements['hallucination'] !== undefined,
      completionProof: progress.metricMeasurements['faithfulness']
        ? `Verified: Measured score ${progress.metricMeasurements['faithfulness'].score.toFixed(
            2
          )}`
        : progress.metricMeasurements['hallucination']
        ? `Verified: Measured hallucination score ${progress.metricMeasurements[
            'hallucination'
          ].score.toFixed(2)}`
        : undefined,
    },

    // Module 3
    {
      id: 'm3_exercise',
      moduleId: 3,
      moduleName: 'Module 3: Custom Rubrics with G-Eval',
      title: 'G-Eval Evaluation Parameters Mapping',
      description: 'Complete the LLMTestCaseParams exercise in the Exercise Workbench.',
      istqbBridge: 'Static Analysis & Information Boundary Restriction',
      targetTab: 'curriculum',
      isCompleted: progress.completedExerciseIds.includes('m3_task1'),
      completionProof: progress.completedExerciseIds.includes('m3_task1')
        ? 'Verified: G-Eval parameter exercise completed'
        : undefined,
    },
    {
      id: 'm3_geval_measure',
      moduleId: 3,
      moduleName: 'Module 3: Custom Rubrics with G-Eval',
      title: 'Measure Custom Rubric in Sandbox',
      description: 'Execute chain-of-thought rubric evaluation for tone & format.',
      istqbBridge: 'Custom Non-Functional QA Quality Gates',
      targetTab: 'sandbox',
      isCompleted: progress.metricMeasurements['geval_rubric'] !== undefined,
      completionProof: progress.metricMeasurements['geval_rubric']
        ? `Verified: Rubric score ${progress.metricMeasurements['geval_rubric'].score.toFixed(
            2
          )}`
        : undefined,
    },
    {
      id: 'm3_quiz',
      moduleId: 3,
      moduleName: 'Module 3: Custom Rubrics with G-Eval',
      title: 'Module 3 Checkpoint Quiz Mastery',
      description: 'Pass the Module 3 conceptual quiz in the Assessment Portal.',
      istqbBridge: 'Evaluation Traceability & Static Analysis',
      targetTab: 'assessments',
      isCompleted: !!progress.quizResults[3]?.passed,
      completionProof: progress.quizResults[3]?.passed
        ? `Verified: Quiz passed (${progress.quizResults[3].score}/${progress.quizResults[3].total})`
        : undefined,
    },

    // Module 4
    {
      id: 'm4_suite_run',
      moduleId: 4,
      moduleName: 'Module 4: Automated CI/CD Pytest Integration',
      title: 'Execute Cumulative Pytest Suite',
      description: 'Run deepeval CLI in the Test Suite tab to execute automated assertions.',
      istqbBridge: 'Test Execution Automation & Regression Testing',
      targetTab: 'suite',
      isCompleted: progress.suiteRunCount > 0,
      completionProof:
        progress.suiteRunCount > 0
          ? `Verified: ${progress.suiteRunCount} test suite executions recorded`
          : undefined,
    },
    {
      id: 'm4_variance',
      moduleId: 4,
      moduleName: 'Module 4: Automated CI/CD Pytest Integration',
      title: 'Diagnose Judge Score Variance',
      description: 'Simulate repeated runs in the Model Variance Comparator (Sandbox).',
      istqbBridge: 'Flakiness Root-Cause Analysis vs True Defects',
      targetTab: 'sandbox',
      isCompleted: progress.varianceSimulationsCount > 0,
      completionProof:
        progress.varianceSimulationsCount > 0
          ? `Verified: ${progress.varianceSimulationsCount} variance simulations analyzed`
          : undefined,
    },

    // Module 5
    {
      id: 'm5_portfolio',
      moduleId: 5,
      moduleName: 'Module 5: Portfolio Artifact Creation',
      title: 'Package GitHub Portfolio Artifact',
      description: 'Copy README.md documentation or git execution commands in Portfolio Guide.',
      istqbBridge: 'Test Deliverables & QA Portfolio Artifacts',
      targetTab: 'portfolio',
      isCompleted: progress.portfolioReadmeCopied || progress.portfolioGitCopied,
      completionProof:
        progress.portfolioReadmeCopied || progress.portfolioGitCopied
          ? 'Verified: Portfolio documentation generated & copied'
          : undefined,
    },
  ];

  const getReadinessLevel = () => {
    if (overallPercent === 100)
      return {
        title: 'Certified AI Quality Automation Engineer',
        color: 'text-emerald-400',
        desc: 'All 12 evaluation milestones verified through actual test executions and measurements.',
      };
    if (overallPercent >= 75)
      return {
        title: 'AI Quality Engineering Specialist',
        color: 'text-indigo-400',
        desc: 'Proficient in Pytest suites, G-Eval rubrics, and local judge variance mitigation.',
      };
    if (overallPercent >= 50)
      return {
        title: 'LLM Test Oracle Practitioner',
        color: 'text-amber-400',
        desc: 'Mastered core single-turn metrics, factuality verification, and boundary tuning.',
      };
    if (overallPercent >= 25)
      return {
        title: 'AI QA Environment Apprentice',
        color: 'text-sky-400',
        desc: 'Local Ollama test harness configured; learning LLMTestCase authoring.',
      };
    return {
      title: 'ISTQB Foundation Stage (0% Complete)',
      color: 'text-slate-400',
      desc: 'No milestones completed yet. Start by sizing your hardware in Module 1.',
    };
  };

  const readiness = getReadinessLevel();

  const handleExportAudit = () => {
    const text = `# 📊 Verified AI Quality Engineering Telemetry Audit
Date: ${new Date().toISOString().split('T')[0]}
Candidate Background: ISTQB-Certified Manual / API QA
Real Mastery Progress: ${overallPercent}% (${completedMilestonesCount}/${totalMilestonesCount} Verified Milestones)
Readiness Status: ${readiness.title}

## Verified Action Telemetry
- Total Pytest Suite Executions: ${progress.suiteRunCount}
- Evaluated Metrics in Sandbox: ${Object.keys(progress.metricMeasurements).join(', ') || 'None'}
- Completed Coding Exercises: ${progress.completedExerciseIds.join(', ') || 'None'}
- Passed Module Quizzes: ${
      Object.entries(progress.quizResults)
        .filter(([_, q]) => q.passed)
        .map(([m]) => `Module ${m}`)
        .join(', ') || 'None'
    }

## Automated Milestone Verification Log
${milestones
  .map(
    (m) =>
      `- [${m.isCompleted ? 'X' : ' '}] ${m.moduleName}: ${m.title}
   ISTQB Bridge: ${m.istqbBridge}
   Evidence: ${m.isCompleted ? m.completionProof : 'Pending student completion'}`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  // Group milestones by module
  const moduleGroups = [1, 2, 3, 4, 5].map((modNum) => {
    const items = milestones.filter((m) => m.moduleId === modNum);
    const modCompleted = items.filter((m) => m.isCompleted).length;
    return {
      moduleId: modNum,
      name: items[0]?.moduleName || `Module ${modNum}`,
      items,
      completed: modCompleted,
      total: items.length,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>ISTQB QA Career Transition</span>
              <span>·</span>
              <span>Automated Telemetry Tracking</span>
              <span>·</span>
              <span>No Manual Completion Markers</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Real-Time Competency & Milestone Progress
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every metric below updates automatically when you complete exercises, measure metrics in
              the sandbox, execute test suites, or pass module quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copiedAudit ? 'Audit Copied to Clipboard' : 'Export Verified Audit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress % Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Overall Verified Progress</span>
            <span className="text-xs font-mono text-indigo-400 font-bold tabular-nums">
              {completedMilestonesCount} / {totalMilestonesCount} Milestones
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white tabular-nums">
              {overallPercent}%
            </span>
            <span className="text-xs text-slate-400">Real Execution Mastery</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Readiness Level Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Career Transition Readiness:
              </span>
            </div>
            <span className={`text-xs font-mono font-bold ${readiness.color}`}>
              {readiness.title}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {readiness.desc}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Automatically verified across 12 criteria</span>
            <button
              onClick={resetAllProgress}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Progress to 0%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module Milestone Checklist */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Automated Milestone Verification Log
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Milestones complete automatically upon action
          </span>
        </div>

        <div className="space-y-4">
          {moduleGroups.map((group) => {
            const isAllDone = group.completed === group.total && group.total > 0;

            return (
              <div
                key={group.moduleId}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 transition-colors"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      Module 0{group.moduleId}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-sm font-semibold text-slate-200">{group.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {group.completed} / {group.total} Verified
                    </span>
                    {isAllDone && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                        Module Mastered
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in Module */}
                <div className="space-y-3">
                  {group.items.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-lg border text-xs flex items-start justify-between gap-4 transition-all ${
                        m.isCompleted
                          ? 'bg-slate-950/80 border-emerald-950/60 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {m.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-200 flex items-center gap-2">
                            <span>{m.title}</span>
                            {m.isCompleted && (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 leading-relaxed">{m.description}</p>
                          <div className="text-[11px] font-mono text-amber-400/90 pt-0.5">
                            ISTQB Bridge: {m.istqbBridge}
                          </div>
                          {m.completionProof && (
                            <div className="text-[11px] font-mono text-emerald-400/90">
                              {m.completionProof}
                            </div>
                          )}
                        </div>
                      </div>

                      {!m.isCompleted && (
                        <button
                          onClick={() => onNavigateTab(m.targetTab)}
                          className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 underline whitespace-nowrap shrink-0 mt-0.5 cursor-pointer"
                        >
                          <span>Complete Action</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
