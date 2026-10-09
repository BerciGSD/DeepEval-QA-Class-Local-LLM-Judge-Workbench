/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { CurriculumNav } from './components/CurriculumNav';
import { HardwareSizer } from './components/HardwareSizer';
import { CumulativeSuiteViewer } from './components/CumulativeSuiteViewer';
import { MetricSandbox } from './components/MetricSandbox';
import { TerminalOutputParser } from './components/TerminalOutputParser';
import { ExerciseWorkbench } from './components/ExerciseWorkbench';
import { PortfolioPackager } from './components/PortfolioPackager';
import { AssessmentPortal } from './components/AssessmentPortal';
import { ProgressTracker } from './components/ProgressTracker';
import { Dashboard } from './components/Dashboard';
import { ProgressProvider } from './context/ProgressContext';
import { MODULES } from './data/curriculumData';
import { HardwareConfig } from './types/curriculum';
import { Check, ShieldCheck } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [hardwareConfig, setHardwareConfig] = useState<HardwareConfig>({
    os: 'windows',
    ram: '16gb',
    gpu: 'none',
    pythonInstalled: true,
    vscodeInstalled: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportConfig = () => {
    const script = `#!/bin/bash
# DeepEval 100% Local Setup Script
# Target: ${hardwareConfig.os.toUpperCase()} | RAM: ${hardwareConfig.ram}
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install deepeval pytest
ollama pull ${hardwareConfig.ram === '8gb' ? 'deepseek-r1:1.5b' : 'qwen2.5:7b'}
deepeval set-ollama --model=${hardwareConfig.ram === '8gb' ? 'deepseek-r1:1.5b' : 'qwen2.5:7b'}
export CONFIDENT_AI_API_KEY=""
echo "DeepEval local offline test environment configured successfully!"
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `setup_deepeval_local_${hardwareConfig.os}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported setup script for ${hardwareConfig.os}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportConfig={handleExportConfig}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono rounded-lg shadow-xl animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <Dashboard
            hardwareConfig={hardwareConfig}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onStartModule={(modId) => {
              setSelectedModuleId(modId);
              setActiveTab('curriculum');
            }}
          />
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-10">
            <CurriculumNav
              modules={MODULES}
              selectedModuleId={selectedModuleId}
              onSelectModule={(id) => setSelectedModuleId(id)}
              onGoToHardware={() => setActiveTab('hardware')}
              onGoToAssessment={() => setActiveTab('assessments')}
            />

            {/* In-Curriculum Exercise Workbench Preview */}
            <div className="pt-4 border-t border-slate-800">
              <ExerciseWorkbench />
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <ProgressTracker onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'hardware' && (
          <HardwareSizer
            config={hardwareConfig}
            onChangeConfig={(newCfg) => setHardwareConfig(newCfg)}
          />
        )}

        {activeTab === 'suite' && (
          <CumulativeSuiteViewer onNavigateToParser={() => setActiveTab('parser')} />
        )}

        {activeTab === 'parser' && <TerminalOutputParser />}

        {activeTab === 'sandbox' && <MetricSandbox />}

        {activeTab === 'assessments' && <AssessmentPortal />}

        {activeTab === 'portfolio' && <PortfolioPackager />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Free Open-Source Stack · Zero Token Cost · Offline Local Judge</span>
          </div>
          <div>ISTQB Test Engineering to AI Quality Engineering Transition</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  );
}
