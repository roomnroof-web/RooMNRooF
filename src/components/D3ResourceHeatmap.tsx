import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GanttPhase } from '../types/estimation';
import { INITIAL_GANTT_PHASES } from '../data/projectTemplates';
import {
  Users,
  Flame,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  Info,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

interface D3ResourceHeatmapProps {
  phases?: GanttPhase[];
}

interface MatrixCell {
  resourceId: string;
  resourceName: string;
  category: 'labor' | 'material';
  week: number;
  value: number; // headcount or material qty
  unit: string;
  activePhases: string[];
  isPeak: boolean;
}

export const D3ResourceHeatmap: React.FC<D3ResourceHeatmapProps> = ({
  phases = INITIAL_GANTT_PHASES,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedResourceType, setSelectedResourceType] = useState<'all' | 'labor' | 'material'>('all');
  const [hoveredCell, setHoveredCell] = useState<MatrixCell | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const totalWeeks = 34;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Compute Weekly Demand Matrix
  const resourceDefs = [
    { id: 'masons', name: 'Masons (Mastri)', category: 'labor', unit: 'workers' },
    { id: 'helpers', name: 'Labor Helpers (Jogali)', category: 'labor', unit: 'workers' },
    { id: 'barBenders', name: 'Bar Benders & Steel Fixers', category: 'labor', unit: 'workers' },
    { id: 'mep', name: 'MEP Technicians', category: 'labor', unit: 'workers' },
    { id: 'cement', name: 'Cement Delivery', category: 'material', unit: 'bags' },
    { id: 'stone', name: 'Stone Aggregate', category: 'material', unit: 'cum' },
    { id: 'sand', name: 'Coarse Sand', category: 'material', unit: 'cum' },
  ] as const;

  const matrix: MatrixCell[] = [];

  resourceDefs.forEach((r) => {
    weeks.forEach((w) => {
      let val = 0;
      const activePhases: string[] = [];

      phases.forEach((p) => {
        if (w >= p.startWeek && w <= p.endWeek) {
          activePhases.push(p.title);

          if (r.id === 'masons') val += p.laborRequired.masons;
          if (r.id === 'helpers') val += p.laborRequired.helpers;
          if (r.id === 'barBenders') val += p.laborRequired.barBenders;
          if (r.id === 'mep') val += p.laborRequired.electricians + p.laborRequired.plumbers;

          // Material deliveries tied to specific delivery weeks
          p.materialDeliveries.forEach((md) => {
            if (md.deliveryWeek === w) {
              const nameLower = md.materialName.toLowerCase();
              if (r.id === 'cement' && nameLower.includes('cement')) val += md.quantity;
              if (r.id === 'stone' && nameLower.includes('stone')) val += md.quantity;
              if (r.id === 'sand' && nameLower.includes('sand')) val += md.quantity;
            }
          });
        }
      });

      matrix.push({
        resourceId: r.id,
        resourceName: r.name,
        category: r.category as 'labor' | 'material',
        week: w,
        value: val,
        unit: r.unit,
        activePhases,
        isPeak: false,
      });
    });
  });

  // Determine peaks for each resource row
  resourceDefs.forEach((r) => {
    const rowCells = matrix.filter((c) => c.resourceId === r.id);
    const maxVal = d3.max(rowCells, (d) => d.value) || 1;
    rowCells.forEach((c) => {
      if (c.value > 0 && c.value === maxVal) c.isPeak = true;
    });
  });

  const filteredResources = resourceDefs.filter((r) =>
    selectedResourceType === 'all' ? true : r.category === selectedResourceType
  );

  // Render Heatmap with D3
  useEffect(() => {
    if (!svgRef.current) return;

    const margin = { top: 35, right: 20, bottom: 25, left: 180 };
    const width = 880 - margin.left - margin.right;
    const height = filteredResources.length * 36;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Weeks 1 to 34)
    const xScale = d3
      .scaleBand<number>()
      .domain(weeks)
      .range([0, width])
      .padding(0.08);

    // Y Scale (Resource Types)
    const yScale = d3
      .scaleBand<string>()
      .domain(filteredResources.map((r) => r.name))
      .range([0, height])
      .padding(0.12);

    // Render X Axis
    g.append('g')
      .call(d3.axisTop(xScale).tickFormat((d) => `W${d}`))
      .selectAll('text')
      .attr('font-size', '9px')
      .attr('fill', '#94A3B8')
      .attr('font-weight', '600');

    g.selectAll('.domain, .tick line').attr('stroke', '#334155');

    // Render Y Axis Labels
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#F8FAFC')
      .attr('font-weight', '700');

    g.selectAll('.domain, .tick line').attr('stroke', 'transparent');

    // Color Scales for rows
    filteredResources.forEach((r) => {
      const rowCells = matrix.filter((m) => m.resourceId === r.id);
      const maxVal = d3.max(rowCells, (d) => d.value) || 1;

      const colorScale = d3
        .scaleSequential()
        .domain([0, maxVal])
        .interpolator(r.category === 'labor' ? d3.interpolateYlOrRd : d3.interpolateBlues);

      // Draw Cells
      rowCells.forEach((cell) => {
        const yPos = yScale(cell.resourceName);
        if (yPos === undefined) return;

        const cellG = g
          .append('g')
          .attr('transform', `translate(${xScale(cell.week)}, ${yPos})`);

        cellG
          .append('rect')
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .attr('rx', 4)
          .attr('fill', cell.value === 0 ? '#0F172A' : colorScale(cell.value))
          .attr('stroke', cell.isPeak ? '#EF4444' : '#1E293B')
          .attr('stroke-width', cell.isPeak ? 1.5 : 0.5)
          .style('cursor', 'pointer')
          .style('transition', 'all 0.15s ease')
          .on('mouseover', (event) => {
            setHoveredCell(cell);
            const rect = svgRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipPos({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
              });
            }
          })
          .on('mouseleave', () => {
            setHoveredCell(null);
            setTooltipPos(null);
          });

        // Add peak marker or count text if cell is wide enough
        if (cell.value > 0) {
          cellG
            .append('text')
            .attr('x', xScale.bandwidth() / 2)
            .attr('y', yScale.bandwidth() / 2 + 3)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('font-weight', 'bold')
            .attr('fill', cell.value / maxVal > 0.6 ? '#FFFFFF' : '#0F172A')
            .text(cell.value > 999 ? `${(cell.value / 1000).toFixed(1)}k` : cell.value);
        }
      });
    });
  }, [filteredResources, matrix]);

  // Overall Peak Week calculation
  const weeklyLaborTotal: Record<number, number> = {};
  weeks.forEach((w) => {
    weeklyLaborTotal[w] = matrix
      .filter((c) => c.week === w && c.category === 'labor')
      .reduce((sum, c) => sum + c.value, 0);
  });
  const peakLaborWeek = Object.entries(weeklyLaborTotal).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 uppercase tracking-wider">
              <Flame className="w-3 h-3 text-amber-400" />
              D3.js Resource Demand Engine
            </span>
            <span className="text-xs font-semibold text-slate-400">
              34-Week Labor & Material Intensity Heatmap
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Dynamic Schedule Resource Heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Visualizes weekly labor headcounts and site material delivery spikes across project gantt phases.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['all', 'labor', 'material'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedResourceType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedResourceType === t
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Resources' : t === 'labor' ? 'Workforce Demand' : 'Material Deliveries'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-rose-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-400">Peak Site Workforce</div>
            <div className="text-lg font-black text-white mt-0.5">
              {peakLaborWeek ? peakLaborWeek[1] : 0} Workers
            </div>
            <div className="text-[10px] text-slate-400">Week {peakLaborWeek ? peakLaborWeek[0] : 1} (Structural R.C.C)</div>
          </div>
          <Users className="w-5 h-5 text-rose-400" />
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-amber-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Peak Cement Inflow</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">640 Bags / Wk</div>
            <div className="text-[10px] text-slate-400">Week 4 (Foundation Pour)</div>
          </div>
          <PackageCheck className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-indigo-900/40 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-indigo-400">Critical Bottleneck Risk</div>
            <div className="text-lg font-black text-indigo-300 mt-0.5">Week 5 - Week 9</div>
            <div className="text-[10px] text-slate-400">Overlapping Footing & Rebar Binding</div>
          </div>
          <AlertTriangle className="w-5 h-5 text-indigo-400" />
        </div>
      </div>

      {/* D3 Heatmap Canvas */}
      <div className="relative bg-slate-950/90 border border-slate-800 rounded-xl p-4 overflow-x-auto">
        <svg ref={svgRef} className="w-full h-auto min-w-[800px]" />

        {/* Floating Hover Tooltip */}
        {hoveredCell && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 backdrop-blur-md"
            style={{
              left: `${Math.min(tooltipPos.x + 10, 650)}px`,
              top: `${tooltipPos.y + 10}px`,
            }}
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
              <span className="font-bold text-white">{hoveredCell.resourceName}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                Week {hoveredCell.week}
              </span>
            </div>
            <div className="text-slate-300 font-semibold">
              Intensity Load:{' '}
              <span className="text-amber-400 font-mono font-bold">
                {hoveredCell.value.toLocaleString()} {hoveredCell.unit}
              </span>
            </div>
            {hoveredCell.activePhases.length > 0 && (
              <div className="text-[10px] text-slate-400 pt-1">
                <span className="text-slate-300 font-medium">Active Phase:</span>{' '}
                {hoveredCell.activePhases.join(', ')}
              </div>
            )}
            {hoveredCell.isPeak && (
              <div className="text-[10px] font-bold text-rose-400 flex items-center gap-1 pt-1">
                <AlertTriangle className="w-3 h-3" /> Peak Allocation Maximum
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">Intensity Scale:</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px]">Zero</span>
              <div className="w-16 h-3 bg-gradient-to-r from-slate-900 via-amber-600 to-rose-600 rounded" />
              <span className="text-[10px]">Peak Demand</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 border border-rose-500 bg-rose-500/20 rounded" />
            <span>Red Outline = Peak Weekly Resource Demand</span>
          </div>
        </div>
      </div>
    </div>
  );
};
