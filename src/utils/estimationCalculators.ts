import { TakeoffRow, CostCategorySummary, ProjectCostSummary, UnitSystem, CurrencyCode } from '../types/estimation';
import { CURRENCIES } from '../data/pwdRateSchedule';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Convert metric unit string to imperial unit string
 */
export function getUnitDisplay(unit: string, system: UnitSystem): string {
  if (system === 'metric') return unit;
  switch (unit.toLowerCase()) {
    case 'sqm': return 'sq.ft';
    case 'cum': return 'cu.ft';
    case 'meter':
    case 'm': return 'ft';
    case 'kg': return 'lbs';
    case 'liter': return 'gal';
    default: return unit;
  }
}

/**
 * Convert value between metric and imperial based on unit
 */
export function convertQuantity(value: number, unit: string, system: UnitSystem): number {
  if (system === 'metric') return value;
  switch (unit.toLowerCase()) {
    case 'sqm': return value * 10.7639; // sqm to sq.ft
    case 'cum': return value * 35.3147; // cum to cu.ft
    case 'meter':
    case 'm': return value * 3.28084; // m to ft
    case 'kg': return value * 2.20462; // kg to lbs
    case 'liter': return value * 0.264172; // ltr to gallon
    default: return value;
  }
}

/**
 * Convert rate between metric and imperial
 */
export function convertRate(rateBDT: number, unit: string, system: UnitSystem): number {
  if (system === 'metric') return rateBDT;
  switch (unit.toLowerCase()) {
    case 'sqm': return rateBDT / 10.7639;
    case 'cum': return rateBDT / 35.3147;
    case 'meter':
    case 'm': return rateBDT / 3.28084;
    case 'kg': return rateBDT / 2.20462;
    case 'liter': return rateBDT / 0.264172;
    default: return rateBDT;
  }
}

/**
 * Convert amount in BDT to chosen currency
 */
export function formatCurrency(amountBDT: number = 0, currency: CurrencyCode = 'BDT'): string {
  const config = CURRENCIES[currency] || CURRENCIES.BDT;
  const val = Number.isNaN(Number(amountBDT)) ? 0 : Number(amountBDT);
  const converted = val * (config.rateFromBDT || 1);
  return `${config.symbol || '৳'} ${(converted || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Compute total amount of all rows
 */
export function computeSubtotal(rows: TakeoffRow[]): number {
  return rows.reduce((acc, row) => {
    // If quantity was updated manually or row amount is calculated
    const amt = row.quantity * row.rateBDT;
    return acc + amt;
  }, 0);
}

/**
 * Compute Project Cost Summary including Electrification, Contingency, 25 Units, etc.
 */
export function computeProjectCostSummary(
  rows: TakeoffRow[],
  numberOfUnits: number = 25,
  totalAreaSqm: number = 287.10,
  electrificationPercent: number = 5.0,
  contingencyPercent: number = 3.0,
  vatTaxPercent: number = 0.0
): ProjectCostSummary {
  const subtotalProjectCostBDT = computeSubtotal(rows);
  const electrificationAmountBDT = subtotalProjectCostBDT * (electrificationPercent / 100);
  const totalWithElectrification = subtotalProjectCostBDT + electrificationAmountBDT;
  const contingencyAmountBDT = totalWithElectrification * (contingencyPercent / 100);
  const vatTaxAmountBDT = (totalWithElectrification + contingencyAmountBDT) * (vatTaxPercent / 100);
  const totalCostPerUnitBDT = totalWithElectrification + contingencyAmountBDT + vatTaxAmountBDT;
  const grandTotalCostBDT = totalCostPerUnitBDT * numberOfUnits;
  const costPerSqmBDT = totalAreaSqm > 0 ? totalCostPerUnitBDT / totalAreaSqm : 0;

  return {
    subtotalProjectCostBDT,
    electrificationPercent,
    electrificationAmountBDT,
    contingencyPercent,
    contingencyAmountBDT,
    vatTaxPercent,
    vatTaxAmountBDT,
    totalCostPerUnitBDT,
    numberOfUnits,
    grandTotalCostBDT,
    totalBuildingAreaSqm: totalAreaSqm,
    costPerSqmBDT,
  };
}

/**
 * Group takeoff rows by category for dashboard pie/bar chart and abstract sheet
 */
export function computeCategorySummaries(rows: TakeoffRow[]): CostCategorySummary[] {
  const map: Record<string, { totalQty: number; unit: string; amount: number }> = {};
  const subtotal = computeSubtotal(rows);

  rows.forEach((row) => {
    const cat = row.category || 'Other Works';
    if (!map[cat]) {
      map[cat] = { totalQty: 0, unit: row.unit, amount: 0 };
    }
    map[cat].totalQty += row.quantity;
    map[cat].amount += row.quantity * row.rateBDT;
  });

  return Object.keys(map).map((cat) => {
    const entry = map[cat];
    return {
      category: cat,
      totalQuantity: entry.totalQty,
      unit: entry.unit,
      amountBDT: entry.amount,
      percentageOfTotal: subtotal > 0 ? (entry.amount / subtotal) * 100 : 0,
    };
  });
}

import { ProjectMetadata } from '../components/ProjectMetadataModal';

/**
 * Generate PDF BOQ Report compliant with CPWD / BNBC Bangladesh Standards
 */
export function generatePdfReport(
  projectTitle: string,
  projectNo: string,
  rows: TakeoffRow[],
  summary: ProjectCostSummary,
  unitSystem: UnitSystem,
  currency: CurrencyCode,
  metadata?: ProjectMetadata
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Default metadata if not provided
  const meta: ProjectMetadata = metadata || {
    projectName: projectTitle,
    projectNo: projectNo,
    department: 'CENTRAL PUBLIC WORKS DEPARTMENT (CPWD / PWD 2024)',
    owner: 'Ministry of Home Affairs / Police Housing Authority',
    siteLocation: 'Plot 42, Police Line Road, Mirpur-14, Dhaka-1216, Bangladesh',
    contractorId: 'CON-PWD-2024-88492 (Grade-A License)',
    contractRefNo: 'TENDER-2026/CPWD/BNBC-004',
    engineerInCharge: 'Er. AMRUT AMARSHETTY',
    chiefEngineer: 'Er. Gaurav Singh Rathore',
    preparedBy: 'Estimation & Costing Engineering Team',
  };

  // Colors & Branding
  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const accentColor: [number, number, number] = [37, 99, 235]; // blue-600

  // Title Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL BILL OF QUANTITIES (BOQ) & ABSTRACT ESTIMATE', 14, 13);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${meta.projectName || projectTitle} | Tender No: ${meta.projectNo || projectNo}`, 14, 20);
  doc.text(`BNBC 2020 & CPWD / PWD 2024 Schedule | Units: ${unitSystem.toUpperCase()} | Executing: ${meta.department}`, 14, 26);

  // Formal Embedded Metadata Header Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 35, 182, 28, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 35, 182, 28, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FORMAL SUBMISSION & CADASTRAL PROJECT METADATA', 18, 41);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  // Col 1
  doc.text(`Project Owner / Authority:`, 18, 47);
  doc.setFont('helvetica', 'bold');
  doc.text(`${meta.owner}`, 58, 47);

  doc.setFont('helvetica', 'normal');
  doc.text(`Site Location Address:`, 18, 53);
  doc.setFont('helvetica', 'bold');
  doc.text(`${meta.siteLocation}`, 58, 53);

  doc.setFont('helvetica', 'normal');
  doc.text(`Contract Ref / Tender:`, 18, 58);
  doc.setFont('helvetica', 'bold');
  doc.text(`${meta.contractRefNo || 'TENDER-2026/CPWD-004'}`, 58, 58);

  // Col 2
  doc.setFont('helvetica', 'normal');
  doc.text(`Contractor ID / Reg:`, 130, 47);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(`${meta.contractorId}`, 160, 47);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`Engineer-in-Charge:`, 130, 53);
  doc.setFont('helvetica', 'bold');
  doc.text(`${meta.engineerInCharge}`, 160, 53);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date of Submission:`, 130, 58);
  doc.setFont('helvetica', 'bold');
  doc.text(`${new Date().toLocaleDateString('en-GB')}`, 160, 58);

  // Prepare table data
  const tableData = rows.map((row) => {
    const qty = convertQuantity(row.quantity, row.unit, unitSystem);
    const rate = convertRate(row.rateBDT, row.unit, unitSystem);
    const amount = row.quantity * row.rateBDT;
    const unitStr = getUnitDisplay(row.unit, unitSystem);

    return [
      row.serialNo,
      row.pwdCode,
      row.itemDescription + (row.remarks ? ` (${row.remarks})` : ''),
      qty.toFixed(2),
      unitStr,
      formatCurrency(rate, currency),
      formatCurrency(amount, currency),
    ];
  });

  autoTable(doc, {
    startY: 67,
    head: [['Sr.', 'PWD Code', 'Item Description (BNBC/PWD)', 'Quantity', 'Unit', `Rate (${currency})`, `Total (${currency})`]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: accentColor,
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 16 },
      2: { cellWidth: 74 },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 12 },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 30, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Cost Summary Abstract Section below table
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY, 182, 50, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, finalY, 182, 50, 'S');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`ABSTRACT COST SUMMARY (${meta.projectName || 'STAFF QUARTER'} - ${summary.numberOfUnits} UNITS)`, 18, finalY + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  let rowY = finalY + 14;
  doc.text('Cost of Project (Subtotal Single Unit):', 20, rowY);
  doc.text(formatCurrency(summary.subtotalProjectCostBDT, currency), 150, rowY, { align: 'right' });

  rowY += 5.5;
  doc.text(`Add ${summary.electrificationPercent}% Electrification Charge:`, 20, rowY);
  doc.text(formatCurrency(summary.electrificationAmountBDT, currency), 150, rowY, { align: 'right' });

  rowY += 5.5;
  doc.text('Total Cost of Single Unit (A + B):', 20, rowY);
  doc.text(
    formatCurrency(summary.subtotalProjectCostBDT + summary.electrificationAmountBDT, currency),
    150,
    rowY,
    { align: 'right' }
  );

  rowY += 5.5;
  doc.text(`Add ${summary.contingencyPercent}% Contingency Charge:`, 20, rowY);
  doc.text(formatCurrency(summary.contingencyAmountBDT, currency), 150, rowY, { align: 'right' });

  rowY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total (Single Unit):', 20, rowY);
  doc.text(formatCurrency(summary.totalCostPerUnitBDT, currency), 150, rowY, { align: 'right' });

  rowY += 7;
  doc.setFontSize(10.5);
  doc.setTextColor(37, 99, 235);
  doc.text(`GRAND TOTAL COST OF PROJECT (${summary.numberOfUnits} UNITS):`, 20, rowY);
  doc.text(formatCurrency(summary.grandTotalCostBDT, currency), 180, rowY, { align: 'right' });

  // Formal Submission Signatures Block
  const sigY = finalY + 58;
  if (sigY < 270) {
    doc.setDrawColor(203, 213, 225);
    doc.line(20, sigY, 65, sigY);
    doc.line(82, sigY, 128, sigY);
    doc.line(145, sigY, 190, sigY);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);

    doc.text('Contractor Seal & Signature', 20, sigY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${meta.contractorId}`, 20, sigY + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Engineer-in-Charge', 82, sigY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(`${meta.engineerInCharge}`, 82, sigY + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Chief Engineer Sanction', 145, sigY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(`${meta.chiefEngineer}`, 145, sigY + 8);
  }

  // Footer note
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Official BOQ Submission Document | Owner: ${meta.owner} | Location: ${meta.siteLocation} | BNBC 2020 & CPWD 2024 Compliant`,
    14,
    288
  );

  doc.save(`${(meta.projectNo || projectNo).replace(/[/\\?%*:|"<>]/g, '_')}_Formal_BOQ_Submission.pdf`);
}

/**
 * Compute the total amount in BDT for an individual row
 */
export function calculateRowTotalBDT(row: TakeoffRow): number {
  return row.quantity * row.rateBDT;
}

/**
 * Alias for computing project cost summary
 */
export const calculateProjectSummary = computeProjectCostSummary;

/**
 * Alias for computing category summaries
 */
export const calculateCategorySummaries = computeCategorySummaries;
