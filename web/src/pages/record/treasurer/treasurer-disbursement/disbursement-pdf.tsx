import { jsPDF } from "jspdf";
import { DisbursementFile } from "./incDisb-types";

export interface DisbursementPdfData {
  dis_num: any;
  dis_payee: string;
  dis_tin: string;
  dis_date: string;
  dis_fund: number;
  dis_particulars: Array<{ forPayment: string; tax: number; amount: number }>;
  dis_checknum: string;
  dis_bank: string;
  dis_or_num: string;
  dis_paydate: string;
  dis_payacc: Array<{ account: string; accCode: string; debit: number; credit: number }>;
  staff_name?: string;
  files?: DisbursementFile[];
}

export const generateDisbursementPdf = async (data: DisbursementPdfData, preview = false) => {
  const pageSize = [612, 1008];
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: pageSize,
  });

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  const margin = 72;
  let yPos = margin;
  const pageWidth = pageSize[0];
  const pageHeight = pageSize[1] - margin * 2;
  const lineHeight = 14;
  const sectionGap = 20;

  const addTextWithPageBreak = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    options: { bold?: boolean; italic?: boolean; fontSize?: number } = {}
  ) => {
    const displayText = text || "N/A";
    if (options.bold) doc.setFont("times", "bold");
    if (options.italic) doc.setFont("times", "italic");
    if (options.fontSize) doc.setFontSize(options.fontSize);
    
    const splitText = doc.splitTextToSize(displayText, maxWidth);
    for (let i = 0; i < splitText.length; i++) {
      if (y + lineHeight > pageHeight) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitText[i], x, y);
      y += lineHeight;
    }
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    return y;
  };

  const addSectionTitle = (title: string, y: number) => {
    return addTextWithPageBreak(title, margin, y, pageWidth - margin * 2, { bold: true, fontSize: 14 });
  };

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  const titleWidth = doc.getTextWidth("DISBURSEMENT VOUCHER");
  doc.text("DISBURSEMENT VOUCHER", (pageWidth - titleWidth) / 2, yPos);
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  yPos += sectionGap + lineHeight;

  // Voucher Number
  yPos = addSectionTitle(`Voucher #: ${data.dis_num || "N/A"}`, yPos);
  yPos += sectionGap;

  // Payee Information
  yPos = addSectionTitle("Payee Information:", yPos);
  yPos = addTextWithPageBreak(`Payee: ${data.dis_payee || "N/A"}`, margin, yPos, pageWidth - margin * 2);
  yPos = addTextWithPageBreak(`TIN: ${data.dis_tin || "N/A"}`, margin, yPos, pageWidth - margin * 2);
  yPos += sectionGap;

  // Date and Fund Information
  yPos = addSectionTitle("Transaction Details:", yPos);
  yPos = addTextWithPageBreak(`Date: ${data.dis_date || "N/A"}`, margin, yPos, pageWidth - margin * 2);
  yPos = addTextWithPageBreak(`Fund: ₱${data.dis_fund?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}`, margin, yPos, pageWidth - margin * 2);
  yPos += sectionGap;

  // Particulars
  yPos = addSectionTitle("Particulars:", yPos);
  if (data.dis_particulars.length === 0) {
    yPos = addTextWithPageBreak("No particulars provided", margin, yPos, pageWidth - margin * 2);
  } else {
    const tableCols = [300, 100, 100];
    const tableStartX = margin;

    // Table header
    doc.setFont("times", "bold");
    doc.text("For Payment", tableStartX, yPos);
    doc.text("Tax", tableStartX + tableCols[0], yPos);
    doc.text("Amount", tableStartX + tableCols[0] + tableCols[1], yPos);
    doc.setFont("times", "normal");
    yPos += lineHeight * 2;

    let totalAmount = 0;
    let totalTax = 0;

    data.dis_particulars.forEach((particular) => {
      if (yPos + lineHeight > pageHeight) {
        doc.addPage();
        yPos = margin;
      }

      doc.text(particular.forPayment || "N/A", tableStartX, yPos);
      doc.text(`₱${particular.tax?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}`, tableStartX + tableCols[0], yPos);
      doc.text(`₱${particular.amount?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}`, tableStartX + tableCols[0] + tableCols[1], yPos);
      
      totalAmount += particular.amount || 0;
      totalTax += particular.tax || 0;
      yPos += lineHeight;
    });

    // Totals
    yPos += lineHeight;
    doc.setFont("times", "bold");
    doc.text("Total Tax:", tableStartX + tableCols[0], yPos);
    doc.text(`₱${totalTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, tableStartX + tableCols[0] + tableCols[1], yPos);
    yPos += lineHeight;
    doc.text("Total Amount:", tableStartX + tableCols[0], yPos);
    doc.text(`₱${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, tableStartX + tableCols[0] + tableCols[1], yPos);
    doc.setFont("times", "normal");
  }
  yPos += sectionGap;

  // Payment Information
  yPos = addSectionTitle("Payment Information:", yPos);
  yPos = addTextWithPageBreak(`Check Number: ${data.dis_checknum || "N/A"}`, margin, yPos, pageWidth - margin * 2);
  yPos = addTextWithPageBreak(`Bank: ${data.dis_bank || "N/A"}`, margin, yPos, pageWidth - margin * 2);
  yPos = addTextWithPageBreak(`OR Number: ${data.dis_or_num || "N/A"}`, margin, yPos, pageWidth - margin * 2);
  yPos = addTextWithPageBreak(`Payment Date: ${data.dis_paydate || "N/A"}`, margin, yPos, pageWidth - margin * 2);
  yPos += sectionGap;

  // Payment Accounts
  yPos = addSectionTitle("Payment Accounts:", yPos);
  if (data.dis_payacc.length === 0) {
    yPos = addTextWithPageBreak("No payment accounts provided", margin, yPos, pageWidth - margin * 2);
  } else {
    const tableCols = [200, 100, 100, 100];
    const tableStartX = margin;

    // Table header
    doc.setFont("times", "bold");
    doc.text("Account", tableStartX, yPos);
    doc.text("Code", tableStartX + tableCols[0], yPos);
    doc.text("Debit", tableStartX + tableCols[0] + tableCols[1], yPos);
    doc.text("Credit", tableStartX + tableCols[0] + tableCols[1] + tableCols[2], yPos);
    doc.setFont("times", "normal");
    yPos += lineHeight * 2;

    let totalDebit = 0;
    let totalCredit = 0;

    data.dis_payacc.forEach((account) => {
      if (yPos + lineHeight > pageHeight) {
        doc.addPage();
        yPos = margin;
      }

      doc.text(account.account || "N/A", tableStartX, yPos);
      doc.text(account.accCode || "N/A", tableStartX + tableCols[0], yPos);
      doc.text(`₱${account.debit?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}`, tableStartX + tableCols[0] + tableCols[1], yPos);
      doc.text(`₱${account.credit?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}`, tableStartX + tableCols[0] + tableCols[1] + tableCols[2], yPos);
      
      totalDebit += account.debit || 0;
      totalCredit += account.credit || 0;
      yPos += lineHeight;
    });

    // Totals
    yPos += lineHeight;
    doc.setFont("times", "bold");
    doc.text("Total Debit:", tableStartX + tableCols[0] + tableCols[1], yPos);
    doc.text(`₱${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, tableStartX + tableCols[0] + tableCols[1] + tableCols[2], yPos);
    yPos += lineHeight;
    doc.text("Total Credit:", tableStartX + tableCols[0] + tableCols[1], yPos);
    doc.text(`₱${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, tableStartX + tableCols[0] + tableCols[1] + tableCols[2], yPos);
    doc.setFont("times", "normal");
  }
  yPos += sectionGap;

  // Prepared by
  if (data.staff_name) {
    yPos = addSectionTitle("Prepared by:", yPos);
    yPos = addTextWithPageBreak(data.staff_name, margin, yPos, pageWidth - margin * 2);
    yPos += sectionGap;
  }

  // Supporting Documents
  if (data.files && data.files.length > 0) {
    yPos = addSectionTitle("Supporting Documents:", yPos);
    data.files.forEach((file) => {
      if (file.disf_name) {
        yPos = addTextWithPageBreak(`• ${file.disf_name} (${file.disf_type})`, margin + 10, yPos, pageWidth - margin * 2 - 10);
      }
    });
  }

  if (preview) {
    return URL.createObjectURL(
      new Blob([doc.output("blob")], { type: "application/pdf" })
    );
  } else {
    doc.save(
      `disbursement_voucher_${data.dis_num || "unknown"}.pdf`
    );
    return null;
  }
};