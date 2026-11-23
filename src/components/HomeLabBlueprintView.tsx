import React, { useState } from 'react';
import { HomeLabTask } from '../types/securityJob';
import { Terminal, Clock, Wrench, CheckCircle2, FolderGit2, Copy, Check, ChevronRight } from 'lucide-react';

interface HomeLabBlueprintViewProps {
  tasks: HomeLabTask[];
}

export const HomeLabBlueprintView: React.FC<HomeLabBlueprintViewProps> = ({ tasks }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [copiedTask, setCopiedTask] = useState<string | null>(null);

  const handleCopyCommand = (command: string, stepId: string) => {
    navigator.clipboard.writeText(command);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleCopyFullLab = (task: HomeLabTask) => {
    const text = `# ${task.title}
Domain: ${task.primaryDomain}
Estimated Time: ${task.estimatedHours} | Difficulty: ${task.difficulty}

## Objective
${task.objective}

## Recommended Free Tools
${task.recommendedFreeTools.map(t => `- ${t}`).join('\n')}

## Prerequisites
${task.prerequisites.map(p => `- ${p}`).join('\n')}

## Step-by-Step Execution Guide
${task.stepByStepGuide.map(s => `### Step ${s.stepNumber}: ${s.title}\n${s.description}${s.commandOrConfig ? `\n\`\`\`bash\n${s.commandOrConfig}\n\`\`\`` : ''}`).join('\n\n')}

## Verification Criteria
${task.verificationCriteria}

## Portfolio Deliverable
Format: ${task.portfolioDeliverable.format}
Artifacts to Include: ${task.portfolioDeliverable.whatToInclude}
`;
    navigator.clipboard.writeText(text);
    setCopiedTask(task.id);
    setTimeout(() => setCopiedTask(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>Hands-on Portfolio Builder</span>
              <span aria-hidden="true">·</span>
              <span>Rule 4: 2 Actionable Home Lab Blueprints</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              Custom Practical Security Blueprints
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Designed specifically to demonstrate required hands-on competencies using 100% free, community-edition, or open-source tools.
            </p>
          </div>
        </div>
      </div>

      {/* 2 Labs Display */}
      <div className="grid grid-cols-1 gap-6">
        {tasks.map((task, labIndex) => {
          return (
            <article
              key={task.id || labIndex}
              className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-sm transition-colors"
            >
              {/* Lab Header Strip */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    Home Lab 0{labIndex + 1}
                  </span>
                  <span aria-hidden="true" className="text-slate-700">/</span>
                  <span className="text-xs font-semibold text-slate-300">
                    {task.primaryDomain}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.estimatedHours}</span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-300">
                    {task.difficulty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyFullLab(task)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors ml-2"
                  >
                    {copiedTask === task.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied Lab</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Blueprint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Lab Title & Objective */}
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {task.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    <strong className="font-semibold text-slate-200">Objective: </strong>
                    {task.objective}
                  </p>
                </div>

                {/* Targeted Skills & Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Targeted Skills Tested
                    </h4>
                    <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
                      {task.targetedSkills.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      100% Free / Open-Source Tools
                    </h4>
                    <div className="flex flex-wrap gap-1.5 text-xs text-slate-300">
                      {task.recommendedFreeTools.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-900/50 text-[11px]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Execution Guide */}
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Step-by-Step Execution Guide
                  </h4>
                  <div className="space-y-3">
                    {task.stepByStepGuide.map((step) => {
                      const stepKey = `${task.id}-step-${step.stepNumber}`;
                      return (
                        <div
                          key={step.stepNumber}
                          className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/60"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {step.stepNumber}
                            </span>
                            <h5 className="text-xs font-bold text-slate-100">
                              {step.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-400 ml-7 leading-relaxed">
                            {step.description}
                          </p>

                          {step.commandOrConfig && (
                            <div className="mt-2.5 ml-7 relative">
                              <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-normal selection:bg-emerald-900">
                                <code>{step.commandOrConfig}</code>
                              </pre>
                              <button
                                type="button"
                                onClick={() => handleCopyCommand(step.commandOrConfig!, stepKey)}
                                className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700"
                              >
                                {copiedStep === stepKey ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Verification Criteria & Deliverable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verification Criteria</span>
                    </div>
                    <p className="text-xs text-emerald-300/80 leading-relaxed">
                      {task.verificationCriteria}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-900/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-1">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Portfolio Deliverable ({task.portfolioDeliverable.format})</span>
                    </div>
                    <p className="text-xs text-indigo-300/80 leading-relaxed">
                      {task.portfolioDeliverable.whatToInclude}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
