import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileDown,
  MapPin,
  Square,
  Ruler,
  AlertTriangle,
  Plus,
  Trash2,
  Tag
} from 'lucide-react';
import { ArchitecturalPlanElement, TakeoffRow, UnitSystem, CurrencyCode } from '../types/estimation';
import { POLICE_SCHOOL_QUARTER_PROJECT } from '../data/policeSchoolQuarterProject';
import { AutomatedDraftReview } from './AutomatedDraftReview';

export interface BlueprintAnnotation {
  id: string;
  xPct: number;
  yPct: number;
  type: 'pin' | 'area' | 'measure' | 'defect';
  label: string;
  category: string;
  estQuantity: string;
  autoDetected: boolean;
}

interface BlueprintAiViewProps {
  planElements: ArchitecturalPlanElement[];
  onSyncTakeoffFromPlan: (newRows: TakeoffRow[]) => void;
  unitSystem: UnitSystem;
  currency: CurrencyCode;
}

export const BlueprintAiView: React.FC<BlueprintAiViewProps> = ({
  planElements,
  onSyncTakeoffFromPlan,
  unitSystem,
  currency,
}) => {
  const [selectedFileName, setSelectedFileName] = useState('Police_School_Staff_Quarter_2BHK_Rev2.pdf');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(true);
  const [activePlanElementId, setActivePlanElementId] = useState<string | null>(planElements[0]?.id || null);

  // Annotation Overlay State
  const [activeTool, setActiveTool] = useState<'pin' | 'area' | 'measure' | 'defect'>('pin');
  const [annotations, setAnnotations] = useState<BlueprintAnnotation[]>([
    {
      id: 'ann-1',
      xPct: 28,
      yPct: 32,
      type: 'pin',
      label: 'Grid B2 Column C1 Marker',
      category: 'RCC Column Work',
      estQuantity: '0.85 Cum (20 Nos Total)',
      autoDetected: true,
    },
    {
      id: 'ann-2',
      xPct: 62,
      yPct: 68,
      type: 'area',
      label: 'Footing F1 Excavation Boundary',
      category: 'Substructure Earthwork',
      estQuantity: '21.0 Cum',
      autoDetected: true,
    },
    {
      id: 'ann-3',
      xPct: 45,
      yPct: 48,
      type: 'measure',
      label: 'Grade Beam GB1 Span 4.2m',
      category: 'Reinforced Concrete',
      estQuantity: '9.81 Cum',
      autoDetected: true,
    },
  ]);

  // Click on canvas to drop annotation
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newId = `ann-${Date.now()}`;
    let label = 'Custom Blueprint Marker';
    let category = 'Structural Component';
    let estQuantity = '1.0 Unit';

    if (activeTool === 'pin') {
      label = `Column / Pier Marker (${x.toFixed(0)}%, ${y.toFixed(0)}%)`;
      category = 'RCC Column / Beam';
      estQuantity = '0.92 Cum Concrete';
    } else if (activeTool === 'area') {
      label = `Slab / Floor Area (${(x * y / 10).toFixed(1)} m²)`;
      category = 'Floor Slab / Brickwork';
      estQuantity = `${(x * y / 10).toFixed(1)} Sqm`;
    } else if (activeTool === 'measure') {
      label = `Linear Wall / Trench Measure (${(x / 5).toFixed(1)}m)`;
      category = 'Masonry / Trench Line';
      estQuantity = `${(x / 5).toFixed(1)} Meter`;
    } else if (activeTool === 'defect') {
      label = `Rebar Spacing Callout Flag`;
      category = 'QC / Inspection Defect';
      estQuantity = 'BNBC Sec 5.3 Rebar Check';
    }

    const newAnnotation: BlueprintAnnotation = {
      id: newId,
      xPct: parseFloat(x.toFixed(1)),
      yPct: parseFloat(y.toFixed(1)),
      type: activeTool,
      label,
      category,
      estQuantity,
      autoDetected: true,
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  const handleRemoveAnnotation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  // Handle file drop or selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setIsAnalyzing(true);
      setAnalysisCompleted(false);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisCompleted(true);
      }, 1500);
    }
  };

  const handleSyncToTakeoff = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      onSyncTakeoffFromPlan(POLICE_SCHOOL_QUARTER_PROJECT.takeoffRows);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Controls Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              AI Vision & OCR Analyzer
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              BNBC 2020 Auto-Calibrated
            </span>
          </div>
          <h2 className="text-base font-bold text-white">
            Architectural PDF Blueprint to BOQ Takeoff Estimator
          </h2>
          <p className="text-xs text-slate-400">
            Upload floor plan PDF drawings to extract structural dimensions, footings, columns, beams, and schedule of openings automatically.
          </p>
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all">
          <Upload className="w-4 h-4" />
          <span>Upload PDF Blueprint</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Main Grid: Blueprint Canvas Left + Extracted Elements Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left PDF Canvas Mockup matching Professional Polish design HTML */}
        <section className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Interactive Blueprint & Annotation Overlay
              </span>
              <span className="text-[11px] font-mono text-blue-400">{selectedFileName}</span>
            </div>

            {/* Digital Annotation Marker Tools Bar */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTool('pin')}
                className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTool === 'pin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Place Pin Marker for Columns / Footings"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Pin</span>
              </button>
              <button
                onClick={() => setActiveTool('area')}
                className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTool === 'area'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bounding Box for Rooms / Slabs"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Area</span>
              </button>
              <button
                onClick={() => setActiveTool('measure')}
                className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTool === 'measure'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Linear Measure Line for Walls / Beams"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Measure</span>
              </button>
              <button
                onClick={() => setActiveTool('defect')}
                className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTool === 'defect'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="QC Defect / Rebar Callout Flag"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag</span>
              </button>
            </div>
          </div>

          <div
            onClick={handleCanvasClick}
            className="flex-1 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center relative overflow-hidden bg-slate-900/50 cursor-crosshair min-h-[380px]"
          >
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #64748B 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Placed Interactive Annotations Render Overlay */}
            {annotations.map((ann) => (
              <div
                key={ann.id}
                style={{ left: `${ann.xPct}%`, top: `${ann.yPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
              >
                <div className={`p-1.5 rounded-full shadow-lg border flex items-center justify-center cursor-pointer transition-all hover:scale-125 ${
                  ann.type === 'pin'
                    ? 'bg-blue-600 border-blue-300 text-white'
                    : ann.type === 'area'
                    ? 'bg-emerald-600 border-emerald-300 text-white'
                    : ann.type === 'measure'
                    ? 'bg-amber-600 border-amber-300 text-white'
                    : 'bg-rose-600 border-rose-300 text-white'
                }`}>
                  {ann.type === 'pin' ? (
                    <MapPin className="w-3.5 h-3.5" />
                  ) : ann.type === 'area' ? (
                    <Square className="w-3.5 h-3.5" />
                  ) : ann.type === 'measure' ? (
                    <Ruler className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Tooltip Hover Badge */}
                <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 hidden group-hover:flex flex-col bg-slate-950 text-white text-[10px] p-2 rounded-lg border border-slate-700 whitespace-nowrap shadow-2xl z-30 pointer-events-auto">
                  <div className="font-bold flex items-center justify-between gap-2">
                    <span>{ann.label}</span>
                    <button
                      onClick={(e) => handleRemoveAnnotation(ann.id, e)}
                      className="text-rose-400 hover:text-rose-200 p-0.5 rounded cursor-pointer"
                      title="Remove Annotation"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-slate-400 font-mono mt-0.5">{ann.category} • {ann.estQuantity}</div>
                </div>
              </div>
            ))}

            {isAnalyzing ? (
              <div className="text-center z-10 space-y-3">
                <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
                <p className="text-sm font-bold text-white">Extracting Structural Grids & Quantities...</p>
                <p className="text-xs text-slate-400">Applying BNBC 2020 reinforcement & opening deduction rules</p>
              </div>
            ) : (
              <div className="text-center z-10 p-6">
                <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                  <FileText className="w-7 h-7 text-blue-400" />
                </div>
                <p className="text-sm font-bold text-white">{selectedFileName}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Plot: 17.8m × 12.5m (287.10 m²) • 2BHK Staff Quarter • 25 Units Total
                </p>
                <p className="text-[10px] font-mono text-emerald-400 mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Auto-Scale: 1:100 | E2E Encrypted PDF Storage
                </p>

                {/* Simulated AI Overlays matching Professional Polish HTML */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
                    AREA_IDENT_01 [287.1 sqm]
                  </span>
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    FOOTING_F1_F2 [21.0 cum]
                  </span>
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono">
                    COL_GRID_M25 [20 nos C1]
                  </span>
                  <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono">
                    BEAM_GRID_GB1 [9.81 cum]
                  </span>
                </div>
              </div>
            )}

            {/* AI Overlay Box Indicator matching design */}
            <div className="absolute top-1/4 left-1/4 w-36 h-24 border border-blue-500/60 bg-blue-500/10 rounded-lg flex items-start p-1.5 pointer-events-none">
              <span className="text-[9px] text-blue-300 font-mono bg-slate-900/80 px-1 rounded">
                COL_C1_GRID
              </span>
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-24 border border-emerald-500/60 bg-emerald-500/10 rounded-lg flex items-start p-1.5 pointer-events-none">
              <span className="text-[9px] text-emerald-300 font-mono bg-slate-900/80 px-1 rounded">
                FOOTING_F1_1800x1800
              </span>
            </div>
          </div>
        </section>

        {/* Right Extracted Architectural Elements List */}
        <section className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Extracted Building Elements
                </h3>
                <p className="text-xs text-slate-400">
                  Detected from Police School Staff Quarter drawings
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                10 Structural Types
              </span>
            </div>

            {/* Elements Cards */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {planElements.map((el) => {
                const isSelected = activePlanElementId === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => setActivePlanElementId(el.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/60 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-400">
                          {el.code}
                        </span>
                        <span className="text-xs font-bold">{el.name}</span>
                      </div>
                      <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-white font-bold">
                        {el.count} nos
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Size: {el.dimensionsMetric.length}m × {el.dimensionsMetric.width}m × {el.dimensionsMetric.height}m
                      </span>
                      <span className="font-mono text-blue-300 truncate max-w-[150px]">
                        {el.remarks}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sync Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleSyncToTakeoff}
              disabled={isAnalyzing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>
                {isAnalyzing ? 'Synchronizing Takeoff Sheet...' : 'Generate / Sync Quantity Takeoff BOQ Sheet'}
              </span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Updates all 35+ items with PWD Bangladesh 2024 rates & BNBC deduction formulas
            </p>
          </div>
        </section>
      </div>

      {/* Automated Draft Review & CAD Scanner */}
      <AutomatedDraftReview fileName={selectedFileName} />
    </div>
  );
};
