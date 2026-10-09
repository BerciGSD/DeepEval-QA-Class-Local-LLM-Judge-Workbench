import React, { useState } from 'react';
import { FolderGit2, Check, Copy, FileText, Award, Terminal } from 'lucide-react';
import { useStudentProgress } from '../context/ProgressContext';

export const PortfolioPackager: React.FC = () => {
  const { recordPortfolioAction } = useStudentProgress();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (key === 'readme') {
      recordPortfolioAction('readme');
    } else {
      recordPortfolioAction('git');
    }
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const readmeContent = `# 🧪 AI Quality Engineering: Local LLM Evaluation Test Suite
> Automated test harness built with **DeepEval**, **Pytest**, and local **Ollama** judges at $0 token cost.

## 🎯 Project Overview
This repository contains an automated evaluation test suite designed by an ISTQB-certified QA Engineer transitioning into AI Quality Engineering. It verifies RAG-based responses and conversational LLM outputs against strict quality criteria without sending private data to cloud providers.

### Evaluated Quality Metrics
1. **Answer Relevancy (\`AnswerRelevancyMetric\`)**: Ensures responses directly address user questions without semantic drift.
2. **Factuality & Faithfulness (\`FaithfulnessMetric\`)**: Validates that answers are 100% grounded in retrieved internal knowledge documents.
3. **Hallucination Detection (\`HallucinationMetric\`)**: Automatically catches fabricated claims absent from reference data.
4. **Custom Rubrics (\`GEval\`)**: Tailored chain-of-thought evaluations for empathy, brand tone, and safety compliance.

---

## 🛠️ Tech Stack & Local Setup
- **Framework**: [DeepEval](https://github.com/confident-ai/deepeval)
- **Runner**: Pytest 8.x
- **Local Judge**: Ollama (\`deepseek-r1:1.5b\` / \`qwen2.5:7b\`)
- **Cost**: $0.00 (Zero API tokens required)

### Quickstart
\`\`\`bash
# 1. Clone & activate virtual environment
git clone https://github.com/your-username/deepeval-qa-suite.git
cd deepeval-qa-suite
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .\\.venv\\Scripts\\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Pull local judge model & set DeepEval default
ollama pull deepseek-r1:1.5b
deepeval set-ollama --model=deepseek-r1:1.5b

# 4. Run automated test suite
deepeval test run tests/test_qa_suite.py
\`\`\`
`;

  const gitSteps = [
    {
      step: 'Step 1: Initialize Git Repository',
      command: 'git init\ngit branch -M main',
      explanation: 'Initializes version tracking in your project root folder.',
    },
    {
      step: 'Step 2: Stage & Commit Test Artifacts',
      command: 'git add tests/ requirements.txt README.md pytest.ini .gitignore\ngit commit -m "feat: complete automated DeepEval test suite with Ollama local judge"',
      explanation: 'Creates your initial milestone commit with clean message.',
    },
    {
      step: 'Step 3: Connect to GitHub & Push',
      command: 'git remote add origin https://github.com/<your-username>/deepeval-qa-suite.git\ngit push -u origin main',
      explanation: 'Publishes your test harness to your GitHub profile for technical recruiters.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>Module 05 Deliverables</span>
              <span>·</span>
              <span>GitHub Showcase</span>
              <span>·</span>
              <span>Resume Artifacts</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Portfolio Artifact Creation & GitHub Packager
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Turn your cumulative project into a polished, recruiter-ready GitHub repository with
              reproducible installation scripts and ISTQB-to-AI-QA resume impact bullet points.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(readmeContent, 'readme')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              {copiedKey === 'readme' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>README Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy README.md</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Resume Impact Bullet Points Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Resume & LinkedIn Experience Bullet Points</span>
        </div>
        <p className="text-xs text-slate-400">
          Paste these verified achievements directly into your QA resume to demonstrate practical AI
          evaluation competency:
        </p>

        <div className="space-y-3">
          {[
            'Architected an automated LLM evaluation test harness using DeepEval and Pytest, executing 100% locally with zero cloud API token costs via Ollama judges.',
            'Bridged traditional ISTQB test case authoring and boundary analysis to LLMTestCase specifications, tuning acceptance score thresholds across Relevancy, Faithfulness, and Hallucination metrics.',
            'Created tailored G-Eval chain-of-thought rubrics to automate non-functional quality gate assertions for tone, format compliance, and brand safety.',
            'Diagnosed and mitigated local LLM-as-a-judge score variance through threshold calibration, reducing pipeline test flakiness while maintaining defect detection sensitivity.',
          ].map((bullet, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{bullet}</span>
              </div>
              <button
                onClick={() => handleCopy(bullet, `bullet_${idx}`)}
                className="shrink-0 text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Copy bullet"
              >
                {copiedKey === `bullet_${idx}` ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step GitHub Walkthrough */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Beginner-Friendly Git Publishing Workflow</span>
          </h3>
          <span className="text-xs text-slate-400">Step-by-step terminal execution</span>
        </div>

        <div className="space-y-3">
          {gitSteps.map((item, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{item.step}</div>
                  <div className="text-xs text-slate-400">{item.explanation}</div>
                </div>
                <button
                  onClick={() => handleCopy(item.command, `git_${i}`)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedKey === `git_${i}` ? (
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
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-200 overflow-x-auto whitespace-pre">
                {item.command}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* README Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Included README.md Documentation</span>
          </div>
          <span className="text-xs font-mono text-slate-500">Markdown Format</span>
        </div>
        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-80 whitespace-pre">
          {readmeContent}
        </pre>
      </div>
    </div>
  );
};
