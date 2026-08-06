import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Layers,
  FileText,
  RefreshCw,
  Wrench,
  Eye,
  Check,
  ArrowRight
} from 'lucide-react';

interface DraftingIssue {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'Reinforcement Callout' | 'Layer Naming Convention' | 'Dimension Tolerance' | 'Annotation Standard';
  severity: 'error' | 'warning' | 'info';
  location: string;
  standardRef: string;
  isAutoCorrectable: boolean;
  isResolved?: boolean;
}

interface AutomatedDraftReviewProps {
  fileName: string;
}

export const AutomatedDraftReview: React.FC<AutomatedDraftReviewProps> = ({ fileName }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [issues, setIssues] = useState<DraftingIssue[]>([
    {
      id: 'iss-1',
      code: 'CAD-REINF-04',
      title: 'Missing Reinforcement Callout near Support Zone',
      description: 'Grade Beam GB2 structural detail is missing bottom stirrup spacing callout (L/3 zone near Grid line B4).',
      category: 'Reinforcement Callout',
      severity: 'warning',
      location: 'Sheet S-102 • Grid B4 (Grade Beam detail)',
      standardRef: 'BNBC 2020 Sec 6.1.4 (Ductile Detailing)',
      isAutoCorrectable: true,
      isResolved: false,
    },
    {
      id: 'iss-2',
      code: 'CAD-LAY-01',
      title: 'Inconsistent CAD Layer Naming Convention',
      description: 'Found non-standard AutoCAD layers: "Layer_0_temp" and "REBAR_OLD". Must follow ISO 13567 / PWD Standard Layer format (e.g. "S-REIN-MAIN", "S-GRID-IDEN").',
      category: 'Layer Naming Convention',
      severity: 'error',
      location: 'Global Drawing Layers (14 elements)',
      standardRef: 'CPWD / PWD Bangladesh CAD Standard CAD-2024-L',
      isAutoCorrectable: true,
      isResolved: false,
    },
    {
      id: 'iss-3',
      code: 'CAD-DIM-02',
      title: 'Grid Line Offset Variance vs Structural Schedule',
      description: 'Column C2 centroid dimension on Floor Plan (1750mm) diverges by 5mm from Foundation Schedule sheet (1745mm).',
      category: 'Dimension Tolerance',
      severity: 'error',
      location: 'Sheet A-101 vs Sheet S-101 (Grid C3)',
      standardRef: 'BNBC 2020 Chapter 4 (Dimensional Coordination)',
      isAutoCorrectable: false,
      isResolved: false,
    },
    {
      id: 'iss-4',
      code: 'CAD-ANN-05',
      title: 'Missing Clear Cover Specification Note',
      description: 'Slab reinforcement sectional detail lacks explicit minimum clear cover note (20mm for residential G+1 internal slabs).',
      category: 'Annotation Standard',
      severity: 'info',
      location: 'Sheet S-201 • Typical Slab Detail',
      standardRef: 'BNBC 2020 Table 6.3.3 (Durability & Cover)',
      isAutoCorrectable: true,
      isResolved: false,
    },
    {
      id: 'iss-5',
      code: 'CAD-REINF-08',
      title: 'Staircase Landing Top Mesh Bar Callout Unassigned',
      description: 'Staircase landing waist slab shows top distribution mesh without bar diameter callout (Defaulting to 10mm @ 150mm c/c).',
      category: 'Reinforcement Callout',
      severity: 'warning',
      location: 'Sheet S-301 • Staircase Cross Section',
      standardRef: 'BNBC 2020 Sec 6.2.8 (Staircase Reinforcement)',
      isAutoCorrectable: true,
      isResolved: false,
    },
  ]);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const handleAutoCorrectAll = () => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.isAutoCorrectable ? { ...iss, isResolved: true } : iss
      )
    );
  };

  const handleResolveIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, isResolved: true } : iss))
    );
  };

  const filteredIssues = issues.filter((iss) => {
    if (filterSeverity === 'all') return true;
    return iss.severity === filterSeverity;
  });

  const unresolvedCount = issues.filter((i) => !i.isResolved).length;
  const errorCount = issues.filter((i) => i.severity === 'error' && !i.isResolved).length;
  const warningCount = issues.filter((i) => i.severity === 'warning' && !i.isResolved).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-blue-400" />
              AI Studio Master Feature #4
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Automated Draft Review & CAD Standard Scanner
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Structural Drafting Review & Rule Scanner
          </h3>
          <p className="text-xs text-slate-400">
            Scans imported structural drawings (<span className="text-blue-400 font-mono">{fileName}</span>) for drafting issues, missing reinforcement callouts, layer naming compliance, and BNBC 2020 dimension tolerances.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isScanning ? 'Scanning Drawings...' : 'Re-scan Blueprint'}</span>
          </button>

          {unresolvedCount > 0 && (
            <button
              onClick={handleAutoCorrectAll}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Auto-Correct Layers & Callouts</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Checked Issues</div>
            <div className="text-lg font-extrabold text-white">{issues.length} Items</div>
          </div>
          <Layers className="w-6 h-6 text-slate-500" />
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-400">Critical CAD Errors</div>
            <div className="text-lg font-extrabold text-rose-400">{errorCount} Errors</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-rose-500" />
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Drafting Warnings</div>
            <div className="text-lg font-extrabold text-amber-400">{warningCount} Warnings</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400">Resolved Status</div>
            <div className="text-lg font-extrabold text-emerald-400">
              {issues.filter((i) => i.isResolved).length} / {issues.length} Fixed
            </div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          {(['all', 'error', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                filterSeverity === sev
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {sev === 'all' ? 'All Issues' : `${sev}s`} (
              {sev === 'all' ? issues.length : issues.filter((i) => i.severity === sev).length})
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400">
          Showing {filteredIssues.length} drafting inspection results
        </span>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.isResolved
                  ? 'bg-slate-950/50 border-emerald-500/30 opacity-75'
                  : item.severity === 'error'
                  ? 'bg-rose-950/15 border-rose-500/40 hover:border-rose-500/60'
                  : item.severity === 'warning'
                  ? 'bg-amber-950/15 border-amber-500/40 hover:border-amber-500/60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 p-2 rounded-lg ${
                      item.isResolved
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : item.severity === 'error'
                        ? 'bg-rose-500/20 text-rose-400'
                        : item.severity === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {item.isResolved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.severity === 'error' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : item.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.code}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.isResolved
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.severity === 'error'
                            ? 'bg-rose-500/20 text-rose-400'
                            : item.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {item.isResolved ? 'Resolved' : item.severity}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold mt-1 ${
                        item.isResolved ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-300 mt-1">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>📍 {item.location}</span>
                      <span>📜 {item.standardRef}</span>
                    </div>
                  </div>
                </div>

                {/* Resolve button */}
                <div className="flex items-center gap-2 sm:self-center">
                  {!item.isResolved ? (
                    <button
                      onClick={() => handleResolveIssue(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        item.isAutoCorrectable
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {item.isAutoCorrectable ? (
                        <>
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Auto-Correct Now</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Standard Compliant
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
