import React, { useState } from 'react';
import { HardwareConfig, OS, RamSize, GpuType } from '../types/curriculum';
import { Cpu, Check, Copy, AlertTriangle, ShieldCheck, HardDrive } from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

interface HardwareSizerProps {
  config: HardwareConfig;
  onChangeConfig: (config: HardwareConfig) => void;
}

export const HardwareSizer: React.FC<HardwareSizerProps> = ({
  config,
  onChangeConfig,
}) => {
  const { markHardwareConfigured, recordCommandCopied } = useStudentProgress();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    recordCommandCopied(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRecommendedModel = () => {
    if (config.ram === '8gb') {
      return {
        model: 'deepseek-r1:1.5b',
        sizeGb: '1.8 GB',
        contextTokens: '8k tokens',
        reason: 'Optimal for 8GB total RAM. Leaves 5GB+ for Windows/macOS and Python test runner without disk paging or OOM crashes.',
      };
    }
    if (config.ram === '16gb') {
      return {
        model: 'qwen2.5:7b',
        sizeGb: '4.7 GB',
        contextTokens: '16k tokens',
        reason: 'State-of-the-art open-source evaluation judge. Exceptional instruction adherence and step-by-step scoring consistency.',
      };
    }
    return {
      model: 'qwen2.5:14b',
      sizeGb: '9.0 GB',
      contextTokens: '32k tokens',
      reason: 'Enterprise-grade local judge with minimal score variance. Requires 16GB+ VRAM or 32GB+ Unified Memory.',
    };
  };

  const rec = getRecommendedModel();

  const getVenvActivationCommand = (os: OS) => {
    if (os === 'windows') {
      return '.\\.venv\\Scripts\\Activate.ps1';
    }
    return 'source .venv/bin/activate';
  };

  const getOfflineEnvCommand = (os: OS) => {
    if (os === 'windows') {
      return '$env:CONFIDENT_AI_API_KEY=""';
    }
    return 'export CONFIDENT_AI_API_KEY=""';
  };

  const setupCommands = [
    {
      title: '1. Create Isolated Virtual Environment',
      code: `python -m venv .venv\n${getVenvActivationCommand(config.os)}`,
      explanation: 'Prevents dependency conflicts with global packages (ISO/IEC 29119 clean test harness baseline).',
    },
    {
      title: '2. Install DeepEval & Pytest',
      code: 'pip install --upgrade pip\npip install deepeval pytest',
      explanation: 'Installs the evaluation engine and automation test runner without cloud SDKs.',
    },
    {
      title: '3. Pull Local Judge Model with Ollama',
      code: `ollama pull ${rec.model}`,
      explanation: `Downloads ${rec.sizeGb} quantized model weights directly to your local drive ($0 token cost).`,
    },
    {
      title: '4. Configure DeepEval Global Judge (CLI Default)',
      code: `deepeval set-ollama --model=${rec.model}`,
      explanation: 'Permanently establishes the local model as judge for all metrics without hardcoding model= in tests.',
    },
    {
      title: '5. Lock Strict Offline Execution (Zero Telemetry)',
      code: `${getOfflineEnvCommand(config.os)}\ndeepeval test run --help`,
      explanation: 'Guarantees zero network calls to Confident AI cloud. Data stays 100% on your local machine.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
              <span>ISTQB Test Environment Baseline</span>
              <span aria-hidden="true">·</span>
              <span>100% Local</span>
              <span aria-hidden="true">·</span>
              <span>Zero Token Budget</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Hardware Sizing & Offline Judge Configuration
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configure your local machine parameters below to size the local LLM-as-a-judge model,
              prevent Out-Of-Memory errors, and establish a 100% air-gapped test environment.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-right">
              <div className="text-xs text-slate-400">Target Judge</div>
              <div className="text-sm font-bold font-mono text-indigo-300">{rec.model}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Operating System */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-slate-200">1. Operating System</div>
          <div className="space-y-2">
            {(['windows', 'mac', 'linux'] as OS[]).map((osKey) => (
              <button
                key={osKey}
                onClick={() => {
                  onChangeConfig({ ...config, os: osKey });
                  markHardwareConfigured();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                  config.os === osKey
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="capitalize">{osKey}</span>
                {config.os === osKey && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* RAM Size */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-slate-200">2. Available RAM</div>
          <div className="space-y-2">
            {[
              { id: '8gb' as RamSize, label: '8 GB RAM', sub: 'Budget / Standard laptop' },
              { id: '16gb' as RamSize, label: '16 GB RAM', sub: 'Developer baseline' },
              { id: '32gb_plus' as RamSize, label: '32 GB+ RAM', sub: 'High-end workstation' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => onChangeConfig({ ...config, ram: r.id })}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                  config.ram === r.id
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-left">
                  <div>{r.label}</div>
                  <div className="text-xs text-slate-500">{r.sub}</div>
                </div>
                {config.ram === r.id && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Acceleration & Tools */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-slate-200">3. Acceleration & Tooling</div>
          <div className="space-y-3">
            <div className="text-xs text-slate-400">Accelerator / GPU</div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {[
                { id: 'none' as GpuType, label: 'CPU' },
                { id: 'apple_silicon' as GpuType, label: 'Apple M' },
                { id: 'nvidia' as GpuType, label: 'Nvidia' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => onChangeConfig({ ...config, gpu: g.id })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    config.gpu === g.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Python 3.10+ Installed</span>
                <input
                  type="checkbox"
                  checked={config.pythonInstalled}
                  onChange={(e) =>
                    onChangeConfig({ ...config, pythonInstalled: e.target.checked })
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>VS Code Installed</span>
                <input
                  type="checkbox"
                  checked={config.vscodeInstalled}
                  onChange={(e) =>
                    onChangeConfig({ ...config, vscodeInstalled: e.target.checked })
                  }
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sizing Verdict */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-indigo-950/60 border border-indigo-500/40 rounded-lg text-indigo-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">Recommended Sizing Model:</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {rec.model}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {rec.sizeGb} footprint · {rec.contextTokens}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{rec.reason}</p>
          </div>
        </div>
      </div>

      {/* Offline Execution Commands Sequence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            Local Setup Execution Runbook ({config.os.toUpperCase()})
          </h3>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Air-Gapped & Telemetry Disabled</span>
          </div>
        </div>

        <div className="space-y-3">
          {setupCommands.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 transition-colors hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{step.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{step.explanation}</div>
                </div>
                <button
                  onClick={() => handleCopy(step.code, `step_${idx}`)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedKey === `step_${idx}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs font-mono text-indigo-200 overflow-x-auto whitespace-pre">
                {step.code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Senior QA Note on Local Evaluator Score Variance */}
      <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-semibold text-amber-300">
              Senior QA Engineering Note: Local Judge Variance vs Flaky Tests
            </div>
            <p className="text-slate-300 leading-relaxed">
              In traditional API testing, deterministic assertions either pass or fail 100% of the
              time. When using compact local LLM judges (such as 1.5B or 7B models), slight temperature
              fluctuations can produce score variations of ±0.05. In Module 4, we teach threshold
              tuning and tolerance assertion ranges so your regression pipeline remains reliable without
              introducing flaky test alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
