import React, { useState } from 'react';
import { TeamMember } from '../types/estimation';
import {
  Users,
  Shield,
  Lock,
  Globe,
  Plus,
  CheckCircle2,
  Trash2,
  Settings
} from 'lucide-react';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'u-1',
    name: 'Er. AMRUT AMARSHETTY',
    email: 'amrut.a@civilguruji.org.bd',
    role: 'Chief Engineer (Admin)',
    avatar: 'AA',
    status: 'online',
    permissions: {
      editBOQ: true,
      editRates: true,
      approveTender: true,
      viewFinancials: true,
      manageTeam: true,
    },
    lastActive: 'Just now',
    location: 'Dhaka HQ • IP 103.15.24.11',
  },
  {
    id: 'u-2',
    name: 'Er. Gaurav Singh Rathore',
    email: 'gaurav.s@civilguruji.org.bd',
    role: 'Structural Reviewer',
    avatar: 'GR',
    status: 'online',
    permissions: {
      editBOQ: true,
      editRates: false,
      approveTender: true,
      viewFinancials: true,
      manageTeam: false,
    },
    lastActive: '5m ago',
    location: 'Chattogram Office',
  },
  {
    id: 'u-3',
    name: 'Er. Chetan Sharma',
    email: 'chetan.sharma@pwd.gov.bd',
    role: 'PWD Auditor',
    avatar: 'CS',
    status: 'offline',
    permissions: {
      editBOQ: false,
      editRates: true,
      approveTender: true,
      viewFinancials: true,
      manageTeam: false,
    },
    lastActive: '1h ago',
    location: 'PWD Secretariat Dhaka',
  },
  {
    id: 'u-4',
    name: 'Er. Tejas Chandrashekhar',
    email: 'tejas.c@civilguruji.org.bd',
    role: 'Estimation Engineer',
    avatar: 'TC',
    status: 'online',
    permissions: {
      editBOQ: true,
      editRates: true,
      approveTender: false,
      viewFinancials: true,
      manageTeam: false,
    },
    lastActive: '12m ago',
    location: 'Sylhet Site',
  },
];

export const TeamManagementView: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [gdprEnabled, setGdprEnabled] = useState(true);
  const [ccpaEnabled, setCcpaEnabled] = useState(true);
  const [e2eEnabled, setE2eEnabled] = useState(true);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('Estimation Engineer');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleTogglePermission = (
    memberId: string,
    key: keyof TeamMember['permissions']
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          permissions: {
            ...m.permissions,
            [key]: !m.permissions[key],
          },
        };
      })
    );
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const newM: TeamMember = {
      id: `u-${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      avatar: newMemberName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      status: 'online',
      permissions: {
        editBOQ: true,
        editRates: newMemberRole === 'Chief Engineer (Admin)' || newMemberRole === 'PWD Auditor',
        approveTender: newMemberRole === 'Chief Engineer (Admin)' || newMemberRole === 'Structural Reviewer',
        viewFinancials: true,
        manageTeam: newMemberRole === 'Chief Engineer (Admin)',
      },
      lastActive: 'Just now',
      location: 'Bangladesh Remote',
    };

    setMembers([...members, newM]);
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddModal(false);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
              Role-Based Access Control (RBAC)
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              GDPR & CCPA Compliant
            </span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Team Permissions, Roles & Privacy Protection
          </h2>
          <p className="text-xs text-slate-400">
            Configure access controls for Estimation Engineers, PWD Auditors, and Chief Engineers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Main Content: Members Table Left + Compliance Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Members Table */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Project Team ({members.length} Members)
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              {members.filter((m) => m.status === 'online').length} Online
            </span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-2 text-center">Edit BOQ</th>
                <th className="py-3 px-2 text-center">Edit Rates</th>
                <th className="py-3 px-2 text-center">Approve</th>
                <th className="py-3 px-2 text-center">Admin</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs relative">
                        {member.avatar}
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                            member.status === 'online'
                              ? 'bg-emerald-400'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700">
                      {member.role}
                    </span>
                  </td>
                  {/* Permission toggles */}
                  <td className="py-3.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.editBOQ}
                      onChange={() => handleTogglePermission(member.id, 'editBOQ')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-700 bg-slate-800 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.editRates}
                      onChange={() => handleTogglePermission(member.id, 'editRates')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-700 bg-slate-800 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.approveTender}
                      onChange={() => handleTogglePermission(member.id, 'approveTender')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-700 bg-slate-800 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <input
                      type="checkbox"
                      checked={member.permissions.manageTeam}
                      onChange={() => handleTogglePermission(member.id, 'manageTeam')}
                      className="w-4 h-4 rounded text-blue-600 border-slate-700 bg-slate-800 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {member.id !== 'u-1' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side: Compliance & Security */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">GDPR & CCPA Compliance</h3>
            </div>
            <p className="text-xs text-slate-400">
              Control global data sovereignty, right-to-erasure workflows, and PII protection for international stakeholders.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-200">EU GDPR Privacy Mode</p>
                  <p className="text-[10px] text-slate-400">Anonymize audit logs after 30 days</p>
                </div>
                <input
                  type="checkbox"
                  checked={gdprEnabled}
                  onChange={(e) => setGdprEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-200">CCPA California Shield</p>
                  <p className="text-[10px] text-slate-400">Do-not-sell commercial telemetry</p>
                </div>
                <input
                  type="checkbox"
                  checked={ccpaEnabled}
                  onChange={(e) => setCcpaEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-200">E2E AES-256 Encryption</p>
                  <p className="text-[10px] text-slate-400">Zero-knowledge offline cache sync</p>
                </div>
                <input
                  type="checkbox"
                  checked={e2eEnabled}
                  onChange={(e) => setE2eEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Offline Sync Status
            </h3>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Offline Cache Ready</p>
                <p className="text-[10px] text-emerald-200/80">
                  Last cloud sync 1m ago • 2.4 MB encrypted state stored locally
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Invite Team Member</h3>
            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Er. Tanvir Rahman"
                  className="w-full bg-slate-800 text-slate-200 rounded px-3 py-2 border border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="tanvir.r@civilguruji.org.bd"
                  className="w-full bg-slate-800 text-slate-200 rounded px-3 py-2 border border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Role Assignment</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as unknown as TeamMember['role'])}
                  className="w-full bg-slate-800 text-slate-200 rounded px-3 py-2 border border-slate-700"
                >
                  <option value="Estimation Engineer">Estimation Engineer</option>
                  <option value="Structural Reviewer">Structural Reviewer</option>
                  <option value="PWD Auditor">PWD Auditor</option>
                  <option value="Chief Engineer (Admin)">Chief Engineer (Admin)</option>
                  <option value="Field Inspector">Field Inspector</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
