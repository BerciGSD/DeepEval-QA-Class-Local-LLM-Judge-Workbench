export type OS = 'windows' | 'mac' | 'linux';
export type RamSize = '8gb' | '16gb' | '32gb_plus';
export type GpuType = 'none' | 'apple_silicon' | 'nvidia';

export interface HardwareConfig {
  os: OS;
  ram: RamSize;
  gpu: GpuType;
  pythonInstalled: boolean;
  vscodeInstalled: boolean;
}

export interface MetricDefinition {
  id: string;
  name: string;
  category: 'core_single_turn' | 'geval_custom';
  qaEquivalent: string;
  formulaDescription: string;
  requiredFields: string[];
  optionalFields: string[];
  defaultThreshold: number;
  sampleCode: string;
  explanation: string;
}

export interface ExerciseTask {
  id: string;
  moduleId: number;
  title: string;
  type: 'spot_the_bug' | 'fill_the_blank' | 'predict_output' | 'explain_concept';
  qaAnalogy: string;
  conceptIntro: string;
  scaffoldCode: string;
  deliberateGapPrompt: string;
  solution: string;
  hints: {
    tier1Nudge: string;
    tier2Concept: string;
    tier3FullAnswer: string;
  };
}

export interface ModuleInfo {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  istqbBridge: string;
  status: 'active' | 'locked' | 'completed';
  objectives: string[];
  keySyntax: string[];
}
