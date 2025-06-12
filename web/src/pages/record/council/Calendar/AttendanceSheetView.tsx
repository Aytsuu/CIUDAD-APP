// import { useState } from 'react';
// import { Button } from '@/components/ui/button/button';
// import { Label } from '@/components/ui/label';
// import { DataTableViewing } from '@/components/ui/table/data-table-viewing';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// // Assuming sanRoqueLogo has been converted to a base64 string (e.g., PNG)
// const sanRoqueLogoBase64 = "web\src\assets\images\sanRoqueLogo.svg"

// interface AttendanceSheetViewProps {
//   ce_id: number | null;
//   selectedAttendees: { name: string; designation: string }[];
//   activity: string;
//   date: string;
//   time: string;
//   place: string;
//   category: "meeting" | "activity";
//   description: string;
//   onConfirm: () => void;
// }

// const attendanceColumns = [
//   { accessorKey: "Number", header: "No." },
//   { accessorKey: "nameOfAttendee", header: "Name" },
//   { accessorKey: "designation", header: "Designation / Organization" },
//   { accessorKey: "Sign", header: "Signature" },
// ];

// function formatTimeTo12Hour(time: string) {
//   const [hours, minutes] = time.split(':');
//   const formattedHours = (parseInt(hours) % 12) || 12;
//   const ampm = parseInt(hours) < 12 ? 'AM' : 'PM';
//   return `${formattedHours}:${minutes} ${ampm}`;
// }

// function splitDataIntoChunks(data: any[], chunkSize: number) {
//   const chunks = [];
//   for (let i = 0; i < data.length; i += chunkSize) {
//     chunks.push(data.slice(i, i + chunkSize));
//   }
//   return chunks;
// }

// function AttendanceSheetView({ selectedAttendees, activity, date, time, place, category, description, onConfirm }: AttendanceSheetViewProps) {
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

//   console.log('Props:', { selectedAttendees, activity, date, time, place, category, description });

//   const formattedTime = formatTimeTo12Hour(time);
//   console.log('Time:', time, 'Formatted Time:', formattedTime);

//   const attendanceData = selectedAttendees.map((attendee, index) => ({
//     Number: (index + 1).toString(),
//     nameOfAttendee: attendee.name,
//     designation: attendee.designation,
//     Sign: "",
//   }));
//   console.log('attendanceData:', attendanceData);

//   const maxRowsPerPage = 10;
//   const dataChunks = splitDataIntoChunks(attendanceData, maxRowsPerPage);

//   const uploadPdfToDatabase = async (
//     pdfBlob: Blob,
//     activity: string,
//     place: string,
//     date: string,
//     attendees: { name: string; designation: string }[],
//     category: string,
//     time: string,
//     description: string
//   ) => {
//     const formData = new FormData();
//     formData.append('file', pdfBlob, `${activity}.pdf`);
//     formData.append('activity', activity);
//     formData.append('place', place);
//     formData.append('date', date);
//     formData.append('time', time);
//     formData.append('category', category);
//     formData.append('description', description);
//     formData.append('attendees', JSON.stringify(attendees));

//     console.log('FormData contents:');
//     for (const [key, value] of formData.entries()) {
//       if (key === 'file') {
//         console.log(`${key}:`, value);
//       } else {
//         console.log(`${key}:`, value);
//       }
//     }

//     console.log('PDF Blob:', pdfBlob);
//   };

//   const handleOnclick = async () => {
//     setIsGeneratingPDF(true);

//     const doc = new jsPDF({
//       orientation: 'portrait',
//       unit: 'mm',
//       format: [215.9, 332],
//     });

//     doc.setFont('times', 'normal');
//     doc.setFontSize(12);

//     dataChunks.forEach((chunk, index) => {
//       if (index > 0) {
//         doc.addPage();
//       }

//       let yPosition = 20;

//       if (index === 0) {
//         if (sanRoqueLogoBase64) {
//           doc.addImage(sanRoqueLogoBase64, 'PNG', 88, yPosition, 40, 30);
//           yPosition += 35;
//         }

//         doc.setFontSize(12);
//         doc.text('Republic of the Philippines', 108, yPosition, { align: 'center' });
//         yPosition += 6;

//         doc.text('Cebu City | ', 108, yPosition, { align: 'center' });
//         const textWidth = doc.getTextWidth('Cebu City | ');
//         doc.setFont('times', 'bold');
//         doc.text('Barangay San Roque Ciudad', 108 + textWidth / 2, yPosition, { align: 'left' });
//         doc.setFont('times', 'normal');
//         yPosition += 6;

//         doc.setLineWidth(0.5);
//         doc.line(70, yPosition, 145, yPosition);
//         yPosition += 10;

//         doc.setFont('times', 'bold');
//         doc.setFontSize(14);
//         doc.text('Office of the Barangay Captain', 108, yPosition, { align: 'center' });
//         doc.setFont('times', 'normal');
//         doc.setFontSize(12);
//         yPosition += 6;

//         doc.text('Arellano Boulevard, San Roque, Cebu City', 108, yPosition, { align: 'center' });
//         yPosition += 6;

//         doc.text('Barangaysanroquecebu@gmail.com', 108, yPosition, { align: 'center' });
//         yPosition += 6;

//         doc.text('(032) 231 - 3699', 108, yPosition, { align: 'center' });
//         yPosition += 15;

//         doc.setFontSize(12);
//         doc.text(`Activity: `, 30, yPosition);
//         doc.setFont('times', 'bold');
//         doc.text(activity.toUpperCase(), 50, yPosition);
//         doc.setFont('times', 'normal');
//         yPosition += 6;

//         doc.text(`Place/Room: `, 30, yPosition);
//         doc.setFont('times', 'bold');
//         doc.text(place.toUpperCase(), 55, yPosition);
//         doc.setFont('times', 'normal');
//         yPosition += 6;

//         doc.text(`Date: `, 30, yPosition);
//         doc.setFont('times', 'bold');
//         doc.text(date, 45, yPosition);
//         doc.setFont('times', 'normal');
//         yPosition += 6;

//         doc.text(`Time: `, 30, yPosition);
//         doc.setFont('times', 'bold');
//         doc.text(formattedTime, 45, yPosition);
//         doc.setFont('times', 'normal');
//         yPosition += 15;

//         doc.setFont('times', 'bold');
//         doc.setFontSize(16);
//         doc.text('ATTENDANCE SHEET', 108, yPosition, { align: 'center' });
//         doc.setFont('times', 'normal');
//         yPosition += 15;
//       }

//       (doc as any).autoTable({
//         startY: yPosition,
//         head: [['No.', 'Name', 'Designation / Organization', 'Signature']],
//         body: chunk.map(row => [row.Number, row.nameOfAttendee, row.designation, row.Sign]),
//         theme: 'grid',
//         styles: { font: 'times', fontSize: 10, cellPadding: 3 },
//         headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
//         margin: { left: 20, right: 20 },
//         columnStyles: {
//           0: { cellWidth: 15 },
//           1: { cellWidth: 60 },
//           2: { cellWidth: 60 },
//           3: { cellWidth: 40 },
//         },
//       });
//     });

//     const pdfBlob = doc.output('blob');
//     await uploadPdfToDatabase(pdfBlob, activity, place, date, selectedAttendees, category, formattedTime, description);

//     setIsGeneratingPDF(false);
//     onConfirm();
//   };

//   return (
//     <div className="w-full flex flex-col items-center justify-center p-[50px]">
//       <div id="converted">
//         {dataChunks.map((chunk, index) => (
//           <div key={index} className={`w-[816px] h-[1248px] bg-white p-[96px] flex flex-col items-center ${!isGeneratingPDF ? 'border border-black' : ''} mb-[2px]`}>
//             {index === 0 && (
//               <>
//                 <div className="w-40 h-30 bg-gray-200 flex items-center justify-center">
//                   <Label>Logo Placeholder</Label>
//                 </div>

//                 <div className="flex flex-col w-full items-center pt-5 p-5 gap-2">
//                   <Label className="text-[16px]">Republic of the Philippines</Label>
//                   <Label className="text-[16px]">Cebu City | <Label className="font-bold text-[16px]">Barangay San Roque Ciudad</Label></Label>
//                   <hr className="border-black w-[350px]" />
//                 </div>

//                 <div className="flex flex-col w-full items-center pb-10">
//                   <Label className="font-bold text-[18px]">Office of the Barangay Captain</Label>
//                   <Label className="text-[16px]">Arellano Boulevard, San Roque, Cebu City</Label>
//                   <Label className="text-[16px]">Barangaysanroquecebu@gmail.com</Label>
//                   <Label className="text-[18px]">(032) 231 - 3699</Label>
//                 </div>

//                 <div className="flex flex-col w-full items-center pb-8">
//                   <Label className="text-[16px]">Activity: <Label className="font-bold text-[16px]">{activity.toUpperCase()}</Label></Label>
//                   <Label className="text-[16px]">Place/Room: <Label className="font-bold text-[16px]">{place.toUpperCase()}</Label></Label>
//                   <Label className="text-[16px]">Date: <Label className="font-bold text-[16px]">{date}</Label></Label>
//                   <Label className="text-[16px]">Time: <Label className="font-bold text-[16px]">{formattedTime}</Label></Label>
//                 </div>

//                 <Label className="font-bold text-[20px]">ATTENDANCE SHEET</Label>
//               </>
//             )}

//             <DataTableViewing columns={attendanceColumns} data={chunk} />
//           </div>
//         ))}
//       </div>
//       <div className="flex w-full pt-10 justify-end">
//         <Button onClick={handleOnclick} disabled={isGeneratingPDF}>
//           {isGeneratingPDF ? 'Generating PDF...' : 'Submit'}
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default AttendanceSheetView;

import { jsPDF } from "jspdf"; 
import autoTable from "jspdf-autotable";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";

const sanRoqueLogoBase64 = "data:image/svg+xml;base64,YOUR_BASE64_ENCODED_SVG_HERE";

interface AttendanceSheetViewProps {
  selectedAttendees?: { name: string; designation: string }[];
  activity?: string;
  date?: string;
  time?: string;
  place?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

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

function generatePDF(
  doc: jsPDF,
  dataChunks: any[][],
  activity: string,
  date: string,
  time: string,
  place: string,
  formattedTime: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  dataChunks.forEach((chunk, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let yPosition = 20;

    if (index === 0) {
      if (sanRoqueLogoBase64) {
        try {
          const logoWidth = 40;
          const logoX = centerX - (logoWidth / 2);
          doc.addImage(sanRoqueLogoBase64, "SVG", logoX, yPosition, logoWidth, 30);
          yPosition += 35;
        } catch (error) {
          console.warn("Logo failed to load, skipping:", error);
          yPosition += 10;
        }
      }

      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text("Republic of the Philippines", centerX, yPosition, { align: "center" });
      yPosition += 7;

      const cityText = "Cebu City | ";
      const cityTextWidth = doc.getTextWidth(cityText);
      doc.text(cityText, centerX - (cityTextWidth / 2), yPosition);
      doc.setFont("helvetica", "bold");
      doc.text("Barangay San Roque Ciudad", centerX + (cityTextWidth / 2), yPosition, { align: "left" });
      doc.setFont("helvetica", "normal");
      yPosition += 7;

      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(centerX - 35, yPosition, centerX + 35, yPosition);
      yPosition += 12;

      doc.setFont("helvetica", "bold");
      doc.text("Office of the Barangay Captain", centerX, yPosition, { align: "center" });
      doc.setFont("helvetica", "normal");
      yPosition += 6;

      doc.setFontSize(11);
      doc.text("Arellano Boulevard, San Roque, Cebu City", centerX, yPosition, { align: "center" });
      yPosition += 5;
      doc.text("Barangaysanroquecebu@gmail.com | (032) 231 - 3699", centerX, yPosition, { align: "center" });
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ACTIVITY DETAILS", centerX, yPosition, { align: "center" });
      doc.setFont("helvetica", "normal");
      yPosition += 10;

      const detailsLeft = 30;

      doc.text("Activity:", detailsLeft, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(activity.toUpperCase(), detailsLeft + 20, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;

      doc.text("Place/Room:", detailsLeft, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(place.toUpperCase(), detailsLeft + 25, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;

      doc.text("Date:", detailsLeft, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(date, detailsLeft + 15, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 7;

      doc.text("Time:", detailsLeft, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(formattedTime, detailsLeft + 15, yPosition);
      doc.setFont("helvetica", "normal");
      yPosition += 15;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("ATTENDANCE SHEET", centerX, yPosition, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      yPosition += 12;
    }

    autoTable(doc, {
      startY: yPosition,
      head: [["No.", "Name", "Designation / Organization", "Signature"]],
      body: chunk.length > 0
        ? chunk.map((row, i) => [
            (i + 1 + index * 10).toString(),
            row.nameOfAttendee,
            row.designation,
            ""
          ])
        : [["1", "No Attendees", "", ""]],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 4,
        textColor: [50, 50, 50]
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center"
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 65 },
        2: { cellWidth: 65 },
        3: { cellWidth: 35, halign: "center" }
      },
      bodyStyles: {
        halign: "left",
        valign: "middle"
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    if (index === 0) {
      const pageHeight = doc.internal.pageSize.height;
      const footerY = pageHeight - 15;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Generated by Barangay San Roque System", centerX, footerY, { align: "center" });
    }
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

  useEffect(() => {
    isMounted.current = true;
    setIsGenerating(true);
    setGenerationError(false);

    const generateAndSetPDF = async () => {
      try {
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfBlob = await generatePDF(
          doc,
          dataChunks,
          activity,
          date,
          time,
          place,
          formattedTime
        );

        const url = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));

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

    generateAndSetPDF();

    return () => {
      isMounted.current = false;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [activity, date, time, place, selectedAttendees, formattedTime]);

  return (
    <div className="w-[90vw] max-w-8xl h-[90vh] flex flex-col items-center justify-center bg-white/70">
      {generationError ? (
        <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
          <span className="text-lg font-medium">Failed to generate PDF</span>
          <span className="text-sm">Please try again later</span>
          <Button variant="outline" onClick={() => onClose?.()} className="mt-4">
            Close
          </Button>
        </div>
      ) : isGenerating ? (
        <div className="w-full h-full p-6 space-y-4 overflow-auto">
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
        <div className="w-full h-full flex items-stretch justify-center p-0">
          <iframe
            src={`${pdfUrl}#zoom=Fit`}
            className="w-full h-auto border-0"
            style={{ minHeight: "100%", width: "100%", objectFit: "contain" }}
            title="Attendance PDF Preview"
            onLoad={() => onLoad?.()}
            onError={() => {
              setGenerationError(true);
              onError?.();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceSheetView;