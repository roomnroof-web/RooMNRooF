/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GanttPhase,
  TakeoffRow,
  UnitSystem,
  CurrencyCode
} from '../types/estimation';
import { INITIAL_GANTT_PHASES } from '../data/projectTemplates';
import { formatCurrency, getUnitDisplay } from '../utils/estimationCalculators';
import { D3ResourceHeatmap } from './D3ResourceHeatmap';
import {
  CalendarRange,
  Clock,
  Users,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Layers,
  Filter,
  Plus,
  Edit3,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface ScheduleGanttViewProps {
  takeoffRows: TakeoffRow[];
  unitSystem: UnitSystem;
  currency: CurrencyCode;
}

export const ScheduleGanttView: React.FC<ScheduleGanttViewProps> = ({
  takeoffRows,
  unitSystem,
  currency,
}) => {
  const [phases, setPhases] = useState<GanttPhase[]>(INITIAL_GANTT_PHASES);
  const [activeSubTab, setActiveSubTab] = useState<'gantt' | 'materials' | 'labor' | 'd3-heatmap'>('gantt');
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>('ph-02');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  const totalWeeks = 34;
  const weeksArray = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Compute total project progress weighted by duration
  const totalDuration = phases.reduce((acc, p) => acc + (p.endWeek - p.startWeek + 1), 0);
  const weightedProgress = Math.round(
    phases.reduce((acc, p) => acc + p.progressPercent * (p.endWeek - p.startWeek + 1), 0) /
      (totalDuration || 1)
  );

  // Handle Progress change
  const handleProgressChange = (id: string, newVal: number) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, progressPercent: newVal } : p))
    );
  };

  // Filter phases by category
  const filteredPhases = phases.filter((p) =>
    selectedCategoryFilter === 'All' ? true : p.linkedCategory === selectedCategoryFilter
  );

  const categories = ['All', ...Array.from(new Set(phases.map((p) => p.linkedCategory)))];

  // Helper for Gantt bar color
  const getPhaseColorClass = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'from-emerald-600 to-emerald-500 border-emerald-400/50';
      case 'blue':
        return 'from-blue-600 to-blue-500 border-blue-400/50';
      case 'indigo':
        return 'from-indigo-600 to-indigo-500 border-indigo-400/50';
      case 'amber':
        return 'from-amber-600 to-amber-500 border-amber-400/50';
      case 'purple':
        return 'from-purple-600 to-purple-500 border-purple-400/50';
      case 'cyan':
        return 'from-cyan-600 to-cyan-500 border-cyan-400/50';
      case 'rose':
        return 'from-rose-600 to-rose-500 border-rose-400/50';
      default:
        return 'from-teal-600 to-teal-500 border-teal-400/50';
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] select-none">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              CPWD / PWD Schedule of Work
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              BNBC 2020 Construction Phasing
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-blue-400" />
            <span>Project Schedule Gantt Chart & BOQ Timeline Mapping</span>
          </h2>
          <p className="text-xs text-slate-400">
            Link quantity takeoff items to BNBC 2020 construction milestones, material delivery schedules, and site labor requirements.
          </p>
        </div>

        {/* Sub Navigation Pills */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('gantt')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === 'gantt'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Gantt Timeline</span>
          </button>
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === 'materials'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Material Deliveries</span>
          </button>
          <button
            onClick={() => setActiveSubTab('labor')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === 'labor'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Labor Requirements</span>
          </button>
          <button
            onClick={() => setActiveSubTab('d3-heatmap')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === 'd3-heatmap'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>D3 Resource Heatmap</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Total Construction Duration</p>
          <p className="text-xl font-bold font-mono text-white mt-1">34 Weeks (8.5 Months)</p>
          <p className="text-[10px] text-emerald-400 font-mono mt-1">Police School Staff Quarter (25 Units)</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Overall Weighted Progress</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-bold font-mono text-blue-400">{weightedProgress}%</span>
            <span className="text-xs font-mono text-slate-400">4 of 8 Phases Active</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${weightedProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Linked BOQ Takeoff Items</p>
          <p className="text-xl font-bold font-mono text-white mt-1">
            {takeoffRows.length} Items Mapped
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-1">100% of BOQ rows synchronized</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Peak Site Manpower</p>
          <p className="text-xl font-bold font-mono text-amber-400 mt-1">56 Workers / Day</p>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Phase 4 (Brick Masonry & DPC)</p>
        </div>
      </div>

      {/* SUB-VIEW 1: GANTT TIMELINE */}
      {activeSubTab === 'gantt' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
          {/* Top filter row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                BOQ Category Phase Filter:
              </span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1 border border-slate-700 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" />
                In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" />
                Scheduled
              </span>
            </div>
          </div>

          {/* Gantt Chart Table / Visual Canvas */}
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Timeline Header Weeks */}
              <div className="grid grid-cols-12 bg-slate-950/80 rounded-t-xl border border-slate-800/80 py-2.5 px-4 text-[10px] font-mono font-bold text-slate-400 uppercase">
                <div className="col-span-4">Phase Description & Linked BOQ Category</div>
                <div className="col-span-1 text-center">Duration</div>
                <div className="col-span-1 text-center">Progress</div>
                <div className="col-span-6 flex justify-between px-2">
                  <span>W1</span>
                  <span>W6</span>
                  <span>W12</span>
                  <span>W18</span>
                  <span>W24</span>
                  <span>W30</span>
                  <span>W34</span>
                </div>
              </div>

              {/* Phase Rows */}
              <div className="divide-y divide-slate-800/80 border-x border-b border-slate-800/80 rounded-b-xl bg-slate-900/40">
                {filteredPhases.map((phase) => {
                  const isExpanded = expandedPhaseId === phase.id;
                  const phaseRows = takeoffRows.filter((r) => r.category === phase.linkedCategory);
                  const phaseTotalBDT = phaseRows.reduce((sum, r) => sum + (r.amountBDT || 0), 0);
                  const startPercent = ((phase.startWeek - 1) / totalWeeks) * 100;
                  const widthPercent = ((phase.endWeek - phase.startWeek + 1) / totalWeeks) * 100;

                  return (
                    <div key={phase.id} className="hover:bg-slate-800/30 transition-all">
                      {/* Main Gantt row */}
                      <div className="grid grid-cols-12 items-center py-3.5 px-4 text-xs">
                        {/* Title & expand */}
                        <div
                          className="col-span-4 flex items-start gap-2 cursor-pointer pr-3"
                          onClick={() =>
                            setExpandedPhaseId(isExpanded ? null : phase.id)
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-bold text-white hover:text-blue-300 transition-colors">
                              {phase.title}
                            </p>
                            {phase.titleBn && (
                              <p className="text-[10px] text-slate-400 font-normal">
                                {phase.titleBn}
                              </p>
                            )}
                            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 inline-block mt-1">
                              {phase.linkedCategory} • {phaseRows.length} BOQ Items
                            </span>
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="col-span-1 text-center font-mono text-slate-300">
                          W{phase.startWeek} – W{phase.endWeek}
                          <p className="text-[10px] text-slate-500">
                            {phase.endWeek - phase.startWeek + 1} wks
                          </p>
                        </div>

                        {/* Progress slider */}
                        <div className="col-span-1 text-center px-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={phase.progressPercent}
                            onChange={(e) =>
                              handleProgressChange(phase.id, parseInt(e.target.value) || 0)
                            }
                            className="w-full accent-blue-500 h-1.5 cursor-pointer"
                            title={`Progress: ${phase.progressPercent}%`}
                          />
                          <span className="text-[11px] font-mono font-bold text-blue-400">
                            {phase.progressPercent}%
                          </span>
                        </div>

                        {/* Gantt Bar Visualization */}
                        <div className="col-span-6 relative h-7 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center px-1">
                          {/* Background Grid Lines */}
                          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-15 px-1">
                            <span className="border-r border-slate-500 h-full" />
                            <span className="border-r border-slate-500 h-full" />
                            <span className="border-r border-slate-500 h-full" />
                            <span className="border-r border-slate-500 h-full" />
                            <span className="border-r border-slate-500 h-full" />
                            <span className="border-r border-slate-500 h-full" />
                          </div>

                          {/* Phase Bar */}
                          <div
                            className={`absolute h-5 rounded bg-gradient-to-r ${getPhaseColorClass(
                              phase.color
                            )} border flex items-center justify-between px-2 overflow-hidden shadow-sm transition-all`}
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          >
                            <span className="text-[10px] font-mono font-bold text-white truncate drop-shadow">
                              {phase.progressPercent}%
                            </span>
                            <span className="text-[9px] font-mono text-white/90 truncate hidden sm:inline">
                              {formatCurrency(phaseTotalBDT, currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* EXPANDED SECTION: Linked BOQ Items */}
                      {isExpanded && (
                        <div className="bg-slate-950/90 border-t border-slate-800/80 p-4 pl-10 space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
                              Linked BOQ Takeoff Items ({phaseRows.length} rows)
                            </span>
                            <span className="font-mono font-bold text-white">
                              Category Subtotal: {formatCurrency(phaseTotalBDT, currency)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-2">
                            {phaseRows.map((row) => (
                              <div
                                key={row.id}
                                className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                              >
                                <div className="truncate pr-2">
                                  <span className="font-mono text-[10px] text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded mr-1.5">
                                    {row.pwdCode}
                                  </span>
                                  <span className="text-slate-200 font-medium truncate">
                                    {row.itemDescription}
                                  </span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-mono font-bold text-white">
                                    {row.quantity.toFixed(2)}{' '}
                                    {getUnitDisplay(row.unit, unitSystem)}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {formatCurrency(row.amountBDT || 0, currency)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MATERIAL DELIVERIES SCHEDULE */}
      {activeSubTab === 'materials' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>BOQ Material Delivery Schedule & Milestones</span>
              </h3>
              <p className="text-xs text-slate-400">
                Track delivery of Sylhet sand, OPC cement, crushed stone, BSRM 500W rebar, and 1st class bricks
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              12 Key Milestones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <th className="py-3 px-4">Material Specification</th>
                  <th className="py-3 px-4">Linked Schedule Phase</th>
                  <th className="py-3 px-4 text-right">Required Quantity</th>
                  <th className="py-3 px-4 text-center">Delivery Week</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {phases.flatMap((phase) =>
                  phase.materialDeliveries.map((mat) => (
                    <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {mat.materialName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="text-[11px] font-mono text-blue-400">
                          {phase.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                        {mat.quantity} {mat.unit}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                        Week {mat.deliveryWeek}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                            mat.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : mat.status === 'Scheduled'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {mat.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: LABOR REQUIREMENTS */}
      {activeSubTab === 'labor' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Site Manpower & Labor Loading Schedule (CPWD Norms)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Daily worker requirements per construction phase for Police School Staff Quarter (25 Units)
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              Peak: 56 Workers/Day
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <th className="py-3 px-4">Construction Phase</th>
                  <th className="py-3 px-4 text-center">Masons</th>
                  <th className="py-3 px-4 text-center">Helpers / Mazdoor</th>
                  <th className="py-3 px-4 text-center">Bar Benders</th>
                  <th className="py-3 px-4 text-center">Electricians</th>
                  <th className="py-3 px-4 text-center">Plumbers</th>
                  <th className="py-3 px-4 text-right">Total Daily Workforce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {phases.map((p) => {
                  const totalWorkers =
                    p.laborRequired.masons +
                    p.laborRequired.helpers +
                    p.laborRequired.barBenders +
                    p.laborRequired.electricians +
                    p.laborRequired.plumbers;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {p.title}
                        <p className="text-[10px] text-slate-400 font-normal">
                          Weeks {p.startWeek}–{p.endWeek}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-200">
                        {p.laborRequired.masons}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-400">
                        {p.laborRequired.helpers}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-400">
                        {p.laborRequired.barBenders}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                        {p.laborRequired.electricians}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                        {p.laborRequired.plumbers}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 font-mono font-extrabold text-white">
                          {totalWorkers} workers
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'd3-heatmap' && (
        <D3ResourceHeatmap phases={phases} />
      )}
    </div>
  );
};
