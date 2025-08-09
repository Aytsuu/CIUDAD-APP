import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Printer, Search, Loader2 } from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "../firstaid-report/export-report";
import { ExportDropdown } from "../firstaid-report/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useMonthlyOPTRecords } from "./queries/fetch";
import { OPTChildHealthRecord } from "./types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

// Debounce hook
function useDebounce(value: any, delay: any) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function OPTTrackingDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term for API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useMonthlyOPTRecords(month, currentPage, pageSize, debouncedSearchTerm);

  const records: OPTChildHealthRecord[] = apiResponse?.results?.report_data || [];
  const totalEntries = apiResponse?.results?.total_entries || 0;
  const totalPages = Math.ceil(totalEntries / pageSize);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch OPT records");
      console.error("API Error:", error);
    }
  }, [error]);

  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  const prepareExportData = useCallback(() => {
    return records.map((item) => ({
      "Household No": item.household_no || 'N/A',
      "Child Name": item.child_name || 'N/A',
      "Sex": item.sex || 'N/A',
      "Date of Birth": item.date_of_birth || 'N/A',
      "Age (months)": item.age_in_months?.toString() || 'N/A',
      "Name of Household Head/Mother/Caregiver": item.parents?.mother || item.parents?.father || 'N/A',
      "Address": item.address || 'N/A',
      "Sitio": item.sitio || 'N/A',
      "Transient": item.transient ? "Yes" : "No",
      "Date of Weighing": item.date_of_weighing || 'N/A',
      "Age at Weighing": item.age_at_weighing || 'N/A',
      "Weight (kg)": item.weight?.toString() || 'N/A',
      "Height (cm)": item.height?.toString() || 'N/A',
      "WFA Status": item.nutritional_status?.wfa || "N/A",
      "LHFA Status": item.nutritional_status?.lhfa || "N/A",
      "WFL Status": item.nutritional_status?.wfl || "N/A",
      "MUAC (mm)": item.nutritional_status?.muac?.toString() || "N/A",
      "Edema": item.nutritional_status?.edema || "N/A",
      "MUAC Status": item.nutritional_status?.muac_status || "N/A",
      "Type of Feeding": item.type_of_feeding || 'N/A',
    }));
  }, [records]);

  const handleExportCSV = () =>
    exportToCSV(
      prepareExportData(),
      `opt_records_${monthName.replace(" ", "_")}`
    );

  const handleExportExcel = () =>
    exportToExcel(
      prepareExportData(),
      `opt_records_${monthName.replace(" ", "_")}`
    );

  const handleExportPDF = () =>
    exportToPDF(
      prepareExportData(),
      `opt_records_${monthName.replace(" ", "_")}`
    );

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  return (
    <LayoutWithBack
      title={`OPT Tracking`}
      description={`${monthName} Child Health Records`}
    >
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, sitio, address, or family number..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            className="border-gray-200 hover:bg-gray-50"
          />
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 border-gray-200 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-700">entries</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `Showing ${startIndex} - ${endIndex} of ${totalEntries} records`
            )}
          </span>
          {!isLoading && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="text-sm"
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-b-lg overflow-hidden">
        <div
          id="printable-area"
          className="p-4"
          style={{
            minHeight: "11in",
            margin: "0 auto",
            fontSize: "12px",
          }}
        >
          <div className="text-center mb-6 print-only">
            <h1 className="font-bold text-lg uppercase">OPTUS FORM NO. 1</h1>
            <p className="text-sm">List of Preschooler with Weight and Height measurement & Identified status</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm">Province of Cebu</span>
              <span className="text-sm">Year: {new Date().getFullYear()}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-sm">Municipality: [Your Municipality]</span>
              <span className="text-sm">Month: {monthName}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="w-full h-[200px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <span className="text-sm text-gray-600">Loading records...</span>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="w-full h-[200px] flex items-center justify-center">
              <div className="text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {searchTerm ? `No records found for "${searchTerm}"` : "No records found for this month"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th rowSpan={2} className="border p-1 text-center w-[5%]">HH No.</th>
                    <th rowSpan={2} className="border p-1 text-left w-[20%]">Name of Household Head/Mother/Caregiver</th>
                    <th rowSpan={2} className="border p-1 text-center w-[5%]">ACCEPTOR<br/>Y/N</th>
                    <th rowSpan={2} className="border p-1 text-left w-[15%]">Name of Preschoolers weighed</th>
                    <th rowSpan={2} className="border p-1 text-center w-[3%]">S</th>
                    <th rowSpan={2} className="border p-1 text-center w-[8%]">Date of Birth</th>
                    <th rowSpan={2} className="border p-1 text-center w-[8%]">Date of Weighing</th>
                    <th rowSpan={2} className="border p-1 text-center w-[5%]">MOS</th>
                    <th rowSpan={2} className="border p-1 text-center w-[7%]">Weight (kg)</th>
                    <th rowSpan={2} className="border p-1 text-center w-[7%]">Height (cm)</th>
                    <th colSpan={3} className="border p-1 text-center">NUTRITIONAL STATUS</th>
                    <th rowSpan={2} className="border p-1 text-center w-[7%]">W/ CLEFT PALATE</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border p-1 text-center">WFA</th>
                    <th className="border p-1 text-center">HFA</th>
                    <th className="border p-1 text-center">WFL</th>
                    <th className="border p-1 text-center">MUAC</th>

                  </tr>
                </thead>
                <tbody>
                  {records.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-1 text-center">{item.household_no}</td>
                      <td className="border p-1">{item.parents?.mother || item.parents?.father || 'N/A'}</td>
                      <td className="border p-1 text-center">N</td>
                      <td className="border p-1">{item.child_name || 'N/A'}</td>
                      <td className="border p-1 text-center">
                        {item.sex === "Male" ? "M" : item.sex === "Female" ? "F" : 'N/A'}
                      </td>
                      <td className="border p-1 text-center">{formatDate(item.date_of_birth)}</td>
                      <td className="border p-1 text-center">{formatDate(item.date_of_weighing)}</td>
                      <td className="border p-1 text-center">{item.age_in_months?.toString() || 'N/A'}</td>
                      <td className="border p-1 text-center">{item.weight ? Number(item.weight).toFixed(2) : 'N/A'}</td>
                      <td className="border p-1 text-center">{item.height ? Number(item.height).toFixed(1) : 'N/A'}</td>
                      <td className="border p-1 text-center">{item.nutritional_status?.wfa || 'N/A'}</td>
                      <td className="border p-1 text-center">{item.nutritional_status?.lhfa || 'N/A'}</td>
                      <td className="border p-1 text-center">{item.nutritional_status?.wfl || 'N/A'}</td>
                      <td className="border p-1 text-center">{item.nutritional_status?.muac_status || 'N/A'}</td>

                      <td className="border p-1 text-center">N</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutWithBack>
  );
}