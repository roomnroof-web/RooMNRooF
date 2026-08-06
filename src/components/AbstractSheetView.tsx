import React from 'react';
import {
  TakeoffRow,
  ProjectCostSummary,
  CostCategorySummary,
  UnitSystem,
  CurrencyCode
} from '../types/estimation';
import { formatCurrency, getUnitDisplay } from '../utils/estimationCalculators';
import { FileSpreadsheet, FileDown, CheckCircle2, Award, ShieldCheck } from 'lucide-react';

interface AbstractSheetViewProps {
  rows: TakeoffRow[];
  summary: ProjectCostSummary;
  categorySummaries: CostCategorySummary[];
  unitSystem: UnitSystem;
  currency: CurrencyCode;
  onExportPdf: () => void;
}

export const AbstractSheetView: React.FC<AbstractSheetViewProps> = ({
  rows,
  summary,
  categorySummaries,
  unitSystem,
  currency,
  onExportPdf,
}) => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Title Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              Official Tender Document
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              CPWD & BNBC 2024 Verified
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Abstract Estimate & Cost Summary Sheet
          </h2>
          <p className="text-xs text-slate-400">
            Police School Staff Quarter Project • Project No. CG/SS/2BHK • 25 Residential Units
          </p>
        </div>

        <button
          onClick={onExportPdf}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Abstract PDF</span>
        </button>
      </div>

      {/* Main Grid: Category Abstract Table Left + Executive Summary Box Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Table: Category wise Abstract */}
        <section className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Work Category Abstract Breakdown
            </h3>
            <span className="text-xs font-mono text-blue-400">
              {categorySummaries.length} Major Categories
            </span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <th className="py-3 px-4">Category Description</th>
                  <th className="py-3 px-4 text-right">Items</th>
                  <th className="py-3 px-4 text-right">Total Quantity</th>
                  <th className="py-3 px-4 text-right">Unit</th>
                  <th className="py-3 px-4 text-right">Amount ({currency})</th>
                  <th className="py-3 px-4 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categorySummaries.map((cat, i) => {
                  const itemCount = rows.filter((r) => r.category === cat.category).length;
                  return (
                    <tr key={cat.category} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {cat.category}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {itemCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-white font-bold">
                        {cat.totalQuantity.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 uppercase text-[10px]">
                        {getUnitDisplay(cat.unit, unitSystem)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(cat.amountBDT, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-blue-400">
                        {cat.percentageOfTotal.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Total Base Estimate (Single Unit)</span>
            <span className="font-mono font-extrabold text-white text-sm">
              {formatCurrency(summary.subtotalProjectCostBDT, currency)}
            </span>
          </div>
        </section>

        {/* Right Card: Tender Cost Summary matching PDF Page 6 */}
        <section className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Tender Cost Summary</h3>
                <p className="text-xs text-slate-400">
                  Department: CENTRAL PUBLIC WORK DEPARTMENT (PWD 2024)
                </p>
              </div>
              <Award className="w-6 h-6 text-blue-400" />
            </div>

            {/* Cost Rows */}
            <div className="space-y-4 mt-5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300 font-medium">Cost of Project (1 Unit Subtotal)</span>
                <span className="font-mono font-bold text-white text-sm">
                  {formatCurrency(summary.subtotalProjectCostBDT, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300 font-medium">
                  Add {summary.electrificationPercent}% Electrification Charge
                </span>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  + {formatCurrency(summary.electrificationAmountBDT, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700">
                <span className="text-white font-bold">Total Cost of Project (1 Unit)</span>
                <span className="font-mono font-extrabold text-white text-sm">
                  {formatCurrency(
                    summary.subtotalProjectCostBDT + summary.electrificationAmountBDT,
                    currency
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300 font-medium">
                  Add {summary.contingencyPercent}% Contingency Charge
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  + {formatCurrency(summary.contingencyAmountBDT, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
                <span className="text-white font-bold">Grand Total (Single Unit)</span>
                <span className="font-mono font-extrabold text-blue-300 text-base">
                  {formatCurrency(summary.totalCostPerUnitBDT, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300 font-medium">No. of Units in this Project</span>
                <span className="font-mono font-extrabold text-white text-base bg-slate-700 px-3 py-1 rounded">
                  {summary.numberOfUnits} Units
                </span>
              </div>
            </div>

            {/* Grand Total Tender Amount */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-900/40">
              <p className="text-[11px] uppercase tracking-wider font-bold text-blue-100">
                Grand Total Cost of the Project (25 Units)
              </p>
              <p className="text-2xl lg:text-3xl font-extrabold font-mono mt-1 tracking-tight">
                {formatCurrency(summary.grandTotalCostBDT, currency)}
              </p>
              <p className="text-[10px] text-blue-200 mt-2 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                Rates adopted as per DSR 2023 & PWD Bangladesh 2024
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
            <p>Engineer-in-Charge: Er. AMRUT AMARSHETTY</p>
            <p>Guided by: Er. Gaurav Singh Rathore</p>
          </div>
        </section>
      </div>
    </div>
  );
};
