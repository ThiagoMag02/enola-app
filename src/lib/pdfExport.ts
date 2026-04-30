import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateLocal } from './utils';

export interface PdfExportConfig {
  title: string;
  subtitle?: string;
  columns: { header: string; dataKey: string; align?: 'left' | 'center' | 'right' }[];
  data: Record<string, any>[];
  fileName: string;
  /** Optional KPI summary cards to display above the table */
  summaryCards?: { label: string; value: string; color?: 'emerald' | 'rose' | 'blue' | 'amber' | 'purple' | 'indigo' }[];
  /** Orientation: portrait or landscape */
  orientation?: 'portrait' | 'landscape';
}

const COLORS = {
  primary: [15, 23, 42] as [number, number, number],       // slate-900
  accent: [16, 185, 129] as [number, number, number],      // emerald-500
  textDark: [30, 41, 59] as [number, number, number],      // slate-800
  textMedium: [100, 116, 139] as [number, number, number], // slate-500
  textLight: [148, 163, 184] as [number, number, number],  // slate-400
  headerBg: [30, 41, 59] as [number, number, number],      // slate-800
  headerText: [226, 232, 240] as [number, number, number], // slate-200
  rowEven: [248, 250, 252] as [number, number, number],    // slate-50
  rowOdd: [255, 255, 255] as [number, number, number],     // white
  border: [226, 232, 240] as [number, number, number],     // slate-200
  cardColors: {
    emerald: [5, 150, 105] as [number, number, number],
    rose: [225, 29, 72] as [number, number, number],
    blue: [37, 99, 235] as [number, number, number],
    amber: [217, 119, 6] as [number, number, number],
    purple: [147, 51, 234] as [number, number, number],
    indigo: [99, 102, 241] as [number, number, number],
  }
};

export function exportToPdf(config: PdfExportConfig) {
  const { title, subtitle, columns, data, fileName, summaryCards, orientation = 'landscape' } = config;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  // ─── HEADER BAR ───────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent line
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 28, pageWidth, 1.2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), margin, 12);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, margin, 18);
  }

  // Date stamp
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generado: ${dateStr} a las ${timeStr}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`${data.length} registro${data.length !== 1 ? 's' : ''}`, pageWidth - margin, 17, { align: 'right' });

  currentY = 34;

  // ─── SUMMARY CARDS ────────────────────────────────────────────
  if (summaryCards && summaryCards.length > 0) {
    const cardCount = summaryCards.length;
    const totalWidth = pageWidth - margin * 2;
    const cardGap = 4;
    const cardWidth = (totalWidth - (cardCount - 1) * cardGap) / cardCount;
    const cardHeight = 16;

    summaryCards.forEach((card, i) => {
      const x = margin + i * (cardWidth + cardGap);
      const colorKey = card.color || 'blue';
      const color = COLORS.cardColors[colorKey] || COLORS.cardColors.blue;

      // Card background with subtle border
      doc.setFillColor(250, 250, 252);
      doc.setDrawColor(...color);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

      // Color accent bar on left
      doc.setFillColor(...color);
      doc.rect(x, currentY, 1.5, cardHeight, 'F');

      // Label
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(card.label.toUpperCase(), x + 5, currentY + 5.5);

      // Value
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.textDark);
      doc.text(card.value, x + 5, currentY + 12.5);
    });

    currentY += cardHeight + 6;
  }

  // ─── TABLE ────────────────────────────────────────────────────
  const headers = columns.map(c => c.header);
  const rows = data.map(row => columns.map(c => {
    const val = row[c.dataKey];
    if (val === null || val === undefined) return '---';
    return String(val);
  }));

  const columnStyles: Record<number, any> = {};
  columns.forEach((col, i) => {
    if (col.align === 'right') {
      columnStyles[i] = { halign: 'right' };
    } else if (col.align === 'center') {
      columnStyles[i] = { halign: 'center' };
    }
  });

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: currentY,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      font: 'helvetica',
      textColor: COLORS.textDark,
      lineColor: COLORS.border,
      lineWidth: 0.15,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: COLORS.headerBg,
      textColor: COLORS.headerText,
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 4,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLORS.rowEven,
    },
    bodyStyles: {
      fillColor: COLORS.rowOdd,
    },
    columnStyles,
    didDrawPage: (pageData: any) => {
      // Footer on each page
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(6.5);
      doc.setTextColor(...COLORS.textLight);
      doc.setFont('helvetica', 'normal');

      // Left: title
      doc.text(title, margin, pageHeight - 6);

      // Center: page number
      const pageText = `Página ${pageData.pageNumber} de ${pageNum}`;
      doc.text(pageText, pageWidth / 2, pageHeight - 6, { align: 'center' });

      // Right: app name
      doc.text('ENOLA • Sistema de Gestión', pageWidth - margin, pageHeight - 6, { align: 'right' });

      // Footer line
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    },
  });

  // Save
  doc.save(`${fileName}.pdf`);
}

// ─── HELPER FORMATTERS ──────────────────────────────────────────

export function fmtCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '---';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '---';
  return `$${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
}

export function fmtDate(dateString: string | null | undefined): string {
  return formatDateLocal(dateString, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtStatus(status: string | null | undefined, map?: Record<string, string>): string {
  if (!status) return '---';
  if (map && map[status]) return map[status];
  return status;
}
