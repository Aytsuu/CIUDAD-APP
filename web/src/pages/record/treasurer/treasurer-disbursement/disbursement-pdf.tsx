import { jsPDF } from "jspdf";
import { DisbursementFile } from "./incDisb-types";

export interface DisbursementPdfData {
  dis_num: any;
  dis_payee: string;
  dis_tin: string;
  dis_date: string;
  dis_fund: number;
  dis_particulars: Array<{ 
    forPayment?: string;
    description?: string; 
    tax: number | string; 
    amount: number | string;
  }>;
  dis_checknum: string;
  dis_bank: string;
  dis_or_num: string;
  dis_paydate: string;
  dis_payacc: Array<{ account: string; accCode: string; debit: number; credit: number }>;
  staff_name?: string;
  files?: DisbursementFile[];
}

// Helper function to convert number to words
const numberToWords = (num: number): string => {
  if (num === 0) return "ZERO";
  
  const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  const teens = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  const thousands = ["", "THOUSAND", "MILLION", "BILLION"];
  
  function convertHundreds(n: number): string {
    let result = "";
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " HUNDRED ";
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + " ";
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + " ";
    }
    
    return result;
  }
  
  let result = "";
  let thousandCounter = 0;
  
  while (num > 0) {
    if (num % 1000 !== 0) {
      result = convertHundreds(num % 1000) + thousands[thousandCounter] + " " + result;
    }
    num = Math.floor(num / 1000);
    thousandCounter++;
  }
  
  return result.trim();
};

export const generateDisbursementPdf = async (data: DisbursementPdfData, preview = false) => {
  const pageSize = [612, 936]; // Legal size (8.5 x 13 inches)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: pageSize,
  });

  doc.setFont("times", "normal");
  doc.setFontSize(10);

  const margin = 72; // 1 inch margin (72 points = 1 inch)
  let yPos = margin + 20;
  const pageWidth = pageSize[0];

  // Helper function to draw borders
  const drawRect = (x: number, y: number, width: number, height: number): void => {
    doc.rect(x, y, width, height);
  };

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, fontSize: number = 10, bold: boolean = false): void => {
    if (bold) doc.setFont("times", "bold");
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
    if (bold) doc.setFont("times", "normal");
    doc.setFontSize(10);
  };

  // Calculate totals from database data
  const totalAmount = data.dis_particulars.reduce((sum, item) => {
    const amount = typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0;
    return sum + amount;
  }, 0);
  
  const totalTax = data.dis_particulars.reduce((sum, item) => {
    const tax = typeof item.tax === 'string' ? parseFloat(item.tax) || 0 : item.tax || 0;
    return sum + tax;
  }, 0);
  
  const netAmount = totalAmount - totalTax;

    // Title
  addCenteredText("Disbursement Voucher", yPos, 16, true);

  // Header section with border
  const headerHeight = 70;
  drawRect(margin, yPos, pageWidth - margin * 2, headerHeight);
  
  // Header row with three columns
  const col1Width = 180;
  const col2Width = 180;
  
  // Vertical lines for header columns
  doc.line(margin + col1Width, yPos, margin + col1Width, yPos + headerHeight);
  doc.line(margin + col1Width + col2Width, yPos, margin + col1Width + col2Width, yPos + headerHeight);
  
  // Header content
  doc.setFontSize(9);
  doc.text("Barangay: SAN ROQUE (CIUDAD)", margin + 5, yPos + 20);
  doc.text(`Payee: ${data.dis_payee || 'N/A'}`, margin + 5, yPos + 40);
  doc.text("Address: CEBU CITY", margin + 5, yPos + 60);
  
  doc.text("City/Municipality: CITY", margin + col1Width + 5, yPos + 20);
  doc.text("Province: CEBU", margin + col1Width + 5, yPos + 40);
  doc.text(`TIN: ${data.dis_tin || 'N/A'}`, margin + col1Width + 5, yPos + 60);
  
  doc.text(`DV No.: ${data.dis_num || 'N/A'}`, margin + col1Width + col2Width + 5, yPos + 20);
  doc.text(`Date: ${data.dis_date || 'N/A'}`, margin + col1Width + col2Width + 5, yPos + 40);
  doc.text("Fund:", margin + col1Width + col2Width + 5, yPos + 60);

  yPos += headerHeight + 10;

  // Particulars section
  const particularsHeight = 150;
  drawRect(margin, yPos, pageWidth - margin * 2, particularsHeight);
  
  // Particulars header
  doc.line(margin, yPos + 20, pageWidth - margin, yPos + 20);
  doc.setFontSize(10);
  doc.text("Particulars", margin + 5, yPos + 15);
  doc.text("Amount", pageWidth - margin - 80, yPos + 15);
  
  // For Payment content
  doc.setFontSize(9);
  doc.text("For Payment:", margin + 10, yPos + 40);
  
  // Main payment description from database
  let currentY = yPos + 40;
  data.dis_particulars.forEach((particular, index) => {
    const description = particular.forPayment || particular.description || 'N/A';
    const amount = typeof particular.amount === 'string' ? parseFloat(particular.amount) || 0 : particular.amount || 0;
    
    if (index === 0) {
      // Main item
      doc.text(description, margin + 80, currentY);
      doc.text(`₱${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, pageWidth - margin - 80, currentY);
    }
    currentY += 15;
  });
  
  // Tax calculations from database
  currentY = yPos + 70;
  doc.text("With Holding Tax:", margin + 80, currentY);
  
  // Display tax breakdowns if available
  let taxY = currentY + 15;
  
  interface TaxItem {
    percent: string;
    amount: number;
  }
  
  const taxItems: TaxItem[] = [];
  
  data.dis_particulars.forEach((particular) => {
    const tax = typeof particular.tax === 'string' ? parseFloat(particular.tax) || 0 : particular.tax || 0;
    const amount = typeof particular.amount === 'string' ? parseFloat(particular.amount) || 0 : particular.amount || 0;
    
    if (tax > 0 && amount > 0) {
      const taxPercent = ((tax / amount) * 100).toFixed(0);
      taxItems.push({ percent: taxPercent, amount: tax });
    }
  });
  
  // Group similar tax percentages
  const groupedTax = taxItems.reduce((acc: TaxItem[], item: TaxItem) => {
    const existing = acc.find((x: TaxItem) => x.percent === item.percent);
    if (existing) {
      existing.amount += item.amount;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);
  
  groupedTax.forEach((taxItem: TaxItem) => {
    doc.text(`${taxItem.percent}% - ₱${taxItem.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, margin + 100, taxY);
    taxY += 12;
  });
  
  if (totalTax > 0) {
    doc.text(`- ₱${totalTax.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, pageWidth - margin - 80, yPos + 85);
  }
  
  // Amount in words
  doc.text("Amount:", margin + 10, yPos + 110);
  const amountInWords = numberToWords(Math.floor(netAmount)) + " & " + 
    Math.round((netAmount % 1) * 100).toString().padStart(2, '0') + "/100 PESOS ONLY.";
  doc.text(amountInWords, margin + 80, yPos + 110);
  
  // Net amount (highlighted)
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  // Add yellow background
  doc.setFillColor(255, 255, 0);
  const netAmountText = `₱${netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  const textWidth = doc.getTextWidth(netAmountText);
  doc.rect(pageWidth - margin - 90, yPos + 120, textWidth + 10, 20, 'F');
  doc.text(netAmountText, pageWidth - margin - 85, yPos + 135);
  doc.setFont("times", "normal");
  doc.setFontSize(9);

  yPos += particularsHeight + 10;

  // Supporting Documents section
  const supportDocsHeight = 80;
  drawRect(margin, yPos, pageWidth - margin * 2, supportDocsHeight);
  
  doc.setFontSize(9);
  doc.text("SUPPORTING DOCUMENTS ATTACHED:", margin + 5, yPos + 15);
  
  // List supporting documents from database or default list
  let supportDocs = [];
  if (data.files && data.files.length > 0) {
    supportDocs = data.files.map(file => file.disf_name.toUpperCase());
  } else {
    supportDocs = [
      "DISBURSEMENT VOUCHER",
      "MONTHLY BILL", 
      "PHOTOCOPY OF CHECK",
      "OFFICIAL RECEIPT",
      "PBC",
      "VAT DETAILS"
    ];
  }
  
  supportDocs.forEach((doc_name, index) => {
    const col = Math.floor(index / 3);
    const row = index % 3;
    if (margin + 20 + (col * 250) < pageWidth - margin - 100) {
      doc.text(`• ${doc_name}`, margin + 20 + (col * 250), yPos + 35 + (row * 15));
    }
  });

  yPos += supportDocsHeight + 10;

  // Certification section with three columns
  const certHeight = 100;
  drawRect(margin, yPos, pageWidth - margin * 2, certHeight);
  
  const certCol1Width = (pageWidth - margin * 2) / 3;
  const certCol2Width = (pageWidth - margin * 2) / 3;
  
  // Vertical dividers
  doc.line(margin + certCol1Width, yPos, margin + certCol1Width, yPos + certHeight);
  doc.line(margin + certCol1Width + certCol2Width, yPos, margin + certCol1Width + certCol2Width, yPos + certHeight);
  
  doc.setFontSize(8);
  // Column A
  doc.text("A. Certified as to existence", margin + 5, yPos + 15);
  doc.text("of appropriation for", margin + 5, yPos + 25);
  doc.text("obligation", margin + 5, yPos + 35);
  
  doc.text("HON. ARIEL R. CORTES", margin + 5, yPos + 65);
  doc.setFont("times", "italic");
  doc.text("(Signature Over Printed Name)", margin + 5, yPos + 75);
  doc.text("Chairman, Committee on Appropriation", margin + 5, yPos + 85);
  doc.setFont("times", "normal");
  doc.text("Date: ___________", margin + 5, yPos + 95);
  
  // Column B  
  doc.text("B. Certified As to availability", margin + certCol1Width + 5, yPos + 15);
  doc.text("of funds for the purpose, and", margin + certCol1Width + 5, yPos + 25);
  doc.text("completeness and propriety of", margin + certCol1Width + 5, yPos + 35);
  doc.text("supporting documents.", margin + certCol1Width + 5, yPos + 45);
  
  doc.text("ROCHELLE T. YAUN", margin + certCol1Width + 5, yPos + 65);
  doc.setFont("times", "italic");
  doc.text("(Signature Over Printed Name)", margin + certCol1Width + 5, yPos + 75);
  doc.setFont("times", "normal");
  doc.text("Date: ___________", margin + certCol1Width + 5, yPos + 95);
  
  // Column C
  doc.text("C. Certified as to validity, propriety, and", margin + certCol1Width + certCol2Width + 5, yPos + 15);
  doc.text("legality of claim and approved for payment:", margin + certCol1Width + certCol2Width + 5, yPos + 25);
  
  doc.text("HON. VICTOR N. ABENOJA", margin + certCol1Width + certCol2Width + 5, yPos + 65);
  doc.setFont("times", "italic");
  doc.text("(Signature Over Printed Name)", margin + certCol1Width + certCol2Width + 5, yPos + 75);
  doc.text("(Punong Barangay)", margin + certCol1Width + certCol2Width + 5, yPos + 85);
  doc.setFont("times", "normal");
  doc.text("Date: ___________", margin + certCol1Width + certCol2Width + 5, yPos + 95);

  yPos += certHeight + 10;

  // Payment section
  const paymentHeight = 80;
  drawRect(margin, yPos, pageWidth - margin * 2, paymentHeight);
  
  doc.setFontSize(9);
  doc.text("D. Received Payment:", margin + 5, yPos + 15);
  
  // Left side: Signature line and label
  doc.text("_________________________________", margin + 20, yPos + 45);
  doc.setFont("times", "italic");
  doc.text("Signature Over Printed Name", margin + 36, yPos + 55);
  doc.setFont("times", "normal");
  
  // Right side: Payment details in compact layout
  const rightSideStart = margin + 280;
  
  // Row 1: Check No. and Date on same line
  doc.text(`Check No.: ${data.dis_checknum || '_________________'}`, rightSideStart, yPos + 30);
  doc.text(`Date: ${data.dis_paydate || '_____________'}`, rightSideStart + 100, yPos + 30);
  
  // Row 2: Bank Name
  doc.text(`Bank Name: ${data.dis_bank || '_________________'}`, rightSideStart, yPos + 45);
  
  // Row 3: O.R No.
  doc.text(`O.R No.: ${data.dis_or_num || '_______________________'}`, rightSideStart, yPos + 60);

  yPos += paymentHeight + 10;

  // Accounting Entries section
  const accountingHeight = 120;
  drawRect(margin, yPos, pageWidth - margin * 2, accountingHeight);
  
  doc.setFontSize(9);
  doc.text("E. Accounting Entries", margin + 5, yPos + 15);
  
  // Table headers
  doc.line(margin, yPos + 25, pageWidth - margin, yPos + 25);
  const accCol1 = 150;
  const accCol2 = 120;
  const accCol3 = 100;
  
  doc.line(margin + accCol1, yPos, margin + accCol1, yPos + accountingHeight);
  doc.line(margin + accCol1 + accCol2, yPos, margin + accCol1 + accCol2, yPos + accountingHeight);
  doc.line(margin + accCol1 + accCol2 + accCol3, yPos, margin + accCol1 + accCol2 + accCol3, yPos + accountingHeight);
  
  doc.text("Account", margin + 5, yPos + 35);
  doc.text("Account Code", margin + accCol1 + 5, yPos + 35);
  doc.text("Debit", margin + accCol1 + accCol2 + 5, yPos + 35);
  doc.text("Credit", margin + accCol1 + accCol2 + accCol3 + 5, yPos + 35);
  
  // Add accounting entries from database
  let accountY = yPos + 50;
  if (data.dis_payacc && data.dis_payacc.length > 0) {
    data.dis_payacc.forEach((account, _index) => {
      if (accountY < yPos + accountingHeight - 15) {
        doc.text(account.account || '', margin + 5, accountY);
        doc.text(account.accCode || '', margin + accCol1 + 5, accountY);
        doc.text(account.debit ? `₱${parseFloat(account.debit.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : '', margin + accCol1 + accCol2 + 5, accountY);
        doc.text(account.credit ? `₱${parseFloat(account.credit.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : '', margin + accCol1 + accCol2 + accCol3 + 5, accountY);
        accountY += 15;
      }
    });
  }

  yPos += accountingHeight + 20;

  // Prepared and Approved section
  const signatureHeight = 60;
  drawRect(margin, yPos, pageWidth - margin * 2, signatureHeight);
  
  // Divide into two columns
  const sigCol1Width = (pageWidth - margin * 2) / 2;
  doc.line(margin + sigCol1Width, yPos, margin + sigCol1Width, yPos + signatureHeight);
  
  doc.setFontSize(9);
  doc.text("Prepared By:", margin + 5, yPos + 15);
  doc.text("________________________", margin + 5, yPos + 45);
  doc.text(data.staff_name || "Barangay Bookkeeper", margin + 20, yPos + 55);
  doc.text("Date: ____________", margin + 150, yPos + 50);
  
  doc.text("Approved By:", margin + sigCol1Width + 5, yPos + 15);
  doc.text("________________________", margin + sigCol1Width + 5, yPos + 45);
  doc.text("City/Municipal Accountant", margin + sigCol1Width + 10, yPos + 55);
  doc.text("Date: ____________", margin + sigCol1Width + 150, yPos + 50);

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