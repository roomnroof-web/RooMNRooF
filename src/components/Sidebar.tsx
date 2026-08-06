import React from 'react';
import {
  LayoutDashboard,
  Table,
  FileSpreadsheet,
  FileText,
  Users,
  Shield,
  Code2,
  Cloud,
  Layers,
  Award,
  CalendarRange,
  BookmarkCheck,
  Compass,
  TrendingUp,
  History,
  Box
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'takeoff'
  | 'abstract'
  | 'schedule-gantt'
  | 'site-layout'
  | 'bim-3d'
  | 'project-structure'
  | 'material-tracker'
  | 'templates'
  | 'pwd-rates'
  | 'blueprint-ai'
  | 'team'
  | 'api-docs';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onlineUsersCount: number;
  isE2eEncrypted: boolean;
  onToggleE2E: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onlineUsersCount,
  isE2eEncrypted,
  onToggleE2E,
}) => {
  const navItems: { id: ActiveTab; label: string; labelBn?: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      labelBn: 'ড্যাশবোর্ড',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'takeoff',
      label: 'Quantity Takeoff',
      labelBn: 'পরিমাণ নিরূপণ',
      icon: <Table className="w-4 h-4" />,
      badge: '40+ Rows',
    },
    {
      id: 'abstract',
      label: 'Abstract Sheet',
      labelBn: 'সারসংক্ষেপ শিট',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: '25 Units',
    },
    {
      id: 'schedule-gantt',
      label: 'Schedule & Gantt',
      labelBn: 'নির্মাণ সময়সূচী',
      icon: <CalendarRange className="w-4 h-4" />,
      badge: 'Timeline',
    },
    {
      id: 'site-layout',
      label: 'Site Layout & Logistics',
      labelBn: 'সাইট লেআউট প্ল্যান',
      icon: <Compass className="w-4 h-4" />,
      badge: '3D & CAD',
    },
    {
      id: 'material-tracker',
      label: 'Real-Time Material Tracker',
      labelBn: 'রিয়েল-টাইম উপাদান ট্র্যাকার',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: 'Live Grounded',
    },
    {
      id: 'templates',
      label: 'BOQ Templates',
      labelBn: 'প্রজেক্ট টেমপ্লেট',
      icon: <BookmarkCheck className="w-4 h-4" />,
      badge: '4 Presets',
    },
    {
      id: 'pwd-rates',
      label: 'PWD Rates 2024',
      labelBn: 'পি ডব্লিউ ডি রেট',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 'blueprint-ai',
      label: 'Blueprint AI OCR',
      labelBn: 'পিডিএফ এআই প্ল্যান',
      icon: <FileText className="w-4 h-4" />,
      badge: 'PDF',
    },
    {
      id: 'team',
      label: 'Team RBAC & Roles',
      labelBn: 'টিম এবং অনুমতি',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'api-docs',
      label: 'Developer API & Backup',
      labelBn: 'এপিআই ও ব্যাকআপ',
      icon: <Code2 className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900/80 flex flex-col justify-between h-full select-none">
      <div>
        {/* Logo Header matching Professional Polish aesthetic */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40">
              EP
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                EstimaPro <span className="text-blue-500 text-xs font-mono px-1 py-0.5 bg-blue-500/10 rounded">BD</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">BNBC 2020 • PWD 2024</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full rounded-lg px-3 py-2.5 flex items-center justify-between text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Sync & E2E Encryption Footer */}
      <div className="p-4 space-y-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
              Cloud Sync Active
            </span>
            <Cloud className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-blue-200/90 mb-2.5">
            Real-time collaboration & offline storage enabled.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono text-emerald-300">
                {onlineUsersCount} Users Online
              </span>
            </div>
            <button
              onClick={onToggleE2E}
              title="Toggle End-to-End Encryption Mode"
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono transition-colors ${
                isE2eEncrypted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Shield className="w-3 h-3" />
              {isE2eEncrypted ? 'E2E ON' : 'E2E OFF'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
          <span>GDPR & CCPA Compliant</span>
          <span>v2.4.0-BD</span>
        </div>
      </div>
    </aside>
  );
};
