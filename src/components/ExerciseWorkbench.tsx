import React, { useState } from 'react';
import { EXERCISES } from '../data/curriculumData';
import { ExerciseTask } from '../types/curriculum';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Lightbulb, RotateCcw } from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

export const ExerciseWorkbench: React.FC = () => {
  const { recordExerciseCompleted } = useStudentProgress();
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [userSubmission, setUserSubmission] = useState('');
  const [unlockedHintTier, setUnlockedHintTier] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect' | null;
    message: string;
  }>({ status: null, message: '' });

  const currentTask: ExerciseTask = EXERCISES[selectedTaskIndex];

  const handleCheckAttempt = () => {
    if (!userSubmission.trim()) {
      setFeedback({
        status: 'incorrect',
        message: 'Please provide an attempt first before submitting.',
      });
      return;
    }

    const cleanInput = userSubmission.trim().toLowerCase();
    const cleanSolution = currentTask.solution.trim().toLowerCase();

    // Check if input matches or contains key solution element
    const isCorrect =
      cleanInput === cleanSolution ||
      cleanInput.includes(cleanSolution) ||
      (currentTask.id === 'm1_task1' && cleanInput.includes('command_b')) ||
      (currentTask.id === 'm2_task1' && cleanInput.includes('retrieval_context')) ||
      (currentTask.id === 'm2_task2' && cleanInput.includes('threshold')) ||
      (currentTask.id === 'm3_task1' && cleanInput.includes('actual_output'));

    if (isCorrect) {
      recordExerciseCompleted(currentTask.id);
      setFeedback({
        status: 'correct',
        message:
          'Excellent! Your solution is correct. Notice how this aligns with the ISTQB test concept.',
      });
    } else {
      setFeedback({
        status: 'incorrect',
        message: 'Not quite. Check your parameter names and syntax, or request Tier 1 Hint below.',
      });
    }
  };

  const handleNextTask = () => {
    if (selectedTaskIndex < EXERCISES.length - 1) {
      setSelectedTaskIndex((prev) => prev + 1);
      setUserSubmission('');
      setUnlockedHintTier(0);
      setFeedback({ status: null, message: '' });
    }
  };

  const handleReset = () => {
    setUserSubmission('');
    setUnlockedHintTier(0);
    setFeedback({ status: null, message: '' });
  };

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>Interactive Retrieval Task</span>
              <span>·</span>
              <span>Module 0{currentTask.moduleId}</span>
              <span>·</span>
              <span className="capitalize">{currentTask.type.replace(/_/g, ' ')}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{currentTask.title}</h2>
            <p className="text-sm text-slate-300 mt-1">{currentTask.conceptIntro}</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>
              Task {selectedTaskIndex + 1} of {EXERCISES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Task Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Scaffolding */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Scaffolded Code (Complete the Gap)
            </span>
            <span className="text-xs font-mono text-amber-400">Production Before Reference</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
              <code>{currentTask.scaffoldCode}</code>
            </pre>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg space-y-1">
            <div className="text-xs font-semibold text-indigo-400">QA Concept Bridge:</div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentTask.qaAnalogy}</p>
          </div>
        </div>

        {/* Right: Submission & Tiered Hints */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 block">
              {currentTask.deliberateGapPrompt}
            </label>
            <textarea
              rows={3}
              placeholder="Type your fix / parameter / code here..."
              value={userSubmission}
              onChange={(e) => setUserSubmission(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCheckAttempt}
              className="flex-1 py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Check My Attempt
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Reset task"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback banner */}
          {feedback.status && (
            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                feedback.status === 'correct'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              {feedback.status === 'correct' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-2">
                <div>{feedback.message}</div>
                {feedback.status === 'correct' && selectedTaskIndex < EXERCISES.length - 1 && (
                  <button
                    onClick={handleNextTask}
                    className="flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    <span>Advance to Next Exercise</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tiered Hints System */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Tiered Hints</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Tier {unlockedHintTier}/3
              </span>
            </div>

            <div className="space-y-2">
              {/* Tier 1 */}
              {unlockedHintTier >= 1 ? (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-200/90 font-mono">
                  <span className="font-bold text-amber-400">Tier 1 Nudge:</span>{' '}
                  {currentTask.hints.tier1Nudge}
                </div>
              ) : (
                <button
                  onClick={() => setUnlockedHintTier(1)}
                  className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Unlock Tier 1: Nudge Question
                </button>
              )}

              {/* Tier 2 */}
              {unlockedHintTier >= 2 ? (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-indigo-200/90 font-mono">
                  <span className="font-bold text-indigo-400">Tier 2 Concept:</span>{' '}
                  {currentTask.hints.tier2Concept}
                </div>
              ) : unlockedHintTier === 1 ? (
                <button
                  onClick={() => setUnlockedHintTier(2)}
                  className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Unlock Tier 2: Concept Without Syntax
                </button>
              ) : null}

              {/* Tier 3 */}
              {unlockedHintTier >= 3 ? (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono">
                  <span className="font-bold text-emerald-400">Tier 3 Full Solution:</span>{' '}
                  {currentTask.hints.tier3FullAnswer}
                </div>
              ) : unlockedHintTier === 2 ? (
                <button
                  onClick={() => setUnlockedHintTier(3)}
                  className="w-full text-left p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Unlock Tier 3: Reference Solution (After Attempt)
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
