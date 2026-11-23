import React, { useState } from 'react';
import { ParsedSecurityJob, DomainSkill } from '../types/securityJob';
import {
  CheckSquare,
  Square,
  ArrowRight,
  Database,
  Network,
  KeyRound,
  ShieldAlert,
  FileCheck,
} from 'lucide-react';

interface CandidateReadinessChecklistProps {
  data: ParsedSecurityJob;
  checkedSkills: Record<string, boolean>;
  onToggleSkill: (skillName: string) => void;
  onToggleDomainSkills: (skills: DomainSkill[], markAs: boolean) => void;
  onNavigateToLabs: () => void;
}

export const CandidateReadinessChecklist: React.FC<CandidateReadinessChecklistProps> = ({
  data,
  checkedSkills,
  onToggleSkill,
  onToggleDomainSkills,
  onNavigateToLabs,
}) => {
  // Aggregate all skills with domain key
  const domainDefinitions = [
    {
      key: 'siemAndLogAnalysis' as const,
      name: 'SIEM & Log Analysis',
      shortName: 'SIEM & Logs',
      icon: Database,
      skills: data.domains.siemAndLogAnalysis || [],
    },
    {
      key: 'networkDefenseAndTrafficAnalysis' as const,
      name: 'Network Defense & Traffic Analysis',
      shortName: 'Network Defense',
      icon: Network,
      skills: data.domains.networkDefenseAndTrafficAnalysis || [],
    },
    {
      key: 'identityAndAccessManagement' as const,
      name: 'Identity & Access Management (IAM)',
      shortName: 'IAM & Access',
      icon: KeyRound,
      skills: data.domains.identityAndAccessManagement || [],
    },
    {
      key: 'incidentResponseAndTriage' as const,
      name: 'Incident Response & Triage',
      shortName: 'IR & Triage',
      icon: ShieldAlert,
      skills: data.domains.incidentResponseAndTriage || [],
    },
    {
      key: 'complianceAndGrc' as const,
      name: 'Compliance & GRC',
      shortName: 'Compliance & GRC',
      icon: FileCheck,
      skills: data.domains.complianceAndGrc || [],
    },
  ];

  const allSkills = domainDefinitions.flatMap((d) =>
    d.skills.map((s) => ({ ...s, domainKey: d.key, domainName: d.name }))
  );

  const [activeDomainFilter, setActiveDomainFilter] = useState<string>('all');

  const knownCount = allSkills.filter((s) => Boolean(checkedSkills[s.skill])).length;
  const totalCount = allSkills.length;
  const readinessPercent = totalCount > 0 ? Math.round((knownCount / totalCount) * 100) : 0;

  // Identify top gaps (unchecked skills with High ATS priority)
  const highPriorityGaps = allSkills.filter(
    (s) => !checkedSkills[s.skill] && s.atsPriority === 'High'
  );

  // Filter skills for list
  const displayedSkills = allSkills.filter((s) =>
    activeDomainFilter === 'all' ? true : s.domainKey === activeDomainFilter
  );

  const allDisplayedChecked =
    displayedSkills.length > 0 && displayedSkills.every((s) => Boolean(checkedSkills[s.skill]));

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>Candidate Self-Assessment</span>
              <span aria-hidden="true">·</span>
              <span>Gap Analysis & Target Lab Recommendation</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              Skill Gap Audit for {data.metadata.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Check off the skills you currently possess to inspect your domain-by-domain readiness ratios and target the highest-value home lab.
            </p>
          </div>

          {/* Overall Readiness Metric */}
          <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800 shrink-0">
            <div>
              <div className="text-[11px] font-medium text-slate-400">
                Overall Skills Acquired
              </div>
              <div className="text-base font-bold text-slate-100 tabular-nums">
                {knownCount} of {totalCount} ({readinessPercent}%)
              </div>
            </div>

            <div className="w-12 h-12 rounded-full border-2 border-indigo-400 flex items-center justify-center font-bold text-xs tabular-nums text-indigo-400">
              {readinessPercent}%
            </div>
          </div>
        </div>

        {/* Dynamic Recommendation Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-950/30 p-3.5 rounded-lg border border-indigo-900/40">
          <div>
            <h4 className="text-xs font-bold text-slate-100">
              {highPriorityGaps.length === 0
                ? 'Strong Alignment! Ready to showcase portfolio'
                : `Identified ${highPriorityGaps.length} High-Priority Skill ${highPriorityGaps.length === 1 ? 'Gap' : 'Gaps'}`}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {highPriorityGaps.length === 0
                ? 'You meet the core ATS requirements. Build either home lab to create verifiable proof for interview discussion.'
                : `Focus first on "${data.homeLabTasks[0]?.title}" to close key gaps in ${data.homeLabTasks[0]?.primaryDomain}.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToLabs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shrink-0 shadow-sm"
          >
            <span>View Recommended Labs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Progress Bars for the 5 Security Domains */}
      <section className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>Domain Ratios</span>
              <span aria-hidden="true">·</span>
              <span>Required vs. Missing Skills</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-0.5">
              Security Domain Preparedness Progress
            </h3>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Acquired</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
              <span>Missing Gap</span>
            </div>
          </div>
        </div>

        {/* 5 Domain Progress Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
          {domainDefinitions.map((domain) => {
            const Icon = domain.icon;
            const domainSkills = domain.skills;
            const total = domainSkills.length;
            const acquired = domainSkills.filter((s) => checkedSkills[s.skill]).length;
            const missing = total - acquired;
            const percent = total > 0 ? Math.round((acquired / total) * 100) : 0;
            const requiredCount = domainSkills.filter((s) => s.importance === 'Required').length;
            const acquiredRequired = domainSkills.filter(
              (s) => s.importance === 'Required' && checkedSkills[s.skill]
            ).length;
            const missingRequired = requiredCount - acquiredRequired;

            const isSelectedFilter = activeDomainFilter === domain.key;

            return (
              <div
                key={domain.key}
                onClick={() =>
                  setActiveDomainFilter((prev) => (prev === domain.key ? 'all' : domain.key))
                }
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelectedFilter
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <div>
                  {/* Domain Icon & Name */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-950/70 border border-indigo-900/60 flex items-center justify-center text-indigo-400 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <span className="text-xs font-bold text-slate-100 tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mt-2.5 truncate" title={domain.name}>
                    {domain.shortName}
                  </h4>

                  {/* Clean unboxed ratio stats */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 tabular-nums">
                    <span className="text-emerald-400 font-semibold">
                      {acquired} Acquired
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={missing > 0 ? 'text-rose-400 font-medium' : 'text-slate-500'}>
                      {missing} Missing
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  {/* Visual Progress Bar Track */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex border border-slate-750">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Required Skills Sub-Note */}
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 tabular-nums">
                    <span>
                      {missingRequired === 0 ? (
                        <span className="text-emerald-400 font-medium">
                          All Required Met
                        </span>
                      ) : (
                        <span>
                          {missingRequired} required missing
                        </span>
                      )}
                    </span>
                    <span>{acquired}/{total} total</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Checklist & Domain Filtering */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Requirements Checklist ({displayedSkills.length} {displayedSkills.length === 1 ? 'skill' : 'skills'})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any domain card above or use tabs to filter specific security areas.
            </p>
          </div>

          {/* Quick Domain Filter Tabs & Batch Action */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveDomainFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                activeDomainFilter === 'all'
                  ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              All Domains
            </button>
            {domainDefinitions.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setActiveDomainFilter(d.key)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeDomainFilter === d.key
                    ? 'bg-slate-800 text-slate-100 font-medium border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                {d.shortName}
              </button>
            ))}
            {displayedSkills.length > 0 && (
              <button
                type="button"
                onClick={() => onToggleDomainSkills(displayedSkills, !allDisplayedChecked)}
                className="ml-1 px-2.5 py-1 rounded-md border border-slate-700 bg-slate-950 text-indigo-300 hover:bg-slate-800 transition-colors font-medium"
              >
                {allDisplayedChecked ? 'Clear Shown' : 'Check Shown'}
              </button>
            )}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedSkills.map((item, idx) => {
            const isChecked = Boolean(checkedSkills[item.skill]);
            return (
              <div
                key={idx}
                onClick={() => onToggleSkill(item.skill)}
                className={`p-3 rounded-lg border cursor-pointer select-none transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'border-emerald-800/80 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-500"
                  aria-label={isChecked ? `Uncheck ${item.skill}` : `Check ${item.skill}`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isChecked
                          ? 'text-emerald-200 line-through opacity-75'
                          : 'text-slate-100'
                      }`}
                    >
                      {item.skill}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        item.atsPriority === 'High'
                          ? 'bg-amber-950 text-amber-300 border border-amber-900/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.atsPriority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>{item.domainName}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        item.importance === 'Required'
                          ? 'text-rose-400 font-medium'
                          : 'text-slate-500'
                      }
                    >
                      {item.importance}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
