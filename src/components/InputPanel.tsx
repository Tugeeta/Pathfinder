import React, { useState } from 'react';
import { Sparkles, Trash2, ArrowRight, UploadCloud, FileJson } from 'lucide-react';
import { SAMPLE_POSTINGS, SamplePosting } from '../data/sampleJobPostings';
import { ParsedSecurityJob } from '../types/securityJob';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onParse: () => void;
  onImportJson: (job: ParsedSecurityJob) => void;
  isLoading: boolean;
  selectedSampleId: string;
  onSelectSample: (sample: SamplePosting) => void;
}

function tryParseSecurityJobJson(raw: string): ParsedSecurityJob | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (
      obj &&
      typeof obj === 'object' &&
      obj.metadata &&
      typeof obj.metadata.title === 'string' &&
      obj.domains &&
      typeof obj.domains === 'object'
    ) {
      return {
        metadata: {
          title: obj.metadata.title || 'Security Analyst',
          company: obj.metadata.company || 'Imported Organization',
          location: obj.metadata.location || 'Not specified',
          workplaceType: obj.metadata.workplaceType || 'Not specified',
          experienceLevel: obj.metadata.experienceLevel || 'Entry-Level',
          employmentType: obj.metadata.employmentType,
          securityClearance: obj.metadata.securityClearance,
        },
        executiveSummary: obj.executiveSummary || '',
        domains: {
          siemAndLogAnalysis: Array.isArray(obj.domains.siemAndLogAnalysis) ? obj.domains.siemAndLogAnalysis : [],
          networkDefenseAndTrafficAnalysis: Array.isArray(obj.domains.networkDefenseAndTrafficAnalysis) ? obj.domains.networkDefenseAndTrafficAnalysis : [],
          identityAndAccessManagement: Array.isArray(obj.domains.identityAndAccessManagement) ? obj.domains.identityAndAccessManagement : [],
          incidentResponseAndTriage: Array.isArray(obj.domains.incidentResponseAndTriage) ? obj.domains.incidentResponseAndTriage : [],
          complianceAndGrc: Array.isArray(obj.domains.complianceAndGrc) ? obj.domains.complianceAndGrc : [],
        },
        atsKeywords: Array.isArray(obj.atsKeywords) ? obj.atsKeywords : [],
        homeLabTasks: Array.isArray(obj.homeLabTasks) && obj.homeLabTasks.length >= 2
          ? [obj.homeLabTasks[0], obj.homeLabTasks[1]]
          : [
              obj.homeLabTasks?.[0] ?? {
                id: 'imported-lab-1',
                title: 'SIEM Alert Triage & Log Correlation Lab',
                primaryDomain: 'SIEM & Log Analysis',
                targetedSkills: ['SIEM Querying', 'Log Analysis'],
                difficulty: 'Beginner',
                estimatedHours: '2 hours',
                objective: 'Practice ingesting and querying security telemetry logs.',
                recommendedFreeTools: ['Elastic Security / Kibana', 'Sysmon'],
                prerequisites: ['Local VM or Docker'],
                stepByStepGuide: [{ stepNumber: 1, title: 'Ingest sample logs', description: 'Load event telemetry and filter authentication failures.' }],
                verificationCriteria: 'Produce saved detection query and triage note.',
                portfolioDeliverable: { format: 'Markdown Report', whatToInclude: 'Query screenshots and alert triage summary.' },
              },
              obj.homeLabTasks?.[1] ?? {
                id: 'imported-lab-2',
                title: 'PCAP Traffic Inspection & IOC Extraction Lab',
                primaryDomain: 'Network Defense & Traffic Analysis',
                targetedSkills: ['Wireshark', 'Protocol Analysis'],
                difficulty: 'Beginner',
                estimatedHours: '2 hours',
                objective: 'Inspect suspicious network captures for anomalies.',
                recommendedFreeTools: ['Wireshark', 'Suricata'],
                prerequisites: ['Wireshark installed'],
                stepByStepGuide: [{ stepNumber: 1, title: 'Inspect HTTP & DNS streams', description: 'Filter anomalous beaconing and DNS queries.' }],
                verificationCriteria: 'Document extracted IOCs and protocol findings.',
                portfolioDeliverable: { format: 'GitHub Writeup', whatToInclude: 'IOC table and Wireshark filter notes.' },
              },
            ],
        parserVersion: obj.parserVersion || 'Imported-JSON',
        parsedAt: obj.parsedAt || new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  onParse,
  onImportJson,
  isLoading,
  selectedSampleId,
  onSelectSample,
}) => {
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const detectedJson = tryParseSecurityJobJson(inputText);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setInputText(content);
          const parsedJson = tryParseSecurityJobJson(content);
          if (parsedJson) {
            onImportJson(parsedJson);
            setImportNotice(`Imported structured job JSON: ${parsedJson.metadata.title}`);
            setTimeout(() => setImportNotice(null), 4000);
          } else {
            setImportNotice(null);
          }
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <section id="parser-input" className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 md:p-6 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Job Posting & Structured Data Input
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste an entry-level security analyst posting, load an industry preset, or import an exported Pathfind JSON file.
          </p>
        </div>

        {/* Word and character counters */}
        <div className="flex items-center gap-3 text-xs text-slate-400 tabular-nums">
          <span>{wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>{charCount} characters</span>
        </div>
      </div>

      {/* Quick-load Sample Postings */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Load Pre-Configured Entry-Level Job Posting:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SAMPLE_POSTINGS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setImportNotice(null);
                  onSelectSample(sample);
                }}
                className={`text-left p-2.5 rounded-lg border transition-all text-xs ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/50 text-indigo-200 font-medium'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="font-semibold truncate text-slate-200">{sample.name}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {sample.company}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Area */}
      <div className="mt-4 relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste raw unstructured security analyst job posting OR Pathfind structured JSON here..."
          rows={8}
          className="w-full font-mono text-xs p-3.5 rounded-lg border border-slate-700 bg-slate-950/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors resize-y placeholder:text-slate-500 leading-relaxed"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              if (detectedJson) {
                onImportJson(detectedJson);
              } else {
                onParse();
              }
            }
          }}
        />
      </div>

      {importNotice && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300">
          {importNotice}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-slate-700">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Posting / JSON</span>
            <input
              type="file"
              accept=".txt,.md,.doc,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {inputText && (
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setImportNotice(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-slate-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">Ctrl+Enter</kbd>
          </span>

          {detectedJson ? (
            <button
              type="button"
              onClick={() => {
                onImportJson(detectedJson);
                setImportNotice(`Loaded structured JSON for ${detectedJson.metadata.title}`);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Import Job JSON</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onParse}
              disabled={isLoading || !inputText.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-sm ${
                isLoading || !inputText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Parsing Job Posting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Parse Job Posting</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
