import React, { useState } from 'react';
import { SecurityDomains, DomainSkill, AtsPriority } from '../types/securityJob';
import { Database, Network, KeyRound, ShieldAlert, FileCheck, Search, Filter } from 'lucide-react';

interface SecurityDomainsViewProps {
  domains: SecurityDomains;
}

interface DomainConfig {
  key: keyof SecurityDomains;
  name: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  skills: DomainSkill[];
}

export const SecurityDomainsView: React.FC<SecurityDomainsViewProps> = ({ domains }) => {
  const [selectedDomainKey, setSelectedDomainKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const domainConfigs: DomainConfig[] = [
    {
      key: 'siemAndLogAnalysis',
      name: 'SIEM & Log Analysis',
      shortLabel: 'SIEM / Logs',
      description: 'Aggregation, correlation, querying (SPL/KQL), Windows Event IDs, Sysmon, and centralized detection platforms.',
      icon: Database,
      skills: domains.siemAndLogAnalysis || [],
    },
    {
      key: 'networkDefenseAndTrafficAnalysis',
      name: 'Network Defense & Traffic Analysis',
      shortLabel: 'Network / PCAP',
      description: 'Deep packet inspection (Wireshark/tcpdump), protocol anomaly analysis (DNS, TLS, HTTP), and NIDS (Suricata/Snort/Zeek).',
      icon: Network,
      skills: domains.networkDefenseAndTrafficAnalysis || [],
    },
    {
      key: 'identityAndAccessManagement',
      name: 'Identity & Access Management (IAM)',
      shortLabel: 'Identity / IAM',
      description: 'Active Directory, Kerberos, Azure AD / Entra ID, Okta SSO, RBAC least privilege, and credential theft analysis.',
      icon: KeyRound,
      skills: domains.identityAndAccessManagement || [],
    },
    {
      key: 'incidentResponseAndTriage',
      name: 'Incident Response & Triage',
      shortLabel: 'IR & Triage',
      description: 'Alert validation, phishing header dissection (SPF/DKIM/DMARC), host containment, and MITRE ATT&CK mapping.',
      icon: ShieldAlert,
      skills: domains.incidentResponseAndTriage || [],
    },
    {
      key: 'complianceAndGrc',
      name: 'Compliance & GRC',
      shortLabel: 'Compliance / GRC',
      description: 'NIST CSF, NIST SP 800-53/61, ISO 27001, SOC 2 Type II, HIPAA, PCI-DSS, audit evidence, and chain of custody.',
      icon: FileCheck,
      skills: domains.complianceAndGrc || [],
    },
  ];

  const totalSkills = domainConfigs.reduce((acc, d) => acc + d.skills.length, 0);

  // Filter based on selected domain and search query
  const filteredConfigs = domainConfigs
    .filter((d) => selectedDomainKey === 'all' || d.key === selectedDomainKey)
    .map((d) => ({
      ...d,
      skills: d.skills.filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.skill.toLowerCase().includes(q) ||
          (s.subCategory && s.subCategory.toLowerCase().includes(q)) ||
          s.contextSnippet.toLowerCase().includes(q) ||
          s.rationale.toLowerCase().includes(q)
        );
      }),
    }))
    .filter((d) => selectedDomainKey !== 'all' || d.skills.length > 0 || !searchQuery.trim());

  return (
    <div className="space-y-5">
      {/* Domain Header & Controls */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>Taxonomy Alignment</span>
              <span aria-hidden="true">·</span>
              <span>Rule 2: 5 Standard Security Domains</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              Required Technical Skills Categorization
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified <span className="font-semibold tabular-nums text-slate-300">{totalSkills}</span> core skills extracted from the job description mapped to industry blue-team functional domains.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, tools, queries..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedDomainKey('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors tabular-nums ${
              selectedDomainKey === 'all'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            All 5 Domains ({totalSkills})
          </button>
          {domainConfigs.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setSelectedDomainKey(d.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors tabular-nums ${
                selectedDomainKey === d.key
                  ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              {d.shortLabel} ({d.skills.length})
            </button>
          ))}
        </div>
      </div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredConfigs.map((domain) => {
          const IconComponent = domain.icon;
          return (
            <div
              key={domain.key}
              className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-sm transition-colors"
            >
              {/* Domain Header */}
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-900/60 flex items-center justify-center text-indigo-400 shrink-0">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      {domain.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 tabular-nums self-end sm:self-auto">
                  {domain.skills.length} {domain.skills.length === 1 ? 'skill extracted' : 'skills extracted'}
                </div>
              </div>

              {/* Skill Items List */}
              <div className="p-5">
                {domain.skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3">
                    No explicit requirements found matching this filter.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {domain.skills.map((skill, idx) => {
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-semibold text-slate-100">
                                {skill.skill}
                              </h4>
                              {skill.subCategory && (
                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                  {skill.subCategory}
                                </span>
                              )}
                            </div>

                            {/* Clean Unboxed Metadata Indicators */}
                            <div className="flex items-center gap-1.5 text-[11px] shrink-0 font-medium">
                              <span
                                className={
                                  skill.importance === 'Required'
                                    ? 'text-rose-400 font-semibold'
                                    : 'text-slate-400'
                                }
                              >
                                {skill.importance}
                              </span>
                              <span aria-hidden="true" className="text-slate-700">·</span>
                              <span
                                className={
                                  skill.atsPriority === 'High'
                                    ? 'text-amber-400 font-semibold'
                                    : skill.atsPriority === 'Medium'
                                    ? 'text-blue-400'
                                    : 'text-slate-500'
                                }
                              >
                                ATS {skill.atsPriority}
                              </span>
                            </div>
                          </div>

                          {/* Context Snippet */}
                          {skill.contextSnippet && (
                            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic font-mono bg-slate-950/70 p-2 rounded">
                              "{skill.contextSnippet}"
                            </div>
                          )}

                          {/* Rationale */}
                          {skill.rationale && (
                            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                              <strong className="font-medium text-slate-300">Why it matters:</strong> {skill.rationale}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
