import { jsPDF } from "jspdf";

export interface ProposalPdfData {
  projectTitle: string;
  background: string;
  objectives: string[];
  participants: Array<{ category: string; count: string }>;
  date: string;
  venue: string;
  budgetItems: Array<{ name: string; pax: string; amount: string }>;
  monitoringEvaluation: string;
  signatories: Array<{ name: string; position: string; type: string }>;
  paperSize: string;
  headerImage?: string | null;
}

export const generateProposalPdf = async (data: ProposalPdfData, preview = false) => {
  const pageSize = {
    a4: [595.28, 841.89],
    letter: [612, 792],
    legal: [612, 1008],
  }[data.paperSize] || [595.28, 841.89];

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
  const signatureColumnWidth = 200;

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
    return addTextWithPageBreak(title, margin, y, pageWidth - margin * 2, { bold: true });
  };

  if (data.headerImage) {
    try {
      let dataUrl = data.headerImage;
      if (!dataUrl.startsWith("data:image")) {
        const response = await fetch(dataUrl, {
          mode: "cors",
          headers: {
            Accept: "image/*",
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        const mimeType = blob.type;
        if (!mimeType.startsWith("image/")) {
          throw new Error(`Invalid image type: ${mimeType}`);
        }
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read image blob"));
          reader.readAsDataURL(blob);
        });
      }

      if (dataUrl && dataUrl.startsWith("data:image")) {
        const img = new Image();
        img.src = dataUrl;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (img.height / img.width) * imgWidth;
            const maxHeight = 80;
            const scaleFactor = Math.min(1, maxHeight / imgHeight);
            const finalHeight = imgHeight * scaleFactor;
            try {
              const format = dataUrl.match(/^data:image\/(\w+);base64,/)?.[1]?.toUpperCase() || "JPEG";
              doc.addImage(
                dataUrl,
                format,
                margin,
                margin,
                imgWidth,
                finalHeight
              );
              yPos += finalHeight + 20;
              resolve();
            } catch (e) {
              console.error("Error adding image to PDF:", e);
              reject(e);
            }
          };
          img.onerror = () => {
            reject(new Error("Image failed to load"));
          };
        });
      }
    } catch (e) {
      console.error("Error processing header image for PDF:", e);
      yPos = addTextWithPageBreak(
        "No header image available",
        margin,
        yPos,
        pageWidth - margin * 2,
        { italic: true, fontSize: 10 }
      );
      yPos += 20;
    }
  }

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  const titleWidth = doc.getTextWidth("PROJECT PROPOSAL");
  doc.text("PROJECT PROPOSAL", (pageWidth - titleWidth) / 2, yPos);
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  yPos += sectionGap + lineHeight;

  yPos = addSectionTitle("Project Title:", yPos);
  yPos = addTextWithPageBreak(data.projectTitle || "Untitled", margin, yPos, pageWidth - margin * 2);
  yPos += sectionGap;

  yPos = addSectionTitle("Background:", yPos);
  yPos = addTextWithPageBreak(data.background || "No background provided", margin, yPos, pageWidth - margin * 2);
  yPos += sectionGap;

  yPos = addSectionTitle("Objectives:", yPos);
  if (data.objectives.length === 0 || data.objectives.every(obj => !obj.trim())) {
    yPos = addTextWithPageBreak("No objectives provided", margin + 10, yPos, pageWidth - margin * 2 - 10);
  } else {
    data.objectives.forEach((obj) => {
      if (obj.trim()) {
        yPos = addTextWithPageBreak(`• ${obj}`, margin + 10, yPos, pageWidth - margin * 2 - 10);
      }
    });
  }
  yPos += sectionGap;

  yPos = addSectionTitle("Participants:", yPos);
  if (data.participants.length === 0 || data.participants.every(p => !p.category.trim())) {
    yPos = addTextWithPageBreak("No participants provided", margin, yPos, pageWidth - margin * 2);
  } else {
    data.participants.forEach((participant) => {
      if (participant.category.trim()) {
        const text = `${participant.count || "0"} ${participant.category}`;
        yPos = addTextWithPageBreak(text, margin, yPos, pageWidth - margin * 2);
      }
    });
  }
  yPos += sectionGap;

  yPos = addSectionTitle("Date and Venue:", yPos);
  yPos = addTextWithPageBreak(data.date || "No date provided", margin, yPos, pageWidth - margin * 2);
  yPos = addTextWithPageBreak(data.venue || "No venue provided", margin, yPos, pageWidth - margin * 2);
  yPos += sectionGap;

  yPos = addSectionTitle("Budgetary Requirements:", yPos);
  const tableCols = [200, 80, 80, 80];
  const tableStartX = margin;

  const addTableRow = (
    row: string[],
    y: number,
    isHeader: boolean = false
  ) => {
    if (y + lineHeight > pageHeight) {
      doc.addPage();
      y = margin;
    }

    if (isHeader) doc.setFont("times", "bold");

    let x = tableStartX;
    let maxCellHeight = lineHeight;
    const cellHeights = row.map((cell, i) => {
      const colWidth = tableCols[i];
      const text = doc.splitTextToSize(cell, colWidth - 10);
      return text.length * lineHeight;
    });
    maxCellHeight = Math.max(...cellHeights, lineHeight);

    row.forEach((cell, i) => {
      const colWidth = tableCols[i];
      const text = doc.splitTextToSize(cell, colWidth - 10);
      let textY = y;
      text.forEach((line: string, lineIndex: number) => {
        if (lineIndex > 0 && textY + lineHeight > pageHeight) {
          doc.addPage();
          textY = margin;
        }
        doc.text(line, x + 5, textY + lineIndex * lineHeight);
      });
      doc.rect(x, y - lineHeight + 2, colWidth, maxCellHeight, "S");
      x += colWidth;
    });

    if (isHeader) doc.setFont("times", "normal");

    return y + maxCellHeight;
  };

  yPos = addTableRow(["Name", "Pax", "Amount", "Total"], yPos, true);

  let grandTotal = 0;
  if (data.budgetItems.length === 0 || data.budgetItems.every(item => !item.name.trim())) {
    yPos = addTableRow(["No budget items provided", "", "", ""], yPos);
  } else {
    data.budgetItems.forEach((item) => {
      if (item.name.trim()) {
        const amount = parseFloat(item.amount) || 0;
        const paxCount = item.pax.trim() && item.pax.includes("pax") ? parseInt(item.pax) || 1 : 1;
        const total = paxCount * amount;
        grandTotal += total;
        yPos = addTableRow(
          [
            item.name,
            item.pax || "N/A",
            amount ? `(${amount.toFixed(2)})` : "(0.00)",
            total.toLocaleString(),
          ],
          yPos
        );
      }
    });
  }

  doc.setFont("times", "bold");
  yPos = addTableRow(
    [
      "",
      "",
      "TOTAL",
      grandTotal ? `P ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "P 0.00",
    ],
    yPos
  );
  doc.setFont("times", "normal");
  yPos += sectionGap;

  yPos = addSectionTitle("Monitoring Evaluation:", yPos);
  yPos = addTextWithPageBreak(data.monitoringEvaluation || "No evaluation provided", margin, yPos, pageWidth - margin * 2);
  yPos += sectionGap;

  const preparedBy = data.signatories.filter((s) => s.type === "prepared");
  const approvedBy = data.signatories.filter((s) => s.type === "approved");

  const preparedHeight = preparedBy.length * 60;
  const approvedHeight =
    approvedBy.length * 60 +
    (approvedBy.length > 1 ? (approvedBy.length - 1) * 40 : 0);
  const maxSignatureHeight = Math.max(preparedHeight, approvedHeight);

  if (yPos + maxSignatureHeight + 20 > pageHeight) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFont("times", "bold");
  doc.text("Prepared by:", margin, yPos);
  doc.text("Approved by:", margin + 250, yPos);
  yPos += 40;

  if (preparedBy.length === 0) {
    doc.setFont("times", "normal");
    doc.text("No preparers assigned", margin, yPos);
  } else {
    preparedBy.forEach((sig, i) => {
      if (sig.name.trim()) {
        const nameWidth = doc.getTextWidth(sig.name);
        const positionWidth = doc.getTextWidth(sig.position);
        doc.setFont("times", "normal");
        const nameX = margin + (signatureColumnWidth - nameWidth) / 2;
        doc.text(sig.name, nameX, yPos + i * 60);
        doc.setFont("times", "bold");
        const positionX = margin + (signatureColumnWidth - positionWidth) / 2;
        doc.text(sig.position || "N/A", positionX, yPos + i * 60 + 20);
        doc.setDrawColor(200, 200, 200);
      }
    });
  }

  if (approvedBy.length === 0) {
    doc.setFont("times", "normal");
    doc.text("No approvers assigned", margin + 250, yPos);
  } else {
    approvedBy.forEach((sig, i) => {
      if (sig.name.trim()) {
        const nameWidth = doc.getTextWidth(sig.name);
        const positionWidth = doc.getTextWidth(sig.position);
        doc.setFont("times", "normal");
        const nameX = margin + 250 + (signatureColumnWidth - nameWidth) / 2;
        doc.text(sig.name, nameX, yPos + i * 60);
        doc.setFont("times", "bold");
        const positionX =
          margin + 250 + (signatureColumnWidth - positionWidth) / 2;
        doc.text(sig.position || "N/A", positionX, yPos + i * 60 + 20);
        doc.setDrawColor(200, 200, 200);
      }
    });
  }

  if (preview) {
    return URL.createObjectURL(
      new Blob([doc.output("blob")], { type: "application/pdf" })
    );
  } else {
    doc.save(
      `${(data.projectTitle || "proposal")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_proposal.pdf`
    );
    return null;
  }
};