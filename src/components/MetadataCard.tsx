import React from 'react';
import { JobMetadata } from '../types/securityJob';
import { Building2, MapPin, Briefcase, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface MetadataCardProps {
  metadata: JobMetadata;
  executiveSummary: string;
  source?: string;
  parsedAt?: string;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({
  metadata,
  executiveSummary,
  source,
  parsedAt,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 md:p-6 shadow-sm transition-colors">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            <span>Security Operations Profile</span>
            <span aria-hidden="true">·</span>
            <span>Rule 1: Verified Job Metadata</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-100 mt-1 tracking-tight">
            {metadata.title}
          </h1>

          {/* Clean Unboxed Metadata with Typographic Separators */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              {metadata.company}
            </span>
            <span aria-hidden="true">·</span>
            <span>{metadata.location}</span>
            <span aria-hidden="true">·</span>
            <span>{metadata.workplaceType}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{metadata.experienceLevel}</span>
            {metadata.securityClearance && metadata.securityClearance !== 'Not required' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-medium">
                  {metadata.securityClearance}
                </span>
              </>
            )}
          </div>
        </div>

        {source && (
          <div className="text-right shrink-0">
            <div className="text-[11px] text-slate-400">
              Parser Engine: {source === 'gemini' ? 'Gemini 3.8 Flash' : 'Deterministic SOC Engine'}
            </div>
            {parsedAt && (
              <div className="text-[10px] text-slate-500 font-mono tabular-nums mt-0.5">
                {new Date(parsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {executiveSummary && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Role Synthesis & Strategy
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {executiveSummary}
          </p>
        </div>
      )}
    </div>
  );
};
