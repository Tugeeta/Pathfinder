import React from 'react';
import { ShieldCheck, Download, Palette } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bgTheme: 'soc' | 'midnight' | 'navy';
  setBgTheme: (theme: 'soc' | 'midnight' | 'navy') => void;
  onDownloadJson?: () => void;
  hasData: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  bgTheme,
  setBgTheme,
  onDownloadJson,
  hasData,
}) => {
  const cycleTheme = () => {
    if (bgTheme === 'soc') setBgTheme('midnight');
    else if (bgTheme === 'midnight') setBgTheme('navy');
    else setBgTheme('soc');
  };

  const themeLabel =
    bgTheme === 'soc'
      ? 'SOC Slate'
      : bgTheme === 'midnight'
      ? 'Cyber Midnight'
      : 'Tactical Navy';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Pathfind Security
          </span>
        </div>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('domains')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'domains'
                ? 'border-indigo-400 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Security Domains
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('readiness')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'readiness'
                ? 'border-indigo-400 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Proficiency Radar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ats')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'ats'
                ? 'border-indigo-400 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            ATS Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('homelabs')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'homelabs'
                ? 'border-indigo-400 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Home Labs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'json'
                ? 'border-indigo-400 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Structured JSON
          </button>
        </nav>

        {/* Zone 3: Primary action + palette toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={cycleTheme}
            title="Switch Background Palette"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{themeLabel}</span>
          </button>

          {hasData && onDownloadJson ? (
            <button
              type="button"
              onClick={onDownloadJson}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          ) : (
            <a
              href="#parser-input"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Parse Posting
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
