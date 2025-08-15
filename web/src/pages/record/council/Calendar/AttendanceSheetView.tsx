import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import sanroque_logo from "@/assets/images/sanroque_logo.jpg";
import { AttendanceSheetViewProps } from "./ce-att-types";

function formatTimeTo12Hour(time: string | undefined) {
  if (!time) return "N/A";
  const [hours, minutes] = time.split(":");
  const formattedHours = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) < 12 ? "AM" : "PM";
  return `${formattedHours}:${minutes} ${ampm}`;
}

function splitDataIntoChunks(data: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

async function generatePDF(
  doc: jsPDF,
  dataChunks: any[][],
  activity: string,
  date: string,
  _time: string,
  place: string,
  formattedTime: string,
  logoBase64: string | null
) {
  doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [612, 936],
  });

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  const margin = 62;
  let yPos = margin;
  const pageWidth = 612;

  // Header Section
  if (logoBase64) {
    try {
      // Load the image and wait for it
      const img = await loadImage(logoBase64);
      const logoWidth = 100;
      const imgHeight = (img.height / img.width) * logoWidth;
      const maxHeight = 100;
      const scaleFactor = Math.min(1, maxHeight / imgHeight);
      const finalHeight = imgHeight * scaleFactor;
      const xPos = (pageWidth - logoWidth) / 2;

      doc.addImage(logoBase64, "JPEG", xPos, margin, logoWidth, finalHeight);
      yPos += finalHeight + 30;
    } catch (error) {
      yPos += 10;
    }
  } else {
    yPos += 10;
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  doc.setFontSize(14);
  doc.text("Republic of the Philippines", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 20;

  doc.setFont("times", "bold");
  doc.text("Cebu City | Barangay San Roque Ciudad", pageWidth / 2, yPos, {
    align: "center",
  });
  doc.setFont("times", "normal");
  yPos += 10;

  doc.text(
    "_____________________________________________________",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 30;

  doc.setFont("times", "bold");
  doc.text("Office of the Barangay Captain", pageWidth / 2, yPos, {
    align: "center",
  });
  doc.setFont("times", "normal");
  yPos += 20;

  doc.setFontSize(11);
  doc.text("Arellano Boulevard, San Roque, Cebu City", pageWidth / 2, yPos, {
    align: "center",
  });
  yPos += 15;
  doc.text(
    "Barangaysanroquecebu@gmail.com | (032) 231 - 3699",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 50;

  // Activity Details
  doc.setFontSize(12);
  doc.setFont("times", "bold");
  doc.text("Activity:", margin, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${activity.toUpperCase()}`, margin + 50, yPos);
  yPos += 20;

  doc.setFont("times", "bold");
  doc.text("Place/Room:", margin, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${place.toUpperCase()}`, margin + 70, yPos);
  yPos += 20;

  doc.setFont("times", "bold");
  doc.text("Date:", margin, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${date}`, margin + 30, yPos);
  yPos += 20;

  doc.setFont("times", "bold");
  doc.text("Time:", margin, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${formattedTime}`, margin + 30, yPos);
  yPos += 40;

  // Title
  doc.setFontSize(16);
  doc.setFont("times", "bold");
  doc.text("ATTENDANCE SHEET", pageWidth / 2, yPos, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("times", "normal");
  yPos += 15;

  // Table
  dataChunks.forEach((chunk, index) => {
    if (index > 0) {
      doc.addPage();
      yPos = margin;
    }

    autoTable(doc, {
      startY: yPos,
      head: [["No.", "Name", "Designation / Organization", "Signature"]],
      body:
        chunk.length > 0
          ? chunk.map((row, i) => [
              (index * 10 + i + 1).toString(),
              row.nameOfAttendee || "N/A",
              row.designation || "N/A",
              "",
            ])
          : [["1", "No attendees available", "", ""]],
      theme: "grid",
      styles: {
        font: "times",
        fontSize: 12,
        cellPadding: 5,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 50, halign: "center" },
        1: { cellWidth: 150 },
        2: { cellWidth: 200 },
        3: { cellWidth: 100, halign: "center" },
      },
      bodyStyles: {
        halign: "center",
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
  });

  return doc.output("blob");
}

const AttendanceSheetView: React.FC<AttendanceSheetViewProps> = ({
  selectedAttendees = [],
  activity = "Untitled Activity",
  date = "No date provided",
  time = "N/A",
  place = "No place provided",
  onLoad,
  onError,
  onClose,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationError, setGenerationError] = useState(false);
  const [sanRoqueLogoBase64, setSanRoqueLogoBase64] = useState<string | null>(
    null
  );
  const isMounted = useRef(true);

  const formattedTime = formatTimeTo12Hour(time);
  const attendanceData = selectedAttendees.map((attendee) => ({
    Number: "",
    nameOfAttendee: attendee.name || "N/A",
    designation: attendee.designation || "N/A",
    Sign: "",
  }));

  const maxRowsPerPage = 10;
  const dataChunks = splitDataIntoChunks(attendanceData, maxRowsPerPage);

  // Convert image to base64 with debugging
  useEffect(() => {
    const convertImageToBase64 = () => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = sanroque_logo;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL("image/jpeg");
          setSanRoqueLogoBase64(base64);
        }
      };
    };
    convertImageToBase64();
  }, [sanroque_logo]);

  useEffect(() => {
    isMounted.current = true;
    setIsGenerating(true);
    setGenerationError(false);

    const generateAndSetPDF = async () => {
      try {
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: [612, 792], // Letter size: 8.5 x 11 inches
        });

        const pdfBlob = await generatePDF(
          doc,
          dataChunks,
          activity,
          date,
          time,
          place,
          formattedTime,
          sanRoqueLogoBase64
        );

        const url = URL.createObjectURL(
          new Blob([pdfBlob], { type: "application/pdf" })
        );

        if (isMounted.current) {
          setPdfUrl(url);
          setIsGenerating(false);
          onLoad?.();
        }
      } catch (error) {
        if (isMounted.current) {
          setGenerationError(true);
          setIsGenerating(false);
          onError?.();
        }
      }
    };

    if (sanRoqueLogoBase64) {
      generateAndSetPDF();
    }
  }, [
    activity,
    date,
    time,
    place,
    selectedAttendees,
    formattedTime,
    sanRoqueLogoBase64,
  ]);

  return (
    <div className="w-full h-full flex flex-col">
      {generationError ? (
        <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
          <span className="text-lg font-medium">Failed to generate PDF</span>
          <span className="text-sm">Please try again later</span>
          <Button
            variant="outline"
            onClick={() => onClose?.()}
            className="mt-4"
          >
            Close
          </Button>
        </div>
      ) : isGenerating ? (
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
      ) : (
        <iframe
          src={`${pdfUrl}#zoom=FitH`}
          className="flex-1 w-full border-0 bg-white"
          style={{ minHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          title="Attendance PDF Preview"
          onLoad={() => {
            onLoad?.();
          }}
          onError={() => {
            setGenerationError(true);
            onError?.();
          }}
        />
      )}
    </div>
  );
};

export default AttendanceSheetView;