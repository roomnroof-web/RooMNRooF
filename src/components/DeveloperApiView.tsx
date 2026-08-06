import React, { useState } from 'react';
import { BackupSnapshot } from '../types/estimation';
import {
  Code2,
  Database,
  Cloud,
  Key,
  Copy,
  Check,
  Download,
  RotateCcw,
  ShieldCheck,
  Server,
  RefreshCw
} from 'lucide-react';

export const INITIAL_BACKUPS: BackupSnapshot[] = [
  {
    id: 'bk-01',
    timestamp: '2026-07-31 06:00:00 UTC',
    projectNo: 'CG/SS/2BHK',
    sizeKb: 1420,
    type: 'Automated Daily',
    encrypted: true,
    notes: 'Auto-backup: 25 Units BOQ & PWD Bangladesh 2024 rate schedule',
  },
  {
    id: 'bk-02',
    timestamp: '2026-07-30 23:45:10 UTC',
    projectNo: 'CG/SS/2BHK',
    sizeKb: 1395,
    type: 'Tender Freeze',
    encrypted: true,
    notes: 'Tender submission checkpoint by Er. AMRUT AMARSHETTY',
  },
  {
    id: 'bk-03',
    timestamp: '2026-07-29 14:20:00 UTC',
    projectNo: 'CG/SS/2BHK',
    sizeKb: 1310,
    type: 'Manual Checkpoint',
    encrypted: true,
    notes: 'Post-OCR extraction verification checkpoint',
  },
];

export const DeveloperApiView: React.FC = () => {
  const [backups, setBackups] = useState<BackupSnapshot[]>(INITIAL_BACKUPS);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);

  const apiKey = 'ep_live_bd_2024_bnbc_e2e_9814a6e84d72bc01';

  const sampleCurl = `curl -X GET "https://api.estimapro.bd/v2/projects/CG-SS-2BHK/boq-summary" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -H "X-PWD-Standard: BD-2024"`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleTriggerBackup = () => {
    setIsTriggeringBackup(true);
    setTimeout(() => {
      const newBk: BackupSnapshot = {
        id: `bk-${Date.now()}`,
        timestamp: new Date().toUTCString(),
        projectNo: 'CG/SS/2BHK',
        sizeKb: 1445,
        type: 'Manual Checkpoint',
        encrypted: true,
        notes: 'Manual cloud backup snapshot initiated by User',
      };
      setBackups([newBk, ...backups]);
      setIsTriggeringBackup(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              Developer API & REST Hooks
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              AES-256 Cloud Infrastructure
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            3rd-Party Integrations, Developer Onboarding & Daily Backups
          </h2>
          <p className="text-xs text-slate-400">
            Automated daily backups, ERP/BIM interoperability endpoints, and high-availability cloud infrastructure
          </p>
        </div>

        <button
          onClick={handleTriggerBackup}
          disabled={isTriggeringBackup}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30"
        >
          <RefreshCw className={`w-4 h-4 ${isTriggeringBackup ? 'animate-spin' : ''}`} />
          <span>{isTriggeringBackup ? 'Creating Backup...' : 'Trigger Cloud Snapshot'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: API Keys & REST Docs */}
        <div className="lg:col-span-7 space-y-6">
          {/* API Key Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Production REST API Key</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active • Rate Limit: 1000 req/min
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Use this bearer token to integrate EstimaPro Bangladesh BOQ summaries with SAP, Autodesk Revit BIM, or Primavera P6.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="flex-1 bg-slate-950 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 border border-slate-700"
              />
              <button
                onClick={handleCopyKey}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* cURL Snippet */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">BOQ Export API Endpoint</h3>
              </div>
              <button
                onClick={handleCopySnippet}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
              {sampleCurl}
            </pre>
            <p className="text-[11px] text-slate-400">
              Returns JSON containing total quantity takeoff rows, unit conversions (metric/imperial), and CPWD / PWD 2024 rate schedule calculations.
            </p>
          </div>
        </div>

        {/* Right: Automated Backups & Infrastructure */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Automated Daily Backups</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Retention: 90 Days</span>
            </div>

            <div className="space-y-2.5">
              {backups.map((bk) => (
                <div
                  key={bk.id}
                  className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{bk.type}</span>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        {bk.sizeKb} KB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{bk.timestamp}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{bk.notes}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => alert(`Downloaded snapshot ${bk.id}`)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                      title="Download SQL/JSON Snapshot"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alert(`Restoring backup ${bk.id} to active workspace...`)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded"
                      title="Restore Snapshot"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scalable Cloud Infrastructure status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Scalable Cloud Infrastructure</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                <span className="text-slate-300">Google Cloud Run (Asia-Southeast1)</span>
                <span className="text-emerald-400 font-mono font-bold">99.99% SLA</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                <span className="text-slate-300">Real-time WebSocket Sync</span>
                <span className="text-emerald-400 font-mono font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                <span className="text-slate-300">Zero-Knowledge Offline Storage</span>
                <span className="text-emerald-400 font-mono font-bold">Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
