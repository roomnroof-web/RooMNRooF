import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  X,
  FileText,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'PWD Bangladesh 2024 Schedule Auto-Calibrated',
      time: '10m ago',
      desc: 'All 35+ items updated with CPWD / PWD 2024 Dhaka Division rates. Contingency set to 4.5% & electrification set to 7.5%.',
      type: 'success',
    },
    {
      id: 'n2',
      title: 'BNBC 2020 Opening Deduction Verified',
      time: '1h ago',
      desc: 'Brick masonry opening deductions calculated as per BNBC 2020 clause 4.2.8 for doors D1/D2 and windows W1-W3.',
      type: 'info',
    },
    {
      id: 'n3',
      title: 'GDPR & CCPA EU Data Sovereignty Active',
      time: '3h ago',
      desc: 'Audit logs anonymized and AES-256 local encrypted storage synchronized.',
      type: 'security',
    },
    {
      id: 'n4',
      title: 'Police School Staff Quarter OCR Plan Loaded',
      time: '5h ago',
      desc: 'PDF blueprint (287.10 m² plot, 2BHK Staff Quarter, 25 Units) structural grid M25 columns extracted.',
      type: 'info',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-slate-950/40 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Project Activity & Alerts</h3>
              <p className="text-[11px] text-slate-400">
                Police School Staff Quarter • Project CG/SS/2BHK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GDPR/CCPA badge */}
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>GDPR / CCPA Protected Workspace</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">E2E Encrypted</span>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{notif.title}</span>
                <span className="text-[10px] font-mono text-slate-400">{notif.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{notif.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">4 unread audit logs</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-xs"
          >
            Mark All as Read
          </button>
        </div>
      </div>
    </div>
  );
};
