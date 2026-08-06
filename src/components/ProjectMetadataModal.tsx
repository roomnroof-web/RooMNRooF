import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  ShieldCheck,
  FileCheck,
  User,
  Save,
  CheckCircle2,
  FileDown,
  Briefcase,
  Hash
} from 'lucide-react';

export interface ProjectMetadata {
  projectName: string;
  projectNo: string;
  department: string;
  owner: string;
  siteLocation: string;
  contractorId: string;
  contractRefNo: string;
  engineerInCharge: string;
  chiefEngineer: string;
  preparedBy: string;
}

interface ProjectMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProjectMetadata;
  onSaveMetadata: (updated: ProjectMetadata) => void;
  onExportPdfWithMetadata?: () => void;
}

export const ProjectMetadataModal: React.FC<ProjectMetadataModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onSaveMetadata,
  onExportPdfWithMetadata,
}) => {
  const [formData, setFormData] = useState<ProjectMetadata>(metadata);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProjectMetadata, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMetadata(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Edit Formal Project Submission Metadata</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                  PDF Embedded
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure official Owner, Site Location, and Contractor details embedded into BOQ PDF export reports.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-3 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Project metadata updated successfully! Embedded into official PDF headers.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner / Authority */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                Project Owner / Authority
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => handleChange('owner', e.target.value)}
                placeholder="e.g. Ministry of Home Affairs / Police Housing"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            {/* Contractor ID / License */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Contractor ID / License No.
              </label>
              <input
                type="text"
                value={formData.contractorId}
                onChange={(e) => handleChange('contractorId', e.target.value)}
                placeholder="e.g. CON-PWD-2024-88492 (Grade A)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono font-medium"
                required
              />
            </div>

            {/* Site Location */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Site Location & Plot Address
              </label>
              <input
                type="text"
                value={formData.siteLocation}
                onChange={(e) => handleChange('siteLocation', e.target.value)}
                placeholder="e.g. Plot 42, Police Line Road, Mirpur-14, Dhaka-1216, Bangladesh"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            {/* Contract Ref No */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                Tender / Contract Ref No.
              </label>
              <input
                type="text"
                value={formData.contractRefNo}
                onChange={(e) => handleChange('contractRefNo', e.target.value)}
                placeholder="e.g. TENDER-2026/CPWD/BNBC-004"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>

            {/* Department Name */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                Executing Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g. CENTRAL PUBLIC WORKS DEPARTMENT (CPWD)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Engineer-in-Charge */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Engineer-in-Charge
              </label>
              <input
                type="text"
                value={formData.engineerInCharge}
                onChange={(e) => handleChange('engineerInCharge', e.target.value)}
                placeholder="e.g. Er. AMRUT AMARSHETTY"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Chief Engineer */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                Chief Sanctioning Engineer
              </label>
              <input
                type="text"
                value={formData.chiefEngineer}
                onChange={(e) => handleChange('chiefEngineer', e.target.value)}
                placeholder="e.g. Er. Gaurav Singh Rathore"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* PDF Preview Notice */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="text-slate-300">
                <strong className="text-white block font-semibold">Automatic PDF Embedding</strong>
                <span>These fields will be rendered on Page 1 & Signature Block of all exported BOQ PDFs.</span>
              </div>
            </div>
            {onExportPdfWithMetadata && (
              <button
                type="button"
                onClick={onExportPdfWithMetadata}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-400" />
                <span>Test PDF Export</span>
              </button>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Embed Metadata</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
