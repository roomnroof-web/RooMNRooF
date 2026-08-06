/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TakeoffRow,
  CategoryBudgetBaseline,
  CurrencyCode
} from '../types/estimation';
import { DEFAULT_CATEGORY_BASELINES } from '../data/projectTemplates';
import { formatCurrency } from '../utils/estimationCalculators';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Edit3,
  RefreshCw,
  BellRing,
  Award
} from 'lucide-react';

interface BudgetVarianceMonitorProps {
  takeoffRows: TakeoffRow[];
  currency: CurrencyCode;
  onAlertTriggered?: (title: string, message: string) => void;
  isEmbedded?: boolean;
}

export const BudgetVarianceMonitor: React.FC<BudgetVarianceMonitorProps> = ({
  takeoffRows,
  currency,
  onAlertTriggered,
  isEmbedded = false,
}) => {
  const [baselines, setBaselines] = useState<CategoryBudgetBaseline[]>(
    DEFAULT_CATEGORY_BASELINES
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempBaselineVal, setTempBaselineVal] = useState<string>('');

  // Calculate actual amounts by category from takeoffRows
  const categoryActuals = useMemo(() => {
    const map: Record<string, number> = {};
    takeoffRows.forEach((row) => {
      map[row.category] = (map[row.category] || 0) + (row.amountBDT || 0);
    });
    return map;
  }, [takeoffRows]);

  // Compute variance for each baseline category
  const varianceData = useMemo(() => {
    return baselines.map((base) => {
      const actual = categoryActuals[base.category] || 0;
      const allocated = base.allocatedBDT;
      const varianceBDT = actual - allocated;
      const variancePercent = allocated > 0 ? (varianceBDT / allocated) * 100 : 0;
      const usagePercent = allocated > 0 ? (actual / allocated) * 100 : 0;

      let status: 'ok' | 'warning' | 'alert' = 'ok';
      if (usagePercent > 100) status = 'alert';
      else if (usagePercent >= 95) status = 'warning';

      return {
        ...base,
        actualBDT: actual,
        varianceBDT,
        variancePercent,
        usagePercent,
        status,
      };
    });
  }, [baselines, categoryActuals]);

  // Total project budget vs actual
  const totalAllocated = varianceData.reduce((sum, d) => sum + d.allocatedBDT, 0);
  const totalActual = varianceData.reduce((sum, d) => sum + d.actualBDT, 0);
  const totalVarianceBDT = totalActual - totalAllocated;
  const totalUsagePercent = totalAllocated > 0 ? (totalActual / totalAllocated) * 100 : 0;

  const alertCategories = varianceData.filter((d) => d.status === 'alert');

  const handleStartEdit = (category: string, currentVal: number) => {
    setEditingCategory(category);
    setTempBaselineVal(currentVal.toString());
  };

  const handleSaveEdit = (category: string) => {
    const val = parseFloat(tempBaselineVal) || 0;
    setBaselines((prev) =>
      prev.map((b) => (b.category === category ? { ...b, allocatedBDT: val } : b))
    );
    setEditingCategory(null);

    // If updated baseline causes alert, trigger callback
    const actual = categoryActuals[category] || 0;
    if (val > 0 && actual > val && onAlertTriggered) {
      onAlertTriggered(
        `Budget Baseline Exceeded: ${category}`,
        `Actual takeoff (${formatCurrency(actual, currency)}) is +${((actual - val) / val * 100).toFixed(1)}% over the allocated PWD baseline (${formatCurrency(val, currency)}).`
      );
    }
  };

  return (
    <div
      className={`space-y-6 select-none ${
        isEmbedded ? '' : 'bg-slate-900/80 border border-slate-800 rounded-xl p-6'
      }`}
    >
      {/* Top Banner / Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              Automated Cost Audit
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <Award className="w-3 h-3" />
              PWD Bangladesh 2024 Baselines
            </span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400" />
            <span>Automated Budget Variance Monitor & Allocation Alerts</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time comparison of BOQ quantity takeoff costs against CPWD / PWD allocated baseline budgets.
          </p>
        </div>

        {/* Overall Status Badge */}
        <div
          className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
            totalUsagePercent > 100
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
              : totalUsagePercent >= 95
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {totalUsagePercent > 100 ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <div>
            <p className="text-[10px] font-mono uppercase font-bold">
              Total Budget Usage: {totalUsagePercent.toFixed(1)}%
            </p>
            <p className="text-xs font-bold font-mono">
              Variance: {totalVarianceBDT > 0 ? '+' : ''}
              {formatCurrency(totalVarianceBDT, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* ALERT BANNER if any category exceeds baseline */}
      {alertCategories.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/50 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-white">
              {alertCategories.length} BOQ Takeoff Categor{alertCategories.length === 1 ? 'y' : 'ies'} Exceeded Allocated PWD Baseline Budget!
            </p>
            <p className="text-rose-200/90 text-[11px] mt-0.5">
              {alertCategories
                .map(
                  (c) =>
                    `${c.category} (+${c.variancePercent.toFixed(1)}% / +${formatCurrency(
                      c.varianceBDT,
                      currency
                    )})`
                )
                .join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <th className="py-3 px-4">PWD Category</th>
              <th className="py-3 px-4 text-right">Allocated Baseline</th>
              <th className="py-3 px-4 text-right">Actual BOQ Takeoff</th>
              <th className="py-3 px-4 text-right">Variance BDT</th>
              <th className="py-3 px-4 text-center min-w-[160px]">Budget Usage</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {varianceData.map((item) => {
              const isEditing = editingCategory === item.category;

              return (
                <tr
                  key={item.category}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    item.status === 'alert' ? 'bg-rose-500/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{item.category}</p>
                    <p className="text-[10px] font-mono text-slate-400">{item.codeRef}</p>
                  </td>

                  {/* Allocated Baseline with inline edit */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          step="1000"
                          value={tempBaselineVal}
                          onChange={(e) => setTempBaselineVal(e.target.value)}
                          className="w-28 px-2 py-1 bg-slate-800 text-white rounded border border-blue-500 text-right"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(item.category)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-slate-200">
                          {formatCurrency(item.allocatedBDT, currency)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(item.category, item.allocatedBDT)}
                          className="text-slate-500 hover:text-blue-400 transition-colors"
                          title="Edit Allocated Baseline"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Actual amount from Takeoff */}
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                    {formatCurrency(item.actualBDT, currency)}
                  </td>

                  {/* Variance BDT */}
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span
                      className={`font-bold flex items-center justify-end gap-1 ${
                        item.varianceBDT > 0
                          ? 'text-rose-400'
                          : item.varianceBDT < 0
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.varianceBDT > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 inline" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 inline" />
                      )}
                      <span>
                        {item.varianceBDT > 0 ? '+' : ''}
                        {formatCurrency(item.varianceBDT, currency)}
                      </span>
                    </span>
                  </td>

                  {/* Usage Progress bar */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.status === 'alert'
                              ? 'bg-rose-500'
                              : item.status === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(item.usagePercent, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold w-12 text-right ${
                          item.status === 'alert'
                            ? 'text-rose-400'
                            : item.status === 'warning'
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {item.usagePercent.toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold border ${
                        item.status === 'alert'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : item.status === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {item.status === 'alert'
                        ? 'OVER BUDGET'
                        : item.status === 'warning'
                        ? 'NEAR LIMIT'
                        : 'WITHIN BUDGET'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
        <span>Click the pencil icon to simulate adjusting CPWD/BNBC allocated baseline budgets</span>
        <span>Auto-audited against PWD Bangladesh 2024 Schedule</span>
      </div>
    </div>
  );
};
