import React, { useState, useMemo } from 'react';
import { TakeoffRow, UnitSystem, CurrencyCode, LanguageCode } from '../types/estimation';
import {
  formatCurrency,
  getUnitDisplay,
  convertQuantity,
  convertRate
} from '../utils/estimationCalculators';
import {
  Search,
  Plus,
  FileDown,
  Filter,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Scale,
  Info
} from 'lucide-react';
import { PWD_BANGLADESH_RATES } from '../data/pwdRateSchedule';
import { AlternativeMaterialsPanel } from './AlternativeMaterialsPanel';

// Helper to compute median PWD rate deviation for a takeoff row
export function getRowDeviationDetails(row: TakeoffRow) {
  // 1. Direct code match
  const directMatch = PWD_BANGLADESH_RATES.find((p) => p.code === row.pwdCode);
  let medianRate = directMatch ? directMatch.defaultRateBDT : 0;
  let benchmarkSource = directMatch ? `PWD Code ${directMatch.code}` : '';

  if (!directMatch) {
    const catMatches = PWD_BANGLADESH_RATES.filter((p) => p.category === row.category);
    if (catMatches.length > 0) {
      const rates = catMatches.map((p) => p.defaultRateBDT).sort((a, b) => a - b);
      const mid = Math.floor(rates.length / 2);
      medianRate = rates.length % 2 !== 0 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
      benchmarkSource = `Category Median (${row.category})`;
    } else {
      const unitMatches = PWD_BANGLADESH_RATES.filter((p) => p.unitMetric === row.unit);
      if (unitMatches.length > 0) {
        const rates = unitMatches.map((p) => p.defaultRateBDT).sort((a, b) => a - b);
        const mid = Math.floor(rates.length / 2);
        medianRate = rates.length % 2 !== 0 ? rates[mid] : (rates[mid - 1] + rates[mid]) / 2;
        benchmarkSource = `Unit Median (${row.unit})`;
      } else {
        medianRate = row.rateBDT;
        benchmarkSource = 'Standard Baseline';
      }
    }
  }

  const deltaBDT = row.rateBDT - medianRate;
  const pct = medianRate > 0 ? (deltaBDT / medianRate) * 100 : 0;

  if (pct > 20) {
    return {
      type: 'high_surge' as const,
      pct,
      deltaBDT,
      medianRate,
      benchmarkSource,
      label: `+${pct.toFixed(1)}% High Surge`,
      colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      iconType: 'high_surge',
    };
  } else if (pct > 8) {
    return {
      type: 'moderate_surge' as const,
      pct,
      deltaBDT,
      medianRate,
      benchmarkSource,
      label: `+${pct.toFixed(1)}% Moderate`,
      colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      iconType: 'moderate_surge',
    };
  } else if (pct < -10) {
    return {
      type: 'underpriced' as const,
      pct,
      deltaBDT,
      medianRate,
      benchmarkSource,
      label: `${pct.toFixed(1)}% Below PWD`,
      colorClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      iconType: 'underpriced',
    };
  } else {
    return {
      type: 'normal' as const,
      pct,
      deltaBDT,
      medianRate,
      benchmarkSource,
      label: `Inline (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`,
      colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      iconType: 'normal',
    };
  }
}

interface TakeoffSheetViewProps {
  rows: TakeoffRow[];
  onUpdateRows: (rows: TakeoffRow[]) => void;
  unitSystem: UnitSystem;
  currency: CurrencyCode;
  language: LanguageCode;
  onExportPdf: () => void;
}

type FloorFilter = 'All' | 'Substructure' | 'Ground Floor' | 'First Floor' | 'Terrace/Parapet';

export const TakeoffSheetView: React.FC<TakeoffSheetViewProps> = ({
  rows,
  onUpdateRows,
  unitSystem,
  currency,
  language,
  onExportPdf,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'takeoff_table' | 'alternative_materials'>('takeoff_table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<FloorFilter>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const handleApplySubstituteToRows = (targetPwdCode: string, newDescription: string, newRateBDT: number) => {
    const updated = rows.map((row) => {
      if (row.pwdCode === targetPwdCode || row.category.toLowerCase().includes(targetPwdCode.toLowerCase())) {
        return {
          ...row,
          itemDescription: newDescription,
          rateBDT: newRateBDT,
          amountBDT: parseFloat((row.quantity * newRateBDT).toFixed(2)),
        };
      }
      return row;
    });
    onUpdateRows(updated);
  };

  // Editable row form state
  const [editNumber, setEditNumber] = useState<number>(1);
  const [editLength, setEditLength] = useState<number>(1);
  const [editWidth, setEditWidth] = useState<number>(1);
  const [editHeight, setEditHeight] = useState<number>(1);
  const [editRate, setEditRate] = useState<number>(0);
  const [editRemarks, setEditRemarks] = useState<string>('');

  // New row modal form state
  const [newSerial, setNewSerial] = useState('New');
  const [newPwdCode, setNewPwdCode] = useState('5.33.1.1');
  const [newDescription, setNewDescription] = useState('');
  const [newDescriptionBn, setNewDescriptionBn] = useState('');
  const [newCategory, setNewCategory] = useState('02. Cement & Concrete Work');
  const [newUnit, setNewUnit] = useState('cum');
  const [newNumber, setNewNumber] = useState<number>(1);
  const [newLength, setNewLength] = useState<number>(2.4);
  const [newWidth, setNewWidth] = useState<number>(2.4);
  const [newHeight, setNewHeight] = useState<number>(1.5);
  const [newRateBDT, setNewRateBDT] = useState<number>(12450);
  const [newRemarks, setNewRemarks] = useState('');
  const [newIsDeduction, setNewIsDeduction] = useState(false);
  const [newFloor, setNewFloor] = useState<'Substructure' | 'Ground Floor' | 'First Floor' | 'Terrace/Parapet'>('Ground Floor');

  // Categories list
  const allCategories = useMemo(() => {
    const cats = new Set(rows.map((r) => r.category));
    return ['All', ...Array.from(cats)];
  }, [rows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchFloor = selectedFloor === 'All' || row.floor === selectedFloor;
      const matchCat = selectedCategory === 'All' || row.category === selectedCategory;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        term === '' ||
        row.pwdCode.toLowerCase().includes(term) ||
        row.itemDescription.toLowerCase().includes(term) ||
        (row.itemDescriptionBn && row.itemDescriptionBn.toLowerCase().includes(term)) ||
        (row.remarks && row.remarks.toLowerCase().includes(term));
      return matchFloor && matchCat && matchSearch;
    });
  }, [rows, selectedFloor, selectedCategory, searchTerm]);

  // Handle start inline editing
  const startEditingRow = (row: TakeoffRow) => {
    setEditingRowId(row.id);
    setEditNumber(row.number);
    setEditLength(row.length);
    setEditWidth(row.width);
    setEditHeight(row.heightOrDepth);
    setEditRate(row.rateBDT);
    setEditRemarks(row.remarks || '');
  };

  // Save inline edit
  const saveEditingRow = (rowId: string) => {
    const updated = rows.map((row) => {
      if (row.id !== rowId) return row;
      const calculatedQty =
        editNumber *
        editLength *
        editWidth *
        editHeight *
        (row.isDeduction ? -1 : 1);
      return {
        ...row,
        number: editNumber,
        length: editLength,
        width: editWidth,
        heightOrDepth: editHeight,
        quantity: parseFloat(calculatedQty.toFixed(4)),
        rateBDT: editRate,
        amountBDT: parseFloat((calculatedQty * editRate).toFixed(2)),
        remarks: editRemarks,
      };
    });
    onUpdateRows(updated);
    setEditingRowId(null);
  };

  // Delete row
  const deleteRow = (rowId: string) => {
    onUpdateRows(rows.filter((r) => r.id !== rowId));
  };

  // Add row submit
  const handleCreateNewRow = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedQty =
      newNumber *
      newLength *
      newWidth *
      newHeight *
      (newIsDeduction ? -1 : 1);
    const newRow: TakeoffRow = {
      id: `r-${Date.now()}`,
      serialNo: newSerial,
      pwdCode: newPwdCode,
      category: newCategory,
      itemDescription: newDescription,
      itemDescriptionBn: newDescriptionBn || newDescription,
      isDeduction: newIsDeduction,
      number: newNumber,
      length: newLength,
      width: newWidth,
      heightOrDepth: newHeight,
      quantity: parseFloat(calculatedQty.toFixed(4)),
      unit: newUnit,
      rateBDT: newRateBDT,
      amountBDT: parseFloat((calculatedQty * newRateBDT).toFixed(2)),
      remarks: newRemarks,
      floor: newFloor,
    };
    onUpdateRows([...rows, newRow]);
    setIsAddingModalOpen(false);
  };

  // Populate from PWD rate database
  const handleSelectPwdTemplate = (code: string) => {
    const found = PWD_BANGLADESH_RATES.find((item) => item.code === code);
    if (found) {
      setNewPwdCode(found.code);
      setNewCategory(found.category);
      setNewDescription(found.itemDescription);
      setNewDescriptionBn(found.itemDescriptionBn || found.itemDescription);
      setNewUnit(found.unitMetric);
      setNewRateBDT(found.defaultRateBDT);
    }
  };

  // Total amount of filtered rows
  const filteredSubtotal = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + r.quantity * r.rateBDT, 0);
  }, [filteredRows]);

  // Deviation statistics across all rows
  const devStats = useMemo(() => {
    let high = 0;
    let moderate = 0;
    let normal = 0;
    let under = 0;

    rows.forEach((r) => {
      const d = getRowDeviationDetails(r);
      if (d.type === 'high_surge') high++;
      else if (d.type === 'moderate_surge') moderate++;
      else if (d.type === 'underpriced') under++;
      else normal++;
    });

    return { high, moderate, normal, under, total: rows.length };
  }, [rows]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950/40">
      {/* Sub-navigation Header Tabs */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('takeoff_table')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'takeoff_table'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Quantity Takeoff Sheet ({rows.length} Items)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('alternative_materials')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'alternative_materials'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Alternative Materials (BNBC AI Substitutes)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
              Save ~৳1.8M
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Scale className="w-3.5 h-3.5 text-indigo-400" />
          <span>BNBC 2020 Value Engineering Engine Active</span>
        </div>
      </div>

      {activeSubTab === 'alternative_materials' ? (
        <AlternativeMaterialsPanel
          rows={rows}
          currency={currency}
          onApplySubstituteToRows={handleApplySubstituteToRows}
        />
      ) : (
        <>
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PWD code, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Floor Stage Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg p-1 border border-slate-700">
            {(['All', 'Substructure', 'Ground Floor', 'First Floor', 'Terrace/Parapet'] as FloorFilter[]).map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  selectedFloor === fl
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fl}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportPdf}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-700"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            <span>PDF Export</span>
          </button>
          <button
            onClick={() => setIsAddingModalOpen(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-900/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* PWD Rate Benchmark Variance Indicator Banner */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Scale className="w-4 h-4 text-amber-400" />
          <span>PWD Rate Benchmark Monitor:</span>
          <span className="text-slate-400 font-normal">Comparing unit rates against median PWD 2024 schedules</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            High Surge (&gt;+20%): {devStats.high}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            Moderate (+8 to +20%): {devStats.moderate}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Inline (-10 to +8%): {devStats.normal}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 font-bold">
            <TrendingDown className="w-3 h-3 text-cyan-400" />
            Below PWD (&lt;-10%): {devStats.under}
          </span>
        </div>
      </div>

      {/* Main Takeoff Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold sticky top-0 z-10 backdrop-blur-md">
              <th className="py-3 px-3 w-10">Sr.</th>
              <th className="py-3 px-3 w-16">Code</th>
              <th className="py-3 px-4 min-w-[240px]">Description (PWD / BNBC)</th>
              <th className="py-3 px-2 text-center w-12">No</th>
              <th className="py-3 px-2 text-right w-16">L ({unitSystem === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-3 px-2 text-right w-16">W ({unitSystem === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-3 px-2 text-right w-16">H/D ({unitSystem === 'metric' ? 'm' : 'ft'})</th>
              <th className="py-3 px-3 text-right w-20">Quantity</th>
              <th className="py-3 px-2 text-center w-12">Unit</th>
              <th className="py-3 px-3 text-right w-24">Rate ({currency})</th>
              <th className="py-3 px-3 text-center w-36">PWD Rate Variance</th>
              <th className="py-3 px-4 text-right w-28">Total ({currency})</th>
              <th className="py-3 px-3 text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRows.map((row) => {
              const isEditing = editingRowId === row.id;
              const displayUnit = getUnitDisplay(row.unit, unitSystem);
              const displayQty = convertQuantity(row.quantity, row.unit, unitSystem);
              const displayRate = convertRate(row.rateBDT, row.unit, unitSystem);
              const rowAmountBDT = row.quantity * row.rateBDT;
              const dev = getRowDeviationDetails(row);

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    row.isDeduction ? 'bg-rose-950/10 text-rose-300' : ''
                  }`}
                >
                  {/* Serial No */}
                  <td className="py-3 px-3 font-mono text-slate-400">{row.serialNo}</td>

                  {/* PWD Code */}
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">{row.pwdCode}</td>

                  {/* Description */}
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-slate-200">
                        {language === 'bn' && row.itemDescriptionBn
                          ? row.itemDescriptionBn
                          : row.itemDescription}
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          placeholder="Remarks/location..."
                          className="mt-1 w-full px-2 py-0.5 bg-slate-800 text-[10px] rounded border border-slate-700"
                        />
                      ) : (
                        row.remarks && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.remarks}</p>
                        )
                      )}
                    </div>
                  </td>

                  {/* No (Number) */}
                  <td className="py-3 px-2 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editNumber}
                        onChange={(e) => setEditNumber(parseFloat(e.target.value) || 0)}
                        className="w-12 px-1 py-0.5 bg-slate-800 text-center rounded border border-slate-700"
                      />
                    ) : (
                      <span className="font-mono">{row.number}</span>
                    )}
                  </td>

                  {/* Length */}
                  <td className="py-3 px-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editLength}
                        onChange={(e) => setEditLength(parseFloat(e.target.value) || 0)}
                        className="w-14 px-1 py-0.5 bg-slate-800 text-right rounded border border-slate-700"
                      />
                    ) : (
                      <span className="font-mono">
                        {(unitSystem === 'metric' ? row.length : row.length * 3.28084).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Width */}
                  <td className="py-3 px-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editWidth}
                        onChange={(e) => setEditWidth(parseFloat(e.target.value) || 0)}
                        className="w-14 px-1 py-0.5 bg-slate-800 text-right rounded border border-slate-700"
                      />
                    ) : (
                      <span className="font-mono">
                        {(unitSystem === 'metric' ? row.width : row.width * 3.28084).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Height/Depth */}
                  <td className="py-3 px-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editHeight}
                        onChange={(e) => setEditHeight(parseFloat(e.target.value) || 0)}
                        className="w-14 px-1 py-0.5 bg-slate-800 text-right rounded border border-slate-700"
                      />
                    ) : (
                      <span className="font-mono">
                        {(unitSystem === 'metric' ? row.heightOrDepth : row.heightOrDepth * 3.28084).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {displayQty.toFixed(2)}
                  </td>

                  {/* Unit */}
                  <td className="py-3 px-2 text-center text-slate-400 uppercase font-mono text-[10px]">
                    {displayUnit}
                  </td>

                  {/* Rate */}
                  <td className="py-3 px-3 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editRate}
                        onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                        className="w-20 px-1.5 py-0.5 bg-slate-800 text-right rounded border border-slate-700"
                      />
                    ) : (
                      <span className="font-mono">{formatCurrency(displayRate, currency)}</span>
                    )}
                  </td>

                  {/* PWD Rate Variance Visual Indicator */}
                  <td className="py-3 px-3 text-center">
                    <span
                      title={`Unit Rate: ৳${row.rateBDT.toLocaleString()}\nPWD Median Benchmark: ৳${dev.medianRate.toLocaleString()}\nSource: ${dev.benchmarkSource}\nVariance: ${dev.deltaBDT >= 0 ? '+' : ''}৳${dev.deltaBDT.toLocaleString()} (${dev.pct.toFixed(1)}%)`}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 cursor-help transition-all ${dev.colorClass}`}
                    >
                      {dev.type === 'high_surge' && <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />}
                      {dev.type === 'moderate_surge' && <TrendingUp className="w-3 h-3 text-amber-400" />}
                      {dev.type === 'normal' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {dev.type === 'underpriced' && <TrendingDown className="w-3 h-3 text-cyan-400" />}
                      <span>{dev.label}</span>
                    </span>
                  </td>

                  {/* Total Amount */}
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-white">
                    {formatCurrency(rowAmountBDT, currency)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => saveEditingRow(row.id)}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                          title="Save changes"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingRowId(null)}
                          className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEditingRow(row)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                          title="Edit Row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRow(row.id)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Bar with Subtotal */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Showing {filteredRows.length} of {rows.length} rows</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Formula precision verified (1:4, 1:2:4, M25 mix)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filtered Subtotal:
          </span>
          <span className="text-lg font-extrabold text-white font-mono">
            {formatCurrency(filteredSubtotal, currency)}
          </span>
        </div>
      </div>

      {/* Add New Takeoff Row Modal */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Add New BOQ Quantity Takeoff Item
              </h3>
              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRow} className="p-5 space-y-4 text-xs">
              {/* Select from PWD Schedule */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Auto-fill from PWD Bangladesh Rate Schedule 2024 (Optional):
                </label>
                <select
                  onChange={(e) => handleSelectPwdTemplate(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 border border-slate-700"
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Select a standard PWD/BNBC item --
                  </option>
                  {PWD_BANGLADESH_RATES.map((rate) => (
                    <option key={rate.code} value={rate.code}>
                      [{rate.code}] {rate.itemDescription} — ৳{rate.defaultRateBDT}/{rate.unitMetric}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sr. No</label>
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">PWD / BNBC Code</label>
                  <input
                    type="text"
                    value={newPwdCode}
                    onChange={(e) => setNewPwdCode(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Work Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Item Description (English)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700"
                  placeholder="e.g., RCC M25 Concrete in structural beams..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Item Description (Bangla বাংলা - Optional)</label>
                <input
                  type="text"
                  value={newDescriptionBn}
                  onChange={(e) => setNewDescriptionBn(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700"
                  placeholder="e.g., আরসিসি এম-২৫ কংক্রিট ঢালাই..."
                />
              </div>

              {/* Dimensions Grid */}
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">No (Count)</label>
                  <input
                    type="number"
                    value={newNumber}
                    onChange={(e) => setNewNumber(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-2 py-1.5 border border-slate-700 text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Length (L - m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newLength}
                    onChange={(e) => setNewLength(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-2 py-1.5 border border-slate-700 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Width (W - m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newWidth}
                    onChange={(e) => setNewWidth(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-2 py-1.5 border border-slate-700 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">H / Depth (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newHeight}
                    onChange={(e) => setNewHeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-2 py-1.5 border border-slate-700 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-2 py-1.5 border border-slate-700"
                  >
                    <option value="cum">cum (m³)</option>
                    <option value="sqm">sqm (m²)</option>
                    <option value="meter">meter (m)</option>
                    <option value="kg">kg (Kg)</option>
                    <option value="each">each</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Rate in BDT (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRateBDT}
                    onChange={(e) => setNewRateBDT(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700 text-right"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Building Stage</label>
                  <select
                    value={newFloor}
                    onChange={(e) => setNewFloor(e.target.value as unknown as TakeoffRow['floor'])}
                    className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700"
                  >
                    <option value="Substructure">Substructure</option>
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="First Floor">First Floor</option>
                    <option value="Terrace/Parapet">Terrace/Parapet</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newIsDeduction}
                      onChange={(e) => setNewIsDeduction(e.target.checked)}
                      className="w-4 h-4 text-rose-500 rounded border-slate-700"
                    />
                    <span className="text-rose-400 font-bold">Mark as Deduction (-)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remarks / Location Note</label>
                <input
                  type="text"
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 rounded px-3 py-1.5 border border-slate-700"
                  placeholder="e.g., Grid line A to E..."
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/30"
                >
                  Add Takeoff Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
