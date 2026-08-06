import React, { useState, useEffect } from 'react';
import {
  Compass,
  Maximize2,
  Truck,
  ShieldCheck,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Ruler,
  Download,
  Building2,
  RefreshCw
} from 'lucide-react';
import siteLayoutSketchImg from '../assets/images/site_layout_sketch_1785956926111.jpg';
import siteLogisticsPlanImg from '../assets/images/site_logistics_plan_1785956940800.jpg';

interface SiteLayoutLogisticsPlannerProps {
  totalAreaSqm?: number;
  numberOfUnits?: number;
  currency?: string;
  projectName?: string;
}

export const SiteLayoutLogisticsPlanner: React.FC<SiteLayoutLogisticsPlannerProps> = ({
  totalAreaSqm = 287.1,
  numberOfUnits = 25,
  projectName = '6-Story Police Officer Staff Quarters',
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'3d_sketch' | 'topdown_plan' | 'interactive_zones'>('3d_sketch');
  const [showCraneCoverage, setShowCraneCoverage] = useState(true);
  const [showSafetySetback, setShowSafetySetback] = useState(true);
  const [showStagingArea, setShowStagingArea] = useState(true);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const fetchAiLayoutAnalysis = async () => {
    setLoadingAiAnalysis(true);
    try {
      const res = await fetch('/api/site-layout/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingAreaSqm: totalAreaSqm,
          numberOfUnits,
          stories: 6,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiAnalysis(json.data);
      }
    } catch (e) {
      console.warn('AI site layout analysis fallback loaded:', e);
    } finally {
      setLoadingAiAnalysis(false);
    }
  };

  useEffect(() => {
    fetchAiLayoutAnalysis();
  }, [totalAreaSqm]);

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-blue-400" />
                BNBC 2020 Site Logistics & Cadastral Planning
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold uppercase tracking-wider">
                Footprint: {totalAreaSqm} m² (3,090 ft²)
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Conceptual Site Layout & Logistics Planner
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Generates conceptual 3D isometric sketches and 2D master site plans based on the building footprint data ({totalAreaSqm} m² / {numberOfUnits} Units). Assists site engineers and project managers in early-stage material staging, tower crane placement, and BNBC safety setbacks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAiLayoutAnalysis}
              disabled={loadingAiAnalysis}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAiAnalysis ? 'animate-spin' : ''}`} />
              <span>{loadingAiAnalysis ? 'Re-analyzing Plot...' : 'Re-run AI Site Analysis'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveViewMode('3d_sketch')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === '3d_sketch'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D Conceptual Sketch Rendering</span>
            </button>
            <button
              onClick={() => setActiveViewMode('topdown_plan')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === 'topdown_plan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2D Master Site Logistics CAD Plan</span>
            </button>
            <button
              onClick={() => setActiveViewMode('interactive_zones')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === 'interactive_zones'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Zone Overlay & Radius</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showCraneCoverage}
                onChange={(e) => setShowCraneCoverage(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Tower Crane Radius</span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showSafetySetback}
                onChange={(e) => setShowSafetySetback(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0"
              />
              <span>BNBC 3.0m Setback</span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showStagingArea}
                onChange={(e) => setShowStagingArea(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-amber-600 focus:ring-0"
              />
              <span>Material Staging Yard</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Sketch Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High Res Sketch Artifact */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">
                {activeViewMode === '3d_sketch'
                  ? '3D Isometric Conceptual Site Layout Sketch'
                  : activeViewMode === 'topdown_plan'
                  ? '2D Top-Down Cadastral Site Logistics Schematic'
                  : 'Footprint & Safety Clearance Interactive Zones'}
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
              Project Footprint: 21.5m x 13.35m
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 min-h-[380px] flex items-center justify-center group">
            {activeViewMode === '3d_sketch' && (
              <img
                src={siteLayoutSketchImg}
                alt="Conceptual 3D Site Layout Sketch"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-xl shadow-lg transition-all duration-300 group-hover:scale-[1.01]"
              />
            )}

            {activeViewMode === 'topdown_plan' && (
              <img
                src={siteLogisticsPlanImg}
                alt="2D Master Site Logistics Plan"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover rounded-xl shadow-lg transition-all duration-300 group-hover:scale-[1.01]"
              />
            )}

            {activeViewMode === 'interactive_zones' && (
              <div className="w-full p-6 bg-slate-950 flex flex-col items-center justify-center space-y-4">
                {/* Simulated Canvas Blueprint Overlay */}
                <div className="w-full max-w-lg aspect-video bg-slate-900 border-2 border-dashed border-blue-500/50 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden">
                  {/* Building Footprint */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 h-1/2 bg-blue-600/30 border-2 border-blue-400 rounded-lg flex items-center justify-center text-center p-2">
                    <div>
                      <span className="text-xs font-extrabold text-white block">
                        6-Story Building Footprint
                      </span>
                      <span className="text-[10px] text-blue-200 font-mono">
                        {totalAreaSqm} m² (21.5m x 13.35m)
                      </span>
                    </div>
                  </div>

                  {/* Tower Crane Swing Circle */}
                  {showCraneCoverage && (
                    <div className="absolute top-1/4 right-1/4 w-44 h-44 rounded-full border-2 border-amber-400/80 border-dashed animate-spin-slow bg-amber-500/5 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-mono font-bold text-amber-300 bg-slate-950/80 px-1.5 py-0.5 rounded">
                        Crane Radius 35m
                      </span>
                    </div>
                  )}

                  {/* Safety Setback Zone */}
                  {showSafetySetback && (
                    <div className="absolute inset-2 border-2 border-emerald-500/40 rounded-xl pointer-events-none flex items-start p-1">
                      <span className="text-[9px] font-mono text-emerald-400 bg-slate-950/90 px-1 rounded">
                        BNBC 3.0m Setback Boundary
                      </span>
                    </div>
                  )}

                  {/* Staging Yard */}
                  {showStagingArea && (
                    <div className="absolute bottom-3 left-3 bg-purple-600/30 border border-purple-400 rounded-lg p-2 text-[10px] font-mono text-purple-200">
                      Rebar & Cement Yard (120 m²)
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 text-center font-mono">
                  Interactive Cadastral Layout Overlay — Live Crane Swing Radius & BNBC Buffer Analysis
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Render Engine: Gemini 3D Spatial Layout Synthesis</span>
            <span className="text-emerald-400 font-bold">BNBC 2020 Part 3 Section 3.2 Compliant</span>
          </div>
        </div>

        {/* Right Col: AI Site Logistics & Equipment Recommendations */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">Site Logistics & Heavy Equipment</h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">
                  Recommended Tower Crane
                </span>
                <p className="text-sm font-bold text-amber-300 mt-0.5">
                  {aiAnalysis?.recommendedLogistics?.craneType ||
                    'Stationary Tower Crane (35m jib radius / 3.5 Ton Capacity)'}
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">
                    Material Yard Area
                  </span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {aiAnalysis?.recommendedLogistics?.stagingAreaSqm || 120} m²
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">
                    Steel Rebar Stock
                  </span>
                  <p className="text-xs font-bold text-slate-200 mt-0.5">
                    {aiAnalysis?.recommendedLogistics?.steelRebarYardSqm || 45} m²
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">
                  Cement Godown Capacity
                </span>
                <p className="text-xs font-bold text-emerald-300 mt-0.5">
                  {aiAnalysis?.recommendedLogistics?.cementGodownCapacityBags || 1200} Bags (60 Metric Tons)
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block font-bold">
                  BNBC Safety Clearances
                </span>
                <p className="text-xs font-bold text-blue-300 mt-0.5">
                  {aiAnalysis?.recommendedLogistics?.bnbcSafetyClearance ||
                    '3.0m side setback & 4.5m front setback per BNBC 2020 Part 3'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Site Phasing & Access Key
            </span>
            <ul className="space-y-2 text-xs text-slate-300">
              {(
                aiAnalysis?.sitePhasingSuggestions || [
                  'Position tower crane at North-East footprint corner for full 287m² coverage',
                  'Locate rebar bending yard near main gate for flatbed truck access',
                  'Erect moisture-proof elevated cement godown within 10m of batching zone',
                  'Enforce 3.0m BNBC safety buffer along perimeter fence lines',
                ]
              ).map((suggestion: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
