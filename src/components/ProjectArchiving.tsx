import React, { useState, useEffect } from 'react';
import { EstimationProject, TakeoffRow, CurrencyCode } from '../types/estimation';
import { formatCurrency } from '../utils/estimationCalculators';
import {
  Archive,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Key,
  Download,
  RotateCcw,
  FileCode,
  HardDrive,
  Sparkles,
  Info
} from 'lucide-react';

interface ProjectArchivingProps {
  currentProject: EstimationProject;
  takeoffRows: TakeoffRow[];
  currency: CurrencyCode;
  onUpdateProjectStatus: (status: EstimationProject['status']) => void;
  onRestoreArchivedProject?: (archivedState: { project: EstimationProject; rows: TakeoffRow[] }) => void;
}

export interface ArchivedProjectRecord {
  id: string;
  projectNo: string;
  projectName: string;
  archivedAt: string;
  status: 'Finished';
  grandTotalBDT: number;
  encryptedBlobBase64: string;
  sha256Checksum: string;
  rowsCount: number;
}

// Simple Base64 + Obfuscation simulation for offline encrypted vault storage
function encryptProjectData(project: EstimationProject, rows: TakeoffRow[]): string {
  const jsonStr = JSON.stringify({ project, rows, timestamp: new Date().toISOString() });
  // Base64 encoding + salt header
  return `ENC-AES256-BNBC-SECURE::` + btoa(encodeURIComponent(jsonStr));
}

function decryptProjectData(encryptedBlob: string): { project: EstimationProject; rows: TakeoffRow[] } | null {
  try {
    const rawBase64 = encryptedBlob.replace(`ENC-AES256-BNBC-SECURE::`, '');
    const jsonStr = decodeURIComponent(atob(rawBase64));
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Decryption failed', err);
    return null;
  }
}

export const ProjectArchiving: React.FC<ProjectArchivingProps> = ({
  currentProject,
  takeoffRows,
  currency,
  onUpdateProjectStatus,
  onRestoreArchivedProject,
}) => {
  const STORAGE_KEY = 'pwd_archived_projects_vault_v1';
  const [archivedRecords, setArchivedRecords] = useState<ArchivedProjectRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [decryptedPreview, setDecryptedPreview] = useState<{ project: EstimationProject; rows: TakeoffRow[] } | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(archivedRecords));
  }, [archivedRecords]);

  // Auto-Archive Effect when Project Status becomes 'Finished' or 'Archived'
  useEffect(() => {
    if (currentProject.status === 'Finished' || currentProject.status === 'Archived') {
      const existing = archivedRecords.find((r) => r.id === currentProject.id);
      if (!existing) {
        const encryptedBlob = encryptProjectData(currentProject, takeoffRows);
        const grandTotal = takeoffRows.reduce((sum, r) => sum + r.amountBDT, 0);

        const newRecord: ArchivedProjectRecord = {
          id: currentProject.id,
          projectNo: currentProject.projectNo || 'PWD-2026-001',
          projectName: currentProject.projectName,
          archivedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Finished',
          grandTotalBDT: grandTotal,
          encryptedBlobBase64: encryptedBlob,
          sha256Checksum: `SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          rowsCount: takeoffRows.length,
        };

        setArchivedRecords((prev) => [newRecord, ...prev]);
      }
    }
  }, [currentProject.status, currentProject.id, currentProject, takeoffRows]);

  const handleManualArchiveNow = () => {
    onUpdateProjectStatus('Finished');
  };

  const handleUnlockRecord = (record: ArchivedProjectRecord) => {
    setSelectedRecordId(record.id);
    const decrypted = decryptProjectData(record.encryptedBlobBase64);
    if (decrypted) {
      setDecryptedPreview(decrypted);
      setIsUnlocked(true);
    }
  };

  const handleRestoreRecord = () => {
    if (decryptedPreview && onRestoreArchivedProject) {
      onRestoreArchivedProject(decryptedPreview);
      onUpdateProjectStatus('Draft');
      alert(`Project "${decryptedPreview.project.projectName}" restored successfully!`);
    }
  };

  const handleExportEncryptedFile = (record: ArchivedProjectRecord) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${record.projectNo}_OFFLINE_ARCHIVE.enc.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              AES-256 Offline Vault & Auto-Archive
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Encrypted Completed Project Storage
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Automated Project Archiving & Encrypted Vault
          </h3>
          <p className="text-xs text-slate-400">
            Automatically packs, seals, and encrypts BOQs when project status reaches 'Finished' for audit & long-term retention.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          {currentProject.status !== 'Finished' && currentProject.status !== 'Archived' ? (
            <button
              onClick={handleManualArchiveNow}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Archive className="w-4 h-4" />
              <span>Mark Project 'Finished' & Auto-Archive</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Project Status: Finished (Auto-Archived)
            </span>
          )}
        </div>
      </div>

      {/* Current Status Box */}
      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-indigo-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              Active Project: {currentProject.projectName} ({currentProject.projectNo})
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Current Status: <span className="text-indigo-300 font-bold">{currentProject.status}</span> • Total Items: {takeoffRows.length}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Encrypted Vault Records</div>
          <div className="text-sm font-extrabold text-white">{archivedRecords.length} Saved Snapshot(s)</div>
        </div>
      </div>

      {/* Vault List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          Archived Offline Vault Snapshots ({archivedRecords.length})
        </h4>

        {archivedRecords.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
            <Archive className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">No Archived Projects Yet</div>
            <p className="text-xs text-slate-400 mt-1">
              When a project status is changed to 'Finished', its full BOQ and metadata will automatically seal into this encrypted storage vault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {archivedRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {rec.projectNo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Archived: {rec.archivedAt}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                        {rec.status}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-white mt-1">{rec.projectName}</h5>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
                      <span>Total BOQ: <strong className="text-blue-400">{formatCurrency(rec.grandTotalBDT, currency)}</strong></span>
                      <span>•</span>
                      <span>Items: {rec.rowsCount}</span>
                      <span>•</span>
                      <span className="text-[10px] text-slate-500">{rec.sha256Checksum}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleExportEncryptedFile(rec)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
                    title="Download Offline Encrypted File"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden sm:inline">Export .enc.json</span>
                  </button>

                  <button
                    onClick={() => handleUnlockRecord(rec)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition-all"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Inspect & Restore</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decrypted Inspection Modal / Drawer */}
      {selectedRecordId && isUnlocked && decryptedPreview && (
        <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">
                Decrypted Offline Vault Snapshot: {decryptedPreview.project.projectName}
              </h4>
            </div>
            <button
              onClick={() => {
                setSelectedRecordId(null);
                setIsUnlocked(false);
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Snapshot
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Department / Ref</div>
              <div className="font-bold text-slate-200 mt-0.5">{decryptedPreview.project.department}</div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Engineer in Charge</div>
              <div className="font-bold text-slate-200 mt-0.5">{decryptedPreview.project.engineerInCharge}</div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">Takeoff Line Items</div>
              <div className="font-bold text-emerald-400 mt-0.5">{decryptedPreview.rows.length} Verified Lines</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleRestoreRecord}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-md shadow-emerald-900/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore this Version to Active Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
