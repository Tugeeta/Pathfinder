import React, { useState } from 'react';
import { AtsKeyword, AtsPriority } from '../types/securityJob';
import { Copy, Check, Target, Info, Sparkles, Filter } from 'lucide-react';

interface AtsOptimizerViewProps {
  keywords: AtsKeyword[];
}

export const AtsOptimizerView: React.FC<AtsOptimizerViewProps> = ({ keywords }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'All' | AtsPriority>('All');

  const filteredKeywords = keywords.filter((k) =>
    priorityFilter === 'All' ? true : k.priority === priorityFilter
  );

  const highCount = keywords.filter((k) => k.priority === 'High').length;
  const medCount = keywords.filter((k) => k.priority === 'Medium').length;
  const lowCount = keywords.filter((k) => k.priority === 'Low').length;

  const handleCopyBullet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllKeywords = () => {
    const list = keywords.map((k) => `${k.keyword} [Priority: ${k.priority} - Domain: ${k.domain}]`).join('\n');
    navigator.clipboard.writeText(list);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Overview & Actions */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>Resume Tailoring Engine</span>
              <span aria-hidden="true">·</span>
              <span>Rule 3: ATS Keyword Optimization Priority</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              Applicant Tracking System (ATS) Keyword Prioritization
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Optimized for automated parsing algorithms (Workday, Greenhouse, Taleo) used by cybersecurity hiring teams.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyAllKeywords}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied All Keywords</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Keyword List</span>
              </>
            )}
          </button>
        </div>

        {/* Priority Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setPriorityFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors tabular-nums ${
              priorityFilter === 'All'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            All Keywords ({keywords.length})
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('High')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors tabular-nums ${
              priorityFilter === 'High'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            High Priority ({highCount})
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('Medium')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors tabular-nums ${
              priorityFilter === 'Medium'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            Medium Priority ({medCount})
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('Low')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors tabular-nums ${
              priorityFilter === 'Low'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            Low Priority ({lowCount})
          </button>
        </div>
      </div>

      {/* Keywords Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredKeywords.map((item, idx) => {
          return (
            <div
              key={idx}
              className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">
                      {item.keyword}
                    </h3>
                  </div>

                  {/* Clean Metadata line with typographic separators */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{item.domain}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-semibold ${
                        item.priority === 'High'
                          ? 'text-amber-400'
                          : item.priority === 'Medium'
                          ? 'text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      Priority: {item.priority}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md self-start ${
                    item.priority === 'High'
                      ? 'bg-amber-950/50 text-amber-300 border border-amber-900/60'
                      : item.priority === 'Medium'
                      ? 'bg-blue-950/50 text-blue-300 border border-blue-900/60'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.priority === 'High' ? 'Core ATS Gatekeeper' : item.priority === 'Medium' ? 'Differentiator' : 'Supplementary'}
                </span>
              </div>

              {/* Match Strategy */}
              <div className="mt-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Resume Strategy: </span>
                {item.matchStrategy}
              </div>

              {/* Recommended Tailored Bullet Point */}
              <div className="mt-3.5 pt-3 border-t border-slate-800 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Recommended Experience Bullet Point
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyBullet(item.recommendedResumeBullet, idx)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Bullet</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-200 font-mono leading-relaxed selection:bg-indigo-900">
                  • {item.recommendedResumeBullet}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
