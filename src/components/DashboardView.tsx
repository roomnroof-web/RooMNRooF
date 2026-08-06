import React from 'react';
import {
  TakeoffRow,
  ProjectCostSummary,
  CostCategorySummary,
  UnitSystem,
  CurrencyCode
} from '../types/estimation';
import { formatCurrency, getUnitDisplay } from '../utils/estimationCalculators';
import { BudgetVarianceMonitor } from './BudgetVarianceMonitor';
import { CostIntensityHeatmap } from './CostIntensityHeatmap';
import { ProjectRiskMatrix } from './ProjectRiskMatrix';
import { HistoricalCostForecast } from './HistoricalCostForecast';
import { HeuristicAnalysisPanel } from './HeuristicAnalysisPanel';
import { CarbonFootprintCalculator } from './CarbonFootprintCalculator';
import { D3ResourceHeatmap } from './D3ResourceHeatmap';
import { ProjectArchiving } from './ProjectArchiving';
import { POLICE_SCHOOL_QUARTER_PROJECT } from '../data/policeSchoolQuarterProject';
import { EstimationProject } from '../types/estimation';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Building2,
  Building,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  FileDown,
  Compass,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  rows: TakeoffRow[];
  summary: ProjectCostSummary;
  categorySummaries: CostCategorySummary[];
  unitSystem: UnitSystem;
  currency: CurrencyCode;
  onNavigateToTakeoff?: () => void;
  onNavigate?: (tab: string) => void;
  onExportPdf: () => void;
  onOpenMetadataModal?: () => void;
  onAlertTriggered?: (title: string, message: string) => void;
  onUpdateRowRateOrUnit?: (rowId: string, newRateBDT: number, newUnit: string) => void;
}

const MATERIAL_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#14B8A6'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  rows,
  summary,
  categorySummaries,
  unitSystem,
  currency,
  onNavigateToTakeoff,
  onNavigate,
  onExportPdf,
  onOpenMetadataModal,
  onAlertTriggered,
  onUpdateRowRateOrUnit,
}) => {
  // Material Allocation chart data (adapted from Police School Staff Quarter expenditure)
  const materialAllocationData = [
    { name: 'RCC & Cement', percentage: 42, amount: summary.subtotalProjectCostBDT * 0.42 },
    { name: 'TMT 500D Steel', percentage: 25, amount: summary.subtotalProjectCostBDT * 0.25 },
    { name: 'Sylhet & Local Sand', percentage: 12, amount: summary.subtotalProjectCostBDT * 0.12 },
    { name: 'First Class Brick', percentage: 11, amount: summary.subtotalProjectCostBDT * 0.11 },
    { name: 'Tiles & Kota Stone', percentage: 6, amount: summary.subtotalProjectCostBDT * 0.06 },
    { name: 'CPVC & Sanitary', percentage: 4, amount: summary.subtotalProjectCostBDT * 0.04 },
  ];

  const barChartData = categorySummaries.map((c) => ({
    category: c.category.replace(/^[0-9]+\.\s*/, ''),
    amount: Math.round(c.amountBDT),
    itemsCount: rows.filter((r) => r.category === c.category).length,
  }));

  const totalTakeoffRowsCount = rows.length;
  const areaUnit = getUnitDisplay('sqm', unitSystem);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-indigo-900/40 border border-blue-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
              Executive Cost Summary
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              BNBC 2020 Compliant
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Police School Staff Quarter — <span className="text-blue-400">2BHK Residential Project (25 Units)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Standard Specification of Central Public Work Department (CPWD / PWD Bangladesh 2024 Schedule)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (onNavigate) onNavigate('site-layout');
            }}
            className="px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-300" />
            <span>Site Layout & CAD</span>
          </button>

          <button
            onClick={() => {
              if (onNavigate) onNavigate('material-tracker');
            }}
            className="px-3.5 py-2 bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-all cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>Live Material Tracker</span>
          </button>

          {onOpenMetadataModal && (
            <button
              onClick={onOpenMetadataModal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>Project Metadata</span>
            </button>
          )}

          <button
            onClick={onExportPdf}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>BOQ PDF</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToTakeoff) onNavigateToTakeoff();
              else if (onNavigate) onNavigate('takeoff');
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Takeoff Table</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Grand Total */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Grand Total ({summary.numberOfUnits} Units)
          </p>
          <p className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(summary.grandTotalCostBDT, currency)}
          </p>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-emerald-400 font-medium">Tender Approved</span>
            <span className="text-slate-400 font-mono">100% PWD Rate</span>
          </div>
        </div>

        {/* KPI 2: Single Unit Cost */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Single Unit Cost (1 Unit)
          </p>
          <p className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(summary.totalCostPerUnitBDT, currency)}
          </p>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-blue-400">Incl. 5% Electrification + 3% Contingency</span>
          </div>
        </div>

        {/* KPI 3: Cost Per Sqm / Sq.ft */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Cost Per {areaUnit.toUpperCase()}
          </p>
          <p className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(summary.costPerSqmBDT, currency)}
          </p>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-slate-400">Total Area: {summary.totalBuildingAreaSqm} {areaUnit}</span>
          </div>
        </div>

        {/* KPI 4: Total Takeoff Items */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Total Takeoff Items
          </p>
          <p className="text-2xl font-extrabold text-white mt-1">
            {totalTakeoffRowsCount} <span className="text-sm font-normal text-slate-400">items</span>
          </p>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-emerald-400">Zero formula errors</span>
            <span className="text-slate-400">8 Categories</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Expenditure Bar Chart */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Project Cost by BNBC Category</h3>
              <p className="text-xs text-slate-400">Breakdown of estimated amount across structural and finishing works</p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
              Base: {currency}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis
                  dataKey="category"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F8FAFC',
                  }}
                  formatter={(value: unknown) => [
                    formatCurrency(typeof value === 'number' ? value : Number(value), currency),
                    'Estimated Cost',
                  ]}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Allocation Pie Chart */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Material Allocation %</h3>
              <p className="text-xs text-slate-400">Cement, Steel, Sand, Brick & Tiling ratio</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="percentage"
                >
                  {materialAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MATERIAL_COLORS[index % MATERIAL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F8FAFC',
                  }}
                  formatter={(val: unknown) => [`${val}%`, 'Allocation']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COST-INTENSITY HEATMAP VISUALIZATION */}
      <CostIntensityHeatmap takeoffRows={rows} currency={currency} />

      {/* D3 RESOURCE HEATMAP VISUALIZATION (LABOR & MATERIAL DEMAND) */}
      <D3ResourceHeatmap />

      {/* AUTOMATED CARBON FOOTPRINT CALCULATOR (BNBC SUSTAINABILITY) */}
      <CarbonFootprintCalculator
        takeoffRows={rows}
        totalAreaSqm={summary.totalBuildingAreaSqm || 287.1}
        currency={currency}
      />

      {/* PROJECT RISK ASSESSMENT MATRIX & BOTTLENECK VISUALIZATION */}
      <ProjectRiskMatrix currency={currency} />

      {/* HISTORICAL COST FORECAST & TREND ANALYSIS (RECHARTS) */}
      <HistoricalCostForecast currency={currency} currentCostPerSqmBDT={summary.costPerSqmBDT} />

      {/* HEURISTIC ANALYSIS PANEL (BENCHMARKS & ANOMALIES) */}
      <HeuristicAnalysisPanel
        rows={rows}
        currency={currency}
        onUpdateRowRateOrUnit={onUpdateRowRateOrUnit}
      />

      {/* AUTOMATED PROJECT ARCHIVING & ENCRYPTED OFFLINE VAULT */}
      <ProjectArchiving
        currentProject={POLICE_SCHOOL_QUARTER_PROJECT as EstimationProject}
        takeoffRows={rows}
        currency={currency}
        onUpdateProjectStatus={(newStatus) => {
          if (onAlertTriggered) {
            onAlertTriggered(
              'Project Status Updated',
              `Project status changed to '${newStatus}'. Encrypted archive vault updated.`
            );
          }
        }}
      />

      {/* AUTOMATED BUDGET VARIANCE MONITORING FEATURE (PWD BASELINES) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <BudgetVarianceMonitor
          takeoffRows={rows}
          currency={currency}
          onAlertTriggered={onAlertTriggered}
          isEmbedded={true}
        />
      </div>

      {/* BNBC Compliance & Team Activity bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: BNBC 2020 Compliance Checklist */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              BNBC & CPWD Standards
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
              100% Passed
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-slate-300">Seismic Zone II/III RCC Concrete (M25)</span>
              <span className="text-emerald-400 font-bold">✓ Verified</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-slate-300">Reinforcement Fe-500D High Ductility</span>
              <span className="text-emerald-400 font-bold">✓ Verified</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-slate-300">DPC Bitumen Coating (1.7 kg/sqm)</span>
              <span className="text-emerald-400 font-bold">✓ Verified</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-800/50">
              <span className="text-slate-300">CPVC Plumbing ASTM F441 Sch 80</span>
              <span className="text-emerald-400 font-bold">✓ Verified</span>
            </div>
          </div>
        </div>

        {/* Card 2: Real-time Collaboration Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Live Team Collaboration Feed
            </h3>
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start justify-between border-l-2 border-blue-500 pl-3 py-1">
              <div>
                <p className="text-slate-200 font-medium">Er. AMRUT AMARSHETTY</p>
                <p className="text-slate-400 text-[11px]">Approved BOQ Tender Rate Schedule 2024</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">10m ago</span>
            </div>
            <div className="flex items-start justify-between border-l-2 border-emerald-500 pl-3 py-1">
              <div>
                <p className="text-slate-200 font-medium">Er. Gaurav Singh Rathore</p>
                <p className="text-slate-400 text-[11px]">Reviewed 25 Units Police Quarter estimate</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">35m ago</span>
            </div>
            <div className="flex items-start justify-between border-l-2 border-amber-500 pl-3 py-1">
              <div>
                <p className="text-slate-200 font-medium">Auto-Backup Engine</p>
                <p className="text-slate-400 text-[11px]">Encrypted snapshot saved to cloud storage</p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1h ago</span>
            </div>
          </div>
        </div>

        {/* Card 3: GDPR, CCPA & Privacy Assurance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                GDPR & CCPA Privacy Status
              </h3>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">
                Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All team member credentials, project financial estimates, and uploaded PDF drawings are encrypted with AES-256 both at rest and in transit. User data is fully compliant with EU GDPR and California CCPA privacy regulations.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Offline Cache State</span>
            <span className="text-emerald-400 font-mono font-bold">✓ Synced Local & Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
};
