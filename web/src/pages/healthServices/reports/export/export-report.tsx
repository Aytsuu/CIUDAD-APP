// utils/export-utils.ts
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

export function exportToCSV(data: any[], filename: string) {
  const csvContent = [Object.keys(data[0]).join(","), ...data.map((item) => Object.values(item).join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPDF(p0: any[], filename: string) {
  try {
    const element = document.getElementById("printable-area");
    if (!element) {
      throw new Error("Printable area not found");
    }

    html2canvas(element as HTMLElement, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL("image/png");

      // Determine orientation based on aspect ratio
      const aspectRatio = canvas.width / canvas.height;
      const orientation = aspectRatio > 1 ? "landscape" : "portrait";

      const pdf = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}



export function exportToPDF2(data: any[], filename: string, title: string = "Vaccination Records") {
  try {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    
    // Calculate total width needed for all columns
    const tempPdf = new jsPDF();
    const columnWidths = calculateOptimalColumnWidths(tempPdf, headers, data, 1000); // Large available width to get natural sizes
    const totalContentWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    
    // Determine orientation based on column count and total width
    const columnCount = headers.length;
    const isWideTable = columnCount > 8 || totalContentWidth > 280; // Threshold for landscape
    
    // Use appropriate paper size and orientation
    const pdf = new jsPDF({
      orientation: isWideTable ? 'landscape' : 'portrait' as 'landscape' | 'portrait',
      unit: 'mm',
      format: isWideTable ? 'legal' : 'legal' // Use A4 for landscape, legal for portrait
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = isWideTable ? 8 : 10; // Smaller margins for landscape
    let yPosition = margin + (isWideTable ? 5 : 10);

    // Adjust font sizes based on orientation
    const titleFontSize = isWideTable ? 14 : 16;
    const headerFontSize = isWideTable ? 6 : 7;
    const cellFontSize = isWideTable ? 6 : 7;

    // Add title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(titleFontSize);
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, yPosition);
    
    yPosition += isWideTable ? 8 : 10;

    // Recalculate column widths for the actual page width
    const availableWidth = pageWidth - (2 * margin);
    const finalColumnWidths = calculateOptimalColumnWidths(pdf, headers, data, availableWidth);

    // Draw table border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.1);
    
    // Table header with black borders
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(headerFontSize);

    let xPosition = margin;
    headers.forEach((header, index) => {
      // Draw cell border
      pdf.rect(xPosition, yPosition, finalColumnWidths[index], 6);
      
      // Left align header text
      const headerText = toTitleCase(header);
      pdf.text(headerText, xPosition + 2, yPosition + 4);
      
      xPosition += finalColumnWidths[index];
    });

    yPosition += 6;

    // Table rows with borders
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(cellFontSize);

    data.forEach((row) => {
      // Calculate row height based on content
      const rowHeights = headers.map((header, colIndex) => {
        const value = String(row[header] || 'N/A');
        const titleCaseValue = toTitleCase(value);
        const lines = wrapText(pdf, titleCaseValue, finalColumnWidths[colIndex] - 4);
        return lines.length * (isWideTable ? 3.5 : 4) + 4; // Adjust line height based on orientation
      });
      const rowHeight = Math.max(...rowHeights, 8); // Minimum 8mm row height

      // Check for page break
      if (yPosition + rowHeight > pageHeight - margin - 10) {
        pdf.addPage('portrait');
        yPosition = margin + (isWideTable ? 5 : 10);
        
        // Repeat header on new page
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(headerFontSize);
        
        xPosition = margin;
        headers.forEach((header, index) => {
          pdf.rect(xPosition, yPosition, finalColumnWidths[index], 6);
          const headerText = toTitleCase(header);
          pdf.text(headerText, xPosition + 2, yPosition + 4);
          xPosition += finalColumnWidths[index];
        });
        
        yPosition += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(cellFontSize);
      }

      // Draw row cells with borders
      xPosition = margin;
      headers.forEach((header, colIndex) => {
        // Draw cell border
        pdf.rect(xPosition, yPosition, finalColumnWidths[colIndex], rowHeight);
        
        const value = String(row[header] || 'N/A');
        const titleCaseValue = toTitleCase(value);
        const cellLines = wrapText(pdf, titleCaseValue, finalColumnWidths[colIndex] - 4);
        
        // Left align text in cell with proper line spacing
        const lineHeight = isWideTable ? 3.5 : 4;
        cellLines.forEach((line, lineIndex) => {
          pdf.text(line, xPosition + 2, yPosition + 5 + (lineIndex * lineHeight));
        });
        
        xPosition += finalColumnWidths[colIndex];
      });

      yPosition += rowHeight;
    });

    // Save with simple filename (no timestamp, so it overwrites)
    pdf.save(`${filename}.pdf`);

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}

// Helper function to convert text to Title Case
function toTitleCase(text: string): string {
  if (!text) return 'N/A';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Skip empty words and common conjunctions/prepositions
      if (!word) return '';
      if (['and', 'or', 'but', 'for', 'nor', 'so', 'yet', 'a', 'an', 'the', 'in', 'on', 'at', 'to', 'from', 'by'].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to calculate optimal column widths
function calculateOptimalColumnWidths(pdf: jsPDF, headers: string[], data: any[], availableWidth: number): number[] {
  const minWidth = 12; // Reduced minimum width for landscape
  const maxWidth = 40; // Reduced maximum width for landscape
  const padding = 4;   // Reduced padding for landscape
  
  const contentWidths = headers.map((header, index) => {
    const titleCaseHeader = toTitleCase(header);
    const headerWidth = pdf.getTextWidth(titleCaseHeader) + padding;
    
    const dataWidths = data.map(row => {
      const value = String(row[headers[index]] || 'N/A');
      const titleCaseValue = toTitleCase(value);
      return pdf.getTextWidth(titleCaseValue) + padding;
    });
    
    const maxDataWidth = Math.max(...dataWidths);
    return Math.min(maxWidth, Math.max(minWidth, Math.max(headerWidth, maxDataWidth)));
  });

  const totalContentWidth = contentWidths.reduce((sum, width) => sum + width, 0);
  
  // Force scaling to fit within available width
  if (totalContentWidth > availableWidth) {
    const scaleFactor = availableWidth / totalContentWidth;
    return contentWidths.map(width => Math.max(minWidth, width * scaleFactor));
  }
  
  return contentWidths;
}

// Helper function to wrap text
function wrapText(pdf: jsPDF, text: string, maxWidth: number): string[] {
  if (!text || text === 'N/A') return ['N/A'];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    const testWidth = pdf.getTextWidth(testLine);
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  
  return lines;
}