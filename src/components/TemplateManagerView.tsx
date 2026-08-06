/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ProjectTemplate,
  TakeoffRow,
  UnitSystem,
  CurrencyCode
} from '../types/estimation';
import { INITIAL_PROJECT_TEMPLATES } from '../data/projectTemplates';
import { formatCurrency, getUnitDisplay } from '../utils/estimationCalculators';
import {
  BookmarkCheck,
  Plus,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Trash2,
  Download,
  Share2,
  Search,
  Sparkles,
  Info
} from 'lucide-react';

interface TemplateManagerViewProps {
  currentTakeoffRows: TakeoffRow[];
  currentTotalUnits: number;
  unitSystem: UnitSystem;
  currency: CurrencyCode;
  onLoadTemplate: (template: ProjectTemplate) => void;
  onSaveAsTemplate?: (name: string, buildingType: string, description: string) => void;
}

export const TemplateManagerView: React.FC<TemplateManagerViewProps> = ({
  currentTakeoffRows,
  currentTotalUnits,
  unitSystem,
  currency,
  onLoadTemplate,
  onSaveAsTemplate,
}) => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>(INITIAL_PROJECT_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplType, setNewTmplType] = useState('Residential Government Quarter');
  const [newTmplDesc, setNewTmplDesc] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ProjectTemplate | null>(
    INITIAL_PROJECT_TEMPLATES[0]
  );

  const buildingTypes = [
    'All',
    'Residential Government Quarter (G+1)',
    'Educational Institute (G+3)',
    'Healthcare & Medical Facility',
    'Government Secretariat / Office Building',
    'Custom Presets',
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buildingType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === 'All'
        ? true
        : selectedType === 'Custom Presets'
        ? t.isCustom
        : t.buildingType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplName.trim()) return;

    const newTemplate: ProjectTemplate = {
      id: `tmpl-custom-${Date.now()}`,
      name: newTmplName.trim(),
      buildingType: newTmplType,
      description:
        newTmplDesc.trim() ||
        `Custom saved template with ${currentTakeoffRows.length} PWD Bangladesh BOQ items.`,
      totalUnits: currentTotalUnits,
      defaultElectrificationPercent: 5.0,
      defaultContingencyPercent: 3.0,
      takeoffRows: [...currentTakeoffRows],
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setPreviewTemplate(newTemplate);
    setShowSaveModal(false);
    setNewTmplName('');
    setNewTmplDesc('');

    if (onSaveAsTemplate) {
      onSaveAsTemplate(newTemplate.name, newTemplate.buildingType, newTemplate.description);
    }
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (previewTemplate?.id === id) {
      setPreviewTemplate(templates[0] || null);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] select-none">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              Standardized Bangladesh Presets
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              CPWD / PWD 2024 Schedule
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-blue-400" />
            <span>BOQ Building Templates & Re-usable Takeoff Structures</span>
          </h2>
          <p className="text-xs text-slate-400">
            Quickly load pre-set takeoff structures for standard building types or save your current BOQ as a re-usable template.
          </p>
        </div>

        <button
          onClick={() => setShowSaveModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Save Current BOQ as Template</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          {buildingTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Content Grid: Template List (Left 7 cols) & Live Preview (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredTemplates.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No matching templates found</p>
              <p className="text-xs text-slate-500">Try a different search or filter category.</p>
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const isSelected = previewTemplate?.id === template.id;
              const totalAmount = template.takeoffRows.reduce(
                (sum, r) => sum + (r.amountBDT || 0),
                0
              );

              return (
                <div
                  key={template.id}
                  onClick={() => setPreviewTemplate(template)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                    isSelected
                      ? 'bg-blue-950/30 border-blue-500/80 shadow-md shadow-blue-900/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {template.buildingType}
                      </span>
                      {template.isCustom && (
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Custom
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{template.name}</span>
                    </h3>
                    {template.nameBn && (
                      <p className="text-[11px] text-slate-400 font-normal">
                        {template.nameBn}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                      <span>
                        <strong className="text-slate-200">{template.takeoffRows.length}</strong> BOQ Items
                      </span>
                      <span>
                        <strong className="text-slate-200">{template.totalUnits}</strong> Units
                      </span>
                      <span>
                        Created: <strong className="text-slate-300">{template.createdAt}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3 self-stretch">
                    <p className="font-mono font-extrabold text-white text-sm">
                      {formatCurrency(totalAmount, currency)}
                    </p>

                    <div className="flex items-center gap-2">
                      {template.isCustom && (
                        <button
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Custom Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadTemplate(template);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Load BOQ</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Template Preview Panel */}
        <div className="lg:col-span-5">
          {previewTemplate ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400">
                    Template BOQ Preview
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {previewTemplate.name}
                  </h3>
                </div>
                <button
                  onClick={() => onLoadTemplate(previewTemplate)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Load Into Active Project</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-slate-300">{previewTemplate.description}</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-400 text-[10px]">Total Takeoff Items</p>
                    <p className="text-base font-bold font-mono text-white mt-0.5">
                      {previewTemplate.takeoffRows.length} rows
                    </p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-slate-400 text-[10px]">Default Electrification</p>
                    <p className="text-base font-bold font-mono text-blue-400 mt-0.5">
                      {previewTemplate.defaultElectrificationPercent}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Takeoff Rows Preview Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Included PWD Takeoff Categories
                </span>
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                  {previewTemplate.takeoffRows.map((row) => (
                    <div
                      key={row.id}
                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="text-[10px] font-mono text-blue-400 bg-slate-800 px-1 py-0.5 rounded mr-1.5">
                          {row.pwdCode}
                        </span>
                        <span className="text-slate-200 font-medium truncate">
                          {row.itemDescription}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-white font-bold">
                          {row.quantity.toFixed(1)}{' '}
                          {getUnitDisplay(row.unit, unitSystem)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">Select a template on the left to preview BOQ items</p>
            </div>
          )}
        </div>
      </div>

      {/* SAVE NEW TEMPLATE MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Save Current BOQ as Re-usable Template
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Story Multipurpose Hall (PWD 2024)"
                  value={newTmplName}
                  onChange={(e) => setNewTmplName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Building Type / Classification
                </label>
                <select
                  value={newTmplType}
                  onChange={(e) => setNewTmplType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="Residential Government Quarter (G+1)">
                    Residential Government Quarter (G+1)
                  </option>
                  <option value="Educational Institute (G+3)">
                    Educational Institute (G+3)
                  </option>
                  <option value="Healthcare & Medical Facility">
                    Healthcare & Medical Facility
                  </option>
                  <option value="Government Secretariat / Office Building">
                    Government Secretariat / Office Building
                  </option>
                  <option value="Custom Infrastructure Project">
                    Custom Infrastructure Project
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe key structural features, foundation type, or floor count..."
                  value={newTmplDesc}
                  onChange={(e) => setNewTmplDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
                <span>Included BOQ Takeoff Items:</span>
                <span className="font-mono font-bold text-white">
                  {currentTakeoffRows.length} items
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md shadow-blue-900/30"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
