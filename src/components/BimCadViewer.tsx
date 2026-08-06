import React, { useState } from 'react';
import {
  Layers,
  Box,
  Eye,
  History,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Maximize2,
  FileDown,
  Building2,
  Compass
} from 'lucide-react';
import { CurrencyCode } from '../types/estimation';
import { formatCurrency } from '../utils/estimationCalculators';

export interface BimRevisionRecord {
  version: string;
  releaseName: string;
  date: string;
  author: string;
  role: string;
  concreteVolumeCum: number;
  steelWeightTon: number;
  totalElementsCount: number;
  changesSummary: string;
  status: 'active_baseline' | 'archived_rev';
}

export interface BimComponentDelta {
  componentId: string;
  name: string;
  category: string;
  changeType: 'added' | 'modified' | 'rebar_upgrade' | 'removed';
  oldVolumeCum: number;
  newVolumeCum: number;
  oldSteelTon: number;
  newSteelTon: number;
  remarks: string;
}

interface BimCadViewerProps {
  currency?: CurrencyCode;
}

export const BimCadViewer: React.FC<BimCadViewerProps> = ({ currency = 'BDT' }) => {
  const [activeVersion, setActiveVersion] = useState<string>('v2.0');
  const [compareVersion, setCompareVersion] = useState<string>('v1.1');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(true);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [explodedView, setExplodedView] = useState<boolean>(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('C1-Col');

  // Revision Releases History
  const bimRevisions: BimRevisionRecord[] = [
    {
      version: 'v2.1',
      releaseName: 'MEP Plumbing Duct & HVAC Integration',
      date: '2026-08-04',
      author: 'Er. Gaurav Singh Rathore',
      role: 'BIM / Structural Coordinator',
      concreteVolumeCum: 385.2,
      steelWeightTon: 28.5,
      totalElementsCount: 148,
      changesSummary: 'Added slab core sleeves for MEP water pipes & HVAC ventilation shafts.',
      status: 'active_baseline',
    },
    {
      version: 'v2.0',
      releaseName: 'Structural Expansion (6-Story Multi-Family)',
      date: '2026-08-01',
      author: 'Er. AMRUT AMARSHETTY',
      role: 'Chief Structural Engineer',
      concreteVolumeCum: 382.0,
      steelWeightTon: 28.1,
      totalElementsCount: 142,
      changesSummary: 'Upgraded column M25 concrete mix and increased footing F1 thickness to 1.8m.',
      status: 'archived_rev',
    },
    {
      version: 'v1.1',
      releaseName: 'Foundation Rebar & SBC Soil Upgrade',
      date: '2026-07-25',
      author: 'Er. Gaurav Singh Rathore',
      role: 'Quantity Surveyor',
      concreteVolumeCum: 360.5,
      steelWeightTon: 25.2,
      totalElementsCount: 128,
      changesSummary: 'Added 12mm tie stirrups @ 100mm c/c for seismic ductility compliance.',
      status: 'archived_rev',
    },
    {
      version: 'v1.0',
      releaseName: 'Initial Architectural Draft Concept',
      date: '2026-07-15',
      author: 'Engr. Nazmul Huda',
      role: 'Cadastral Architect',
      concreteVolumeCum: 340.0,
      steelWeightTon: 23.0,
      totalElementsCount: 110,
      changesSummary: 'Baseline 3D grid layout draft for Police Officer Quarter.',
      status: 'archived_rev',
    },
  ];

  // Component Deltas between v2.1 and v1.1
  const componentDeltas: BimComponentDelta[] = [
    {
      componentId: 'C1-Col',
      name: 'Column C1 (400mm x 450mm)',
      category: 'Columns & Vertical Members',
      changeType: 'modified',
      oldVolumeCum: 18.2,
      newVolumeCum: 20.4,
      oldSteelTon: 2.15,
      newSteelTon: 2.65,
      remarks: 'Upgraded main rebar from 6#16mm to 8#20mm Fe 500D per BNBC seismic code.',
    },
    {
      componentId: 'F1-Footing',
      name: 'Isolated Footing F1 (1.8m x 1.8m)',
      category: 'Substructure Footings',
      changeType: 'rebar_upgrade',
      oldVolumeCum: 18.0,
      newVolumeCum: 21.0,
      oldSteelTon: 1.80,
      newSteelTon: 2.10,
      remarks: 'Increased mat rebar density and thickness by 300mm for SBC soil safety.',
    },
    {
      componentId: 'GB1-Beam',
      name: 'Grade Beam GB1 (250mm x 500mm)',
      category: 'Beams & Girders',
      changeType: 'modified',
      oldVolumeCum: 9.2,
      newVolumeCum: 9.81,
      oldSteelTon: 0.95,
      newSteelTon: 1.12,
      remarks: 'Added top negative reinforcement at support nodes.',
    },
    {
      componentId: 'S1-Slab',
      name: 'Two-Way RCC Floor Slab S1 (125mm)',
      category: 'Slabs & Decks',
      changeType: 'added',
      oldVolumeCum: 42.0,
      newVolumeCum: 45.8,
      oldSteelTon: 3.20,
      newSteelTon: 3.60,
      remarks: 'Integrated extra terrace parapet & OHT support slab area.',
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-indigo-400" />
                3D BIM / CAD Version Control
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                BNBC 2020 Structural Audit
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              BIM Component Model Versioning & Diff History System
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Tracks structural element revisions, concrete volume changes, and rebar tonnage deltas across design milestones. Enables side-by-side version comparison and component-level change logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isCompareMode
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>{isCompareMode ? 'Exit Diff View' : 'Compare Versions (Diff)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Viewport Left + Version Timeline & Deltas Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 3D Interactive Viewport */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative flex flex-col min-h-[480px]">
          {/* Viewport Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Box className="w-4 h-4 text-indigo-400" />
                BIM 3D Mesh Engine
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Active Version: {activeVersion}
              </span>
            </div>

            {/* Viewport Render Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWireframeMode(!wireframeMode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  wireframeMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Wireframe
              </button>
              <button
                onClick={() => setExplodedView(!explodedView)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  explodedView
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Exploded View
              </button>
            </div>
          </div>

          {/* Simulated 3D CAD Stage Canvas */}
          <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950 relative overflow-hidden flex items-center justify-center min-h-[350px]">
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Simulated 3D Building Frame Wireframe / Solid Blocks */}
            <div className={`relative transition-all duration-300 ${explodedView ? 'scale-110 space-y-4' : 'scale-100 space-y-1'}`}>
              {/* Roof Slab */}
              <div
                onClick={() => setSelectedComponentId('S1-Slab')}
                className={`w-64 h-6 mx-auto rounded border-2 transition-all cursor-pointer flex items-center justify-center text-[10px] font-mono font-bold ${
                  selectedComponentId === 'S1-Slab'
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-lg'
                    : 'bg-indigo-900/40 border-indigo-600/60 text-indigo-300 hover:border-indigo-400'
                } ${wireframeMode ? 'bg-transparent border-dashed' : ''}`}
              >
                Roof Slab S1 (125mm RCC)
              </div>

              {/* Columns & Beams Frame Row */}
              <div className="flex justify-between w-72 gap-3 mx-auto">
                <div
                  onClick={() => setSelectedComponentId('C1-Col')}
                  className={`w-12 h-32 rounded border-2 transition-all cursor-pointer flex items-center justify-center text-[9px] font-mono font-bold text-center p-1 ${
                    selectedComponentId === 'C1-Col'
                      ? 'bg-blue-500/40 border-blue-400 text-white shadow-xl scale-105'
                      : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:border-slate-400'
                  } ${wireframeMode ? 'bg-transparent border-dashed' : ''}`}
                >
                  Col C1
                </div>

                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="h-4 bg-blue-600/30 border border-blue-500 rounded text-[9px] font-mono text-blue-300 flex items-center justify-center">
                    Beam GB1
                  </div>
                  <div className="text-[10px] text-center font-mono text-slate-400">
                    6-Story Staff Quarter Core
                  </div>
                  <div className="h-4 bg-blue-600/30 border border-blue-500 rounded text-[9px] font-mono text-blue-300 flex items-center justify-center">
                    Beam GB2
                  </div>
                </div>

                <div
                  onClick={() => setSelectedComponentId('C1-Col')}
                  className={`w-12 h-32 rounded border-2 transition-all cursor-pointer flex items-center justify-center text-[9px] font-mono font-bold text-center p-1 ${
                    selectedComponentId === 'C1-Col'
                      ? 'bg-blue-500/40 border-blue-400 text-white shadow-xl scale-105'
                      : 'bg-slate-800/80 border-slate-600 text-slate-300 hover:border-slate-400'
                  } ${wireframeMode ? 'bg-transparent border-dashed' : ''}`}
                >
                  Col C2
                </div>
              </div>

              {/* Footings Substructure */}
              <div
                onClick={() => setSelectedComponentId('F1-Footing')}
                className={`w-80 h-10 mx-auto rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center text-[10px] font-mono font-bold ${
                  selectedComponentId === 'F1-Footing'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                } ${wireframeMode ? 'bg-transparent border-dashed' : ''}`}
              >
                Substructure Footing F1 Mat (1.8m x 1.8m)
              </div>
            </div>

            {/* Selected Component Badge Card Floating */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 p-2.5 rounded-xl text-xs font-mono backdrop-blur-md">
              <div className="text-[10px] uppercase text-indigo-400 font-bold">Selected 3D Inspector Component</div>
              <div className="font-bold text-white">{selectedComponentId} Component</div>
            </div>
          </div>
        </div>

        {/* Right Version History & Diff Comparison Table */}
        <div className="lg:col-span-5 space-y-4">
          {/* Version Releases Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-400" />
              Revisions Timeline History
            </h4>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {bimRevisions.map((rev) => {
                const isActive = activeVersion === rev.version;
                return (
                  <div
                    key={rev.version}
                    onClick={() => setActiveVersion(rev.version)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {rev.version}
                        </span>
                        <span className="text-xs font-bold">{rev.releaseName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      "{rev.changesSummary}"
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Vol: {rev.concreteVolumeCum} Cum</span>
                      <span>Steel: {rev.steelWeightTon} Ton</span>
                      <span className="text-indigo-300 font-bold">{rev.author}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Component Diff Breakdown */}
          {isCompareMode && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-emerald-400" />
                  Component Delta Diff ({activeVersion} vs {compareVersion})
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  4 Components Delta
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {componentDeltas.map((delta) => (
                  <div key={delta.componentId} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{delta.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {delta.changeType}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Concrete: {delta.oldVolumeCum} → <strong className="text-emerald-400">{delta.newVolumeCum} Cum</strong></span>
                      <span>Steel: {delta.oldSteelTon} → <strong className="text-emerald-400">{delta.newSteelTon} Ton</strong></span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      {delta.remarks}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
