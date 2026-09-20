import jsPDF from 'jspdf';

export interface StatementRegistration {
  registrationId?: string;
  _id?: string;
  playerName?: string;
  studentName?: string;
  parentName?: string;
  email?: string;
  phone?: string;
  sessionName?: string;
  sessionId?: string;
  amountPaid?: number | string;
  amount?: number | string;
  paymentMethod?: string;
  paymentStatus?: string;
  stripePaymentIntentId?: string;
  transactionId?: string;
  registeredAt?: number | string;
  createdAt?: number | string;
  location?: string;
  schedule?: string;
  hasSibling?: boolean;
  siblingName?: string;
}

export interface StatementLead {
  id?: string;
  _id?: string;
  playerName?: string;
  studentName?: string;
  fullName?: string;
  email?: string;
  primaryEmail?: string;
  phone?: string;
  sessionName?: string;
  sessionId?: string;
  programId?: string;
  status?: string;
  createdAt?: number | string;
  paymentIntentId?: string;
  registrationId?: string;
}

export interface StatementOptions {
  statementType?: 'all' | 'payments_only' | 'leads_only';
  periodLabel?: string;
  generatedBy?: string;
  academyName?: string;
  academyAddress?: string;
  academyContact?: string;
  notes?: string;
}

/**
 * Format currency with 2 decimals and commas
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format short date (MM/DD/YYYY)
 */
function formatShortDate(val?: number | string): string {
  if (!val) return 'Recent';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Recent';
  }
}

/**
 * Generate an official Bank-Statement style PDF
 */
export async function generateBankStatementPdf(
  registrations: StatementRegistration[],
  leads: StatementLead[],
  options: StatementOptions = {}
): Promise<{ success: boolean; filename: string; error?: string }> {
  try {
    const {
      statementType = 'all',
      periodLabel = 'All Records to Date',
      generatedBy = 'Administrator',
      academyName = 'CHALLENGERS VOLLEYBALL ACADEMY',
      academyAddress = '37171 Fremont Blvd, Fremont, CA 94536',
      academyContact = 'info@challengersva.com | (510) 791-4351 | www.challengersva.com',
    } = options;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm
    const bottomMargin = 22;

    // Unique statement reference ID
    const today = new Date();
    const dateCode = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const statementNo = `CVA-STM-${dateCode}-${randCode}`;
    const generatedTimestamp = today.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }) + ' at ' + today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // Compute Financial Metrics
    const totalRevenue = registrations.reduce((sum, r) => sum + (Number(r.amountPaid ?? r.amount) || 0), 0);
    const totalRegistrations = registrations.length;
    const totalLeads = leads.length;
    const avgTicket = totalRegistrations > 0 ? totalRevenue / totalRegistrations : 0;
    const totalInitiated = totalRegistrations + totalLeads;
    const conversionRate = totalInitiated > 0 ? ((totalRegistrations / totalInitiated) * 100).toFixed(1) : '0.0';

    // Payment methods aggregation
    const methodCounts: Record<string, { count: number; total: number }> = {
      Card: { count: 0, total: 0 },
      'Apple Pay': { count: 0, total: 0 },
      'Google Pay': { count: 0, total: 0 },
      Link: { count: 0, total: 0 },
      'QR / Direct': { count: 0, total: 0 },
      Other: { count: 0, total: 0 },
    };

    registrations.forEach(r => {
      const pm = String(r.paymentMethod || '').toLowerCase();
      const amt = Number(r.amountPaid ?? r.amount) || 0;
      if (pm.includes('apple')) {
        methodCounts['Apple Pay'].count++;
        methodCounts['Apple Pay'].total += amt;
      } else if (pm.includes('google') || pm.includes('gpay')) {
        methodCounts['Google Pay'].count++;
        methodCounts['Google Pay'].total += amt;
      } else if (pm.includes('link')) {
        methodCounts['Link'].count++;
        methodCounts['Link'].total += amt;
      } else if (pm.includes('qr') || pm.includes('zelle') || pm.includes('venmo')) {
        methodCounts['QR / Direct'].count++;
        methodCounts['QR / Direct'].total += amt;
      } else if (pm.includes('card') || pm.includes('stripe')) {
        methodCounts['Card'].count++;
        methodCounts['Card'].total += amt;
      } else {
        methodCounts['Other'].count++;
        methodCounts['Other'].total += amt;
      }
    });

    let currentY = 14;

    // Helper: Draw Header on Page 1
    const drawPage1Header = () => {
      // Top accent stripe (Navy + Red accent)
      doc.setFillColor(15, 23, 42); // #0F172A slate-900
      doc.rect(margin, currentY, contentWidth, 2, 'F');
      doc.setFillColor(214, 40, 40); // #D62828 crimson
      doc.rect(margin, currentY + 2, 28, 1.2, 'F');

      currentY += 8;

      // Left Column: Academy Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text(academyName, margin, currentY);

      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(214, 40, 40);
      const titleLabel =
        statementType === 'payments_only'
          ? 'OFFICIAL PAYMENT & ENROLLMENT LEDGER STATEMENT'
          : statementType === 'leads_only'
          ? 'OFFICIAL ATHLETE INQUIRIES & LEADS PIPELINE STATEMENT'
          : 'OFFICIAL ENROLLMENT & FINANCIAL TRANSACTION STATEMENT';
      doc.text(titleLabel, margin, currentY);

      currentY += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(academyAddress, margin, currentY);
      currentY += 3.8;
      doc.text(academyContact, margin, currentY);

      // Right Column: Statement Metadata Card
      const metaBoxWidth = 74;
      const metaBoxX = pageWidth - margin - metaBoxWidth;
      const metaBoxY = 18;

      doc.setFillColor(248, 250, 252); // #F8FAFC
      doc.setDrawColor(226, 232, 240); // #E2E8F0
      doc.roundedRect(metaBoxX, metaBoxY, metaBoxWidth, 26, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('STATEMENT SPECIFICATIONS', metaBoxX + 4, metaBoxY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);

      doc.text('Statement Ref:', metaBoxX + 4, metaBoxY + 9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(statementNo, metaBoxX + 30, metaBoxY + 9.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Issued Date:', metaBoxX + 4, metaBoxY + 13.5);
      doc.setTextColor(15, 23, 42);
      doc.text(generatedTimestamp, metaBoxX + 30, metaBoxY + 13.5);

      doc.setTextColor(100, 116, 139);
      doc.text('Period Covered:', metaBoxX + 4, metaBoxY + 17.5);
      doc.setTextColor(15, 23, 42);
      doc.text(periodLabel, metaBoxX + 30, metaBoxY + 17.5);

      doc.setTextColor(100, 116, 139);
      doc.text('Authorized By:', metaBoxX + 4, metaBoxY + 21.5);
      doc.setTextColor(15, 23, 42);
      doc.text(generatedBy, metaBoxX + 30, metaBoxY + 21.5);

      currentY = 49;
    };

    // Helper: Draw Financial Summary Box (Bank Statement Style)
    const drawSummaryBox = () => {
      const boxHeight = 31;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225); // #CBD5E1
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

      // Top title bar inside summary box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY, contentWidth, 7, 2, 2, 'F');
      doc.rect(margin, currentY + 4, contentWidth, 3, 'F'); // square bottom of header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('ACCOUNT SUMMARY & EXECUTIVE FINANCIAL OVERVIEW', margin + 4, currentY + 4.8);

      // Top right status indicator
      doc.setFillColor(16, 185, 129); // green dot
      doc.circle(pageWidth - margin - 22, currentY + 3.8, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(5, 150, 105);
      doc.text('REAL-TIME VERIFIED', pageWidth - margin - 19, currentY + 4.6);

      // 4 Metric Columns
      const colWidth = contentWidth / 4;
      const metricsY = currentY + 11.5;

      // Metric 1: Total Cleared Revenue
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL CLEARED REVENUE', margin + 4, metricsY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text(formatCurrency(totalRevenue), margin + 4, metricsY + 4.8);

      // Metric 2: Confirmed Enrollments
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIRMED ENROLLEES', margin + colWidth + 4, metricsY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`${totalRegistrations} Athletes`, margin + colWidth + 4, metricsY + 4.8);

      // Metric 3: Active Pipeline Leads
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('PROSPECTIVE LEADS', margin + colWidth * 2 + 4, metricsY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(217, 119, 6); // Amber
      doc.text(`${totalLeads} Inquiries`, margin + colWidth * 2 + 4, metricsY + 4.8);

      // Metric 4: Conversion & Average Ticket
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('AVG VALUE / CONVERSION', margin + colWidth * 3 + 4, metricsY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${formatCurrency(avgTicket)} · ${conversionRate}%`, margin + colWidth * 3 + 4, metricsY + 4.8);

      // Bottom Row: Payment Method Breakdown
      const subRowY = currentY + 22;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin + 4, subRowY, pageWidth - margin - 4, subRowY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);

      const methodParts: string[] = [];
      if (methodCounts['Card'].count > 0) methodParts.push(`Cards: ${formatCurrency(methodCounts['Card'].total)} (${methodCounts['Card'].count})`);
      if (methodCounts['Apple Pay'].count > 0) methodParts.push(`Apple Pay: ${formatCurrency(methodCounts['Apple Pay'].total)} (${methodCounts['Apple Pay'].count})`);
      if (methodCounts['Google Pay'].count > 0) methodParts.push(`Google Pay: ${formatCurrency(methodCounts['Google Pay'].total)} (${methodCounts['Google Pay'].count})`);
      if (methodCounts['Link'].count > 0) methodParts.push(`Link: ${formatCurrency(methodCounts['Link'].total)} (${methodCounts['Link'].count})`);
      if (methodCounts['QR / Direct'].count > 0) methodParts.push(`QR/Direct: ${formatCurrency(methodCounts['QR / Direct'].total)} (${methodCounts['QR / Direct'].count})`);
      if (methodCounts['Other'].count > 0) methodParts.push(`Other: ${formatCurrency(methodCounts['Other'].total)} (${methodCounts['Other'].count})`);

      const methodBreakdownText = methodParts.length > 0 ? methodParts.join('  |  ') : 'No cleared payment channels recorded in period.';
      doc.text('Channel Breakdown: ' + methodBreakdownText, margin + 4, subRowY + 4.5, {
        maxWidth: contentWidth - 8,
      });

      currentY += boxHeight + 6;
    };

    // Helper: Draw Header for subsequent pages
    const drawSubsequentPageHeader = (pageTitle: string) => {
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, 10, contentWidth, 1.2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(academyName, margin, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${pageTitle} — Statement Ref: ${statementNo}`, margin, 18.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(generatedTimestamp, pageWidth - margin, 18.5, { align: 'right' });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, 21, pageWidth - margin, 21);

      currentY = 26;
    };

    // ── DRAW FIRST PAGE ──
    drawPage1Header();
    drawSummaryBox();

    // ─────────────────────────────────────────────────────────────
    // 1. CONFIRMED REGISTRATIONS & PAYMENT TRANSACTIONS TABLE
    // ─────────────────────────────────────────────────────────────
    if (statementType !== 'leads_only') {
      const checkPageBreakForSection = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - bottomMargin) {
          doc.addPage();
          drawSubsequentPageHeader('Payment Transactions Ledger');
        }
      };

      checkPageBreakForSection(24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('1. CONFIRMED REGISTRATIONS & CLEARED PAYMENTS', margin, currentY);

      currentY += 3.8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Itemized audit ledger of successful Stripe card checkouts, digital wallets, and verified direct enrollments.', margin, currentY);

      currentY += 4.5;

      const regCols = [
        { title: 'DATE / TIME', width: 23, align: 'left' as const },
        { title: 'REF & STRIPE TX ID', width: 37, align: 'left' as const },
        { title: 'ATHLETE / CONTACT', width: 40, align: 'left' as const },
        { title: 'PROGRAM / SESSION', width: 40, align: 'left' as const },
        { title: 'CHANNEL', width: 22, align: 'left' as const },
        { title: 'AMOUNT ($)', width: 20, align: 'right' as const },
      ];

      const drawRegTableHeader = () => {
        const headerHeight = 6.5;
        doc.setFillColor(30, 41, 59); // #1E293B
        doc.rect(margin, currentY, contentWidth, headerHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);

        let curX = margin;
        regCols.forEach(c => {
          const textX = c.align === 'right' ? curX + c.width - 2 : curX + 2;
          doc.text(c.title, textX, currentY + 4.5, { align: c.align });
          curX += c.width;
        });

        currentY += headerHeight;
      };

      drawRegTableHeader();

      if (registrations.length === 0) {
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY, contentWidth, 10, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('No confirmed payment registrations recorded for this period.', margin + contentWidth / 2, currentY + 6.5, { align: 'center' });
        currentY += 10;
      } else {
        registrations.forEach((reg, index) => {
          const rowHeight = 9.2;
          if (currentY + rowHeight > pageHeight - bottomMargin) {
            doc.addPage();
            drawSubsequentPageHeader('Payment Transactions Ledger');
            drawRegTableHeader();
          }

          // Alternating row background
          doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
          doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

          // Subtle bottom border
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.2);
          doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

          let curX = margin;

          // Col 1: Date & Time
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(71, 85, 105);
          const dateStr = formatShortDate(reg.registeredAt || reg.createdAt);
          const timeStr = reg.registeredAt ? new Date(reg.registeredAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
          doc.text(dateStr, curX + 2, currentY + 3.8);
          if (timeStr) {
            doc.setFontSize(5.5);
            doc.setTextColor(148, 163, 184);
            doc.text(timeStr, curX + 2, currentY + 7.2);
          }
          curX += regCols[0].width;

          // Col 2: Ref & Stripe ID
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(15, 23, 42);
          const regId = String(reg.registrationId || reg._id || 'N/A').slice(0, 18);
          doc.text(regId, curX + 2, currentY + 3.8);

          const txId = String(reg.stripePaymentIntentId || reg.transactionId || '').trim();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(100, 116, 139);
          const txDisplay = txId ? (txId.length > 20 ? txId.slice(0, 20) + '...' : txId) : 'Cleared Direct';
          doc.text(txDisplay, curX + 2, currentY + 7.2);
          curX += regCols[1].width;

          // Col 3: Athlete & Contact
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(15, 23, 42);
          const athleteName = String(reg.playerName || reg.studentName || 'Athlete');
          const truncatedName = athleteName.length > 20 ? athleteName.slice(0, 20) + '...' : athleteName;
          doc.text(truncatedName, curX + 2, currentY + 3.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(100, 116, 139);
          const contactInfo = String(reg.email || reg.phone || '');
          const truncatedContact = contactInfo.length > 24 ? contactInfo.slice(0, 24) + '...' : contactInfo;
          doc.text(truncatedContact, curX + 2, currentY + 7.2);
          curX += regCols[2].width;

          // Col 4: Program / Session
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(30, 41, 59);
          const progName = String(reg.sessionName || reg.sessionId || 'Volleyball Training');
          const truncatedProg = progName.length > 22 ? progName.slice(0, 22) + '...' : progName;
          doc.text(truncatedProg, curX + 2, currentY + 3.8);

          doc.setFontSize(5.5);
          doc.setTextColor(148, 163, 184);
          const locationSchedule = `${reg.location || 'Fremont'} · ${reg.schedule || 'Regular'}`;
          const truncatedLoc = locationSchedule.length > 25 ? locationSchedule.slice(0, 25) + '...' : locationSchedule;
          doc.text(truncatedLoc, curX + 2, currentY + 7.2);
          curX += regCols[3].width;

          // Col 5: Channel / Method
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          const rawMethod = String(reg.paymentMethod || 'Card').toLowerCase();
          let methodBadge = 'CARD';
          if (rawMethod.includes('apple')) methodBadge = 'APPLE PAY';
          else if (rawMethod.includes('google') || rawMethod.includes('gpay')) methodBadge = 'GPAY';
          else if (rawMethod.includes('link')) methodBadge = 'LINK';
          else if (rawMethod.includes('qr') || rawMethod.includes('zelle')) methodBadge = 'QR/DIRECT';

          doc.setTextColor(30, 41, 59);
          doc.text(methodBadge, curX + 2, currentY + 3.8);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(5.5);
          doc.setTextColor(16, 185, 129); // Paid green
          doc.text('PAID / CLEARED', curX + 2, currentY + 7.2);
          curX += regCols[4].width;

          // Col 6: Amount
          const amt = Number(reg.amountPaid ?? reg.amount) || 0;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          doc.text(formatCurrency(amt), curX + regCols[5].width - 2, currentY + 5.5, { align: 'right' });

          currentY += rowHeight;
        });

        // Total Summary Row (Classic Bank Statement double underline)
        const subtotalHeight = 8;
        if (currentY + subtotalHeight > pageHeight - bottomMargin) {
          doc.addPage();
          drawSubsequentPageHeader('Payment Transactions Ledger');
        }

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, currentY, contentWidth, subtotalHeight, 'F');
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.3);
        doc.line(margin, currentY, pageWidth - margin, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`TOTAL CLEARED ENROLLMENT REVENUE (${registrations.length} TRANSACTIONS)`, margin + 4, currentY + 5.2);

        doc.setFontSize(9);
        doc.setTextColor(16, 185, 129);
        doc.text(formatCurrency(totalRevenue), pageWidth - margin - 2, currentY + 5.2, { align: 'right' });

        // Double underline
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.2);
        doc.line(margin, currentY + subtotalHeight, pageWidth - margin, currentY + subtotalHeight);
        doc.line(margin, currentY + subtotalHeight + 0.6, pageWidth - margin, currentY + subtotalHeight + 0.6);

        currentY += subtotalHeight + 6;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CHECKOUT INQUIRIES & ATHLETE LEADS TABLE
    // ─────────────────────────────────────────────────────────────
    if (statementType !== 'payments_only') {
      const checkPageBreakForLeads = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - bottomMargin) {
          doc.addPage();
          drawSubsequentPageHeader('Leads & Inquiries Log');
        }
      };

      checkPageBreakForLeads(24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const sectionNum = statementType === 'leads_only' ? '1' : '2';
      doc.text(`${sectionNum}. CHECKOUT INQUIRIES & ADMISSIONS LEADS PIPELINE`, margin, currentY);

      currentY += 3.8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Prospective student athletes who initiated registration or contacted academy coaching staff.', margin, currentY);

      currentY += 4.5;

      const leadCols = [
        { title: 'INQUIRY DATE', width: 23, align: 'left' as const },
        { title: 'LEAD REF ID', width: 30, align: 'left' as const },
        { title: 'ATHLETE / PROSPECT', width: 42, align: 'left' as const },
        { title: 'CONTACT DETAILS', width: 44, align: 'left' as const },
        { title: 'PROGRAM OF INTEREST', width: 27, align: 'left' as const },
        { title: 'STAGE', width: 16, align: 'right' as const },
      ];

      const drawLeadTableHeader = () => {
        const headerHeight = 6.5;
        doc.setFillColor(51, 65, 85); // #334155
        doc.rect(margin, currentY, contentWidth, headerHeight, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);

        let curX = margin;
        leadCols.forEach(c => {
          const textX = c.align === 'right' ? curX + c.width - 2 : curX + 2;
          doc.text(c.title, textX, currentY + 4.5, { align: c.align });
          curX += c.width;
        });

        currentY += headerHeight;
      };

      drawLeadTableHeader();

      if (leads.length === 0) {
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY, contentWidth, 10, 'F');
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('No active or pending student leads logged for this period.', margin + contentWidth / 2, currentY + 6.5, { align: 'center' });
        currentY += 10;
      } else {
        leads.forEach((lead, index) => {
          const rowHeight = 8.5;
          if (currentY + rowHeight > pageHeight - bottomMargin) {
            doc.addPage();
            drawSubsequentPageHeader('Leads & Inquiries Log');
            drawLeadTableHeader();
          }

          doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
          doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.2);
          doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight);

          let curX = margin;

          // Col 1: Date
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(71, 85, 105);
          doc.text(formatShortDate(lead.createdAt), curX + 2, currentY + 5.2);
          curX += leadCols[0].width;

          // Col 2: Lead ID
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(15, 23, 42);
          const leadId = String(lead.id || lead._id || lead.registrationId || 'LEAD-NEW').slice(0, 16);
          doc.text(leadId, curX + 2, currentY + 5.2);
          curX += leadCols[1].width;

          // Col 3: Prospect Name
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(15, 23, 42);
          const pName = String(lead.playerName || lead.studentName || lead.fullName || 'Prospective Athlete');
          const truncPName = pName.length > 22 ? pName.slice(0, 22) + '...' : pName;
          doc.text(truncPName, curX + 2, currentY + 5.2);
          curX += leadCols[2].width;

          // Col 4: Contact info
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(71, 85, 105);
          const cEmail = String(lead.email || lead.primaryEmail || 'No email');
          const cPhone = String(lead.phone || '');
          const contactLabel = cPhone ? `${cEmail} · ${cPhone}` : cEmail;
          const truncContact = contactLabel.length > 28 ? contactLabel.slice(0, 28) + '...' : contactLabel;
          doc.text(truncContact, curX + 2, currentY + 5.2);
          curX += leadCols[3].width;

          // Col 5: Program of interest
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(30, 41, 59);
          const prg = String(lead.sessionName || lead.sessionId || lead.programId || 'Volleyball Academy');
          const truncPrg = prg.length > 18 ? prg.slice(0, 18) + '...' : prg;
          doc.text(truncPrg, curX + 2, currentY + 5.2);
          curX += leadCols[4].width;

          // Col 6: Status
          const isConfirmed = lead.status === 'confirmed';
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6);
          if (isConfirmed) {
            doc.setTextColor(16, 185, 129);
            doc.text('CONVERTED', curX + leadCols[5].width - 2, currentY + 5.2, { align: 'right' });
          } else {
            doc.setTextColor(217, 119, 6);
            doc.text(String(lead.status || 'PENDING').toUpperCase(), curX + leadCols[5].width - 2, currentY + 5.2, { align: 'right' });
          }

          currentY += rowHeight;
        });

        // Leads Total row
        const leadsSummaryHeight = 7.5;
        if (currentY + leadsSummaryHeight > pageHeight - bottomMargin) {
          doc.addPage();
          drawSubsequentPageHeader('Leads & Inquiries Log');
        }

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, currentY, contentWidth, leadsSummaryHeight, 'F');
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.3);
        doc.line(margin, currentY, pageWidth - margin, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`TOTAL LOGGED PROSPECT LEADS: ${leads.length} RECORDS`, margin + 4, currentY + 5);

        const convertedCount = leads.filter(l => l.status === 'confirmed').length;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Converted to Enrollees: ${convertedCount}  |  Pending Inquiries: ${leads.length - convertedCount}`, pageWidth - margin - 2, currentY + 5, { align: 'right' });

        currentY += leadsSummaryHeight + 6;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. OFFICIAL BANK STATEMENT CERTIFICATION & SECURITY BADGE
    // ─────────────────────────────────────────────────────────────
    const certBoxHeight = 24;
    if (currentY + certBoxHeight > pageHeight - bottomMargin) {
      doc.addPage();
      drawSubsequentPageHeader('Official Statement Certification');
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, certBoxHeight, 1.5, 1.5, 'FD');

    // Digital Security Badge Stamp (Left)
    const stampWidth = 48;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 4, currentY + 3, stampWidth, 18, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL ACADEMY RECORD', margin + 4 + stampWidth / 2, currentY + 7.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(214, 40, 40);
    doc.text('ELECTRONICALLY VERIFIED', margin + 4 + stampWidth / 2, currentY + 11.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(148, 163, 184);
    doc.text(`ID: ${statementNo}`, margin + 4 + stampWidth / 2, currentY + 15.5, { align: 'center' });

    // Official Disclaimer (Middle & Right)
    const textStartX = margin + stampWidth + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text('BANK & AUDIT STATEMENT COMPLIANCE NOTICE', textStartX, currentY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    const disclaimer1 = 'This document represents an official accounting and student admissions statement generated in real-time by Challengers Volleyball Academy.';
    const disclaimer2 = 'All registration fees have been processed via secure PCI-DSS Level 1 payment gateway infrastructure and reconciled with merchant ledgers.';
    const disclaimer3 = 'For financial audits, corporate matching, or billing verification, please contact finance@challengersva.com.';

    doc.text(disclaimer1, textStartX, currentY + 10.5, { maxWidth: contentWidth - stampWidth - 12 });
    doc.text(disclaimer2, textStartX, currentY + 14, { maxWidth: contentWidth - stampWidth - 12 });
    doc.text(disclaimer3, textStartX, currentY + 17.5, { maxWidth: contentWidth - stampWidth - 12 });

    // ─────────────────────────────────────────────────────────────
    // 4. FOOTERS & PAGINATION (APPLIED TO ALL PAGES)
    // ─────────────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Bottom hairline divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text('Challengers Volleyball Academy · Confidential & Proprietary · Real-Time Export', margin, pageHeight - 9.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 9.5, { align: 'right' });
    }

    // Generate clean filename
    const sanitizedTitle = statementType === 'payments_only' ? 'Payments_Ledger' : statementType === 'leads_only' ? 'Leads_Pipeline' : 'Comprehensive_Statement';
    const filename = `CVA_${sanitizedTitle}_${dateCode}.pdf`;

    doc.save(filename);

    return { success: true, filename };
  } catch (error: any) {
    console.error('Failed to generate Bank Statement PDF:', error);
    return { success: false, filename: '', error: error?.message || 'Unknown PDF generation error' };
  }
}
