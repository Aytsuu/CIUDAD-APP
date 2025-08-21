// components/export/ExportButton.tsx
import { Button } from "@/components/ui/button/button";
import { FileInput } from "lucide-react";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
  columns: {
    key: string;
    header: string;
    format?: (row: any) => any;  // Changed to accept the full row
  }[];
}

export function ExportButton<T>({ data, filename, columns }: ExportButtonProps<T>) {
  const exportToCSV = () => {
    try {
      const headers = columns.map(col => col.header);
      const csvData = data.map(item =>
        columns.map(col => {
          // Pass the entire item to the format function if it exists
          return col.format 
            ? `"${col.format(item)}"` 
            : `"${(item as any)[col.key] ?? ''}"`;
        })
      );

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export to CSV. Please try again.");
    }
  };

  const exportToExcel = () => {
    try {
      const excelData = data.map(item =>
        columns.reduce((acc, col) => {
          acc[col.header] = col.format 
            ? col.format(item)
            : (item as any)[col.key] ?? '';
          return acc;
        }, {} as Record<string, any>)
      );

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const headers = columns.map(col => col.header);
      const pdfData = data.map(item =>
        columns.map(col => {
          return col.format 
            ? col.format(item)
            : (item as any)[col.key] ?? '';
        })
      );
  
      autoTable(doc, {
        head: [headers],
        body: pdfData,
        theme: 'grid',
        styles: { fontSize: 8, textColor: [0, 0, 0] }, // Ensure text is black
        headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0] } // bg-gray-200 in RGB, text black
      });
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export to PDF. Please try again.");
    }
  };
  
  // Rest of your component remains the same...
  const exportOptions = [
    { id: "csv", name: "Export as CSV" },
    { id: "excel", name: "Export as Excel" },
    { id: "pdf", name: "Export as PDF" },
  ];

  const handleExport = (type: string) => {
    switch (type) {
      case 'Export as CSV':
        exportToCSV();
        break;
      case 'Export as Excel':
        exportToExcel();
        break;
      case 'Export as PDF':
        exportToPDF();
        break;
      default:
        console.warn("Unknown export type:", type);
        break;
    }
  };

  const handleSelect = (id: string) => {
    const selectedOption = exportOptions.find(option => option.id === id);
    if (selectedOption) {
      handleExport(selectedOption.name);
    } else {
      console.warn("Selected option not found:", id);
    }
  };

  return (
    <DropdownLayout
      trigger={
        <Button variant="outline" className="border border-gray-200">
          <FileInput /> Export
        </Button>
      }
      options={exportOptions}
      onSelect={handleSelect}
    />
  );
}