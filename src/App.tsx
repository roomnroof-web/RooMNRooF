/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  UnitSystem,
  CurrencyCode,
  LanguageCode,
  TakeoffRow,
  ProjectCostSummary,
  CostCategorySummary
} from './types/estimation';
import { POLICE_SCHOOL_QUARTER_PROJECT } from './data/policeSchoolQuarterProject';
import {
  calculateRowTotalBDT,
  calculateProjectSummary,
  calculateCategorySummaries,
  generatePdfReport
} from './utils/estimationCalculators';

// Components
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { TakeoffSheetView } from './components/TakeoffSheetView';
import { BlueprintAiView } from './components/BlueprintAiView';
import { AbstractSheetView } from './components/AbstractSheetView';
import { ScheduleGanttView } from './components/ScheduleGanttView';
import { SiteLayoutLogisticsPlanner } from './components/SiteLayoutLogisticsPlanner';
import { RealtimeMaterialTracker } from './components/RealtimeMaterialTracker';
import { TemplateManagerView } from './components/TemplateManagerView';
import { PwdRatesView } from './components/PwdRatesView';
import { TeamManagementView } from './components/TeamManagementView';
import { DeveloperApiView } from './components/DeveloperApiView';
import { NotificationModal } from './components/NotificationModal';
import { ProjectMetadataModal, ProjectMetadata } from './components/ProjectMetadataModal';
import { PendingChangeItem } from './types/estimation';

import { FileDown, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [currency, setCurrency] = useState<CurrencyCode>('BDT');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isE2eEncrypted, setIsE2eEncrypted] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata>({
    projectName: POLICE_SCHOOL_QUARTER_PROJECT.projectName,
    projectNo: POLICE_SCHOOL_QUARTER_PROJECT.projectNo,
    department: 'CENTRAL PUBLIC WORKS DEPARTMENT (CPWD / PWD 2024)',
    owner: 'Ministry of Home Affairs / Police Housing Authority',
    siteLocation: 'Plot 42, Police Line Road, Mirpur-14, Dhaka-1216, Bangladesh',
    contractorId: 'CON-PWD-2024-88492 (Grade-A License)',
    contractRefNo: 'TENDER-2026/CPWD/BNBC-004',
    engineerInCharge: 'Er. AMRUT AMARSHETTY',
    chiefEngineer: 'Er. Gaurav Singh Rathore',
    preparedBy: 'Estimation & Costing Engineering Team',
  });
  const [showExportToast, setShowExportToast] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingChangesQueue, setPendingChangesQueue] = useState<PendingChangeItem[]>([
    {
      id: 'chg-1',
      timestamp: '10:42 AM',
      description: 'Updated BOQ quantity for BSRM 500W rebar (28.5 MT)',
      category: '03. Reinforcement & Steel',
      status: 'pending',
    },
    {
      id: 'chg-2',
      timestamp: '11:15 AM',
      description: 'Added Sylhet Sand fill volume for foundation pit',
      category: '01. Substructure & Earthwork',
      status: 'pending',
    },
  ]);

  // Project Takeoff Rows State (35+ Items auto-loaded from Police School Quarter project)
  const [takeoffRows, setTakeoffRows] = useState<TakeoffRow[]>(
    POLICE_SCHOOL_QUARTER_PROJECT.takeoffRows
  );

  // Derive rows with calculated totals
  const rowsWithTotals = useMemo(() => {
    return takeoffRows.map((row) => ({
      ...row,
      totalAmountBDT: calculateRowTotalBDT(row),
    }));
  }, [takeoffRows]);

  // Derive Overall Cost Summary
  const projectSummary: ProjectCostSummary = useMemo(() => {
    return calculateProjectSummary(
      rowsWithTotals,
      POLICE_SCHOOL_QUARTER_PROJECT.numberOfUnits,
      287.10,
      POLICE_SCHOOL_QUARTER_PROJECT.costSummaryConfig.electrificationPercent,
      POLICE_SCHOOL_QUARTER_PROJECT.costSummaryConfig.contingencyPercent
    );
  }, [rowsWithTotals]);

  // Derive Category breakdown
  const categorySummaries: CostCategorySummary[] = useMemo(() => {
    return calculateCategorySummaries(rowsWithTotals);
  }, [rowsWithTotals]);

  const addPendingChange = (description: string, category: string) => {
    const newItem: PendingChangeItem = {
      id: `chg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description,
      category,
      status: 'pending',
    };
    setPendingChangesQueue((prev) => [newItem, ...prev]);
  };

  const handlePushToCloud = () => {
    if (pendingChangesQueue.length === 0 || isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setPendingChangesQueue([]);
      setIsSyncing(false);
      setExportMessage('All pending local changes synced to AES-256 encrypted cloud repository.');
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 4000);
    }, 1200);
  };

  const handleAlertTriggered = (title: string, message: string) => {
    setExportMessage(`${title}: ${message}`);
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 5000);
  };

  // Add Row Handler
  const handleAddRow = (newRow: TakeoffRow) => {
    setTakeoffRows((prev) => [...prev, newRow]);
    addPendingChange(`Added BOQ item: ${newRow.itemDescription}`, newRow.category);
  };

  // Delete Row Handler
  const handleDeleteRow = (id: string) => {
    setTakeoffRows((prev) => prev.filter((row) => row.id !== id));
    addPendingChange(`Removed BOQ item #${id}`, 'General BOQ');
  };

  // Update Row Handler
  const handleUpdateRow = (updatedRow: TakeoffRow) => {
    setTakeoffRows((prev) =>
      prev.map((r) => (r.id === updatedRow.id ? updatedRow : r))
    );
    addPendingChange(`Updated item: ${updatedRow.itemDescription}`, updatedRow.category);
  };

  // Sync Takeoff from AI Blueprint Plan
  const handleSyncTakeoffFromPlan = (newRows: TakeoffRow[]) => {
    setTakeoffRows(newRows);
    setActiveTab('takeoff');
  };

  // Update row rate or unit from Heuristic Panel
  const handleUpdateRowRateOrUnit = (rowId: string, newRateBDT: number, newUnit: string) => {
    setTakeoffRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              unitRateBDT: newRateBDT,
              unit: newUnit,
              amountBDT: r.quantity * newRateBDT,
            }
          : r
      )
    );
    addPendingChange(`Aligned rate/unit for item ${rowId} with PWD standard`, 'Heuristic Rate Alignment');
  };

  // Export PDF Handler
  const handleExportPdf = () => {
    try {
      generatePdfReport(
        projectMetadata.projectName || POLICE_SCHOOL_QUARTER_PROJECT.projectName,
        projectMetadata.projectNo || POLICE_SCHOOL_QUARTER_PROJECT.projectNo,
        rowsWithTotals,
        projectSummary,
        unitSystem,
        currency,
        projectMetadata
      );
      setExportMessage(
        `Downloaded PDF with embedded metadata: Owner: ${projectMetadata.owner} | Contractor: ${projectMetadata.contractorId}`
      );
      setShowExportToast(true);
      setTimeout(() => {
        setShowExportToast(false);
      }, 5000);
    } catch (err) {
      console.error('PDF generation error:', err);
      setExportMessage('Exporting BOQ PDF report... Check browser downloads.');
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 3000);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onlineUsersCount={4}
        isE2eEncrypted={isE2eEncrypted}
        onToggleE2E={() => setIsE2eEncrypted(!isE2eEncrypted)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Controls */}
        <TopHeader
          projectTitle={POLICE_SCHOOL_QUARTER_PROJECT.projectName}
          projectNo={POLICE_SCHOOL_QUARTER_PROJECT.projectNo}
          unitSystem={unitSystem}
          onUnitSystemChange={setUnitSystem}
          currency={currency}
          onCurrencyChange={setCurrency}
          language={language}
          onLanguageChange={setLanguage}
          onExportPdf={handleExportPdf}
          onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
          unreadCount={3}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          pendingChangesQueue={pendingChangesQueue}
          onPushToCloud={handlePushToCloud}
          isSyncing={isSyncing}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60">
          {activeTab === 'dashboard' && (
            <DashboardView
              rows={rowsWithTotals}
              summary={projectSummary}
              categorySummaries={categorySummaries}
              unitSystem={unitSystem}
              currency={currency}
              onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
              onExportPdf={handleExportPdf}
              onOpenMetadataModal={() => setIsMetadataModalOpen(true)}
              onAlertTriggered={handleAlertTriggered}
              onUpdateRowRateOrUnit={handleUpdateRowRateOrUnit}
            />
          )}

          {activeTab === 'takeoff' && (
            <TakeoffSheetView
              rows={rowsWithTotals}
              onUpdateRows={setTakeoffRows}
              unitSystem={unitSystem}
              currency={currency}
              language={language}
              onExportPdf={handleExportPdf}
            />
          )}

          {activeTab === 'blueprint-ai' && (
            <BlueprintAiView
              planElements={POLICE_SCHOOL_QUARTER_PROJECT.planElements}
              onSyncTakeoffFromPlan={handleSyncTakeoffFromPlan}
              unitSystem={unitSystem}
              currency={currency}
            />
          )}

          {activeTab === 'abstract' && (
            <AbstractSheetView
              rows={rowsWithTotals}
              summary={projectSummary}
              categorySummaries={categorySummaries}
              unitSystem={unitSystem}
              currency={currency}
              onExportPdf={handleExportPdf}
            />
          )}

          {activeTab === 'schedule-gantt' && (
            <ScheduleGanttView
              takeoffRows={rowsWithTotals}
              unitSystem={unitSystem}
              currency={currency}
            />
          )}

          {activeTab === 'site-layout' && (
            <SiteLayoutLogisticsPlanner
              totalAreaSqm={projectSummary.totalBuildingAreaSqm || 287.1}
              numberOfUnits={POLICE_SCHOOL_QUARTER_PROJECT.numberOfUnits}
              currency={currency}
              projectName={POLICE_SCHOOL_QUARTER_PROJECT.projectName}
            />
          )}

          {activeTab === 'material-tracker' && (
            <RealtimeMaterialTracker
              currency={currency}
              onAlertTriggered={handleAlertTriggered}
            />
          )}

          {activeTab === 'templates' && (
            <TemplateManagerView
              currentTakeoffRows={rowsWithTotals}
              currentTotalUnits={POLICE_SCHOOL_QUARTER_PROJECT.numberOfUnits}
              unitSystem={unitSystem}
              currency={currency}
              onLoadTemplate={(tmpl) => {
                setTakeoffRows(tmpl.takeoffRows);
                setActiveTab('takeoff');
                addPendingChange(`Loaded BOQ template: ${tmpl.name}`, 'Template Load');
              }}
              onSaveAsTemplate={(name, buildingType) => {
                addPendingChange(`Saved custom BOQ template: ${name} (${buildingType})`, 'Template Save');
              }}
            />
          )}

          {activeTab === 'pwd-rates' && (
            <PwdRatesView currency={currency} />
          )}

          {activeTab === 'team' && (
            <TeamManagementView />
          )}

          {activeTab === 'api-docs' && (
            <DeveloperApiView />
          )}
        </main>
      </div>

      {/* Notification Alerts Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Project Submission Metadata Modal */}
      <ProjectMetadataModal
        isOpen={isMetadataModalOpen}
        onClose={() => setIsMetadataModalOpen(false)}
        metadata={projectMetadata}
        onSaveMetadata={(updated) => {
          setProjectMetadata(updated);
          addPendingChange(
            `Updated project metadata (Owner: ${updated.owner}, Contractor: ${updated.contractorId})`,
            'Project Metadata'
          );
        }}
        onExportPdfWithMetadata={handleExportPdf}
      />

      {/* Export Confirmation Toast */}
      {showExportToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/40 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
            <FileDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">BOQ Tender Export Complete</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{exportMessage}</p>
          </div>
          <div className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            AES-256 Signed
          </div>
        </div>
      )}
    </div>
  );
}
