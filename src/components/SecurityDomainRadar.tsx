import React, { useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ParsedSecurityJob, DomainSkill } from '../types/securityJob';
import {
  Database,
  Network,
  KeyRound,
  ShieldAlert,
  FileCheck,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';

interface SecurityDomainRadarProps {
  data: ParsedSecurityJob;
  checkedSkills: Record<string, boolean>;
  onToggleDomainSkills?: (skills: DomainSkill[], markAs: boolean) => void;
  onResetAllSkills?: () => void;
  onNavigateToAudit?: () => void;
}

interface RadarDatum {
  key: string;
  domain: string;
  fullName: string;
  proficiency: number;
  demand: number;
  acquiredCount: number;
  totalCount: number;
  requiredCount: number;
  requiredAcquired: number;
  gapPercent: number;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const SecurityDomainRadar: React.FC<SecurityDomainRadarProps> = ({
  data,
  checkedSkills,
  onToggleDomainSkills,
  onResetAllSkills,
  onNavigateToAudit,
}) => {
  const [scoringMode, setScoringMode] = useState<'weighted' | 'count'>('weighted');

  const domainMeta = useMemo(
    () => [
      {
        key: 'siemAndLogAnalysis',
        shortName: 'SIEM & Logs',
        fullName: 'SIEM & Log Analysis',
        icon: Database,
        skills: data.domains.siemAndLogAnalysis || [],
      },
      {
        key: 'networkDefenseAndTrafficAnalysis',
        shortName: 'Network Defense',
        fullName: 'Network Defense & Traffic Analysis',
        icon: Network,
        skills: data.domains.networkDefenseAndTrafficAnalysis || [],
      },
      {
        key: 'identityAndAccessManagement',
        shortName: 'IAM & Access',
        fullName: 'Identity & Access Management (IAM)',
        icon: KeyRound,
        skills: data.domains.identityAndAccessManagement || [],
      },
      {
        key: 'incidentResponseAndTriage',
        shortName: 'IR & Triage',
        fullName: 'Incident Response & Triage',
        icon: ShieldAlert,
        skills: data.domains.incidentResponseAndTriage || [],
      },
      {
        key: 'complianceAndGrc',
        shortName: 'Compliance & GRC',
        fullName: 'Compliance & GRC',
        icon: FileCheck,
        skills: data.domains.complianceAndGrc || [],
      },
    ],
    [data]
  );

  const radarData: RadarDatum[] = useMemo(() => {
    // Compute raw demand weight per domain to normalize Role Demand on 0-100 scale
    const rawDemands = domainMeta.map((d) =>
      d.skills.reduce((sum, s) => {
        const pWeight = PRIORITY_WEIGHT[s.atsPriority] ?? 1;
        const impBonus = s.importance === 'Required' ? 1.5 : 1;
        return sum + pWeight * impBonus;
      }, 0)
    );
    const maxDemand = Math.max(...rawDemands, 1);

    return domainMeta.map((d, idx) => {
      const skills = d.skills;
      const totalCount = skills.length;
      const acquiredCount = skills.filter((s) => Boolean(checkedSkills[s.skill])).length;
      const requiredSkills = skills.filter((s) => s.importance === 'Required');
      const requiredCount = requiredSkills.length;
      const requiredAcquired = requiredSkills.filter((s) =>
        Boolean(checkedSkills[s.skill])
      ).length;

      let proficiency = 0;
      if (totalCount > 0) {
        if (scoringMode === 'count') {
          proficiency = Math.round((acquiredCount / totalCount) * 100);
        } else {
          const totalWeight = skills.reduce(
            (sum, s) => sum + (PRIORITY_WEIGHT[s.atsPriority] ?? 1),
            0
          );
          const acquiredWeight = skills.reduce(
            (sum, s) =>
              sum + (checkedSkills[s.skill] ? PRIORITY_WEIGHT[s.atsPriority] ?? 1 : 0),
            0
          );
          proficiency =
            totalWeight > 0 ? Math.round((acquiredWeight / totalWeight) * 100) : 0;
        }
      }

      const demand =
        totalCount === 0
          ? 0
          : Math.max(20, Math.round((rawDemands[idx] / maxDemand) * 100));

      return {
        key: d.key,
        domain: d.shortName,
        fullName: d.fullName,
        proficiency,
        demand,
        acquiredCount,
        totalCount,
        requiredCount,
        requiredAcquired,
        gapPercent: Math.max(0, 100 - proficiency),
      };
    });
  }, [domainMeta, checkedSkills, scoringMode]);

  const overallProficiency = useMemo(() => {
    const valid = radarData.filter((d) => d.totalCount > 0);
    if (valid.length === 0) return 0;
    return Math.round(
      valid.reduce((sum, d) => sum + d.proficiency, 0) / valid.length
    );
  }, [radarData]);

  const totalAcquired = radarData.reduce((sum, d) => sum + d.acquiredCount, 0);
  const totalSkills = radarData.reduce((sum, d) => sum + d.totalCount, 0);

  const strongestDomain = useMemo(() => {
    const nonEmpty = radarData.filter((d) => d.totalCount > 0);
    if (nonEmpty.length === 0) return null;
    return nonEmpty.reduce((best, cur) =>
      cur.proficiency > best.proficiency ? cur : best
    );
  }, [radarData]);

  const priorityGapDomain = useMemo(() => {
    const nonEmpty = radarData.filter((d) => d.totalCount > 0);
    if (nonEmpty.length === 0) return null;
    return nonEmpty.reduce((worst, cur) =>
      cur.demand - cur.proficiency > worst.demand - worst.proficiency ? cur : worst
    );
  }, [radarData]);

  const handleMarkAll = () => {
    if (!onToggleDomainSkills) return;
    domainMeta.forEach((d) => {
      onToggleDomainSkills(d.skills, true);
    });
  };

  return (
    <section className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 md:p-6 shadow-sm transition-colors">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <span>Five-Domain Proficiency Profile</span>
            <span aria-hidden="true">·</span>
            <span>{data.metadata.title}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">
            Security Domain Proficiency Radar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compares your verified proficiency against extracted role demand across all five standard security domains.
          </p>
        </div>

        {/* Scoring Mode & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setScoringMode('weighted')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scoringMode === 'weighted'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ATS Weighted
            </button>
            <button
              type="button"
              onClick={() => setScoringMode('count')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                scoringMode === 'count'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Skill Count
            </button>
          </div>

          {onToggleDomainSkills && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All</span>
            </button>
          )}

          {onResetAllSkills && totalAcquired > 0 && (
            <button
              type="button"
              onClick={onResetAllSkills}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Left Radar Chart + Right Domain Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Recharts Spider / Radar Chart */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="h-[340px] w-full bg-slate-950/60 rounded-xl border border-slate-800/80 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Job Role Demand"
                  dataKey="demand"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="#6366f1"
                  fillOpacity={0.14}
                />
                <Radar
                  name="Your Proficiency"
                  dataKey="proficiency"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="#10b981"
                  fillOpacity={0.34}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0].payload as RadarDatum;
                    return (
                      <div className="bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 shadow-xl text-xs">
                        <div className="font-bold text-slate-100 mb-1.5">
                          {item.fullName}
                        </div>
                        <div className="space-y-1 tabular-nums font-mono">
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span>Your Proficiency</span>
                            <span className="font-bold">{item.proficiency}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-indigo-400">
                            <span>Job Role Demand</span>
                            <span className="font-bold">{item.demand}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-slate-400 pt-1 border-t border-slate-800">
                            <span>Skills Checked</span>
                            <span>
                              {item.acquiredCount}/{item.totalCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend & Summary Line */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
                <span className="text-slate-300 font-medium">Your Proficiency</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-400 inline-block" />
                <span className="text-slate-300 font-medium">Job Role Demand</span>
              </div>
            </div>

            <div className="tabular-nums font-mono text-[11px] text-slate-400">
              Avg Proficiency: <strong className="text-emerald-400">{overallProficiency}%</strong>
              <span className="mx-1.5 text-slate-700">·</span>
              <span>{totalAcquired}/{totalSkills} skills</span>
            </div>
          </div>
        </div>

        {/* Right: Structured 5-Domain Breakdown Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3.5">Security Domain</th>
                  <th className="py-2.5 px-3 text-right">Demand</th>
                  <th className="py-2.5 px-3 text-right">Proficiency</th>
                  <th className="py-2.5 px-3 text-right">Matched</th>
                  {onToggleDomainSkills && <th className="py-2.5 px-3 text-right">Quick Toggle</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {radarData.map((row, index) => {
                  const meta = domainMeta[index];
                  const Icon = meta.icon;
                  const allChecked =
                    row.totalCount > 0 && row.acquiredCount === row.totalCount;

                  return (
                    <tr
                      key={row.key}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="font-medium text-slate-200 truncate">
                            {row.domain}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-400">
                        {row.demand}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span
                          className={
                            row.proficiency >= 75
                              ? 'text-emerald-400 font-semibold'
                              : row.proficiency >= 40
                              ? 'text-amber-400 font-semibold'
                              : 'text-slate-300'
                          }
                        >
                          {row.proficiency}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                        {row.acquiredCount}/{row.totalCount}
                      </td>
                      {onToggleDomainSkills && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            disabled={row.totalCount === 0}
                            onClick={() =>
                              onToggleDomainSkills(meta.skills, !allChecked)
                            }
                            className={`text-[11px] font-medium px-2 py-1 rounded border transition-colors ${
                              allChecked
                                ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70'
                                : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {allChecked ? 'Clear' : 'Acquire'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Analytical Insights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Strongest Coverage
              </div>
              <div className="text-sm font-bold text-slate-100 mt-1 truncate">
                {strongestDomain && strongestDomain.proficiency > 0
                  ? strongestDomain.fullName
                  : 'No skills checked yet'}
              </div>
              <div className="text-xs text-emerald-400 font-mono tabular-nums mt-0.5">
                {strongestDomain && strongestDomain.proficiency > 0
                  ? `${strongestDomain.proficiency}% proficiency (${strongestDomain.acquiredCount}/${strongestDomain.totalCount})`
                  : 'Use Acquire or Skill Gap Audit below'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Highest Demand Gap
              </div>
              <div className="text-sm font-bold text-slate-100 mt-1 truncate">
                {priorityGapDomain ? priorityGapDomain.fullName : '—'}
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs text-amber-400 font-mono tabular-nums">
                  {priorityGapDomain
                    ? `${priorityGapDomain.demand}% demand vs ${priorityGapDomain.proficiency}% fit`
                    : '—'}
                </span>
                {onNavigateToAudit && (
                  <button
                    type="button"
                    onClick={onNavigateToAudit}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2"
                  >
                    Audit Skills
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
