import React, { useState, useMemo } from 'react';
import {
  History,
  User,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Building,
  TrendingUp,
  TrendingDown,
  Clock,
  Layers,
  ArrowRight,
  Lock,
  Tag,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { CurrencyCode } from '../types/estimation';
import { formatCurrency } from '../utils/estimationCalculators';

export interface AuditEventItem {
  id: string;
  timestamp: string;
  date: string;
  authorName: string;
  authorRole: 'Chief Sanctioning Engineer' | 'Quantity Surveyor' | 'Site In-Charge' | 'Structural AI System';
  authorAvatarBg: string;
  eventType: 'structural_edit' | 'rate_adjustment' | 'material_swap' | 'quantity_change' | 'floor_addition';
  componentOrItem: string;
  category: string;
  beforeValue: string;
  afterValue: string;
  costImpactBDT: number; // positive = increase, negative = savings
  approvalStatus: 'verified' | 'pending_approval' | 'auto_logged';
  notes: string;
  e2eHash?: string;
}

interface ProjectStructureAuditTimelineProps {
  currency?: CurrencyCode;
  onExportAuditLog?: () => void;
}

export const ProjectStructureAuditTimeline: React.FC<ProjectStructureAuditTimelineProps> = ({
  currency = 'BDT',
  onExportAuditLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Initial audit events seed representing complete structural change history
  const initialEvents: AuditEventItem[] = [
    {
      id: 'aud-108',
      timestamp: '12:14 PM Today',
      date: '2026-08-05',
      authorName: 'Er. AMRUT AMARSHETTY',
      authorRole: 'Chief Sanctioning Engineer',
      authorAvatarBg: 'bg-blue-600',
      eventType: 'material_swap',
      componentOrItem: 'BSRM 500W Grade Rebar -> Micro-Alloyed Fe 500D',
      category: '03. Reinforcement & Steel',
      beforeValue: '৳94,500 / Ton (BSRM 500W)',
      afterValue: '৳90,300 / Ton (Fe 500D Micro-Alloyed)',
      costImpactBDT: -119700,
      approvalStatus: 'verified',
      notes: 'Applied BNBC 2020 Sec 5.3 compliant material substitution to mitigate Q4 steel inflation.',
      e2eHash: '0x8f92a10b...e4c1',
    },
    {
      id: 'aud-107',
      timestamp: '11:42 AM Today',
      date: '2026-08-05',
      authorName: 'Er. Gaurav Singh Rathore',
      authorRole: 'Quantity Surveyor',
      authorAvatarBg: 'bg-indigo-600',
      eventType: 'quantity_change',
      componentOrItem: 'Sylhet Coarse Sand Fill (Foundation Pits)',
      category: '01. Substructure & Earthwork',
      beforeValue: '18,500 Cft',
      afterValue: '21,200 Cft (+2,700 Cft)',
      costImpactBDT: +167400,
      approvalStatus: 'verified',
      notes: 'Adjusted pit compaction volume based on updated geotechnical soil test borehole report #4.',
      e2eHash: '0x7c41f92e...a88d',
    },
    {
      id: 'aud-106',
      timestamp: '09:30 AM Today',
      date: '2026-08-05',
      authorName: 'EstimaPro Structural AI',
      authorRole: 'Structural AI System',
      authorAvatarBg: 'bg-emerald-600',
      eventType: 'rate_adjustment',
      componentOrItem: '1st Class Brick Work Rate Index Alignment',
      category: '04. Brickwork & Masonry',
      beforeValue: '৳11,800 / 1000 Pcs',
      afterValue: '৳12,500 / 1000 Pcs',
      costImpactBDT: +85400,
      approvalStatus: 'auto_logged',
      notes: 'Auto-aligned unit rates to match PWD Schedule 2024 Market Bulletin #12.',
      e2eHash: '0x3a19d88f...c902',
    },
    {
      id: 'aud-105',
      timestamp: '04:15 PM Yesterday',
      date: '2026-08-04',
      authorName: 'Er. AMRUT AMARSHETTY',
      authorRole: 'Chief Sanctioning Engineer',
      authorAvatarBg: 'bg-blue-600',
      eventType: 'structural_edit',
      componentOrItem: 'Footing F1 Depth & Rebar Spacing Revision',
      category: '01. Substructure & Earthwork',
      beforeValue: 'Depth 1.5m, #16mm @ 150mm c/c',
      afterValue: 'Depth 1.8m, #16mm @ 125mm c/c',
      costImpactBDT: +245000,
      approvalStatus: 'verified',
      notes: 'Increased footing thickness and rebar density to accommodate SBC 140 kPa soil capacity.',
      e2eHash: '0x1e88f21a...b332',
    },
    {
      id: 'aud-104',
      timestamp: '02:00 PM Yesterday',
      date: '2026-08-04',
      authorName: 'Engr. Nazmul Huda',
      authorRole: 'Site In-Charge',
      authorAvatarBg: 'bg-amber-600',
      eventType: 'floor_addition',
      componentOrItem: 'Added Terrace Parapet & Overhead Water Tank Structure',
      category: '05. Finishing & Roofing',
      beforeValue: '5 Story Standard Roof',
      afterValue: '5 Story + Terrace Parapet & OHT RCC Slab',
      costImpactBDT: +310000,
      approvalStatus: 'pending_approval',
      notes: 'Added RCC Overhead Tank (25,000 Liters capacity) and 1.2m height brick parapet wall.',
      e2eHash: '0x9d44c21e...f771',
    },
    {
      id: 'aud-103',
      timestamp: '10:10 AM Aug 03',
      date: '2026-08-03',
      authorName: 'Er. Gaurav Singh Rathore',
      authorRole: 'Quantity Surveyor',
      authorAvatarBg: 'bg-indigo-600',
      eventType: 'rate_adjustment',
      componentOrItem: 'Portland Composite Cement (PCC 50kg Bag)',
      category: '02. Cement & Concrete Work',
      beforeValue: '৳510 / Bag',
      afterValue: '৳540 / Bag',
      costImpactBDT: +63000,
      approvalStatus: 'verified',
      notes: 'Updated cement bag unit rate reflecting logistics freight tariff update.',
      e2eHash: '0x4b72e11a...d901',
    },
  ];

  // Derived statistics
  const stats = useMemo(() => {
    const totalEvents = initialEvents.length;
    const totalImpact = initialEvents.reduce((acc, ev) => acc + ev.costImpactBDT, 0);
    const verifiedCount = initialEvents.filter((ev) => ev.approvalStatus === 'verified').length;
    const pendingCount = initialEvents.filter((ev) => ev.approvalStatus === 'pending_approval').length;
    return { totalEvents, totalImpact, verifiedCount, pendingCount };
  }, [initialEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((ev) => {
      const matchSearch =
        searchTerm === '' ||
        ev.componentOrItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = selectedRole === 'All' || ev.authorRole === selectedRole;
      const matchType = selectedType === 'All' || ev.eventType === selectedType;
      const matchCategory = selectedCategory === 'All' || ev.category === selectedCategory;

      return matchSearch && matchRole && matchType && matchCategory;
    });
  }, [initialEvents, searchTerm, selectedRole, selectedType, selectedCategory]);

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-950 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                RBAC Audit Trail & Immutable Log
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                E2E Cryptographic Hash Enabled
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Project Structure Audit Timeline & Revision Tracker
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Chronological log tracking all structural modifications, BOQ item additions, material substitutions, and unit rate adjustments made across team roles for complete multi-user accountability.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportAuditLog}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Audit Log PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Total Logged Events
          </div>
          <div className="text-xl font-extrabold text-white mt-1">{stats.totalEvents} Revision Records</div>
          <div className="text-[10px] text-slate-400 mt-1">Full history retained</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            Net Revision Cost Delta
          </div>
          <div className={`text-xl font-extrabold mt-1 ${stats.totalImpact >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {stats.totalImpact >= 0 ? '+' : ''}{formatCurrency(stats.totalImpact, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Cumulative cost adjustment</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-emerald-900/40 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified & Sanctioned
          </div>
          <div className="text-xl font-extrabold text-emerald-300 mt-1">{stats.verifiedCount} / {stats.totalEvents}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Chief Engineer approved</div>
        </div>

        <div className="p-4 bg-slate-900/80 border border-amber-900/40 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Pending Chief Approval
          </div>
          <div className="text-xl font-extrabold text-amber-300 mt-1">{stats.pendingCount} Pending</div>
          <div className="text-[10px] text-amber-400/80 mt-1">Requires sanction review</div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword, engineer, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
            <User className="w-3.5 h-3.5 text-indigo-400 ml-1" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-transparent text-slate-300 outline-none pr-2 font-medium cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Roles</option>
              <option value="Chief Sanctioning Engineer" className="bg-slate-900 text-white">Chief Engineer</option>
              <option value="Quantity Surveyor" className="bg-slate-900 text-white">Quantity Surveyor</option>
              <option value="Site In-Charge" className="bg-slate-900 text-white">Site In-Charge</option>
              <option value="Structural AI System" className="bg-slate-900 text-white">AI System</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
            <Tag className="w-3.5 h-3.5 text-blue-400 ml-1" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-slate-300 outline-none pr-2 font-medium cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Event Types</option>
              <option value="material_swap" className="bg-slate-900 text-white">Material Swap</option>
              <option value="quantity_change" className="bg-slate-900 text-white">Quantity Change</option>
              <option value="rate_adjustment" className="bg-slate-900 text-white">Rate Adjustment</option>
              <option value="structural_edit" className="bg-slate-900 text-white">Structural Edit</option>
              <option value="floor_addition" className="bg-slate-900 text-white">Floor Addition</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-white font-bold">{filteredEvents.length}</span> of {initialEvents.length} events
        </div>
      </div>

      {/* Timeline Stream View */}
      <div className="space-y-4 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className="relative pl-14 transition-all hover:translate-x-1 duration-150"
          >
            {/* Timeline Circle Marker */}
            <div className={`absolute left-3.5 top-3.5 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              ev.approvalStatus === 'verified'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : ev.approvalStatus === 'pending_approval'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
            }`}>
              {ev.approvalStatus === 'verified' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : ev.approvalStatus === 'pending_approval' ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Event Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${ev.authorAvatarBg} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                    {ev.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{ev.authorName}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                        {ev.authorRole}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{ev.timestamp}</span>
                      <span>•</span>
                      <span className="font-mono text-indigo-400">{ev.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                    ev.costImpactBDT > 0
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : ev.costImpactBDT < 0
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {ev.costImpactBDT > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : ev.costImpactBDT < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : null}
                    <span>{ev.costImpactBDT > 0 ? '+' : ''}{formatCurrency(ev.costImpactBDT, currency)}</span>
                  </span>

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    ev.approvalStatus === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : ev.approvalStatus === 'pending_approval'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {ev.approvalStatus === 'verified'
                      ? 'BNBC Verified'
                      : ev.approvalStatus === 'pending_approval'
                      ? 'Pending Approval'
                      : 'Auto Logged'}
                  </span>
                </div>
              </div>

              {/* Event Body */}
              <div className="mt-3 space-y-2">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>{ev.componentOrItem}</span>
                </div>

                {/* Before vs After comparison strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Before:</span>
                    <span className="text-slate-300 line-through">{ev.beforeValue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">After:</span>
                    <span className="text-emerald-300">{ev.afterValue}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic pt-1">
                  "{ev.notes}"
                </p>

                {ev.e2eHash && (
                  <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Cryptographic Audit Proof: {ev.e2eHash}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
