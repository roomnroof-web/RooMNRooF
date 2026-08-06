import React, { useState, useMemo } from 'react';
import { TakeoffRow, CurrencyCode } from '../types/estimation';
import { formatCurrency } from '../utils/estimationCalculators';
import {
  Flame,
  Layers,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Building,
  Info,
  CheckCircle2
} from 'lucide-react';

interface CostIntensityHeatmapProps {
  takeoffRows: TakeoffRow[];
  currency: CurrencyCode;
}

interface StructuralElementZone {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  amountBDT: number;
  percentage: number;
  itemCount: number;
  topItems: { name: string; amount: number; percentageOfZone: number }[];
  intensityLevel: 'critical' | 'high' | 'medium' | 'low';
  colorClass: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    barColor: string;
  };
}

export const CostIntensityHeatmap: React.FC<CostIntensityHeatmapProps> = ({
  takeoffRows,
  currency,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('foundation');
  const [viewMode, setViewMode] = useState<'heatmap' | 'elevation'>('heatmap');

  const { zones, totalProjectCost } = useMemo(() => {
    let totalCost = 0;
    takeoffRows.forEach((r) => {
      totalCost += r.amountBDT;
    });
    if (totalCost === 0) totalCost = 1;

    // Define structural element categorization rules
    const zoneDefinitions = [
      {
        id: 'foundation',
        name: '01. Foundation & Substructure',
        nameBn: 'ভিত্তি ও সাবস্ট্রাকচার',
        description: 'Earthwork excavation, PCC beds, RCC Footings (F1/F2), Grade Beams & Sand filling',
        keywords: ['foundation', 'footing', 'excavation', 'sand fill', 'pcc', 'substructure', 'earthwork', 'dpc'],
      },
      {
        id: 'columns',
        name: '02. Main Structural Columns & Walls',
        nameBn: 'মূল কলাম ও শিয়ার ওয়াল',
        description: 'RCC Columns (C1/C2/C3), Shear Walls, Lift Core & Heavy Steel Ductility Reinforcement',
        keywords: ['column', 'shear wall', 'c1', 'c2', 'c3', 'reinforcement for column'],
      },
      {
        id: 'slabs',
        name: '03. Suspended Slabs & Roof Deck',
        nameBn: 'ছাদ ও ঝুলন্ত স্ল্যাব',
        description: 'G+1 RCC Floor Slabs, Roof Waterproofing, Parapet Slab & Slab Reinforcement',
        keywords: ['slab', 'roof', 'waterproofing', 'parapet', 'terrace', 'reinforcement for slab'],
      },
      {
        id: 'beams',
        name: '04. Floor Beams & Lintels',
        nameBn: 'ফ্লোর বিম ও লিন্টেল',
        description: 'Main Floor Beams (FB1/FB2), Secondary Beams, Sunshade & Door/Window Lintels',
        keywords: ['beam', 'lintel', 'sunshade', 'fb1', 'fb2', 'reinforcement for beam'],
      },
      {
        id: 'masonry',
        name: '05. Brick Masonry & Wall Partitions',
        nameBn: 'ইটের গাঁথুনি ও পার্টিশন দেয়াল',
        description: '1st Class Brickwork (250mm external & 125mm partition walls in 1:4 cement mortar)',
        keywords: ['brick', 'masonry', 'wall', 'partition', 'mortar'],
      },
      {
        id: 'finishes',
        name: '06. Plastering, Painting & Tiles',
        nameBn: 'প্লাস্টার, রং ও টাইলস ফিনিশিং',
        description: 'Internal & External Cement Plaster, Acrylic Distemper, Ceramic & Kota Stone Flooring',
        keywords: ['plaster', 'paint', 'tile', 'distemper', 'flooring', 'skirting', 'marble', 'kota'],
      },
      {
        id: 'plumbing_elec',
        name: '07. Plumbing, Sanitary & MEP',
        nameBn: 'প্লাম্বিং, স্যানিটারি ও বৈদ্যুতিক',
        description: 'CPVC Pipes, Sanitary Fittings, Underground Reservoir & Concealed Electrical Works',
        keywords: ['plumbing', 'sanitary', 'pipe', 'water', 'electr', 'tank', 'reservoir', 'sewage'],
      },
      {
        id: 'staircase_misc',
        name: '08. Staircase & Miscellaneous works',
        nameBn: 'সিঁড়ি ও অন্যান্য কাজ',
        description: 'RCC Staircase slab, SS Handrails, Main Entrance Gate & Compound Works',
        keywords: ['stair', 'handrail', 'gate', 'compound', 'miscellaneous', 'step'],
      },
    ];

    const computedZones: StructuralElementZone[] = zoneDefinitions.map((def) => {
      const matchingRows = takeoffRows.filter((r) => {
        const text = `${r.itemDescription} ${r.category}`.toLowerCase();
        return def.keywords.some((kw) => text.includes(kw));
      });

      const amountBDT = matchingRows.reduce((sum, r) => sum + r.amountBDT, 0);
      const percentage = (amountBDT / totalCost) * 100;

      // Top contributing items in this zone
      const sortedItems = [...matchingRows].sort((a, b) => b.amountBDT - a.amountBDT).slice(0, 4);
      const topItems = sortedItems.map((item) => ({
        name: item.itemDescription,
        amount: item.amountBDT,
        percentageOfZone: amountBDT > 0 ? (item.amountBDT / amountBDT) * 100 : 0,
      }));

      // Classify intensity level
      let intensityLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
      let colorClass = {
        bg: 'bg-slate-900/60 hover:bg-slate-800/80',
        border: 'border-slate-700',
        text: 'text-slate-300',
        badgeBg: 'bg-slate-800 text-slate-300',
        badgeText: 'text-slate-300',
        barColor: '#64748B',
      };

      if (percentage >= 18) {
        intensityLevel = 'critical';
        colorClass = {
          bg: 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-900 hover:from-rose-950/90',
          border: 'border-rose-500/70 shadow-lg shadow-rose-950/30',
          text: 'text-rose-300',
          badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
          badgeText: 'text-rose-400',
          barColor: '#F43F5E',
        };
      } else if (percentage >= 11) {
        intensityLevel = 'high';
        colorClass = {
          bg: 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 hover:from-amber-950/80',
          border: 'border-amber-500/60',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          badgeText: 'text-amber-400',
          barColor: '#F59E0B',
        };
      } else if (percentage >= 6) {
        intensityLevel = 'medium';
        colorClass = {
          bg: 'bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 hover:from-blue-950/80',
          border: 'border-blue-500/50',
          text: 'text-blue-300',
          badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
          badgeText: 'text-blue-400',
          barColor: '#3B82F6',
        };
      } else {
        intensityLevel = 'low';
        colorClass = {
          bg: 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 hover:from-emerald-950/60',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          badgeText: 'text-emerald-400',
          barColor: '#10B981',
        };
      }

      return {
        id: def.id,
        name: def.name,
        nameBn: def.nameBn,
        description: def.description,
        amountBDT,
        percentage,
        itemCount: matchingRows.length,
        topItems,
        intensityLevel,
        colorClass,
      };
    });

    // Sort by cost descending
    computedZones.sort((a, b) => b.amountBDT - a.amountBDT);

    return { zones: computedZones, totalProjectCost: totalCost };
  }, [takeoffRows]);

  const activeZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) || zones[0];
  }, [zones, selectedZoneId]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 uppercase tracking-wider">
              <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
              AI Studio Master Feature #3
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Structural Cost-Intensity Heatmap
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Structural Element Cost-Intensity Heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Colors structural elements (Foundation, Columns, Slabs, Beams, etc.) by their percentage contribution to the total project cost ({formatCurrency(totalProjectCost, currency)}).
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'heatmap'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Grid Heatmap
          </button>
          <button
            onClick={() => setViewMode('elevation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'elevation'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Elevation Section View
          </button>
        </div>
      </div>

      {/* HEATMAP GRID VIEW */}
      {viewMode === 'heatmap' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((zone) => {
            const isSelected = zone.id === activeZone?.id;
            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  zone.colorClass.bg
                } ${zone.colorClass.border} ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-xl scale-[1.02]' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Intensity Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${zone.colorClass.badgeBg}`}>
                    {zone.intensityLevel === 'critical' && '🔥 Critical Cost Driver'}
                    {zone.intensityLevel === 'high' && '⚡ Major Element'}
                    {zone.intensityLevel === 'medium' && '🔷 Moderate Element'}
                    {zone.intensityLevel === 'low' && '🟢 Light Element'}
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {zone.percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Element Name */}
                <h4 className="text-sm font-bold text-white mb-1 leading-snug">
                  {zone.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {zone.description}
                </p>

                {/* Cost & Items count */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Estimated Cost</div>
                    <div className="text-xs font-bold text-white">
                      {formatCurrency(zone.amountBDT, currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">BOQ Items</div>
                    <div className="text-xs font-bold text-slate-300">
                      {zone.itemCount} Items
                    </div>
                  </div>
                </div>

                {/* Bottom intensity progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, zone.percentage * 2.2)}%`,
                      backgroundColor: zone.colorClass.barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ELEVATION CROSS-SECTION VIEW */}
      {viewMode === 'elevation' && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive G+1 Building Elevation Cross-Section — Click structural zones to drill down
            </span>
          </div>
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            {/* Roof & Parapet Zone */}
            {zones
              .filter((z) => z.id === 'slabs' || z.id === 'beams')
              .map((z) => (
                <div
                  key={z.id}
                  onClick={() => setSelectedZoneId(z.id)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    z.id === activeZone?.id ? 'ring-2 ring-blue-500 bg-slate-800' : 'bg-slate-900/90 hover:bg-slate-800/60'
                  } ${z.colorClass.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-10 rounded ${z.intensityLevel === 'critical' ? 'bg-rose-500' : z.intensityLevel === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{z.name}</div>
                      <div className="text-[11px] text-slate-400">{z.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">{z.percentage.toFixed(1)}%</span>
                    <div className="text-xs text-slate-400">{formatCurrency(z.amountBDT, currency)}</div>
                  </div>
                </div>
              ))}

            {/* Column & Shear wall mid-zone */}
            {zones
              .filter((z) => z.id === 'columns' || z.id === 'masonry')
              .map((z) => (
                <div
                  key={z.id}
                  onClick={() => setSelectedZoneId(z.id)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    z.id === activeZone?.id ? 'ring-2 ring-blue-500 bg-slate-800' : 'bg-slate-900/90 hover:bg-slate-800/60'
                  } ${z.colorClass.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-10 rounded ${z.intensityLevel === 'critical' ? 'bg-rose-500' : z.intensityLevel === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{z.name}</div>
                      <div className="text-[11px] text-slate-400">{z.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">{z.percentage.toFixed(1)}%</span>
                    <div className="text-xs text-slate-400">{formatCurrency(z.amountBDT, currency)}</div>
                  </div>
                </div>
              ))}

            {/* Substructure & Footings */}
            {zones
              .filter((z) => z.id === 'foundation' || z.id === 'plumbing_elec' || z.id === 'finishes' || z.id === 'staircase_misc')
              .map((z) => (
                <div
                  key={z.id}
                  onClick={() => setSelectedZoneId(z.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    z.id === activeZone?.id ? 'ring-2 ring-blue-500 bg-slate-800' : 'bg-slate-900/90 hover:bg-slate-800/60'
                  } ${z.colorClass.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-8 rounded ${z.intensityLevel === 'critical' ? 'bg-rose-500' : z.intensityLevel === 'high' ? 'bg-amber-500' : z.intensityLevel === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">{z.name}</div>
                      <div className="text-[11px] text-slate-400">{z.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-white">{z.percentage.toFixed(1)}%</span>
                    <div className="text-xs text-slate-400">{formatCurrency(z.amountBDT, currency)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* DRILL-DOWN PANEL FOR SELECTED ZONE */}
      {activeZone && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${activeZone.colorClass.text}`}>
                  Selected Element Zone:
                </span>
                <span className="text-sm font-bold text-white">{activeZone.name}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${activeZone.colorClass.badgeBg}`}>
                  {activeZone.percentage.toFixed(1)}% of Total Project
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeZone.description} — Bengali Name: <span className="text-slate-300">{activeZone.nameBn}</span>
              </p>
            </div>
          </div>

          {/* Top contributing BOQ items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                  <th className="py-2 px-3">Top Contributing BOQ Item</th>
                  <th className="py-2 px-3 text-right">Estimated Amount</th>
                  <th className="py-2 px-3 text-right">% of {activeZone.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {activeZone.topItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {formatCurrency(item.amount, currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[11px]">
                        {item.percentageOfZone.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
                {activeZone.topItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500 italic">
                      No specific BOQ items matched this zone keyword.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
