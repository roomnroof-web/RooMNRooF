export type UnitSystem = 'metric' | 'imperial';
export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR';
export type LanguageCode = 'en' | 'bn' | 'ar' | 'hi';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromBDT: number; // 1 BDT in Currency
}

export interface PwdRateItem {
  code: string;
  category: string;
  itemDescription: string;
  itemDescriptionBn?: string;
  unitMetric: string;
  unitImperial: string;
  defaultRateBDT: number;
  bnbcReference?: string;
  specifications?: string;
}

export interface TakeoffRow {
  id: string;
  serialNo: string;
  pwdCode: string;
  category: string;
  itemDescription: string;
  itemDescriptionBn?: string;
  isDeduction?: boolean; // True if it's a deduction row (e.g. window/door openings)
  number: number; // 'No' column
  length: number; // L in meters
  width: number; // W in meters
  heightOrDepth: number; // H/D in meters
  quantity: number; // Calculated: number * L * W * H (or negative if isDeduction)
  unit: string;
  rateBDT: number;
  amountBDT: number;
  remarks?: string;
  floor?: 'Substructure' | 'Ground Floor' | 'First Floor' | 'Terrace/Parapet';
}

export interface CostCategorySummary {
  category: string;
  totalQuantity: number;
  unit: string;
  amountBDT: number;
  percentageOfTotal: number;
}

export interface ProjectCostSummary {
  subtotalProjectCostBDT: number;
  electrificationPercent: number;
  electrificationAmountBDT: number;
  contingencyPercent: number;
  contingencyAmountBDT: number;
  vatTaxPercent: number;
  vatTaxAmountBDT: number;
  totalCostPerUnitBDT: number;
  numberOfUnits: number;
  grandTotalCostBDT: number;
  totalBuildingAreaSqm: number;
  costPerSqmBDT: number;
}

export interface ArchitecturalPlanElement {
  id: string;
  type: 'Footing' | 'Column' | 'Ground Beam' | 'Slab Beam' | 'Slab' | 'Door' | 'Window' | 'Staircase' | 'Room';
  code: string; // e.g., F1, GB1, MD, W1
  name: string;
  dimensionsMetric: {
    length: number;
    width: number;
    height: number;
  };
  count: number;
  remarks: string;
}

export interface EstimationProject {
  id: string;
  projectNo: string;
  projectNumber?: string;
  projectName: string;
  projectNameBn: string;
  department: string;
  workDescription: string;
  engineerInCharge: string;
  chiefEngineer: string;
  directorGeneral: string;
  guidedBy: string;
  preparedBy: string;
  lastUpdated: string;
  status: 'Draft' | 'Under Review' | 'Tender Approved' | 'Archived';
  unitSystem: UnitSystem;
  currency: CurrencyCode;
  totalAreaSqm: number;
  numberOfUnits: number;
  totalUnits?: number;
  takeoffRows: TakeoffRow[];
  planElements: ArchitecturalPlanElement[];
  costSummaryConfig: {
    electrificationPercent: number;
    contingencyPercent: number;
    vatTaxPercent: number;
  };
  defaultElectrificationPercent?: number;
  defaultContingencyPercent?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Chief Engineer (Admin)' | 'Estimation Engineer' | 'Structural Reviewer' | 'PWD Auditor' | 'Field Inspector';
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  permissions: {
    editBOQ: boolean;
    editRates: boolean;
    approveTender: boolean;
    viewFinancials: boolean;
    manageTeam: boolean;
  };
  lastActive: string;
  location: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  link?: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  projectNo: string;
  sizeKb: number;
  type: 'Automated Daily' | 'Manual Checkpoint' | 'Tender Freeze';
  encrypted: boolean;
  notes: string;
}

export interface GanttPhase {
  id: string;
  title: string;
  titleBn?: string;
  startWeek: number; // 1-indexed week number
  endWeek: number;
  progressPercent: number;
  linkedCategory: string;
  color: string;
  laborRequired: {
    masons: number;
    helpers: number;
    barBenders: number;
    electricians: number;
    plumbers: number;
  };
  materialDeliveries: {
    id: string;
    materialName: string;
    quantity: number;
    unit: string;
    deliveryWeek: number;
    status: 'Delivered' | 'Scheduled' | 'Pending';
  }[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  nameBn?: string;
  buildingType: string;
  description: string;
  totalUnits: number;
  defaultElectrificationPercent: number;
  defaultContingencyPercent: number;
  takeoffRows: TakeoffRow[];
  isCustom: boolean;
  createdAt: string;
}

export interface PendingChangeItem {
  id: string;
  timestamp: string;
  description: string;
  category: string;
  status: 'pending' | 'syncing' | 'synced';
}

export interface CategoryBudgetBaseline {
  category: string;
  allocatedBDT: number;
  codeRef: string;
  notes?: string;
}
