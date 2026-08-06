/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Globe,
  CheckCircle2,
  FileDown,
  Cloud,
  RefreshCw,
  ShieldCheck,
  Clock,
  UploadCloud,
  ChevronDown,
  Check,
  X,
  Building,
  FileEdit
} from 'lucide-react';
import {
  UnitSystem,
  CurrencyCode,
  LanguageCode,
  PendingChangeItem
} from '../types/estimation';
import { CURRENCIES } from '../data/pwdRateSchedule';

interface TopHeaderProps {
  projectTitle: string;
  projectNo: string;
  unitSystem: UnitSystem;
  onUnitSystemChange: (system: UnitSystem) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onExportPdf: () => void;
  onOpenMetadataModal?: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  pendingChangesQueue?: PendingChangeItem[];
  onPushToCloud?: () => void;
  isSyncing?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  projectTitle,
  projectNo,
  unitSystem,
  onUnitSystemChange,
  currency,
  onCurrencyChange,
  language,
  onLanguageChange,
  onExportPdf,
  onOpenMetadataModal,
  unreadCount,
  onOpenNotifications,
  pendingChangesQueue = [],
  onPushToCloud,
  isSyncing = false,
}) => {
  const [showSyncQueue, setShowSyncQueue] = useState(false);

  const pendingCount = pendingChangesQueue.filter(
    (item) => item.status === 'pending' || item.status === 'syncing'
  ).length;

  return (
    <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 select-none relative z-40">
      {/* Left Project Info */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black tracking-widest px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md shadow-md shadow-blue-900/40 font-mono uppercase border border-blue-400/30">
          PRO v2.4
        </span>
        <span className="text-xs font-bold px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          BNBC 2020
        </span>
        <span className="text-xs font-bold px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded font-mono">
          {projectNo}
        </span>
        <h2 className="font-medium text-sm text-slate-300 truncate max-w-sm hidden sm:block">
          Project: <span className="text-white font-semibold">{projectTitle}</span>
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* REAL-TIME LOCAL DATA SYNCHRONIZATION STATUS BADGE & PENDING CHANGES QUEUE */}
        <div className="relative">
          <button
            onClick={() => setShowSyncQueue(!showSyncQueue)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isSyncing || pendingCount > 0
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title="Real-time Local Data Synchronization & Pending Cloud Queue"
          >
            {isSyncing || pendingCount > 0 ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>
                  {isSyncing
                    ? 'Syncing to Cloud...'
                    : `${pendingCount} Pending Change${pendingCount === 1 ? '' : 's'}`}
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Synced to Cloud</span>
              </>
            )}
            <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
          </button>

          {/* Pending Changes Queue Popover */}
          {showSyncQueue && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              {/* Header */}
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Local Data Synchronization Queue
                    </h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      AES-256 E2E Encrypted Cloud Push
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSyncQueue(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Queue List */}
              <div className="max-h-60 overflow-y-auto p-3 space-y-2 divide-y divide-slate-800/60">
                {pendingChangesQueue.length === 0 ? (
                  <div className="py-6 text-center space-y-1">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-white">All Edits Synced</p>
                    <p className="text-[11px] text-slate-400">
                      Your local changes are up-to-date with the cloud repository.
                    </p>
                  </div>
                ) : (
                  pendingChangesQueue.map((item) => (
                    <div
                      key={item.id}
                      className="pt-2 first:pt-0 flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.category} • {item.timestamp}
                        </p>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold border flex-shrink-0 ${
                          item.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : item.status === 'syncing'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Footer action button */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {pendingCount} item{pendingCount === 1 ? '' : 's'} waiting
                </span>
                <button
                  onClick={() => {
                    if (onPushToCloud) onPushToCloud();
                    setShowSyncQueue(false);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Push to Cloud Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Unit Converter Switcher */}
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700/80">
          <button
            onClick={() => onUnitSystemChange('metric')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all duration-150 ${
              unitSystem === 'metric'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Metric
          </button>
          <button
            onClick={() => onUnitSystemChange('imperial')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all duration-150 ${
              unitSystem === 'imperial'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Imperial
          </button>
        </div>

        {/* Currency Selector */}
        <div className="relative">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>
                {code} ({CURRENCIES[code].symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Language Localized Toggle */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'bn' : 'en')}
          title="Toggle Language localization"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{language === 'en' ? 'EN' : 'বাংলা'}</span>
        </button>

        {/* Project Submission Metadata Button */}
        {onOpenMetadataModal && (
          <button
            onClick={onOpenMetadataModal}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Edit Owner, Site Location & Contractor ID embedded into PDF"
          >
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Project Metadata</span>
          </button>
        )}

        {/* PDF Export BOQ button */}
        <button
          onClick={onExportPdf}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Export BOQ PDF</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Project Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile display */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-md">
            AA
          </div>
          <div className="text-right hidden xl:block">
            <p className="text-xs font-bold text-white">Er. AMRUT AMARSHETTY</p>
            <p className="text-[10px] text-slate-400">Engineer-In-Charge</p>
          </div>
        </div>
      </div>
    </header>
  );
};
