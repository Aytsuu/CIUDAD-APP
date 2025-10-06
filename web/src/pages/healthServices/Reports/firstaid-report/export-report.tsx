// utils/export-utils.ts
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export function exportToCSV(data: any[], filename: string) {
  const csvContent = [
    Object.keys(data[0]).join(','),
    ...data.map(item => Object.values(item).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}export function exportToPDF(data: any[], filename: string) {
  try {
    // Get the printable area element
    const element = document.getElementById('printable-area');
    if (!element) {
      throw new Error('Printable area not found');
    }

    // Use html2canvas to capture the element
    html2canvas(element as HTMLElement, {
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then((canvas: HTMLCanvasElement) => {
      // Convert canvas to PDF
      const imgData: string = canvas.toDataURL('image/png');
      const pdf: jsPDF = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [215.9, 355.6] // 8.5x14 inches
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth: number = pdf.internal.pageSize.getWidth();
      const pdfHeight: number = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}


// CREATE POLICY "Give users access to folder 1fti7bw_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'image-bucket');
// CREATE POLICY "Give users access to folder 1fti7bw_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'image-bucket');