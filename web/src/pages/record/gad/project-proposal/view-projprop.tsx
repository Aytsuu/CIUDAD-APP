import { jsPDF } from "jspdf";
import { useEffect, useState, useRef } from "react";
import { ProjectProposal } from "./projprop-types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";

interface ViewProjectProposalProps {
  project: ProjectProposal;
  onLoad?: () => void;
  onError?: () => void;
  onEdit?: () => void;
  onClose?: () => void;
  projectSource?: string;
}

export const ViewProjectProposal: React.FC<ViewProjectProposalProps> = ({
  project,
  onLoad,
  onError,
  onClose,
  projectSource = "unknown"
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState(false);
  const isMounted = useRef(true);

  const {
    projectTitle = "Untitled Project",
    background = "",
    objectives = [],
    participants = [],
    date = "",
    venue = "",
    budgetItems = [],
    monitoringEvaluation = "",
    signatories = [],
    headerImage = null,
    paperSize = "a4",
  } = project;

  // Adjusted to prioritize gprHeaderImage from API
  const effectiveHeaderImage = project.headerImage || // API field
    headerImage ||
    (project as any).gprHeaderImg ||
    (project as any).gpr_header_img ||
    (project as any).gprHeaderImage ||
    (project as any).gpr_header_image ||
    null;

  console.log(`ViewProjectProposal - Source: ${projectSource}, Raw project data:`, project);
  console.log("ViewProjectProposal - Header image sources:", {
    headerImage,
    gprHeaderImg: (project as any).gprHeaderImg,
    gpr_header_img: (project as any).gpr_header_img,
    gprHeaderImage: project.headerImage, // Explicitly log API field
    gpr_header_image: (project as any).gpr_header_image,
    hasGprHeaderImg: 'gpr_header_img' in project,
    effectiveHeaderImage,
    rawGprId: project.gprId
  });

  useEffect(() => {
    isMounted.current = true;
    setIsGenerating(true);
    setGenerationError(false);

    const generatePDF = async () => {
      try {
        console.log("generatePDF - Using header image:", effectiveHeaderImage);

        const pageSize = {
          a4: [595.28, 841.89],
          letter: [612, 792],
          legal: [612, 1008],
        }[paperSize] || [595.28, 841.89];

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: paperSize,
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

        if (effectiveHeaderImage) {
          try {
            let dataUrl = effectiveHeaderImage;
            console.log("Processing header image:", dataUrl);
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
                    console.log("Header image added successfully");
                    resolve();
                  } catch (e) {
                    console.error("Error adding image to PDF:", e);
                    reject(e);
                  }
                };
                img.onerror = () => {
                  console.error("Failed to load image:", dataUrl);
                  reject(new Error("Image failed to load"));
                };
              });
            } else {
              console.warn("Invalid data URL for header image");
              yPos = addTextWithPageBreak(
                "No header image available",
                margin,
                yPos,
                pageWidth - margin * 2,
                { italic: true, fontSize: 10 }
              );
              yPos += 20;
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
        } else {
          console.warn("No header image provided");
          yPos = addTextWithPageBreak(
            "No header image available",
            margin,
            yPos,
            pageWidth - margin * 2,
            { italic: true, fontSize: 10 }
          );
          yPos += 20;
        }

        doc.setFont("times", "bold");
        doc.setFontSize(20);
        const titleWidth = doc.getTextWidth("PROJECT PROPOSAL");
        doc.text("PROJECT PROPOSAL", (pageWidth - titleWidth) / 2, yPos);
        doc.setFont("times", "normal");
        doc.setFontSize(12);
        yPos += sectionGap + lineHeight;

        yPos = addSectionTitle("Project Title:", yPos);
        yPos = addTextWithPageBreak(projectTitle || "Untitled", margin, yPos, pageWidth - margin * 2);
        yPos += sectionGap;

        yPos = addSectionTitle("Background:", yPos);
        yPos = addTextWithPageBreak(background || "No background provided", margin, yPos, pageWidth - margin * 2);
        yPos += sectionGap;

        yPos = addSectionTitle("Objectives:", yPos);
        if (objectives.length === 0 || objectives.every(obj => !obj.trim())) {
          yPos = addTextWithPageBreak("No objectives provided", margin + 10, yPos, pageWidth - margin * 2 - 10);
        } else {
          objectives.forEach((obj) => {
            if (obj.trim()) {
              yPos = addTextWithPageBreak(`• ${obj}`, margin + 10, yPos, pageWidth - margin * 2 - 10);
            }
          });
        }
        yPos += sectionGap;

        yPos = addSectionTitle("Participants:", yPos);
        if (participants.length === 0 || participants.every(p => !p.category.trim())) {
          yPos = addTextWithPageBreak("No participants provided", margin, yPos, pageWidth - margin * 2);
        } else {
          participants.forEach((participant) => {
            if (participant.category.trim()) {
              // const count = parseInt(participant.count, 10) || 0;
              // const text = `${count} ${participant.category}`;
              const text = `${participant.count || "0"} ${participant.category}`;
              yPos = addTextWithPageBreak(text, margin, yPos, pageWidth - margin * 2);
            }
          });
        }
        yPos += sectionGap;

        yPos = addSectionTitle("Date and Venue:", yPos);
        yPos = addTextWithPageBreak(date || "No date provided", margin, yPos, pageWidth - margin * 2);
        yPos = addTextWithPageBreak(venue || "No venue provided", margin, yPos, pageWidth - margin * 2);
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
        if (budgetItems.length === 0 || budgetItems.every(item => !item.name.trim())) {
          yPos = addTableRow(["No budget items provided", "", "", ""], yPos);
        } else {
          budgetItems.forEach((item) => {
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
        yPos = addTextWithPageBreak(monitoringEvaluation || "No evaluation provided", margin, yPos, pageWidth - margin * 2);
        yPos += sectionGap;

        const preparedBy = signatories.filter((s) => s.type === "prepared");
        const approvedBy = signatories.filter((s) => s.type === "approved");

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

        const url = URL.createObjectURL(
          new Blob([doc.output("blob")], { type: "application/pdf" })
        );
        if (isMounted.current) {
          setPdfUrl(url);
          setIsGenerating(false);
          onLoad?.();
        }
      } catch (error) {
        console.error("PDF generation failed:", error);
        if (isMounted.current) {
          setGenerationError(true);
          setIsGenerating(false);
          onError?.();
        }
      }
    };

    const timer = setTimeout(() => {
      generatePDF();
    }, 50);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [project, effectiveHeaderImage, onLoad, onError]);

  if (pdfUrl && !isGenerating) {
    return (
      <div className="w-full h-full flex flex-col">
        <iframe
          src={`${pdfUrl}#zoom=FitH`}
          className="flex-1 w-full border-0 bg-white"
          title="PDF Preview"
          onLoad={() => onLoad?.()}
          onError={() => {
            setGenerationError(true);
            onError?.();
          }}
        />
      </div>
    );
  }

  if (generationError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
        <span className="text-lg font-medium">Failed to generate PDF</span>
        <span className="text-sm">Please try again later</span>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 space-y-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  );
};

export default ViewProjectProposal;