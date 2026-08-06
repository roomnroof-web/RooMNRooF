import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Calendar,
  TrendingUp,
  Truck,
  Users,
  CloudRain,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Info,
  ArrowRight,
  Zap
} from 'lucide-react';
import { CurrencyCode } from '../types/estimation';
import { formatCurrency } from '../utils/estimationCalculators';

export interface ProjectRiskItem {
  id: string;
  title: string;
  category: 'Labor' | 'Procurement' | 'Market Volatility' | 'Weather / Seasonal' | 'Design & Soil';
  likelihood: 'Low' | 'Medium' | 'High'; // 1, 2, 3
  impact: 'Low' | 'Medium' | 'High';     // 1, 2, 3
  severityScore: number; // likelihood x impact (1-9)
  affectedTasks: string[];
  affectedBoqItems: string[];
  costImpactBDT: number;
  timeDelayDays: number;
  mitigationStrategy: string;
  status: 'active' | 'mitigated' | 'monitored';
}

interface ProjectRiskMatrixProps {
  currency?: CurrencyCode;
  onApplyMitigationBuffer?: (riskId: string, amountBDT: number) => void;
}

export const ProjectRiskMatrix: React.FC<ProjectRiskMatrixProps> = ({
  currency = 'BDT',
  onApplyMitigationBuffer,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ likelihood: 'Low' | 'Medium' | 'High'; impact: 'Low' | 'Medium' | 'High' } | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [mitigatedRisks, setMitigatedRisks] = useState<Set<string>>(new Set());

  const riskItemsList: ProjectRiskItem[] = [
    {
      id: 'risk-101',
      title: 'Q4 Steel & Cement Freight Rate Volatility',
      category: 'Market Volatility',
      likelihood: 'High',
      impact: 'High',
      severityScore: 9,
      affectedTasks: ['Gantt Task 2.1: Column & Grade Beam RCC', 'Gantt Task 3.2: 1st & 2nd Floor Slab Casting'],
      affectedBoqItems: ['BSRM 500W Deformed Steel Rebar (28.5 MT)', 'PCC Cement (1,400 Bags)'],
      costImpactBDT: 420000,
      timeDelayDays: 14,
      mitigationStrategy: 'Lock 60% bulk steel rebar supply contract within 30 days and apply BNBC 500D substitute.',
      status: 'active',
    },
    {
      id: 'risk-102',
      title: 'Monsoon Heavy Rainfall & Foundation Pit Waterlogging',
      category: 'Weather / Seasonal',
      likelihood: 'High',
      impact: 'Medium',
      severityScore: 6,
      affectedTasks: ['Gantt Task 1.2: Foundation Earth Excavation', 'Gantt Task 1.3: Sand Piling & Compaction'],
      affectedBoqItems: ['Sylhet Sand Filling in Pits (21,200 Cft)', 'De-watering & Trench Shoring Work'],
      costImpactBDT: 185000,
      timeDelayDays: 18,
      mitigationStrategy: 'Deploy 3x 10HP dewatering pumps and construct peripheral brick drainage channels.',
      status: 'active',
    },
    {
      id: 'risk-103',
      title: 'Skilled Mason & Shuttering Carpenter Shortage',
      category: 'Labor',
      likelihood: 'Medium',
      impact: 'High',
      severityScore: 6,
      affectedTasks: ['Gantt Task 2.3: Brick Masonry Partition Walls', 'Gantt Task 3.4: Exterior Plastering'],
      affectedBoqItems: ['1st Class Brick Work (85,000 Pcs)', 'RCC Column Formwork'],
      costImpactBDT: 210000,
      timeDelayDays: 21,
      mitigationStrategy: 'Pre-engage sub-contractor labor gangs with task-completion incentive bonus.',
      status: 'monitored',
    },
    {
      id: 'risk-104',
      title: 'Sylhet Sand Riverbed Quarry Extraction Ban',
      category: 'Procurement',
      likelihood: 'Medium',
      impact: 'Medium',
      severityScore: 4,
      affectedTasks: ['Gantt Task 1.3: Sand Piling', 'Gantt Task 2.2: Mortar Mixing for Masonry'],
      affectedBoqItems: ['Sylhet Coarse Sand (FM 2.5)'],
      costImpactBDT: 125000,
      timeDelayDays: 10,
      mitigationStrategy: 'Stockpile 15,000 Cft Sylhet sand at site staging yard before September transport restrictions.',
      status: 'active',
    },
    {
      id: 'risk-105',
      title: 'Foundation Soil Bearing Capacity Variation',
      category: 'Design & Soil',
      likelihood: 'Low',
      impact: 'High',
      severityScore: 3,
      affectedTasks: ['Gantt Task 1.1: Soil Test Boreholes', 'Gantt Task 1.4: RCC Footing Casting'],
      affectedBoqItems: ['RCC Footing Concrete (M25 Grade)'],
      costImpactBDT: 310000,
      timeDelayDays: 12,
      mitigationStrategy: 'Conduct 2 additional verification plate load tests before pouring Footing F1.',
      status: 'monitored',
    },
  ];

  // Matrix cells helper
  const matrixLevels: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

  // Filtered risks
  const filteredRisks = riskItemsList.filter((r) => {
    const matchCat = activeCategoryFilter === 'All' || r.category === activeCategoryFilter;
    const matchCell =
      !selectedCell ||
      (r.likelihood === selectedCell.likelihood && r.impact === selectedCell.impact);
    return matchCat && matchCell;
  });

  const totalPotentialRiskCost = riskItemsList.reduce((acc, r) => acc + r.costImpactBDT, 0);

  const handleMitigate = (id: string, amount: number) => {
    setMitigatedRisks((prev) => new Set(prev).add(id));
    if (onApplyMitigationBuffer) {
      onApplyMitigationBuffer(id, amount);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Gantt & Volatility Risk Matrix
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Project Bottleneck & Contingency Forecaster
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Project Risk Assessment Matrix & Bottleneck Visualization
          </h3>
          <p className="text-xs text-slate-400">
            Flags schedule bottlenecks, labor shortages, seasonal weather risks, and material rate surges linked with Gantt timeline tasks and market trends.
          </p>
        </div>

        {/* Total Risk Exposure Pill */}
        <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/40 text-right min-w-[200px]">
          <div className="text-[10px] uppercase font-bold text-rose-400">Total Contingency Risk Exposure</div>
          <div className="text-xl font-extrabold text-rose-300 mt-0.5">
            {formatCurrency(totalPotentialRiskCost, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Max Delay: 74 Calendar Days
          </div>
        </div>
      </div>

      {/* Main Grid: 3x3 Matrix Left + Risk Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 3x3 Matrix Grid */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                3×3 Risk Heatmap (Likelihood vs Impact)
              </h4>
              {selectedCell && (
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-[10px] font-mono text-blue-400 underline hover:text-blue-300 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Matrix Visualization */}
            <div className="relative pt-6 pl-8">
              {/* Y-Axis Label */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Likelihood →
              </div>

              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 gap-2">
                {matrixLevels.map((like) =>
                  matrixLevels.slice().reverse().map((imp) => {
                    const countInCell = riskItemsList.filter(
                      (r) => r.likelihood === like && r.impact === imp
                    ).length;

                    const isSelected =
                      selectedCell?.likelihood === like && selectedCell?.impact === imp;

                    // Color code cells based on severity
                    let cellBg = 'bg-slate-900 border-slate-800 text-slate-400';
                    if (like === 'High' && imp === 'High') {
                      cellBg = countInCell > 0
                        ? 'bg-rose-500/30 border-rose-500/60 text-rose-200'
                        : 'bg-rose-950/20 border-rose-900/30 text-rose-400/50';
                    } else if (
                      (like === 'High' && imp === 'Medium') ||
                      (like === 'Medium' && imp === 'High')
                    ) {
                      cellBg = countInCell > 0
                        ? 'bg-amber-500/30 border-amber-500/60 text-amber-200'
                        : 'bg-amber-950/20 border-amber-900/30 text-amber-400/50';
                    } else if (countInCell > 0) {
                      cellBg = 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300';
                    }

                    return (
                      <button
                        key={`${like}-${imp}`}
                        onClick={() =>
                          setSelectedCell(
                            isSelected ? null : { likelihood: like, impact: imp }
                          )
                        }
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[70px] ${cellBg} ${
                          isSelected ? 'ring-2 ring-blue-400 shadow-lg' : 'hover:scale-105'
                        }`}
                      >
                        <span className="text-[10px] font-mono uppercase font-bold opacity-75">
                          {like[0]}L / {imp[0]}I
                        </span>
                        <span className="text-base font-extrabold mt-1">
                          {countInCell} {countInCell === 1 ? 'Risk' : 'Risks'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* X-Axis Label */}
              <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3">
                Impact Level →
              </div>
            </div>
          </div>

          {/* Legend Strip */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> High Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Medium Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Low Tracked
            </span>
          </div>
        </div>

        {/* Right Risk Items List */}
        <div className="lg:col-span-7 space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Trade:</span>
            {['All', 'Market Volatility', 'Weather / Seasonal', 'Labor', 'Procurement', 'Design & Soil'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Risk Cards */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {filteredRisks.map((risk) => {
              const isMitigated = mitigatedRisks.has(risk.id);
              return (
                <div
                  key={risk.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isMitigated
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : risk.severityScore >= 8
                      ? 'bg-rose-950/20 border-rose-900/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        risk.severityScore >= 8
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        Score {risk.severityScore}/9 • {risk.category}
                      </span>
                      <h5 className="text-xs font-bold text-white">{risk.title}</h5>
                    </div>

                    <div className="text-xs font-mono font-bold text-rose-400">
                      +{formatCurrency(risk.costImpactBDT, currency)} | +{risk.timeDelayDays} Days
                    </div>
                  </div>

                  {/* Affected Tasks & BOQ Items */}
                  <div className="text-[11px] text-slate-300 space-y-1 mb-2">
                    <div>
                      <span className="font-bold text-slate-400">Affected Gantt Tasks: </span>
                      <span className="text-slate-300">{risk.affectedTasks.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">Impacted BOQ Items: </span>
                      <span className="text-blue-300 font-mono">{risk.affectedBoqItems.join(', ')}</span>
                    </div>
                  </div>

                  {/* Mitigation Advice Box */}
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300">Mitigation Action: </span>
                        <span className="text-slate-300">{risk.mitigationStrategy}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMitigate(risk.id, risk.costImpactBDT)}
                      disabled={isMitigated}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 cursor-pointer transition-all ${
                        isMitigated
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      }`}
                    >
                      {isMitigated ? 'Mitigation Active' : 'Apply Risk Buffer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
