import React, { useState, useMemo } from 'react';
import { TakeoffRow, CurrencyCode } from '../types/estimation';
import { formatCurrency } from '../utils/estimationCalculators';
import {
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Info,
  Scale,
  RefreshCw,
  Search,
  ArrowRight
} from 'lucide-react';

interface HeuristicAnalysisPanelProps {
  rows: TakeoffRow[];
  currency: CurrencyCode;
  onUpdateRowRateOrUnit?: (rowId: string, newRateBDT: number, newUnit: string) => void;
}

export interface HeuristicAnomaly {
  id: string;
  rowId: string;
  itemCode: string;
  itemDescription: string;
  category: string;
  currentUnit: string;
  currentRateBDT: number;
  expectedUnit: string;
  benchmarkRateBDT: number;
  anomalyType: 'underpriced' | 'non_standard_unit' | 'ratio_deviation';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  explanation: string;
  recommendation: string;
}

// PWD Benchmark Reference Rules
const PWD_BENCHMARKS: {
  keyword: string;
  standardUnit: string;
  minRateBDT: number;
  expectedRateBDT: number;
}[] = [
  { keyword: 'excavation', standardUnit: 'cum', minRateBDT: 150, expectedRateBDT: 210 },
  { keyword: 'concrete', standardUnit: 'cum', minRateBDT: 8500, expectedRateBDT: 11200 },
  { keyword: 'reinforcement', standardUnit: 'MT', minRateBDT: 95000, expectedRateBDT: 118000 },
  { keyword: 'rebar', standardUnit: 'MT', minRateBDT: 95000, expectedRateBDT: 118000 },
  { keyword: 'brick', standardUnit: 'cum', minRateBDT: 950, expectedRateBDT: 12500 },
  { keyword: 'plaster', standardUnit: 'sqm', minRateBDT: 220, expectedRateBDT: 340 },
  { keyword: 'sand', standardUnit: 'cum', minRateBDT: 1400, expectedRateBDT: 2200 },
  { keyword: 'tile', standardUnit: 'sqm', minRateBDT: 900, expectedRateBDT: 1650 },
  { keyword: 'paint', standardUnit: 'sqm', minRateBDT: 90, expectedRateBDT: 180 },
];

export const HeuristicAnalysisPanel: React.FC<HeuristicAnalysisPanelProps> = ({
  rows,
  currency,
  onUpdateRowRateOrUnit,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'underpriced' | 'non_standard_unit' | 'ratio_deviation'>('all');
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Run heuristic rules on rows
  const anomalies = useMemo(() => {
    const list: HeuristicAnomaly[] = [];

    rows.forEach((row) => {
      const text = `${row.itemDescription} ${row.category}`.toLowerCase();

      // Check against PWD Benchmarks
      const matchedBm = PWD_BENCHMARKS.find((bm) => text.includes(bm.keyword));
      if (matchedBm) {
        // 1. Check Non-Standard Unit
        const unitLower = (row.unit || '').toLowerCase().trim();
        const stdUnitLower = matchedBm.standardUnit.toLowerCase();

        const isUnitMismatch =
          unitLower !== stdUnitLower &&
          !(unitLower === 'kg' && stdUnitLower === 'mt') &&
          !(unitLower === 'm' && stdUnitLower === 'm') &&
          !(unitLower === 'nos' && text.includes('gate'));

        if (isUnitMismatch) {
          list.push({
            id: `anom-unit-${row.id}`,
            rowId: row.id,
            itemCode: row.itemCode,
            itemDescription: row.itemDescription,
            category: row.category,
            currentUnit: row.unit,
            currentRateBDT: row.unitRateBDT,
            expectedUnit: matchedBm.standardUnit,
            benchmarkRateBDT: matchedBm.expectedRateBDT,
            anomalyType: 'non_standard_unit',
            severity: 'warning',
            title: `Non-Standard Quantity Unit ("${row.unit}")`,
            explanation: `CPWD / PWD Bangladesh 2024 schedule mandates "${matchedBm.standardUnit}" for ${matchedBm.keyword} items instead of "${row.unit}".`,
            recommendation: `Convert unit to ${matchedBm.standardUnit} for standard BOQ approval.`,
          });
        }

        // 2. Check Underpriced Item (Rate < minRateBDT)
        // Adjust for unit if unit is kg instead of MT
        let normalizedRate = row.unitRateBDT;
        if (unitLower === 'kg' && stdUnitLower === 'mt') {
          normalizedRate = row.unitRateBDT * 1000;
        }

        if (normalizedRate > 0 && normalizedRate < matchedBm.minRateBDT * 0.75) {
          list.push({
            id: `anom-rate-${row.id}`,
            rowId: row.id,
            itemCode: row.itemCode,
            itemDescription: row.itemDescription,
            category: row.category,
            currentUnit: row.unit,
            currentRateBDT: row.unitRateBDT,
            expectedUnit: matchedBm.standardUnit,
            benchmarkRateBDT: unitLower === 'kg' ? matchedBm.expectedRateBDT / 1000 : matchedBm.expectedRateBDT,
            anomalyType: 'underpriced',
            severity: normalizedRate < matchedBm.minRateBDT * 0.5 ? 'critical' : 'warning',
            title: `Potentially Underpriced Item Rate (৳${row.unitRateBDT}/${row.unit})`,
            explanation: `Current rate is significantly below PWD Bangladesh 2024 baseline rate of ৳${(matchedBm.expectedRateBDT || 0).toLocaleString()}/${matchedBm.standardUnit}.`,
            recommendation: `Adjust rate closer to ৳${(matchedBm.expectedRateBDT || 0).toLocaleString()} to prevent contractor loss or audit queries.`,
          });
        }
      }
    });

    // 3. Ratio Anomaly check (Steel vs Concrete ratio heuristic)
    const concreteRows = rows.filter((r) => r.itemDescription.toLowerCase().includes('concrete'));
    const steelRows = rows.filter((r) => r.itemDescription.toLowerCase().includes('reinforcement'));

    const totalConcreteVol = concreteRows.reduce((s, r) => s + (r.unit === 'cum' ? r.quantity : 0), 0);
    const totalSteelKg = steelRows.reduce((s, r) => s + (r.unit === 'MT' ? r.quantity * 1000 : r.unit === 'kg' ? r.quantity : 0), 0);

    if (totalConcreteVol > 0 && totalSteelKg > 0) {
      const kgPerCum = totalSteelKg / totalConcreteVol;
      if (kgPerCum < 75 || kgPerCum > 140) {
        list.push({
          id: 'anom-ratio-steel-concrete',
          rowId: concreteRows[0]?.id || 'steel-ratio',
          itemCode: 'R-RATIO-01',
          itemDescription: 'Overall Project Reinforcement-to-Concrete Ratio',
          category: 'Structural Ductility Check',
          currentUnit: 'kg/cum',
          currentRateBDT: Math.round(kgPerCum),
          expectedUnit: 'kg/cum',
          benchmarkRateBDT: 105,
          anomalyType: 'ratio_deviation',
          severity: 'info',
          title: `Steel Reinforcement Density Ratio (${Math.round(kgPerCum)} kg/m³)`,
          explanation: `Calculated reinforcement ratio is ${Math.round(kgPerCum)} kg/m³. PWD standard for residential G+1 quarters ranges between 90-120 kg/m³.`,
          recommendation: `Verify structural column and slab reinforcement schedules for compliance with BNBC 2020 seismic ductility.`,
        });
      }
    }

    return list;
  }, [rows]);

  const activeAnomalies = anomalies.filter((a) => !resolvedIds.has(a.id));

  const filteredList = activeAnomalies.filter((a) => {
    if (filterType === 'all') return true;
    return a.anomalyType === filterType;
  });

  const underpricedCount = activeAnomalies.filter((a) => a.anomalyType === 'underpriced').length;
  const unitMismatchCount = activeAnomalies.filter((a) => a.anomalyType === 'non_standard_unit').length;
  const ratioDevCount = activeAnomalies.filter((a) => a.anomalyType === 'ratio_deviation').length;

  const healthScore = Math.max(60, 100 - activeAnomalies.length * 8);

  const handleFixAnomaly = (anom: HeuristicAnomaly) => {
    if (onUpdateRowRateOrUnit && anom.rowId && anom.rowId !== 'steel-ratio') {
      onUpdateRowRateOrUnit(anom.rowId, anom.benchmarkRateBDT, anom.expectedUnit);
    }
    setResolvedIds((prev) => new Set(prev).add(anom.id));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 uppercase tracking-wider">
              <Scale className="w-3 h-3 text-amber-400" />
              Heuristic Rate & Unit Verification Engine
            </span>
            <span className="text-xs font-semibold text-slate-400">
              CPWD / PWD Bangladesh Schedule Benchmarking
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Heuristic Anomaly & Rate Benchmark Summary
          </h3>
          <p className="text-xs text-slate-400">
            Automatically scans quantity takeoff rows against official PWD rates and standard measurement units to flag underpriced items and non-standard units.
          </p>
        </div>

        {/* Health score badge */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">PWD Benchmark Score</div>
            <div
              className={`text-lg font-extrabold ${
                healthScore >= 90
                  ? 'text-emerald-400'
                  : healthScore >= 75
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {healthScore} / 100
            </div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
              healthScore >= 90
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : healthScore >= 75
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            {healthScore >= 90 ? 'EXCELLENT' : healthScore >= 75 ? 'GOOD' : 'ATTN'}
          </div>
        </div>
      </div>

      {/* Anomaly KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Anomaly Flags</div>
            <div className="text-lg font-extrabold text-white">{activeAnomalies.length} Items</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-slate-400" />
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-400">Underpriced Items</div>
            <div className="text-lg font-extrabold text-rose-400">{underpricedCount} Items</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-rose-500" />
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Non-Standard Units</div>
            <div className="text-lg font-extrabold text-amber-400">{unitMismatchCount} Items</div>
          </div>
          <Wrench className="w-5 h-5 text-amber-500" />
        </div>

        <div className="p-3 bg-slate-950/80 rounded-xl border border-blue-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-400">Ratio Deviations</div>
            <div className="text-lg font-extrabold text-blue-400">{ratioDevCount} Checks</div>
          </div>
          <Scale className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'underpriced', 'non_standard_unit', 'ratio_deviation'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterType === t
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all'
                ? `All Anomalies (${activeAnomalies.length})`
                : t === 'underpriced'
                ? `Underpriced (${underpricedCount})`
                : t === 'non_standard_unit'
                ? `Non-Std Units (${unitMismatchCount})`
                : `Ratio Checks (${ratioDevCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all ${
              item.severity === 'critical'
                ? 'bg-rose-950/15 border-rose-500/40 hover:border-rose-500/60'
                : item.severity === 'warning'
                ? 'bg-amber-950/15 border-amber-500/40 hover:border-amber-500/60'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    item.severity === 'critical'
                      ? 'bg-rose-500/20 text-rose-400'
                      : item.severity === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {item.severity === 'critical' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : item.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.itemCode}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        item.anomalyType === 'underpriced'
                          ? 'bg-rose-500/20 text-rose-400'
                          : item.anomalyType === 'non_standard_unit'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {item.anomalyType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{item.explanation}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-400">
                    <span>
                      Current: <strong className="text-slate-200">৳{(item.currentRateBDT ?? 0).toLocaleString()} / {item.currentUnit || ''}</strong>
                    </span>
                    <span>→</span>
                    <span>
                      PWD Baseline: <strong className="text-emerald-400">৳{(item.benchmarkRateBDT ?? 0).toLocaleString()} / {item.expectedUnit || ''}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {item.rowId !== 'steel-ratio' && onUpdateRowRateOrUnit && (
                <button
                  onClick={() => handleFixAnomaly(item)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 self-start sm:self-center shadow-md shadow-amber-900/30 transition-all whitespace-nowrap"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Align with PWD Rate</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">All Takeoff Items Pass PWD Heuristic Analysis</div>
            <p className="text-xs text-slate-400 mt-1">
              No underpriced items or non-standard quantity units detected in current project takeoff rows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
