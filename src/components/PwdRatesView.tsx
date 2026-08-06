import React, { useState } from 'react';
import { PwdRateItem, CurrencyCode } from '../types/estimation';
import { PWD_BANGLADESH_RATES } from '../data/pwdRateSchedule';
import { formatCurrency } from '../utils/estimationCalculators';
import {
  Search,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Scale,
  RefreshCw,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

interface PwdRatesViewProps {
  currency: CurrencyCode;
}

interface MarketDeltaComparison {
  id: string;
  materialName: string;
  category: string;
  unit: string;
  pwdScheduleRateBDT: number;
  liveMarketRateBDT: number;
  volatility: 'Stable' | 'Moderate Surge' | 'High Inflation Risk';
  lastUpdated: string;
  primarySupplier: string;
  actionRecommendation: string;
}

// High-frequency materials delta database (PWD 2024 vs Live Bangladesh Market 2026 Q3)
const MARKET_DELTA_ITEMS: MarketDeltaComparison[] = [
  {
    id: 'md-01',
    materialName: 'High-Yield 500D TMT Rebar (BSRM / KSRM / AKS)',
    category: 'Reinforcement Steel',
    unit: 'MT',
    pwdScheduleRateBDT: 95000,
    liveMarketRateBDT: 104500,
    volatility: 'High Inflation Risk',
    lastUpdated: 'Aug 2026',
    primarySupplier: 'BSRM Steels Chittagong',
    actionRecommendation: 'Include 10% price escalation clause in tender contracts.',
  },
  {
    id: 'md-02',
    materialName: 'Ordinary Portland Cement (Holcim / Seven Rings / Bashundhara)',
    category: 'Cement & Binder',
    unit: 'bag (50kg)',
    pwdScheduleRateBDT: 510,
    liveMarketRateBDT: 565,
    volatility: 'Moderate Surge',
    lastUpdated: 'Aug 2026',
    primarySupplier: 'LafargeHolcim Bangladesh',
    actionRecommendation: 'Procure bulk 500-bag lots to lock bulk discount rates.',
  },
  {
    id: 'md-03',
    materialName: 'Coarse Sylhet River Sand (FM 2.5 - 2.8)',
    category: 'Aggregates',
    unit: 'cum',
    pwdScheduleRateBDT: 1850,
    liveMarketRateBDT: 2350,
    volatility: 'High Inflation Risk',
    lastUpdated: 'Jul 2026',
    primarySupplier: 'Sylhet Quarry River Barges',
    actionRecommendation: 'Factor in seasonal river transport barge surges during monsoon.',
  },
  {
    id: 'md-04',
    materialName: 'First Class Auto-Fired Red Clay Bricks (10" x 5" x 3")',
    category: 'Masonry',
    unit: 'nos',
    pwdScheduleRateBDT: 11.5,
    liveMarketRateBDT: 13.8,
    volatility: 'Moderate Surge',
    lastUpdated: 'Jul 2026',
    primarySupplier: 'Dhaka Brick Kiln Association',
    actionRecommendation: 'Inspect compressive strength (2000 psi) prior to site unloading.',
  },
  {
    id: 'md-05',
    materialName: 'Crushed Stone Aggregate (20mm Down - Jaflong/Bholaganj)',
    category: 'Aggregates',
    unit: 'cum',
    pwdScheduleRateBDT: 3800,
    liveMarketRateBDT: 4250,
    volatility: 'Moderate Surge',
    lastUpdated: 'Aug 2026',
    primarySupplier: 'Bholaganj Stone Crushing Plant',
    actionRecommendation: 'Verify flakiness index < 15% before batching.',
  },
  {
    id: 'md-06',
    materialName: 'Anodized Thai Aluminum Window Section (1.8mm KAI)',
    category: 'Finishes & Joinery',
    unit: 'sqm',
    pwdScheduleRateBDT: 2400,
    liveMarketRateBDT: 2450,
    volatility: 'Stable',
    lastUpdated: 'Aug 2026',
    primarySupplier: 'KAI Bangladesh Aluminum',
    actionRecommendation: 'Rates remain stable; ensure EPDM gasket compliance.',
  },
  {
    id: 'md-07',
    materialName: '600mm x 600mm Mirror Finished Homogenous Floor Tiles (RAK)',
    category: 'Finishes & Joinery',
    unit: 'sqm',
    pwdScheduleRateBDT: 1250,
    liveMarketRateBDT: 1320,
    volatility: 'Stable',
    lastUpdated: 'Jul 2026',
    primarySupplier: 'RAK Ceramics Bangladesh',
    actionRecommendation: 'Standard rate inline with BOQ allowances.',
  },
];

export const PwdRatesView: React.FC<PwdRatesViewProps> = ({ currency }) => {
  const [rates, setRates] = useState<PwdRateItem[]>(PWD_BANGLADESH_RATES);
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'comparison'>('schedule');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(rates.map((r) => r.category)))];

  const filteredRates = rates.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const term = search.toLowerCase();
    const matchSearch =
      term === '' ||
      item.code.toLowerCase().includes(term) ||
      item.itemDescription.toLowerCase().includes(term) ||
      (item.itemDescriptionBn && item.itemDescriptionBn.toLowerCase().includes(term)) ||
      (item.bnbcReference && item.bnbcReference.toLowerCase().includes(term));
    return matchCat && matchSearch;
  });

  const handleRateChange = (code: string, newRate: number) => {
    setRates((prev) =>
      prev.map((item) => (item.code === code ? { ...item, defaultRateBDT: newRate } : item))
    );
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] select-none">
      {/* Top Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              PWD Bangladesh Schedule 2024
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              BNBC 2020 Aligned
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Official CPWD / PWD Rate Schedule & Market Delta Benchmarking
          </h2>
          <p className="text-xs text-slate-400">
            Standard specifications for residential, educational, and civil works in Bangladesh with live market rate tracking.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            PWD Schedule Rates
          </button>
          <button
            onClick={() => setActiveSubTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'comparison'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-300" />
            <span>Market Delta Comparative Analysis</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'schedule' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search code, BNBC spec..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 border border-slate-700 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rates Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <th className="py-3 px-4 w-20">Code</th>
                  <th className="py-3 px-4 w-44">Category</th>
                  <th className="py-3 px-4 min-w-[280px]">Item Description & BNBC Reference</th>
                  <th className="py-3 px-4 text-center w-24">Unit</th>
                  <th className="py-3 px-4 text-right w-36">Default Rate ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRates.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{item.code}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{item.category}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white">{item.itemDescription}</p>
                        {item.itemDescriptionBn && (
                          <p className="text-slate-400 text-[11px] mt-0.5">{item.itemDescriptionBn}</p>
                        )}
                        {item.bnbcReference && (
                          <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {item.bnbcReference} — {item.specifications}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 uppercase">
                      {item.unitMetric}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.defaultRateBDT}
                          onChange={(e) => handleRateChange(item.code, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 bg-slate-800 text-right text-white font-mono rounded border border-slate-700 outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatCurrency(item.defaultRateBDT, currency)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Market Delta Comparative Table Section */
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" />
                  PWD Schedule (2024) vs Live Market Rate (2026 Q3) Variance Delta
                </h3>
                <p className="text-xs text-slate-400">
                  Monitors material price inflation across high-frequency items to calculate tender risk margins.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  Last Price Index Refresh: Aug 2026
                </span>
              </div>
            </div>

            {/* Comparative Table */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                    <th className="py-3 px-4">Material & Specification</th>
                    <th className="py-3 px-4 text-center">Unit</th>
                    <th className="py-3 px-4 text-right">PWD 2024 Rate</th>
                    <th className="py-3 px-4 text-right">Live Market Rate</th>
                    <th className="py-3 px-4 text-right">Variance Delta</th>
                    <th className="py-3 px-4 text-center">Inflation Risk</th>
                    <th className="py-3 px-4 min-w-[200px]">Contingency Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {MARKET_DELTA_ITEMS.map((item) => {
                    const deltaBDT = item.liveMarketRateBDT - item.pwdScheduleRateBDT;
                    const deltaPct = (deltaBDT / item.pwdScheduleRateBDT) * 100;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{item.materialName}</div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            Supplier: {item.primarySupplier}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                          {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          ৳{item.pwdScheduleRateBDT.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-300">
                          ৳{item.liveMarketRateBDT.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          <span
                            className={`flex items-center justify-end gap-1 ${
                              deltaBDT > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {deltaBDT > 0 ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            +{deltaPct.toFixed(1)}% (+৳{deltaBDT.toLocaleString()})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.volatility === 'High Inflation Risk'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : item.volatility === 'Moderate Surge'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {item.volatility}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300">
                          {item.actionRecommendation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
