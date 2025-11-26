import { jsPDF } from "jspdf";
import { DisbursementFile, Signatory } from "./incDisb-types";
import sanroque_logo from "@/assets/images/sanroque_logo.jpg";
import citylogo from "@/assets/images/cebucity_logo.png";

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
  dis_signatories?: Signatory[];
  dis_checknum: string;
  dis_bank: string;
  dis_or_num: string;
  dis_paydate: string;
  dis_payacc: Array<{
    account: string;
    accCode: string;
    debit: number;
    credit: number;
  }>;
  staff_name?: string;
  files?: DisbursementFile[];
}

const numberToWords = (num: number): string => {
  if (num === 0) return "ZERO";

  const ones = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
  ];
  const teens = [
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];
  const tens = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];
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
      result =
        convertHundreds(num % 1000) + thousands[thousandCounter] + " " + result;
    }
    num = Math.floor(num / 1000);
    thousandCounter++;
  }

  return result.trim();
};

const convertImageToBase64 = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg");
        resolve(base64);
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

export const generateDisbursementPdf = async (
  data: DisbursementPdfData,
  preview = false
) => {
  const pageSize = [612, 1008];
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: pageSize,
  });

  const signatories = data.dis_signatories || [];
  const margin = 72; 
  const pageWidth = pageSize[0];
  const pageHeight = pageSize[1];

  let yPos = margin + 20;

  doc.setFont("times", "normal");
  doc.setFontSize(10);

  const drawRect = (x: number, y: number, width: number, height: number): void => {
    doc.rect(x, y, width, height);
  };

  const addCenteredText = (text: string, y: number, fontSize: number = 20, bold: boolean = false): void => {
    if (bold) doc.setFont("times", "bold");
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
    if (bold) doc.setFont("times", "normal");
    doc.setFontSize(10);
  };

  const checkNewPage = (requiredHeight: number): void => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin + 20;
    }
  };

  // Add council header with logos
  const logoWidth = 90;
  const logoHeight = 90;
  const leftLogoX = margin;
  const rightLogoX = pageWidth - margin - logoWidth;
  
  try {
    const barangayLogoBase64 = await convertImageToBase64(sanroque_logo);
    doc.addImage(barangayLogoBase64, "JPEG", leftLogoX, yPos, logoWidth, logoHeight);
  } catch (e) {
    // console.error("Error adding barangay logo:", e);
  }

  try {
    const cityLogoBase64 = await convertImageToBase64(citylogo);
    doc.addImage(cityLogoBase64, "JPEG", rightLogoX, yPos, logoWidth, logoHeight);
  } catch (e) {
    // console.error("Error adding city logo:", e);
  }

  const headerText = [
    { text: "Republic of the Philippines", bold: true, size: 12 },
    { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
    { text: "", drawLine: true, size: 14 },
    { text: "Office of the Barangay Captain", bold: false, size: 13 },
    { text: "Arellano Boulevard, Cebu City, Cebu, 6000", bold: false, size: 11 },
    // { text: "Barangaysanroquecebu@gmail.com | (032) 231 - 3699", bold: false, size: 11 }
  ];

  const centerX = pageWidth / 2;
  let headerY = yPos + 15;

  headerText.forEach((line) => {
    if (line.drawLine) {
    // Draw a horizontal line with normal weight
    const lineWidth = 220;
    const lineX = centerX - (lineWidth / 2);
    doc.setLineWidth(1);
    doc.line(lineX, headerY, lineX + lineWidth, headerY);
    headerY += 20;
    return;
  }

    if (line.text === "") {
      headerY += 10;
      return;
    }
    
    doc.setFont("times", line.bold ? 'bold' : 'normal');
    doc.setFontSize(line.size);
    
    const textWidth = doc.getTextWidth(line.text);
    doc.text(line.text, centerX - (textWidth / 2), headerY);
    headerY += 14;
    
    if (line.bold) {
      headerY += 5;
    }
  });

  yPos = headerY + 10;

  // Calculate totals
  const totalAmount = data.dis_particulars.reduce((sum, item) => {
    const amount = typeof item.amount === "string" 
      ? parseFloat(item.amount) || 0 
      : item.amount || 0;
    return sum + amount;
  }, 0);

  const totalTax = data.dis_particulars.reduce((sum, item) => {
    const amount = typeof item.amount === "string" 
      ? parseFloat(item.amount) || 0 
      : item.amount || 0;
    const taxRate = typeof item.tax === "string" 
      ? parseFloat(item.tax) || 0 
      : item.tax || 0;
    const taxAmount = amount * (taxRate / 100); 
    return sum + taxAmount;
  }, 0);

  const netAmount = totalAmount - totalTax;

  // Main container
  const containerWidth = pageWidth - (margin * 2);

  // Title section
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  addCenteredText("Disbursement Voucher", yPos + 20);
  doc.setFont("times", "normal");
  doc.setFontSize(20);

  // Header section with 3 columns
  const headerYPos = yPos + 35;
  const headerHeight = 70;
  
  // Draw header grid
  drawRect(margin, headerYPos, containerWidth, headerHeight);
  
  const col1Width = containerWidth / 3;
  const col2Width = containerWidth / 3;

  // Vertical lines for columns
  doc.line(margin + col1Width, headerYPos, margin + col1Width, headerYPos + headerHeight);
  doc.line(margin + col1Width + col2Width, headerYPos, margin + col1Width + col2Width, headerYPos + headerHeight);

  // Header content
  doc.setFontSize(9);
  
  // Column 1
  doc.setFont("times", "bold")
  doc.text("Barangay: SAN ROQUE (CIUDAD)", margin + 5, headerYPos + 15);
  doc.text(`Payee: ${(data.dis_payee || "").toUpperCase()}`, margin + 5, headerYPos + 30);
  doc.text("Address: CEBU CITY", margin + 5, headerYPos + 45);

  // Column 2
  doc.text("City/Municipality: CITY", margin + col1Width + 5, headerYPos + 15);
  doc.text("Province: CEBU", margin + col1Width + 5, headerYPos + 30);
  doc.text(`TIN: ${data.dis_tin || ""}`, margin + col1Width + 5, headerYPos + 45);
  
  doc.text(`DV No.: ${data.dis_num || ""}`, margin + col1Width + col2Width + 5, headerYPos + 15);
  doc.text(`Date: ${data.dis_date || ""}`, margin + col1Width + col2Width + 5, headerYPos + 30);
  doc.text(`Fund: ${data.dis_fund || ""}`, margin + col1Width + col2Width + 5, headerYPos + 45);

  // Particulars section
  const particularsY = headerYPos + headerHeight;
  let particularsHeight = 80;
  
  // Calculate dynamic height based on content
  const lineHeight = 15;
  const particularsContentLines = data.dis_particulars.reduce((total, particular) => {
    const description = particular.forPayment || particular.description || "";
    const descLines = Math.ceil(description.length / 60);
    return total + Math.max(3, descLines + 2);
  }, 0);
  
  particularsHeight = Math.max(120, 50 + (particularsContentLines * lineHeight) + 60);

  drawRect(margin, particularsY, containerWidth, particularsHeight);
  
  // Particulars header with Amount column
  doc.line(margin, particularsY + 25, margin + containerWidth, particularsY + 25);
  doc.line(margin + containerWidth - 100, particularsY, margin + containerWidth - 100, particularsY + particularsHeight);

  doc.setFontSize(10);
  doc.setFont("times", "bold");
  doc.text("Particulars", margin + 170, particularsY + 20);
  doc.text("Amount", margin + containerWidth - 70, particularsY + 20);
  doc.setFont("times", "normal");

  // Particulars content
  let currentParticularsY = particularsY + 40;
  doc.setFontSize(9);

  data.dis_particulars.forEach((particular, index) => {
    const description = particular.forPayment || particular.description || "";
    const amount = typeof particular.amount === "string" 
      ? parseFloat(particular.amount) || 0 
      : particular.amount || 0;
    const taxRate = typeof particular.tax === "string" 
      ? parseFloat(particular.tax) || 0 
      : particular.tax || 0;
    const taxAmount = amount * (taxRate / 100);

    // For Payment description
    doc.text("For Payment:", margin + 10, currentParticularsY);
    
    // Handle long descriptions
    const maxWidth = containerWidth - 150;
    const descriptionLines = doc.splitTextToSize(description.toUpperCase(), maxWidth);
    
    if (Array.isArray(descriptionLines)) {
      descriptionLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, margin + 80, currentParticularsY + (lineIndex * 12));
      });
      currentParticularsY += descriptionLines.length * 12 + 5;
    } else {
      doc.text(descriptionLines, margin + 80, currentParticularsY);
      currentParticularsY += 17;
    }

    // Amount in right column
    doc.text(
      `P${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      margin + containerWidth - 90,
      currentParticularsY - 10
    );

    // With Holding Tax section
    if (taxRate > 0) {
      doc.text("With Holding Tax:", margin + 10, currentParticularsY);
      doc.text(`${taxRate}% - P${taxAmount.toFixed(2)}`, margin + 80, currentParticularsY + 12);
      doc.text(`P${taxAmount.toFixed(2)}`, margin + 80, currentParticularsY + 24);
      doc.text(`- P${taxAmount.toFixed(2)}`, margin + containerWidth - 90, currentParticularsY + 20);
      currentParticularsY += 40;
    }

    if (index < data.dis_particulars.length - 1) {
      currentParticularsY += 10;
    }
  });

  // Amount in words
  currentParticularsY += 10;
  doc.text("Amount:", margin + 10, currentParticularsY);
  
  let amountInWords;
  if (netAmount % 1 === 0) {
    amountInWords = numberToWords(netAmount) + " ONLY.";
  } else {
    const pesos = Math.floor(netAmount);
    const centavos = Math.round((netAmount % 1) * 100);
    amountInWords = numberToWords(pesos) + " & " + centavos.toString().padStart(2, "0") + " ONLY.";
  }

  const amountWordsLines = doc.splitTextToSize(amountInWords, containerWidth - 150);
  if (Array.isArray(amountWordsLines)) {
    amountWordsLines.forEach((line: string, lineIndex: number) => {
      doc.text(line, margin + 80, currentParticularsY + (lineIndex * 12));
    });
  } else {
    doc.text(amountWordsLines, margin + 80, currentParticularsY);
  }


  // Yellow highlighted total amount
  doc.setFillColor(255, 255, 0);
  const totalText = `P${netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  const totalWidth = doc.getTextWidth(totalText);
  doc.rect(margin + containerWidth - totalWidth - 20, particularsY + particularsHeight - 40, totalWidth + 15, 25, "F");
  doc.text(totalText, margin + containerWidth - totalWidth - 12, particularsY + particularsHeight - 22);
  doc.setFont("times", "normal");
  doc.setFontSize(9);

  // Certification section (3 columns)
  const certY = particularsY + particularsHeight;
  const certHeight = 100;
  
  drawRect(margin, certY, containerWidth, certHeight);
  
  const certCol1Width = containerWidth / 3;
  doc.line(margin + certCol1Width, certY, margin + certCol1Width, certY + certHeight);
  doc.line(margin + certCol1Width * 2, certY, margin + certCol1Width * 2, certY + certHeight);

  doc.setFontSize(8);

  // Column A
  doc.text("A. Certified as to existence of appropriation", margin + 5, certY + 15);
  doc.text("for obligation", margin + 5, certY + 25);
  
  const sig1 = signatories[0];
  if (sig1 && sig1.name) {
    doc.text(sig1.name.toUpperCase(), margin + 5, certY + 60);
  } else {
    doc.text("N/A", margin + 5, certY + 60);
  }
  doc.setFont("times", "italic");
  doc.text("(Signature Over Printed Name)", margin + 5, certY + 70);
  doc.text("Chairman, Committee on Appropriation", margin + 5, certY + 80);
  doc.setFont("times", "normal");
  doc.text("Date: ____________", margin + 5, certY + 90);

  // Column B
  doc.text("B. Certified As to availability of funds for", margin + certCol1Width + 5, certY + 15);
  doc.text("the purpose, and completeness and propriety", margin + certCol1Width + 5, certY + 25);
  doc.text("of supporting documents.", margin + certCol1Width + 5, certY + 35);
  
  const sig2 = signatories[1];
  if (sig2 && sig2.name) {
    doc.text(sig2.name.toUpperCase(), margin + certCol1Width + 5, certY + 70);
  } else {
    doc.text("N/A", margin + certCol1Width + 5, certY + 60);
  }
  doc.setFont("times", "italic");
  doc.text("(Signature Over Printed Name)", margin + certCol1Width + 5, certY + 80);
  doc.setFont("times", "normal");
  doc.text("Date: ____________", margin + certCol1Width + 5, certY + 90);

  // Column C
  doc.text("C. Certified as to validity, propriety, and", margin + certCol1Width * 2 + 5, certY + 15);
  doc.text("legality of claim and approved for payment:", margin + certCol1Width * 2 + 5, certY + 25);
  
  const sig3 = signatories[2];
  if (sig3 && sig3.name) {
    doc.text(sig3.name.toUpperCase(), margin + certCol1Width * 2 + 5, certY + 60);
  } else {
    doc.text("N/A", margin + certCol1Width * 2 + 5, certY + 60);
  }
  doc.setFont("times", "italic");
  doc.text("(Signature Over Printed Name)", margin + certCol1Width * 2 + 5, certY + 70);
  doc.text("(Punong Barangay)", margin + certCol1Width * 2 + 5, certY + 80);
  doc.setFont("times", "normal");
  doc.text("Date: ____________", margin + certCol1Width * 2 + 5, certY + 90);

  // Payment received section
  const paymentY = certY + certHeight;
  const paymentHeight = 60;
  
  drawRect(margin, paymentY, containerWidth, paymentHeight);
  
  doc.setFontSize(9);
  doc.text("D. Received Payment:", margin + 5, paymentY + 15);
  doc.text("_______________________________", margin + 20, paymentY + 40);
  doc.setFont("times", "italic");
  doc.text("Signature Over Printed Name", margin + 30, paymentY + 50);
  doc.setFont("times", "normal");

  // Right side payment details
  const paymentRightX = margin + containerWidth - 200;
  doc.text(`Check No.: ${data.dis_checknum }`, paymentRightX, paymentY + 20);
  doc.text(`Bank Name: ${data.dis_bank }`, paymentRightX, paymentY + 35);
  doc.text(`Date: ${data.dis_paydate }`, paymentRightX + 100, paymentY + 20);
  doc.text(`O.R No.: ${data.dis_or_num }`, paymentRightX, paymentY + 50);

  // Accounting entries section
  const accountingY = paymentY + paymentHeight;
  const minAccountingHeight = 120;
  const accountRows = Math.max(data.dis_payacc?.length || 0, 5);
  const accountingHeight = minAccountingHeight + (accountRows * 15);
  
  checkNewPage(accountingHeight);
  
  drawRect(margin, accountingY, containerWidth, accountingHeight);
  
  doc.text("E. Accounting Entries", margin + 5, accountingY + 15);
  doc.line(margin, accountingY + 25, margin + containerWidth, accountingY + 25);
  
  // Accounting table headers
  const accCol1 = containerWidth * 0.4;
  const accCol2 = containerWidth * 0.25;
  const accCol3 = containerWidth * 0.175;
  
  doc.line(margin + accCol1, accountingY + 25, margin + accCol1, accountingY + accountingHeight);
  doc.line(margin + accCol1 + accCol2, accountingY + 25, margin + accCol1 + accCol2, accountingY + accountingHeight);
  doc.line(margin + accCol1 + accCol2 + accCol3, accountingY + 25, margin + accCol1 + accCol2 + accCol3, accountingY + accountingHeight);

  doc.setFont("times", "bold");
  doc.text("Account", margin + 75, accountingY + 40);
  doc.text("Account Code", margin + accCol1 + 25, accountingY + 40);
  doc.text("Debit", margin + accCol1 + accCol2 + 28, accountingY + 40);
  doc.text("Credit", margin + accCol1 + accCol2 + accCol3 + 25, accountingY + 40);
  doc.setFont("times", "normal");

  // Accounting entries content
  let accountY = accountingY + 65;
  if (data.dis_payacc && data.dis_payacc.length > 0) {
    data.dis_payacc.forEach((account, index) => {
      if (index > 0) {
        // doc.line(margin, accountY - 7, margin + containerWidth, accountY - 7);
      }
      
      const accountLines = doc.splitTextToSize(account.account || "", accCol1 - 10);
      if (Array.isArray(accountLines)) {
        accountLines.forEach((line: string, lineIndex: number) => {
          doc.text(line, margin + 5, accountY + (lineIndex * 12));
        });
      } else {
        doc.text(accountLines, margin + 5, accountY);
      }

      doc.text(account.accCode || "", margin + accCol1 + 5, accountY);
      doc.text(
        account.debit ? `${parseFloat(account.debit.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "",
        margin + accCol1 + accCol2 + 5,
        accountY
      );
      doc.text(
        account.credit ? `${parseFloat(account.credit.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "",
        margin + accCol1 + accCol2 + accCol3 + 5,
        accountY
      );
      accountY += 20;
    });
  } else {
    // Empty rows
    for (let i = 0; i < 5; i++) {
      if (i > 0) {
        doc.line(margin, accountY - 7, margin + containerWidth, accountY - 7);
      }
      accountY += 20;
    }
  }

  // Final signatures
  const finalSigY = accountingY + accountingHeight;
  const finalSigHeight = 60;
  
  drawRect(margin, finalSigY, containerWidth, finalSigHeight);
  doc.line(margin + containerWidth / 2, finalSigY, margin + containerWidth / 2, finalSigY + finalSigHeight);

  doc.setFontSize(9);
  doc.text("Prepared By:", margin + 5, finalSigY + 15);
  doc.text("____________________________", margin + 5, finalSigY + 45);
  doc.text(data.staff_name || "Barangay Bookkeeper", margin + 27, finalSigY + 55);
  doc.text("Date: ____________", margin + containerWidth / 2 - 80, finalSigY + 50);

  doc.text("Approved By:", margin + containerWidth / 2 + 5, finalSigY + 15);
  doc.text("____________________________", margin + containerWidth / 2 + 5, finalSigY + 45);
  doc.text("City/Municipal Accountant", margin + containerWidth / 2 + 17, finalSigY + 55);
  doc.text("Date: ____________", margin + containerWidth - 80, finalSigY + 50);

  if (preview) {
    return URL.createObjectURL(
      new Blob([doc.output("blob")], { type: "application/pdf" })
    );
  } else {
    doc.save(`disbursement_voucher_${data.dis_num || "unknown"}.pdf`);
    return null;
  }
};