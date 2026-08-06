import React, { useState } from 'react';
import { TakeoffRow, CurrencyCode } from '../types/estimation';
import { formatCurrency } from '../utils/estimationCalculators';
import {
  Leaf,
  Sparkles,
  Award,
  AlertCircle,
  TrendingDown,
  Info,
  CheckCircle2,
  TreePine,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CarbonFootprintCalculatorProps {
  takeoffRows: TakeoffRow[];
  totalAreaSqm: number;
  currency: CurrencyCode;
}

interface CarbonFactor {
  keyword: string;
  factorKgCO2ePerUnit: number; // kg CO2e per unit (kg, cum, sqm, etc.)
  unitName: string;
  category: string;
  greenTip: string;
}

// BNBC 2020 Sustainability Guidelines & ICE Carbon Database 2024
const BNBC_CARBON_FACTORS: CarbonFactor[] = [
  {
    keyword: 'steel',
    factorKgCO2ePerUnit: 1.85, // 1.85 kg CO2e per kg steel
    unitName: 'kg',
    category: 'Reinforcement Steel',
    greenTip: 'Switch to Electric Arc Furnace (EAF) recycled rebar to reduce embodied carbon by 45%.',
  },
  {
    keyword: 'rebar',
    factorKgCO2ePerUnit: 1.85,
    unitName: 'kg',
    category: 'Reinforcement Steel',
    greenTip: 'Utilize high-strength BSRM 500D/550D rebar to optimize steel tonnage by 8%.',
  },
  {
    keyword: 'concrete',
    factorKgCO2ePerUnit: 245.0, // 245 kg CO2e per cum concrete
    unitName: 'cum',
    category: 'Cement & Concrete',
    greenTip: 'Substitute 30% Portland Cement with Ground Granulated Blast-Furnace Slag (GGBS) or Fly Ash.',
  },
  {
    keyword: 'cement',
    factorKgCO2ePerUnit: 0.82, // per kg or per bag adjustment
    unitName: 'kg',
    category: 'Cement & Concrete',
    greenTip: 'Use Portland Composite Cement (PCC) instead of OPC for masonry & plastering.',
  },
  {
    keyword: 'brick',
    factorKgCO2ePerUnit: 210.0, // 210 kg CO2e per cum brickwork
    unitName: 'cum',
    category: 'Masonry & Wall Cladding',
    greenTip: 'Replace burnt clay bricks with Auto-aerated Concrete (AAC) blocks or Concrete Hollow Blocks.',
  },
  {
    keyword: 'sand',
    factorKgCO2ePerUnit: 14.2, // 14.2 kg CO2e per cum sand (dredging & transport)
    unitName: 'cum',
    category: 'Aggregates & Fill',
    greenTip: 'Source Sylhet sand from river beds with barges rather than long-distance diesel trucks.',
  },
  {
    keyword: 'plaster',
    factorKgCO2ePerUnit: 12.5, // per sqm
    unitName: 'sqm',
    category: 'Finishes & Rendering',
    greenTip: 'Apply thin-bed premixed gypsum plaster to eliminate water curing and reduce cement volume.',
  },
  {
    keyword: 'tile',
    factorKgCO2ePerUnit: 18.4, // per sqm
    unitName: 'sqm',
    category: 'Finishes & Rendering',
    greenTip: 'Select locally manufactured homogenous tiles to avoid international shipping emissions.',
  },
];

export const CarbonFootprintCalculator: React.FC<CarbonFootprintCalculatorProps> = ({
  takeoffRows,
  totalAreaSqm,
  currency,
}) => {
  const [useGreenConcreteOpt, setUseGreenConcreteOpt] = useState(false);
  const [useRecycledSteelOpt, setUseRecycledSteelOpt] = useState(false);

  // Calculate carbon breakdown
  let totalEmbodiedKgCO2e = 0;
  const categoryCarbonMap: Record<string, { kgCO2e: number; costBDT: number; rowsCount: number }> = {};

  takeoffRows.forEach((row) => {
    const desc = `${row.itemDescription} ${row.category}`.toLowerCase();
    let rowCarbon = 0;

    const matchedFactor = BNBC_CARBON_FACTORS.find((f) => desc.includes(f.keyword));
    if (matchedFactor) {
      let qty = row.quantity;
      let factor = matchedFactor.factorKgCO2ePerUnit;

      // Handle unit conversions
      if (matchedFactor.keyword === 'steel' || matchedFactor.keyword === 'rebar') {
        if (row.unit === 'MT') qty = row.quantity * 1000;
        if (useRecycledSteelOpt) factor *= 0.65; // 35% reduction
      } else if (matchedFactor.keyword === 'concrete') {
        if (useGreenConcreteOpt) factor *= 0.72; // 28% reduction with flyash
      }

      rowCarbon = qty * factor;
      const catKey = matchedFactor.category;

      if (!categoryCarbonMap[catKey]) {
        categoryCarbonMap[catKey] = { kgCO2e: 0, costBDT: 0, rowsCount: 0 };
      }
      categoryCarbonMap[catKey].kgCO2e += rowCarbon;
      categoryCarbonMap[catKey].costBDT += row.amountBDT;
      categoryCarbonMap[catKey].rowsCount += 1;
    } else {
      // Default fallback estimation based on general material weight
      rowCarbon = row.quantity * 8.5;
      const catKey = row.category || 'General Civil Works';
      if (!categoryCarbonMap[catKey]) {
        categoryCarbonMap[catKey] = { kgCO2e: 0, costBDT: 0, rowsCount: 0 };
      }
      categoryCarbonMap[catKey].kgCO2e += rowCarbon;
      categoryCarbonMap[catKey].costBDT += row.amountBDT;
      categoryCarbonMap[catKey].rowsCount += 1;
    }

    totalEmbodiedKgCO2e += rowCarbon;
  });

  const totalMetricTonsCO2e = totalEmbodiedKgCO2e / 1000;
  const carbonIntensitySqm = totalAreaSqm > 0 ? totalEmbodiedKgCO2e / totalAreaSqm : 0;

  // Rating according to BNBC green rating benchmark
  let ratingGrade = 'B';
  let ratingColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
  let ratingDesc = 'BNBC Green Level 2 Compliant';

  if (carbonIntensitySqm < 180) {
    ratingGrade = 'A+';
    ratingColor = 'text-emerald-300 bg-emerald-500/30 border-emerald-400/60';
    ratingDesc = 'Net-Zero Ready (BNBC Gold Rated)';
  } else if (carbonIntensitySqm < 260) {
    ratingGrade = 'A';
    ratingColor = 'text-teal-300 bg-teal-500/20 border-teal-400/50';
    ratingDesc = 'BNBC Green Level 1 Compliant';
  } else if (carbonIntensitySqm < 380) {
    ratingGrade = 'B';
    ratingColor = 'text-blue-300 bg-blue-500/20 border-blue-400/50';
    ratingDesc = 'Standard Urban Construction Baseline';
  } else if (carbonIntensitySqm < 500) {
    ratingGrade = 'C';
    ratingColor = 'text-amber-300 bg-amber-500/20 border-amber-400/50';
    ratingDesc = 'High Carbon Intensity - Optimization Advised';
  } else {
    ratingGrade = 'D';
    ratingColor = 'text-rose-300 bg-rose-500/20 border-rose-400/50';
    ratingDesc = 'Exceeds BNBC Sustainability Limits';
  }

  // Equivalent trees needed to offset
  const treesRequiredToOffset = Math.round(totalMetricTonsCO2e * 45);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 uppercase tracking-wider">
              <Leaf className="w-3 h-3 text-emerald-400" />
              BNBC 2020 Sustainability Module
            </span>
            <span className="text-xs font-semibold text-slate-400">
              BOQ Embodied Carbon & Life Cycle Assessment
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Automated Construction Carbon Footprint Estimator
          </h3>
          <p className="text-xs text-slate-400">
            Real-time embodied carbon calculation based on BNBC Green Building Guidelines and ICE Database 2024.
          </p>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">BNBC Rating</div>
            <div className="text-xs font-bold text-slate-300">{ratingDesc}</div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border ${ratingColor}`}>
            {ratingGrade}
          </div>
        </div>
      </div>

      {/* Primary Carbon KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-950/80 rounded-xl border border-emerald-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400">Total Embodied Carbon</div>
            <div className="text-xl font-black text-white mt-0.5">
              {totalMetricTonsCO2e.toFixed(1)} <span className="text-xs font-bold text-emerald-300">tCO₂e</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {(totalEmbodiedKgCO2e / 1000).toLocaleString()} metric tons greenhouse gases
            </div>
          </div>
          <Leaf className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-blue-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-400">Carbon Intensity</div>
            <div className="text-xl font-black text-white mt-0.5">
              {carbonIntensitySqm.toFixed(1)} <span className="text-xs font-bold text-blue-300">kgCO₂e / m²</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Per floor area ({totalAreaSqm} sqm total)
            </div>
          </div>
          <Layers className="w-6 h-6 text-blue-400 opacity-80" />
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-teal-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-teal-400">Off-set Tree Equivalent</div>
            <div className="text-xl font-black text-white mt-0.5">
              {treesRequiredToOffset.toLocaleString()} <span className="text-xs font-bold text-teal-300">Trees</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Required over 10-year growth period
            </div>
          </div>
          <TreePine className="w-6 h-6 text-teal-400 opacity-80" />
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-indigo-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-indigo-400">Cost-To-Carbon Ratio</div>
            <div className="text-xl font-black text-white mt-0.5">
              ৳{Math.round(takeoffRows.reduce((s, r) => s + r.amountBDT, 0) / (totalMetricTonsCO2e || 1)).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              BDT expenditure per tCO₂e
            </div>
          </div>
          <Award className="w-6 h-6 text-indigo-400 opacity-80" />
        </div>
      </div>

      {/* Interactive Carbon Optimization Toggles */}
      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            BNBC Low-Carbon Specification Abatement Simulator
          </h4>
          <span className="text-[11px] font-medium text-slate-400">Toggle green material specs:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
            useGreenConcreteOpt
              ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={useGreenConcreteOpt}
                onChange={(e) => setUseGreenConcreteOpt(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-0"
              />
              <div>
                <div className="text-xs font-bold text-white">30% Fly Ash Pozzolan Concrete Blend</div>
                <div className="text-[10px] text-slate-400">Reduces cement clinker emissions by ~28% in columns & footings</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              -28% Concrete Carbon
            </span>
          </label>

          <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
            useRecycledSteelOpt
              ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={useRecycledSteelOpt}
                onChange={(e) => setUseRecycledSteelOpt(e.target.checked)}
                className="rounded border-slate-700 text-emerald-600 focus:ring-0"
              />
              <div>
                <div className="text-xs font-bold text-white">High-Recycled Scrap EAF Rebar (BSRM 500D)</div>
                <div className="text-[10px] text-slate-400">Sourced from electric-arc furnaces with scrap steel input</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              -35% Steel Carbon
            </span>
          </label>
        </div>
      </div>

      {/* Category Embodied Carbon Breakdown Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-white">Embodied Carbon Footprint by Material Class</h4>
          <span className="text-[11px] text-slate-400 font-mono">Sorted by Carbon Tonnage</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <th className="py-2.5 px-4">Material Category</th>
              <th className="py-2.5 px-4 text-center">BOQ Rows</th>
              <th className="py-2.5 px-4 text-right">Cost Impact (BDT)</th>
              <th className="py-2.5 px-4 text-right">Embodied Carbon (tCO₂e)</th>
              <th className="py-2.5 px-4 text-right">% Total Carbon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {Object.entries(categoryCarbonMap)
              .sort((a, b) => b[1].kgCO2e - a[1].kgCO2e)
              .map(([catName, data]) => {
                const metricTons = data.kgCO2e / 1000;
                const pct = totalMetricTonsCO2e > 0 ? (metricTons / totalMetricTonsCO2e) * 100 : 0;

                return (
                  <tr key={catName} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">{catName}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{data.rowsCount} items</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatCurrency(data.costBDT, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {metricTons.toFixed(2)} t
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono text-xs text-slate-300">{pct.toFixed(1)}%</span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
