import React, { useCallback, useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { InputPanel } from './components/InputPanel';
import { MetadataCard } from './components/MetadataCard';
import { SecurityDomainsView } from './components/SecurityDomainsView';
import { SecurityDomainRadar } from './components/SecurityDomainRadar';
import { CandidateReadinessChecklist } from './components/CandidateReadinessChecklist';
import { AtsOptimizerView } from './components/AtsOptimizerView';
import { HomeLabBlueprintView } from './components/HomeLabBlueprintView';
import { JsonInspectorView } from './components/JsonInspectorView';
import { SAMPLE_POSTINGS, SamplePosting } from './data/sampleJobPostings';
import { DomainSkill, ParsedSecurityJob } from './types/securityJob';
import { parseSecurityJobFallback } from './utils/fallbackParser';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileUp,
  Sparkles,
} from 'lucide-react';

type BgTheme = 'soc' | 'midnight' | 'navy';

function buildInitialCheckedSkills(job: ParsedSecurityJob): Record<string, boolean> {
  const initial: Record<string, boolean> = {};
  const domainLists: DomainSkill[][] = [
    job.domains.siemAndLogAnalysis || [],
    job.domains.networkDefenseAndTrafficAnalysis || [],
    job.domains.identityAndAccessManagement || [],
    job.domains.incidentResponseAndTriage || [],
    job.domains.complianceAndGrc || [],
  ];

  // Seed a realistic entry-level baseline profile across the 5 domains
  domainLists.forEach((skills, domainIndex) => {
    skills.forEach((skill, skillIdx) => {
      if (domainIndex === 0 && skillIdx < 2) {
        initial[skill.skill] = true;
      } else if (domainIndex === 1 && skillIdx < 2) {
        initial[skill.skill] = true;
      } else if (domainIndex === 2 && skillIdx === 0) {
        initial[skill.skill] = true;
      } else if (domainIndex === 3 && skillIdx === 0) {
        initial[skill.skill] = true;
      }
    });
  });

  return initial;
}

const initialSample = SAMPLE_POSTINGS[0];
const initialParsedJob = parseSecurityJobFallback(initialSample.rawText);

export default function App() {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(initialSample.id);
  const [inputText, setInputText] = useState<string>(initialSample.rawText);
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(false);

  const [parsedJob, setParsedJob] = useState<ParsedSecurityJob>(initialParsedJob);
  const [parseSource, setParseSource] = useState<string>('rule_engine');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>('readiness');
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>(() =>
    buildInitialCheckedSkills(initialParsedJob)
  );

  const [bgTheme, setBgTheme] = useState<BgTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pathfind_bg_theme');
      if (saved === 'soc' || saved === 'midnight' || saved === 'navy') {
        return saved;
      }
    }
    return 'soc';
  });

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('pathfind_bg_theme', bgTheme);
  }, [bgTheme]);

  const bgClass =
    bgTheme === 'soc'
      ? 'bg-[#0b0f19]'
      : bgTheme === 'midnight'
      ? 'bg-[#030712]'
      : 'bg-[#070e1e]';

  const handleToggleSkill = useCallback((skillName: string) => {
    setCheckedSkills((prev) => ({
      ...prev,
      [skillName]: !prev[skillName],
    }));
  }, []);

  const handleToggleDomainSkills = useCallback(
    (skills: DomainSkill[], markAs: boolean) => {
      setCheckedSkills((prev) => {
        const next = { ...prev };
        skills.forEach((s) => {
          next[s.skill] = markAs;
        });
        return next;
      });
    },
    []
  );

  const handleResetAllSkills = useCallback(() => {
    setCheckedSkills({});
  }, []);

  const handleParseJob = async (overrideText?: string) => {
    const textToParse = (overrideText ?? inputText).trim();
    if (!textToParse) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || 'Failed to parse job posting.');
      }

      setParsedJob(payload.data);
      setParseSource(payload.source || 'gemini');
      setIsInputExpanded(false);
    } catch (err: any) {
      const fallback = parseSecurityJobFallback(textToParse);
      setParsedJob(fallback);
      setParseSource('rule_engine');
      setErrorMsg(
        err?.message
          ? `Server parser unavailable (${err.message}). Loaded deterministic SOC fallback output.`
          : 'Loaded deterministic SOC fallback output.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: SamplePosting) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.rawText);
    setErrorMsg(null);
    const localParsed = parseSecurityJobFallback(sample.rawText);
    setParsedJob(localParsed);
    setParseSource('rule_engine');
  };

  const handleImportJson = (importedJob: ParsedSecurityJob) => {
    setSelectedSampleId('imported');
    setParsedJob(importedJob);
    setParseSource('imported_json');
    setErrorMsg(null);
    setIsInputExpanded(false);
    setActiveTab('readiness');
  };

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(parsedJob, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitized = (parsedJob.metadata?.title || 'security-job')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.download = `pathfind-${sanitized}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const navTabs = [
    { id: 'domains', label: 'Security Domains' },
    { id: 'readiness', label: 'Proficiency Radar' },
    { id: 'ats', label: 'ATS Matrix' },
    { id: 'homelabs', label: 'Home Labs' },
    { id: 'json', label: 'Structured JSON' },
  ];

  return (
    <div className={`min-h-screen ${bgClass} text-slate-100 flex flex-col transition-colors`}>
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bgTheme={bgTheme}
        setBgTheme={setBgTheme}
        onDownloadJson={handleDownloadJson}
        hasData={Boolean(parsedJob)}
      />

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden border-b border-slate-800 bg-slate-950/80 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Compact Job Preset & Import Control Bar */}
        <section className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Active Role Profile:
              </span>
              {SAMPLE_POSTINGS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {sample.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsInputExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paste Posting / Import JSON</span>
                {isInputExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleParseJob()}
                disabled={isLoading || !inputText.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? 'AI Parsing...' : 'Run AI Parse'}</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </section>

        {/* Expandable Input & JSON Import Panel */}
        {isInputExpanded && (
          <InputPanel
            inputText={inputText}
            setInputText={setInputText}
            onParse={() => handleParseJob()}
            onImportJson={handleImportJson}
            isLoading={isLoading}
            selectedSampleId={selectedSampleId}
            onSelectSample={handleSelectSample}
          />
        )}

        {/* Rule 1: Job Metadata Card */}
        <MetadataCard
          metadata={parsedJob.metadata}
          executiveSummary={parsedJob.executiveSummary}
          source={parseSource}
          parsedAt={parsedJob.parsedAt}
        />

        {/* Active Dashboard View */}
        {activeTab === 'readiness' && (
          <div className="space-y-6">
            <SecurityDomainRadar
              data={parsedJob}
              checkedSkills={checkedSkills}
              onToggleDomainSkills={handleToggleDomainSkills}
              onResetAllSkills={handleResetAllSkills}
              onNavigateToAudit={() => {
                const el = document.getElementById('skill-audit-checklist');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <div id="skill-audit-checklist">
              <CandidateReadinessChecklist
                data={parsedJob}
                checkedSkills={checkedSkills}
                onToggleSkill={handleToggleSkill}
                onToggleDomainSkills={handleToggleDomainSkills}
                onNavigateToLabs={() => setActiveTab('homelabs')}
              />
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <SecurityDomainsView domains={parsedJob.domains} />
        )}

        {activeTab === 'ats' && (
          <AtsOptimizerView keywords={parsedJob.atsKeywords} />
        )}

        {activeTab === 'homelabs' && (
          <HomeLabBlueprintView tasks={parsedJob.homeLabTasks} />
        )}

        {activeTab === 'json' && (
          <JsonInspectorView data={parsedJob} />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Pathfind Security Parsing Engine</span>
          <span>5 Security Domains · Proficiency Radar · ATS Optimization · Home Lab Blueprints</span>
        </div>
      </footer>
    </div>
  );
}
