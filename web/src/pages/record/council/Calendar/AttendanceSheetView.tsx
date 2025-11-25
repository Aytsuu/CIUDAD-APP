import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import sanroque_logo from "@/assets/images/sanroque_logo.jpg";
import { AttendanceSheetViewProps } from "./councilEventTypes";
import citylogo from "@/assets/images/cebucity_logo.png";

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
  barangayLogoBase64: string | null,
  cityLogoBase64?: string | null 
) {
  doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [612, 936],
  });

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  const marginValue = 72;
  let yPos = marginValue;
  const pageWidth = 612;

  const logoWidth = 90;
  const logoHeight = 90;

  const leftLogoX = marginValue;
  const rightLogoX = pageWidth - marginValue - logoWidth;

  if (barangayLogoBase64) {
    try {
      doc.addImage(barangayLogoBase64, "JPEG", leftLogoX, yPos, logoWidth, logoHeight);
    } catch (e) {
      console.error("Error adding barangay logo:", e);
    }
  }

  if (cityLogoBase64) {
    try {
      doc.addImage(cityLogoBase64, "JPEG", rightLogoX, yPos, logoWidth, logoHeight);
    } catch (e) {
      console.error("Error adding city logo:", e);
    }
  }

  const headerText = [
  { text: "Republic of the Philippines", bold: true, size: 12 },
  { text: "City of Cebu | San Roque Ciudad", bold: false, size: 11 },
  { text: "", drawLine: true, size: 14 }, // Removed bold property
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

  yPos = headerY + 40;

  doc.setFontSize(12);
  doc.setFont("times", "bold");
  doc.text("Activity:", marginValue, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${activity.toUpperCase()}`, marginValue + 50, yPos);
  yPos += 20;

  doc.setFont("times", "bold");
  doc.text("Place/Room:", marginValue, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${place.toUpperCase()}`, marginValue + 70, yPos);
  yPos += 20;

  doc.setFont("times", "bold");
  doc.text("Date:", marginValue, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${date}`, marginValue + 30, yPos);
  yPos += 20;

  doc.setFont("times", "bold");
  doc.text("Time:", marginValue, yPos);
  doc.setFont("times", "normal");
  doc.text(` ${formattedTime}`, marginValue + 30, yPos);
  yPos += 40;

  doc.setFontSize(16);
  doc.setFont("times", "bold");
  doc.text("ATTENDANCE SHEET", pageWidth / 2, yPos, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("times", "normal");
  yPos += 30;

  dataChunks.forEach((chunk, index) => {
    if (index > 0) {
      doc.addPage();
      yPos = marginValue;
    }

    autoTable(doc, {
      startY: yPos,
      head: [["No.", "Name", "Designation / Organization", "Signature"]],
      body:
        chunk.length > 0
          ? chunk.map((row, i) => [
              (index * 10 + i + 1).toString(),
              row.nameOfAttendee,
              row.designation ,
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
      margin: { left: marginValue, right: marginValue },
      columnStyles: {
        0: { cellWidth: 50, halign: "center" },
        1: { cellWidth: 150 },
        2: { cellWidth: 175 },
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

interface EnhancedAttendanceSheetViewProps extends AttendanceSheetViewProps {
  citylogo?: string;
  numberOfRows?: number; // Add this prop
}

const AttendanceSheetView: React.FC<EnhancedAttendanceSheetViewProps> = ({
  selectedAttendees = [],
  numberOfRows, // Add this prop
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
  const [sanRoqueLogoBase64, setSanRoqueLogoBase64] = useState<string | null>(null);
  const [cityLogoBase64, setCityLogoBase64] = useState<string | null>(null);
  const isMounted = useRef(true);

  const formattedTime = formatTimeTo12Hour(time);
  const attendanceData = numberOfRows && numberOfRows > 0 
    ? Array.from({ length: numberOfRows }, (_, _index) => ({
        Number: "",
        nameOfAttendee: "",
        designation: "",
        Sign: "",
      }))
    : selectedAttendees.map((attendee) => ({
        Number: "",
        nameOfAttendee: attendee.name,
        designation: attendee.designation,
        Sign: "",
      }));

  const maxRowsPerPage = 1000;
  const dataChunks = splitDataIntoChunks(attendanceData, maxRowsPerPage);

  useEffect(() => {
    const convertImageToBase64 = (imageSrc: string, callback: (base64: string) => void) => {
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
          callback(base64);
        }
      };
      img.onerror = () => {
        console.error("Failed to load image:", imageSrc);
        callback("");
      };
    };

    convertImageToBase64(sanroque_logo, setSanRoqueLogoBase64);
    convertImageToBase64(citylogo, setCityLogoBase64);
  }, [sanroque_logo, citylogo]);

  useEffect(() => {
    isMounted.current = true;
    setIsGenerating(true);
    setGenerationError(false);

    const generateAndSetPDF = async () => {
      try {
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: [612, 936],
        });

        const pdfBlob = await generatePDF(
          doc,
          dataChunks,
          activity,
          date,
          time,
          place,
          formattedTime,
          sanRoqueLogoBase64,
          cityLogoBase64
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
        console.error("PDF generation error:", error);
        if (isMounted.current) {
          setGenerationError(true);
          setIsGenerating(false);
          onError?.();
        }
      }
    };

    if (sanRoqueLogoBase64 && cityLogoBase64) {
      generateAndSetPDF();
    }
  }, [
    activity,
    date,
    time,
    place,
    selectedAttendees,
    numberOfRows, // Add numberOfRows to dependency array
    formattedTime,
    sanRoqueLogoBase64,
    cityLogoBase64,
  ]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

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