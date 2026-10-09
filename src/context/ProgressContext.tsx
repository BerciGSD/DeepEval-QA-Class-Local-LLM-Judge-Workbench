import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  StudentProgressState,
  INITIAL_PROGRESS_STATE,
  MetricMeasurement,
  TestExecutionRecord,
} from '../types/progress';

interface ProgressContextType {
  progress: StudentProgressState;
  overallPercent: number;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
  markHardwareConfigured: () => void;
  recordCommandCopied: (stepId: string) => void;
  recordExerciseCompleted: (exerciseId: string) => void;
  recordQuizResult: (
    moduleId: number,
    score: number,
    total: number,
    passed: boolean,
    answers: Record<string, string>
  ) => void;
  recordMetricMeasurement: (
    metricId: string,
    name: string,
    score: number,
    threshold: number,
    passed: boolean,
    reason: string
  ) => void;
  recordSuiteExecution: (records: TestExecutionRecord[]) => void;
  recordVarianceSimulation: () => void;
  recordLogParsed: () => void;
  recordPortfolioAction: (action: 'readme' | 'git') => void;
  resetAllProgress: () => void;
}

const STORAGE_KEY = 'deepeval_qa_student_progress_v2';

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<StudentProgressState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // fallback to initial
    }
    return INITIAL_PROGRESS_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      // ignore
    }
  }, [progress]);

  // Compute strictly real milestones (12 milestones)
  const isM1Done = progress.hardwareConfigured && progress.copiedSetupCommands.length >= 2;
  const isM2Done =
    (progress.metricMeasurements['answer_relevancy'] !== undefined ||
      progress.metricMeasurements['faithfulness'] !== undefined) &&
    progress.completedExerciseIds.includes('m2_task1');
  const isM3Done =
    progress.metricMeasurements['geval_rubric'] !== undefined &&
    progress.completedExerciseIds.includes('m3_task1');
  const isM4Done = progress.suiteRunCount > 0 && progress.varianceSimulationsCount > 0;
  const isM5Done = progress.portfolioReadmeCopied || progress.portfolioGitCopied;

  // Individual 12 milestone boolean evaluations
  const milestonesCompletedList = [
    // 1. Hardware Sized
    progress.hardwareConfigured,
    // 2. Local Setup Commands Copied/Configured
    progress.copiedSetupCommands.length >= 2,
    // 3. Module 1 Quiz Passed
    !!progress.quizResults[1]?.passed,
    // 4. LLMTestCase / Exercise 2 Completed
    progress.completedExerciseIds.includes('m2_task1'),
    // 5. Answer Relevancy Measured
    progress.metricMeasurements['answer_relevancy'] !== undefined,
    // 6. Faithfulness or Hallucination Measured
    progress.metricMeasurements['faithfulness'] !== undefined ||
      progress.metricMeasurements['hallucination'] !== undefined,
    // 7. G-Eval Rubric Measured in Sandbox
    progress.metricMeasurements['geval_rubric'] !== undefined,
    // 8. Module 3 Quiz Passed
    !!progress.quizResults[3]?.passed,
    // 9. Pytest Suite Executed via CLI
    progress.suiteRunCount > 0,
    // 10. Judge Variance Simulated
    progress.varianceSimulationsCount > 0,
    // 11. Module 4 Quiz Passed
    !!progress.quizResults[4]?.passed,
    // 12. Portfolio / README Packaged
    progress.portfolioReadmeCopied || progress.portfolioGitCopied,
  ];

  const completedMilestonesCount = milestonesCompletedList.filter(Boolean).length;
  const totalMilestonesCount = milestonesCompletedList.length; // 12
  const overallPercent = Math.round((completedMilestonesCount / totalMilestonesCount) * 100);

  const markHardwareConfigured = () => {
    setProgress((prev) => ({ ...prev, hardwareConfigured: true }));
  };

  const recordCommandCopied = (stepId: string) => {
    setProgress((prev) => {
      const exists = prev.copiedSetupCommands.includes(stepId);
      return {
        ...prev,
        hardwareConfigured: true,
        copiedSetupCommands: exists
          ? prev.copiedSetupCommands
          : [...prev.copiedSetupCommands, stepId],
      };
    });
  };

  const recordExerciseCompleted = (exerciseId: string) => {
    setProgress((prev) => {
      if (prev.completedExerciseIds.includes(exerciseId)) return prev;
      return {
        ...prev,
        completedExerciseIds: [...prev.completedExerciseIds, exerciseId],
      };
    });
  };

  const recordQuizResult = (
    moduleId: number,
    score: number,
    total: number,
    passed: boolean,
    answers: Record<string, string>
  ) => {
    setProgress((prev) => ({
      ...prev,
      quizResults: {
        ...prev.quizResults,
        [moduleId]: { score, total, passed, answers },
      },
    }));
  };

  const recordMetricMeasurement = (
    metricId: string,
    name: string,
    score: number,
    threshold: number,
    passed: boolean,
    reason: string
  ) => {
    setProgress((prev) => ({
      ...prev,
      metricMeasurements: {
        ...prev.metricMeasurements,
        [metricId]: {
          metricId,
          name,
          score,
          threshold,
          passed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reason,
        },
      },
    }));
  };

  const recordSuiteExecution = (records: TestExecutionRecord[]) => {
    setProgress((prev) => ({
      ...prev,
      suiteRunCount: prev.suiteRunCount + 1,
      testExecutions: [...records, ...prev.testExecutions].slice(0, 10), // keep recent 10
    }));
  };

  const recordVarianceSimulation = () => {
    setProgress((prev) => ({
      ...prev,
      varianceSimulationsCount: prev.varianceSimulationsCount + 1,
    }));
  };

  const recordLogParsed = () => {
    setProgress((prev) => ({
      ...prev,
      logsParsedCount: prev.logsParsedCount + 1,
    }));
  };

  const recordPortfolioAction = (action: 'readme' | 'git') => {
    setProgress((prev) => ({
      ...prev,
      portfolioReadmeCopied: action === 'readme' ? true : prev.portfolioReadmeCopied,
      portfolioGitCopied: action === 'git' ? true : prev.portfolioGitCopied,
    }));
  };

  const resetAllProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(INITIAL_PROGRESS_STATE);
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        overallPercent,
        completedMilestonesCount,
        totalMilestonesCount,
        markHardwareConfigured,
        recordCommandCopied,
        recordExerciseCompleted,
        recordQuizResult,
        recordMetricMeasurement,
        recordSuiteExecution,
        recordVarianceSimulation,
        recordLogParsed,
        recordPortfolioAction,
        resetAllProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useStudentProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useStudentProgress must be used within a ProgressProvider');
  }
  return context;
};
