import { useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Label } from '@/components/ui/label';
import { DataTableViewing } from '@/components/ui/table/data-table-viewing';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Assuming sanRoqueLogo has been converted to a base64 string (e.g., PNG)
const sanRoqueLogoBase64 = "web\src\assets\images\sanRoqueLogo.svg"

interface AttendanceSheetViewProps {
  ce_id: number | null;
  selectedAttendees: { name: string; designation: string }[];
  activity: string;
  date: string;
  time: string;
  place: string;
  category: "meeting" | "activity";
  description: string;
  onConfirm: () => void;
}

const attendanceColumns = [
  { accessorKey: "Number", header: "No." },
  { accessorKey: "nameOfAttendee", header: "Name" },
  { accessorKey: "designation", header: "Designation / Organization" },
  { accessorKey: "Sign", header: "Signature" },
];

function formatTimeTo12Hour(time: string) {
  const [hours, minutes] = time.split(':');
  const formattedHours = (parseInt(hours) % 12) || 12;
  const ampm = parseInt(hours) < 12 ? 'AM' : 'PM';
  return `${formattedHours}:${minutes} ${ampm}`;
}

function splitDataIntoChunks(data: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

function AttendanceSheetView({ selectedAttendees, activity, date, time, place, category, description, onConfirm }: AttendanceSheetViewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  console.log('Props:', { selectedAttendees, activity, date, time, place, category, description });

  const formattedTime = formatTimeTo12Hour(time);
  console.log('Time:', time, 'Formatted Time:', formattedTime);

  const attendanceData = selectedAttendees.map((attendee, index) => ({
    Number: (index + 1).toString(),
    nameOfAttendee: attendee.name,
    designation: attendee.designation,
    Sign: "",
  }));
  console.log('attendanceData:', attendanceData);

  const maxRowsPerPage = 10;
  const dataChunks = splitDataIntoChunks(attendanceData, maxRowsPerPage);

  const uploadPdfToDatabase = async (
    pdfBlob: Blob,
    activity: string,
    place: string,
    date: string,
    attendees: { name: string; designation: string }[],
    category: string,
    time: string,
    description: string
  ) => {
    const formData = new FormData();
    formData.append('file', pdfBlob, `${activity}.pdf`);
    formData.append('activity', activity);
    formData.append('place', place);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('attendees', JSON.stringify(attendees));

    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      if (key === 'file') {
        console.log(`${key}:`, value);
      } else {
        console.log(`${key}:`, value);
      }
    }

    console.log('PDF Blob:', pdfBlob);
  };

  const handleOnclick = async () => {
    setIsGeneratingPDF(true);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215.9, 332],
    });

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    dataChunks.forEach((chunk, index) => {
      if (index > 0) {
        doc.addPage();
      }

      let yPosition = 20;

      if (index === 0) {
        if (sanRoqueLogoBase64) {
          doc.addImage(sanRoqueLogoBase64, 'PNG', 88, yPosition, 40, 30);
          yPosition += 35;
        }

        doc.setFontSize(12);
        doc.text('Republic of the Philippines', 108, yPosition, { align: 'center' });
        yPosition += 6;

        doc.text('Cebu City | ', 108, yPosition, { align: 'center' });
        const textWidth = doc.getTextWidth('Cebu City | ');
        doc.setFont('times', 'bold');
        doc.text('Barangay San Roque Ciudad', 108 + textWidth / 2, yPosition, { align: 'left' });
        doc.setFont('times', 'normal');
        yPosition += 6;

        doc.setLineWidth(0.5);
        doc.line(70, yPosition, 145, yPosition);
        yPosition += 10;

        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        doc.text('Office of the Barangay Captain', 108, yPosition, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        yPosition += 6;

        doc.text('Arellano Boulevard, San Roque, Cebu City', 108, yPosition, { align: 'center' });
        yPosition += 6;

        doc.text('Barangaysanroquecebu@gmail.com', 108, yPosition, { align: 'center' });
        yPosition += 6;

        doc.text('(032) 231 - 3699', 108, yPosition, { align: 'center' });
        yPosition += 15;

        doc.setFontSize(12);
        doc.text(`Activity: `, 30, yPosition);
        doc.setFont('times', 'bold');
        doc.text(activity.toUpperCase(), 50, yPosition);
        doc.setFont('times', 'normal');
        yPosition += 6;

        doc.text(`Place/Room: `, 30, yPosition);
        doc.setFont('times', 'bold');
        doc.text(place.toUpperCase(), 55, yPosition);
        doc.setFont('times', 'normal');
        yPosition += 6;

        doc.text(`Date: `, 30, yPosition);
        doc.setFont('times', 'bold');
        doc.text(date, 45, yPosition);
        doc.setFont('times', 'normal');
        yPosition += 6;

        doc.text(`Time: `, 30, yPosition);
        doc.setFont('times', 'bold');
        doc.text(formattedTime, 45, yPosition);
        doc.setFont('times', 'normal');
        yPosition += 15;

        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.text('ATTENDANCE SHEET', 108, yPosition, { align: 'center' });
        doc.setFont('times', 'normal');
        yPosition += 15;
      }

      (doc as any).autoTable({
        startY: yPosition,
        head: [['No.', 'Name', 'Designation / Organization', 'Signature']],
        body: chunk.map(row => [row.Number, row.nameOfAttendee, row.designation, row.Sign]),
        theme: 'grid',
        styles: { font: 'times', fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 60 },
          2: { cellWidth: 60 },
          3: { cellWidth: 40 },
        },
      });
    });

    const pdfBlob = doc.output('blob');
    await uploadPdfToDatabase(pdfBlob, activity, place, date, selectedAttendees, category, formattedTime, description);

    setIsGeneratingPDF(false);
    onConfirm();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-[50px]">
      <div id="converted">
        {dataChunks.map((chunk, index) => (
          <div key={index} className={`w-[816px] h-[1248px] bg-white p-[96px] flex flex-col items-center ${!isGeneratingPDF ? 'border border-black' : ''} mb-[2px]`}>
            {index === 0 && (
              <>
                <div className="w-40 h-30 bg-gray-200 flex items-center justify-center">
                  <Label>Logo Placeholder</Label>
                </div>

                <div className="flex flex-col w-full items-center pt-5 p-5 gap-2">
                  <Label className="text-[16px]">Republic of the Philippines</Label>
                  <Label className="text-[16px]">Cebu City | <Label className="font-bold text-[16px]">Barangay San Roque Ciudad</Label></Label>
                  <hr className="border-black w-[350px]" />
                </div>

                <div className="flex flex-col w-full items-center pb-10">
                  <Label className="font-bold text-[18px]">Office of the Barangay Captain</Label>
                  <Label className="text-[16px]">Arellano Boulevard, San Roque, Cebu City</Label>
                  <Label className="text-[16px]">Barangaysanroquecebu@gmail.com</Label>
                  <Label className="text-[18px]">(032) 231 - 3699</Label>
                </div>

                <div className="flex flex-col w-full items-center pb-8">
                  <Label className="text-[16px]">Activity: <Label className="font-bold text-[16px]">{activity.toUpperCase()}</Label></Label>
                  <Label className="text-[16px]">Place/Room: <Label className="font-bold text-[16px]">{place.toUpperCase()}</Label></Label>
                  <Label className="text-[16px]">Date: <Label className="font-bold text-[16px]">{date}</Label></Label>
                  <Label className="text-[16px]">Time: <Label className="font-bold text-[16px]">{formattedTime}</Label></Label>
                </div>

                <Label className="font-bold text-[20px]">ATTENDANCE SHEET</Label>
              </>
            )}

            <DataTableViewing columns={attendanceColumns} data={chunk} />
          </div>
        ))}
      </div>
      <div className="flex w-full pt-10 justify-end">
        <Button onClick={handleOnclick} disabled={isGeneratingPDF}>
          {isGeneratingPDF ? 'Generating PDF...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}

export default AttendanceSheetView;