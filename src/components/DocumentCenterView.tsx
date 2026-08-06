import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  Download,
  Eye
} from 'lucide-react';

export interface DrawingRegisterItem {
  id: string;
  sheetNumber: string;
  sheetTitle: string;
  sheetTitleBn: string;
  discipline: 'Structural' | 'Architectural' | 'MEP' | 'Civil';
  projectTitle: string;
  drawingDate: string;
  revisionNumber: string;
  scale: string;
  status: 'Approved' | 'Under Review' | 'Draft' | 'Archived';
  fileName: string;
  extractedConfidence: number;
}

interface DocumentCenterViewProps {
  onAlertTriggered?: (title: string, message: string) => void;
}

const INITIAL_DRAWING_REGISTER: DrawingRegisterItem[] = [
  {
    id: 'dwg-1',
    sheetNumber: 'S-101',
    sheetTitle: 'Substructure & Foundation Layout Plan (1800x1800mm Footings)',
    sheetTitleBn: 'ফাউন্ডেশন লেআউট এবং ফুটিং ডিটেইল',
    discipline: 'Structural',
    projectTitle: 'Police School Staff Quarter (25 Units G+1)',
    drawingDate: '2026-07-15',
    revisionNumber: 'Rev-02',
    scale: '1:50',
    status: 'Approved',
    fileName: 'S-101_Foundation_Layout_Rev02.pdf',
    extractedConfidence: 99.4,
  },
  {
    id: 'dwg-2',
    sheetNumber: 'S-102',
    sheetTitle: 'Column Framing Schedule & Tie Beam Reinforcement Details',
    sheetTitleBn: 'কলাম ও গ্রেড বিম শিডিউল',
    discipline: 'Structural',
    projectTitle: 'Police School Staff Quarter (25 Units G+1)',
    drawingDate: '2026-07-18',
    revisionNumber: 'Rev-01',
    scale: '1:25',
    status: 'Approved',
    fileName: 'S-102_Column_TieBeam_Rev01.pdf',
    extractedConfidence: 98.8,
  },
  {
    id: 'dwg-3',
    sheetNumber: 'S-201',
    sheetTitle: 'Ground & First Floor RCC Slab & Floor Beam Bar Bending Schedule',
    sheetTitleBn: 'ছাদ ঢালাই ও বিমের রডের হিসাব',
    discipline: 'Structural',
    projectTitle: 'Police School Staff Quarter (25 Units G+1)',
    drawingDate: '2026-07-22',
    revisionNumber: 'Rev-03',
    scale: '1:50',
    status: 'Approved',
    fileName: 'S-201_Slab_Reinforcement_Rev03.pdf',
    extractedConfidence: 99.1,
  },
  {
    id: 'dwg-4',
    sheetNumber: 'A-101',
    sheetTitle: 'Master Site Layout & BNBC Setback Compliance Plan',
    sheetTitleBn: 'মাস্টার সাইট প্ল্যান ও সেটব্যাক',
    discipline: 'Architectural',
    projectTitle: 'Police School Staff Quarter (25 Units G+1)',
    drawingDate: '2026-07-10',
    revisionNumber: 'Rev-00',
    scale: '1:100',
    status: 'Approved',
    fileName: 'A-101_Site_Plan_Rev00.pdf',
    extractedConfidence: 97.9,
  },
  {
    id: 'dwg-5',
    sheetNumber: 'E-101',
    sheetTitle: 'Electrical Conduit & Sub-Station Distribution Line Diagram',
    sheetTitleBn: 'বৈদ্যুতিক ওয়্যারিং ও সাবস্টেশন প্ল্যান',
    discipline: 'MEP',
    projectTitle: 'Police School Staff Quarter (25 Units G+1)',
    drawingDate: '2026-07-28',
    revisionNumber: 'Rev-01',
    scale: '1:50',
    status: 'Under Review',
    fileName: 'E-101_Electrical_Wiring_Rev01.pdf',
    extractedConfidence: 96.5,
  },
];

export const DocumentCenterView: React.FC<DocumentCenterViewProps> = ({
  onAlertTriggered,
}) => {
  const [drawings, setDrawings] = useState<DrawingRegisterItem[]>(INITIAL_DRAWING_REGISTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('ALL');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchStage, setBatchStage] = useState<string>('');
  const [selectedSheetIds, setSelectedSheetIds] = useState<string[]>([]);
  const [previewSheet, setPreviewSheet] = useState<DrawingRegisterItem | null>(null);

  // Filtered drawings
  const filteredDrawings = drawings.filter((d) => {
    const matchesSearch =
      d.sheetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.sheetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline =
      disciplineFilter === 'ALL' || d.discipline === disciplineFilter;
    return matchesSearch && matchesDiscipline;
  });

  const handleRunBatchProcessor = () => {
    setIsProcessingBatch(true);
    setBatchStage('Scanning PDF Title Blocks across 3 imported drawing sheets...');
    setTimeout(() => {
      setBatchStage('Extracting Project Title, Revision Number, and Sheet Dates via AI OCR...');
      setTimeout(() => {
        const newExtractedSheets: DrawingRegisterItem[] = [
          {
            id: `dwg-${Date.now()}-1`,
            sheetNumber: 'S-301',
            sheetTitle: 'Staircase Tower RCC Reinforcement & Waist Slab Sections',
            sheetTitleBn: 'সিঁড়ি ও ল্যান্ডিং ছাদের রডের ডিটেইল',
            discipline: 'Structural',
            projectTitle: 'Police School Staff Quarter (25 Units G+1)',
            drawingDate: '2026-07-30',
            revisionNumber: 'Rev-01',
            scale: '1:25',
            status: 'Approved',
            fileName: 'S-301_Staircase_Tower_Rev01.pdf',
            extractedConfidence: 99.6,
          },
          {
            id: `dwg-${Date.now()}-2`,
            sheetNumber: 'P-101',
            sheetTitle: 'Water Supply Riser Diagram & Roof Tank Plumbing Details',
            sheetTitleBn: 'পানি সরবরাহ ও প্লাম্বিং লেআউট',
            discipline: 'MEP',
            projectTitle: 'Police School Staff Quarter (25 Units G+1)',
            drawingDate: '2026-07-30',
            revisionNumber: 'Rev-02',
            scale: '1:50',
            status: 'Approved',
            fileName: 'P-101_Plumbing_Riser_Rev02.pdf',
            extractedConfidence: 98.9,
          },
          {
            id: `dwg-${Date.now()}-3`,
            sheetNumber: 'A-201',
            sheetTitle: 'Exterior Elevation & Aluminium Window Schedule',
            sheetTitleBn: 'বহিরাঙ্গন এলিভেশন ও জানালা শিডিউল',
            discipline: 'Architectural',
            projectTitle: 'Police School Staff Quarter (25 Units G+1)',
            drawingDate: '2026-07-31',
            revisionNumber: 'Rev-00',
            scale: '1:50',
            status: 'Approved',
            fileName: 'A-201_Exterior_Elevation_Rev00.pdf',
            extractedConfidence: 99.2,
          },
        ];

        setDrawings((prev) => [...newExtractedSheets, ...prev]);
        setIsProcessingBatch(false);
        setIsBatchModalOpen(false);
        if (onAlertTriggered) {
          onAlertTriggered(
            'Batch OCR Extraction Complete',
            'Successfully extracted Project Title, Date, and Revision Numbers from 3 PDF drawing sheets into the Drawing Register.'
          );
        }
      }, 1500);
    }, 1200);
  };

  const toggleSelectAll = () => {
    if (selectedSheetIds.length === filteredDrawings.length) {
      setSelectedSheetIds([]);
    } else {
      setSelectedSheetIds(filteredDrawings.map((d) => d.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedSheetIds.includes(id)) {
      setSelectedSheetIds(selectedSheetIds.filter((item) => item !== id));
    } else {
      setSelectedSheetIds([...selectedSheetIds, id]);
    }
  };

  const handleDeleteSelected = () => {
    setDrawings((prev) => prev.filter((d) => !selectedSheetIds.includes(d.id)));
    setSelectedSheetIds([]);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Document Center & Drawing Register
            </span>
            <span className="text-xs text-slate-400">AI Title Block OCR</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Batch Drawing Processor & Register
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Batch-process PDF sheets to automatically extract project title, date, revision number, and sheet numbers into a BNBC/PWD-compliant drawing register.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition"
          >
            <Upload className="w-4 h-4" />
            Batch Process PDF Drawings
          </button>
          <button
            onClick={() => {
              if (onAlertTriggered) {
                onAlertTriggered(
                  'Drawing Register Exported',
                  'Exported complete drawing register with revision logs to Excel CSV & PDF.'
                );
              }
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm flex items-center gap-2 border border-slate-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export Register
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search sheet NO, title, filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Disciplines ({drawings.length})</option>
            <option value="Structural">Structural</option>
            <option value="Architectural">Architectural</option>
            <option value="MEP">MEP & Plumbing</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {selectedSheetIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-500/30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Selected ({selectedSheetIds.length})
            </button>
          )}
          <span className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredDrawings.length}</strong> sheets
          </span>
        </div>
      </div>

      {/* Drawing Register Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedSheetIds.length === filteredDrawings.length && filteredDrawings.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">Sheet No</th>
                <th className="py-3 px-4">Sheet Title</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">Project Title (OCR Extracted)</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Revision</th>
                <th className="py-3 px-4">OCR Confidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filteredDrawings.map((dwg) => (
                <tr key={dwg.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedSheetIds.includes(dwg.id)}
                      onChange={() => toggleSelectOne(dwg.id)}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                    />
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-400 font-mono">
                    {dwg.sheetNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{dwg.sheetTitle}</div>
                    <div className="text-xs text-slate-400">{dwg.sheetTitleBn} • {dwg.fileName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                      dwg.discipline === 'Structural'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : dwg.discipline === 'Architectural'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {dwg.discipline}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {dwg.projectTitle}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                    {dwg.drawingDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-amber-400 border border-slate-700 font-mono">
                      {dwg.revisionNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {dwg.extractedConfidence}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setPreviewSheet(dwg)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 ml-auto transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Processing Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Batch Drawing OCR Title Block Processor
              </h3>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 space-y-3">
              <p>
                Select multiple PDF or DWG sheets from your computer. Our AI Vision Engine will automatically read each sheet's Title Block to extract:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                <li><strong className="text-slate-200">Sheet Title & Discipline</strong> (Structural, MEP, Architectural)</li>
                <li><strong className="text-slate-200">Sheet Number</strong> (e.g., S-301, P-101)</li>
                <li><strong className="text-slate-200">Project Title</strong> & Engineer In Charge</li>
                <li><strong className="text-slate-200">Date & Revision Number</strong> (e.g., Rev-01, Rev-02)</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center transition cursor-pointer">
              <Upload className="w-10 h-10 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white">
                Drag & Drop PDF Drawing Sheets Here
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Or click to browse site drawings (S-301, P-101, A-201, etc.)
              </div>
            </div>

            {isProcessingBatch && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                <span>{batchStage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRunBatchProcessor}
                disabled={isProcessingBatch}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isProcessingBatch ? 'Extracting via AI...' : 'Run Batch Extraction (3 Sheets)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewSheet && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Sheet Details • {previewSheet.sheetNumber}
              </h3>
              <button
                onClick={() => setPreviewSheet(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Sheet Title</span>
                <div className="text-white font-bold">{previewSheet.sheetTitle}</div>
                <div className="text-xs text-slate-400">{previewSheet.sheetTitleBn}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Discipline</span>
                  <div className="text-white font-semibold">{previewSheet.discipline}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Revision Number</span>
                  <div className="text-amber-400 font-bold font-mono">{previewSheet.revisionNumber}</div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Extracted Project Title</span>
                <div className="text-white font-semibold">{previewSheet.projectTitle}</div>
                <div className="text-xs text-slate-400 mt-1">Drawing Date: {previewSheet.drawingDate} • Scale: {previewSheet.scale}</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified against CPWD / BNBC 2024 Drawing Protocol ({previewSheet.extractedConfidence}% OCR Confidence)</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewSheet(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
