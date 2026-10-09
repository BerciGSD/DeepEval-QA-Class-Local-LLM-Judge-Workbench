import React from 'react';
import { ModuleInfo } from '../types/curriculum';
import { BookOpen, CheckCircle, Lock, ArrowRight, Shield, Layers } from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

interface CurriculumNavProps {
  modules: ModuleInfo[];
  selectedModuleId: number;
  onSelectModule: (id: number) => void;
  onGoToHardware: () => void;
  onGoToAssessment?: () => void;
}

export const CurriculumNav: React.FC<CurriculumNavProps> = ({
  modules,
  selectedModuleId,
  onSelectModule,
  onGoToHardware,
  onGoToAssessment,
}) => {
  const { progress } = useStudentProgress();

  const isM1Complete = progress.hardwareConfigured && !!progress.quizResults[1]?.passed;
  const isM2Complete = isM1Complete && (!!progress.quizResults[2]?.passed || progress.completedExerciseIds.includes('m2_task1'));
  const isM3Complete = isM2Complete && (!!progress.quizResults[3]?.passed || progress.completedExerciseIds.includes('m3_task1'));
  const isM4Complete = isM3Complete && (!!progress.quizResults[4]?.passed || progress.suiteRunCount > 0);
  const isM5Complete = isM4Complete && (progress.portfolioReadmeCopied || progress.portfolioGitCopied);

  const getDynamicStatus = (id: number): 'completed' | 'active' | 'locked' => {
    if (id === 1) return isM1Complete ? 'completed' : 'active';
    if (id === 2) return isM2Complete ? 'completed' : (isM1Complete ? 'active' : 'locked');
    if (id === 3) return isM3Complete ? 'completed' : (isM2Complete ? 'active' : 'locked');
    if (id === 4) return isM4Complete ? 'completed' : (isM3Complete ? 'active' : 'locked');
    if (id === 5) return isM5Complete ? 'completed' : (isM4Complete ? 'active' : 'locked');
    return 'locked';
  };

  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0];

  return (
    <div className="space-y-8">
      {/* Hero Welcome for QA Engineers */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span>ISTQB Manual / API QA</span>
              <span aria-hidden="true">→</span>
              <span>AI Quality Engineer</span>
              <span aria-hidden="true">·</span>
              <span>100% Free Open-Source Local Stack</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              DeepEval LLM Evaluation Curriculum Roadmap
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Step-by-step interactive mastery designed to bridge your manual test analysis,
              boundary testing, and test case authoring into automated, local LLM-as-a-judge quality suites.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onGoToHardware}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Size My Machine & Ollama</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-center text-[11px] text-slate-500 font-mono">
              Prerequisite: Answer 3 hardware questions
            </div>
          </div>
        </div>
      </div>

      {/* Modules Roadmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module List Sidebar */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Curriculum Modules
          </div>
          {modules.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            const status = getDynamicStatus(mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className={isSelected ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
                        MOD 0{mod.id}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">{mod.duration}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-200 leading-snug">
                      {mod.title.replace(/Module \d+: /, '')}
                    </div>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    {status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : status === 'active' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        In Progress
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400 line-clamp-1">
                  {mod.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Module Detail Stage */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-medium mb-1">
              <span>Module 0{activeModule.id} Deep Dive</span>
              <span>·</span>
              <span>Estimated {activeModule.duration}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{activeModule.title}</h2>
            <p className="text-sm text-slate-300 mt-1">{activeModule.subtitle}</p>
          </div>

          {/* QA Bridge Callout */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Layers className="w-4 h-4" />
              <span>ISTQB QA Bridge Concept</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {activeModule.istqbBridge}
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Learning Objectives & Competencies</span>
            </div>
            <ul className="space-y-2">
              {activeModule.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Syntax / Reference Code */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-200">Key Syntax & Commands</div>
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg space-y-1.5">
              {activeModule.keySyntax.map((syn, idx) => (
                <div key={idx} className="text-xs font-mono text-indigo-300">
                  {syn}
                </div>
              ))}
            </div>
          </div>

          {/* Currency Rule Footer Notice & Assessment Trigger */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                All syntax verified against modern DeepEval standards for local Ollama test runs.
              </span>
            </div>
            {onGoToAssessment && (
              <button
                onClick={onGoToAssessment}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-medium transition-colors cursor-pointer shrink-0"
              >
                <span>Take Module 0{activeModule.id} Checkpoint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
