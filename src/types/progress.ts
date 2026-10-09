export interface MetricMeasurement {
  metricId: string;
  name: string;
  score: number;
  threshold: number;
  passed: boolean;
  timestamp: string;
  reason: string;
}

export interface TestExecutionRecord {
  id: string;
  testName: string;
  metric: string;
  score: number;
  cutoff: number;
  passed: boolean;
  timestamp: string;
  diagnosis?: string;
}

export interface StudentProgressState {
  hardwareConfigured: boolean;
  copiedSetupCommands: string[];
  metricMeasurements: Record<string, MetricMeasurement>;
  completedExerciseIds: string[];
  quizResults: Record<
    number,
    {
      score: number;
      total: number;
      passed: boolean;
      answers: Record<string, string>;
    }
  >;
  testExecutions: TestExecutionRecord[];
  suiteRunCount: number;
  varianceSimulationsCount: number;
  logsParsedCount: number;
  portfolioReadmeCopied: boolean;
  portfolioGitCopied: boolean;
}

export const INITIAL_PROGRESS_STATE: StudentProgressState = {
  hardwareConfigured: false,
  copiedSetupCommands: [],
  metricMeasurements: {},
  completedExerciseIds: [],
  quizResults: {},
  testExecutions: [],
  suiteRunCount: 0,
  varianceSimulationsCount: 0,
  logsParsedCount: 0,
  portfolioReadmeCopied: false,
  portfolioGitCopied: false,
};
