// import { ResidentRecord } from '../profilingTypes';
// import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';
// import {autoTable} from 'jspdf-autotable';

// // Helper function to format date for CSV/Excel exports
// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString();
// };

// // Export to CSV
// export const exportToCSV = (data: ResidentRecord[]) => {
//   // Create CSV content
//   const headers = ["Resident No.", "Household No.", "Family No.", "Sitio", "Last Name", "First Name", "M.I", "Suffix", "Date Registered"];
  
//   let csvContent = headers.join(",") + "\n";
  
//   data.forEach(row => {
//     const values = [
//       row.id,
//       row.householdNo,
//       row.familyNo,
//       row.sitio,
//       `"${row.lastName}"`, // Quotes to handle commas in names
//       `"${row.firstName}"`,
//       row.mi,
//       row.suffix,
//       formatDate(row.dateRegistered)
//     ];
//     csvContent += values.join(",") + "\n";
//   });
  
//   // Create blob and download
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.setAttribute('href', url);
//   link.setAttribute('download', 'resident_records.csv');
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

// // Export to Excel
// export const exportToExcel = (data: ResidentRecord[]) => {
//   // Format data for Excel
//   const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
//     'Resident No.': row.id,
//     'Household No.': row.householdNo,
//     'Family No.': row.familyNo,
//     'Sitio': row.sitio,
//     'Last Name': row.lastName,
//     'First Name': row.firstName,
//     'M.I': row.mi,
//     'Suffix': row.suffix,
//     'Date Registered': formatDate(row.dateRegistered)
//   })));
  
//   // Set column widths
//   const columnWidths = [
//     { wch: 12 }, // Resident No.
//     { wch: 15 }, // Household No.
//     { wch: 12 }, // Family No.
//     { wch: 15 }, // Sitio
//     { wch: 20 }, // Last Name
//     { wch: 20 }, // First Name
//     { wch: 8 },  // M.I
//     { wch: 10 }, // Suffix
//     { wch: 15 }  // Date Registered
//   ];
//   worksheet['!cols'] = columnWidths;
  
//   // Create workbook and add worksheet
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Resident Records');
  
//   // Generate Excel file and trigger download
//   XLSX.writeFile(workbook, 'resident_records.xlsx');
// };

// // Export to PDF - Fixed version
// export const exportToPDF = (data: ResidentRecord[]) => {
//   // Create new document
//   const doc = new jsPDF('landscape');
  
//   // Add jspdf-autotable plugin
//   import('jspdf-autotable').then(() => {
//     // Set title
//     doc.setFontSize(18);
//     doc.text('Resident Records', 14, 22);
//     doc.setFontSize(12);
//     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
//     // Format data for PDF table
//     const tableData = data.map(row => [
//       row.id,
//       row.householdNo,
//       row.familyNo,
//       row.sitio,
//       row.lastName,
//       row.firstName,
//       row.mi,
//       row.suffix,
//       formatDate(row.dateRegistered)
//     ]);
    
//     // Use the autoTable function
//     autoTable(doc, {
//       startY: 40,
//       head: [['Resident No.', 'Household No.', 'Family No.', 'Sitio', 'Last Name', 'First Name', 'M.I', 'Suffix', 'Date Registered']],
//       body: tableData,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [66, 139, 202], textColor: 255 },
//       alternateRowStyles: { fillColor: [240, 240, 240] }
//     });
    
//     // Save PDF file
//     doc.save('resident_records.pdf');
//   });
// };