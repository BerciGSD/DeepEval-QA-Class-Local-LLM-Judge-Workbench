import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

interface ModelRunStats {
  modelName: string;
  tag: string;
  parameterSize: string;
  memoryFootprint: string;
  runs: number[];
  mean: number;
  variance: number;
  stdDev: number;
  flakinessRate: number; // percentage of runs flipping pass/fail
  reasoningCharacteristics: string;
  passedCount: number;
}

const TEST_SCENARIOS = [
  {
    id: 'borderline_relevancy',
    name: 'Scenario A: Borderline Answer Relevancy',
    description: 'The output answers the user query but includes an extra background sentence. Tests sensitivity to slight topic drift.',
    input: 'How do I download my monthly invoice PDF?',
    actualOutput: 'Go to Billing > Invoices and click "Download PDF". Note that invoices are generated on the 1st of every month automatically by our accounting team.',
    defaultThreshold: 0.70,
  },
  {
    id: 'subtle_hallucination',
    name: 'Scenario B: Subtle Factual Hallucination',
    description: 'The output is mostly true, but claims return window is 30 days when the retrieved context document specifies 14 days.',
    input: 'What is the return window for defective hardware?',
    actualOutput: 'Hardware items can be returned within 30 days in original packaging.',
    context: 'All hardware returns must be submitted within 14 calendar days of delivery.',
    defaultThreshold: 0.80,
  },
  {
    id: 'unambiguous_pass',
    name: 'Scenario C: Unambiguous Passing Test Case',
    description: 'Direct, factual, and strictly compliant response. Tests baseline judge agreement.',
    input: 'Does your platform support two-factor authentication (2FA)?',
    actualOutput: 'Yes, our platform supports two-factor authentication via Authenticator apps (TOTP) and SMS codes.',
    context: 'Two-factor authentication (2FA) is available via TOTP authenticator apps and SMS.',
    defaultThreshold: 0.75,
  },
];

export const ModelVarianceComparator: React.FC = () => {
  const { recordVarianceSimulation } = useStudentProgress();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('borderline_relevancy');
  const [runCount, setRunCount] = useState<number>(5);
  const [temperature, setTemperature] = useState<number>(0.3);
  const [threshold, setThreshold] = useState<number>(0.70);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [hasSimulated, setHasSimulated] = useState<boolean>(true);

  const scenario = TEST_SCENARIOS.find((s) => s.id === selectedScenarioId) || TEST_SCENARIOS[0];

  // Generate realistic score distributions based on model size and temperature
  const generateScores = (
    baseScore: number,
    noiseStdDev: number,
    count: number,
    tempFactor: number
  ): number[] => {
    const scores: number[] = [];
    const effectiveNoise = noiseStdDev * (0.4 + tempFactor * 1.2);

    for (let i = 0; i < count; i++) {
      // Gaussian approximation
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.random();
      const randNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const score = Math.min(1.0, Math.max(0.0, baseScore + randNormal * effectiveNoise));
      scores.push(parseFloat(score.toFixed(2)));
    }
    return scores;
  };

  const calculateStats = (
    modelName: string,
    tag: string,
    parameterSize: string,
    memoryFootprint: string,
    baseScore: number,
    noise: number,
    reasoning: string
  ): ModelRunStats => {
    const runs = generateScores(baseScore, noise, runCount, temperature);
    const mean = parseFloat((runs.reduce((a, b) => a + b, 0) / runs.length).toFixed(3));
    const variance = parseFloat(
      (runs.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / runs.length).toFixed(4)
    );
    const stdDev = parseFloat(Math.sqrt(variance).toFixed(3));

    const passedRuns = runs.filter((r) => r >= threshold);
    const passedCount = passedRuns.length;
    // Flakiness rate: if all pass or all fail, flakiness is 0%; if mixed, flakiness is (min(pass,fail)/total)*2
    const flipFraction = Math.min(passedCount, runs.length - passedCount) / runs.length;
    const flakinessRate = Math.round(flipFraction * 200);

    return {
      modelName,
      tag,
      parameterSize,
      memoryFootprint,
      runs,
      mean,
      variance,
      stdDev,
      flakinessRate,
      reasoningCharacteristics: reasoning,
      passedCount,
    };
  };

  // Pre-configured baseline scores per scenario
  const getScenarioBaselines = () => {
    if (selectedScenarioId === 'borderline_relevancy') {
      return {
        m15b: { base: 0.69, noise: 0.08 },
        m7b: { base: 0.73, noise: 0.03 },
        m14b: { base: 0.74, noise: 0.012 },
      };
    }
    if (selectedScenarioId === 'subtle_hallucination') {
      return {
        m15b: { base: 0.48, noise: 0.11 },
        m7b: { base: 0.32, noise: 0.04 },
        m14b: { base: 0.28, noise: 0.015 },
      };
    }
    // Unambiguous pass
    return {
      m15b: { base: 0.88, noise: 0.05 },
      m7b: { base: 0.94, noise: 0.02 },
      m14b: { base: 0.96, noise: 0.008 },
    };
  };

  const baselines = getScenarioBaselines();

  const [modelStats, setModelStats] = useState<ModelRunStats[]>([
    calculateStats(
      'deepseek-r1:1.5b',
      'Compact Local Judge',
      '1.5B parameters',
      '1.8 GB RAM',
      baselines.m15b.base,
      baselines.m15b.noise,
      'Higher score dispersion due to compact reasoning tokens and 4-bit quantization rounding. Prone to flipping around boundary thresholds.'
    ),
    calculateStats(
      'qwen2.5:7b',
      'Mid-Weight Local Judge',
      '7.0B parameters',
      '4.7 GB RAM',
      baselines.m7b.base,
      baselines.m7b.noise,
      'High instruction-following consistency. Minimal reasoning drift with narrow standard deviation.'
    ),
    calculateStats(
      'qwen2.5:14b',
      'High-Parameter Baseline',
      '14.0B parameters',
      '9.0 GB RAM',
      baselines.m14b.base,
      baselines.m14b.noise,
      'Enterprise-grade benchmark. Deterministic step generation with almost zero score variance.'
    ),
  ]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    recordVarianceSimulation();
    setTimeout(() => {
      const b = getScenarioBaselines();
      setModelStats([
        calculateStats(
          'deepseek-r1:1.5b',
          'Compact Local Judge',
          '1.5B parameters',
          '1.8 GB RAM',
          b.m15b.base,
          b.m15b.noise,
          'Higher score dispersion due to compact reasoning tokens and 4-bit quantization rounding. Prone to flipping around boundary thresholds.'
        ),
        calculateStats(
          'qwen2.5:7b',
          'Mid-Weight Local Judge',
          '7.0B parameters',
          '4.7 GB RAM',
          b.m7b.base,
          b.m7b.noise,
          'High instruction-following consistency. Minimal reasoning drift with narrow standard deviation.'
        ),
        calculateStats(
          'qwen2.5:14b',
          'High-Parameter Baseline',
          '14.0B parameters',
          '9.0 GB RAM',
          b.m14b.base,
          b.m14b.noise,
          'Enterprise-grade benchmark. Deterministic step generation with almost zero score variance.'
        ),
      ]);
      setIsSimulating(false);
      setHasSimulated(true);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>Evaluator Reliability & Score Variance</span>
              <span>·</span>
              <span>ISTQB Flakiness Analysis</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Local Judge Variance Comparator (1.5B vs 7B vs 14B)
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Understand why compact local models produce score variance across repeated runs, and
              learn how QA engineers calibrate score thresholds to prevent false test flakiness.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? 'Simulating Runs...' : `Simulate ${runCount} Repeated Runs`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl">
        {/* Scenario Selection */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-slate-200">Test Case Scenario</label>
          <select
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              const targetScen = TEST_SCENARIOS.find((s) => s.id === e.target.value);
              if (targetScen) setThreshold(targetScen.defaultThreshold);
            }}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {TEST_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">{scenario.description}</p>
        </div>

        {/* Sampling Temperature */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Judge Temperature</span>
            <span className="font-mono text-indigo-300 font-bold tabular-nums">
              {temperature.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="0.8"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.0 (Deterministic)</span>
            <span>0.7 (Standard)</span>
          </div>
        </div>

        {/* Cutoff Threshold */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Cutoff Threshold</span>
            <span className="font-mono text-indigo-300 font-bold tabular-nums">
              {threshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.50 (Loose)</span>
            <span>0.70 (Standard)</span>
            <span>0.90 (Strict)</span>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modelStats.map((stat, idx) => {
          const isHighVariance = stat.stdDev >= 0.05;
          const isFlaky = stat.flakinessRate > 0;

          return (
            <div
              key={idx}
              className={`bg-slate-900 border rounded-xl p-5 space-y-4 flex flex-col justify-between ${
                stat.modelName.includes('1.5b')
                  ? 'border-indigo-800/80 bg-indigo-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono font-semibold text-indigo-400">
                      {stat.tag}
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {stat.modelName}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {stat.memoryFootprint}
                  </span>
                </div>

                {/* Score Dispersion Scatter Strip */}
                <div className="space-y-1.5 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Repeated Runs Distribution:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {stat.passedCount}/{runCount} Passed
                    </span>
                  </div>

                  {/* Visual run dots */}
                  <div className="h-7 w-full bg-slate-900 rounded relative flex items-center px-2 overflow-hidden border border-slate-800/80">
                    {/* Cutoff line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: `${threshold * 100}%` }}
                      title={`Cutoff: ${threshold}`}
                    />

                    {/* Run score dots */}
                    {stat.runs.map((r, rIdx) => {
                      const passes = r >= threshold;
                      return (
                        <div
                          key={rIdx}
                          className={`absolute w-3 h-3 rounded-full border transform -translate-x-1/2 transition-all ${
                            passes
                              ? 'bg-emerald-500 border-emerald-300'
                              : 'bg-rose-500 border-rose-300'
                          }`}
                          style={{
                            left: `${Math.min(r * 100, 96)}%`,
                            opacity: 0.85,
                          }}
                          title={`Run ${rIdx + 1}: ${r.toFixed(2)}`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0.00</span>
                    <span className="text-amber-400">▲ Threshold ({threshold.toFixed(2)})</span>
                    <span>1.00</span>
                  </div>
                </div>

                {/* Stats Table */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                    <div className="text-[10px] text-slate-400">Mean Score (μ)</div>
                    <div className="text-sm font-bold text-white tabular-nums">
                      {stat.mean.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                    <div className="text-[10px] text-slate-400">Std Dev (σ)</div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isHighVariance ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      ±{stat.stdDev.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Flakiness Banner */}
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-mono ${
                    isFlaky
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isFlaky ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Flakiness Risk:</span>
                  </div>
                  <span className="font-bold">{isFlaky ? `${stat.flakinessRate}% (Flaky)` : '0% (Stable)'}</span>
                </div>

                {/* Diagnostic Description */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stat.reasoningCharacteristics}
                </p>
              </div>

              {/* Individual run pill list */}
              <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Run scores: </span>
                {stat.runs.map((r, i) => (
                  <span
                    key={i}
                    className={`font-semibold ${r >= threshold ? 'text-emerald-400' : 'text-rose-400'}`}
                  >
                    {r.toFixed(2)}
                    {i < stat.runs.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Senior QA Mitigation Strategies */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Senior QA Best Practices: Taming Local Judge Variance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
            <div className="font-semibold text-indigo-400">1. Threshold Calibration</div>
            <p className="text-slate-400 leading-relaxed">
              When sizing down to a 1.5B judge on laptops, calibrate boundary thresholds (e.g., set
              threshold=0.65 instead of 0.70) to prevent borderline passes from failing due to minor score noise.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
            <div className="font-semibold text-indigo-400">2. Deterministic Sampling (temp=0)</div>
            <p className="text-slate-400 leading-relaxed">
              Always set evaluation sampling temperature to 0.0 in local Ollama configurations. Greedy
              decoding locks generation paths and cuts score variance by over 70%.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
            <div className="font-semibold text-indigo-400">3. Retry Tolerances & Pytest Reruns</div>
            <p className="text-slate-400 leading-relaxed">
              Treat LLM evaluation suites like flaky UI/E2E tests: integrate <code className="text-indigo-300 font-mono">pytest-rerunfailures</code> or
              multi-trial voting rather than failing CI/CD builds on single borderline slips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
