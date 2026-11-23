import React, { useState } from 'react';
import { ParsedSecurityJob } from '../types/securityJob';
import { Copy, Download, Check, CheckCircle2, Code2, Sparkles, FileJson } from 'lucide-react';

interface JsonInspectorViewProps {
  data: ParsedSecurityJob;
}

export const JsonInspectorView: React.FC<JsonInspectorViewProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);
  const jsonBytes = new TextEncoder().encode(jsonString).length;
  const jsonLines = jsonString.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = (data.metadata?.title || 'security-job')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.download = `pathfind-parsed-${sanitizedTitle}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Rule verification status
  const hasMetadata = Boolean(data.metadata?.title && data.metadata?.company && data.metadata?.location);
  const hasAll5Domains = Boolean(
    data.domains?.siemAndLogAnalysis &&
    data.domains?.networkDefenseAndTrafficAnalysis &&
    data.domains?.identityAndAccessManagement &&
    data.domains?.incidentResponseAndTriage &&
    data.domains?.complianceAndGrc
  );
  const hasAtsPriorities = Boolean(
    data.atsKeywords?.length > 0 &&
    data.atsKeywords.some(k => k.priority === 'High') &&
    data.atsKeywords.some(k => k.priority === 'Medium')
  );
  const hasExactly2HomeLabs = Boolean(data.homeLabTasks?.length === 2);

  return (
    <div className="space-y-5">
      {/* JSON Inspector Header & Verification Status */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <span>Structured Data Output</span>
              <span aria-hidden="true">·</span>
              <span>Validated JSON Schema</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-1">
              Pathfind Structured JSON Data
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 tabular-nums">
              <span>{jsonLines} lines</span>
              <span aria-hidden="true">·</span>
              <span>{(jsonBytes / 1024).toFixed(1)} KB</span>
              <span aria-hidden="true">·</span>
              <span>MIME: application/json</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* 4 Rules Compliance Checklist */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Engine Rules Compliance Audit
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className={`p-2 rounded border flex items-center gap-2 ${hasMetadata ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Rule 1: Job Metadata</span>
            </div>

            <div className={`p-2 rounded border flex items-center gap-2 ${hasAll5Domains ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Rule 2: 5 Security Domains</span>
            </div>

            <div className={`p-2 rounded border flex items-center gap-2 ${hasAtsPriorities ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Rule 3: ATS Priority Matrix</span>
            </div>

            <div className={`p-2 rounded border flex items-center gap-2 ${hasExactly2HomeLabs ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Rule 4: 2 Actionable Labs</span>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Code Viewer */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            <span>pathfind-schema.json</span>
          </div>
          <span className="text-[11px] text-slate-500">Read-Only</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-[600px] selection:bg-indigo-900">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
};
