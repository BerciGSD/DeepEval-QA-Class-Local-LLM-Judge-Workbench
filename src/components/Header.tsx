import React from 'react';
import { Terminal, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExportConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportConfig,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'progress', label: 'Progress' },
    { id: 'hardware', label: 'Hardware' },
    { id: 'suite', label: 'Test Suite' },
    { id: 'parser', label: 'Log Parser' },
    { id: 'sandbox', label: 'Sandbox' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Terminal className="w-4 h-4" />
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
            className="text-base font-bold tracking-tight text-slate-100 hover:text-white whitespace-nowrap"
          >
            DeepEval QA Workbench
          </a>
        </div>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors whitespace-nowrap py-1 cursor-pointer ${
                activeTab === item.id
                  ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportConfig}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shadow-sm shadow-indigo-950 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Setup Script</span>
          </button>
        </div>
      </div>
    </header>
  );
};
