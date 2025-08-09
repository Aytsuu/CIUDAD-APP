import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Printer, Search, Loader2 } from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
} from "../../firstaid-report/export-report";
import { ExportDropdown } from "../../firstaid-report/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useMonthlyFirstAidRecords } from "./queries/fetch";
import { FirstAidInventoryItem } from "./types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function MonthlyInventoryFirstAidDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useMonthlyFirstAidRecords(month, currentPage, pageSize, searchTerm);

  const records: FirstAidInventoryItem[] =
    apiResponse?.data?.inventory_summary || [];

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch first aid records");
      toast("Retrying...");
      setTimeout(() => window.location.reload(), 2000);
    }
  }, [error]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const lower = searchTerm.toLowerCase();
    return records.filter((item) => item.fa_name.toLowerCase().includes(lower));
  }, [records, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredRecords, currentPage, pageSize]);

  const totalItems = apiResponse?.data?.total_items || filteredRecords.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const prepareExportData = () =>
    filteredRecords.map((item) => ({
      "First Aid Item": item.fa_name,
      "Opening Stock": item.opening,
      "Received Items": item.received,
      "Dispensed Items": item.dispensed,
      "Closing Stock": item.closing,
      Unit: item.unit,
      "Expiry Date": item.expiry
        ? new Date(item.expiry).toLocaleDateString()
        : "N/A",
    }));

  const handleExportCSV = () =>
    exportToCSV(
      prepareExportData(),
      `firstaid_inventory_${monthName.replace(" ", "_")}`
    );

  const handleExportExcel = () =>
    exportToExcel(
      prepareExportData(),
      `firstaid_inventory_${monthName.replace(" ", "_")}`
    );

  const handleExportPDF = () =>
    exportToPDF(
      prepareExportData(),
      `firstaid_inventory_${monthName.replace(" ", "_")}`
    );

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // <-- simplest but reloads entire page (loses app state)
  };

  const tableHeader = [
    "First Aid Item",
    <div className="text-center flex flex-col items-center">
      {" "}
      <span> Stock on Hand Available </span>
      <span>(beg. balance),</span>
    </div>,
    "Stock Used",
    <div className="text-center flex flex-col items-center">
      {" "}
      <span> Stock on Hand </span>
      <span>(Present Month),</span>
    </div>,
    "Unit",
    "Expiry Date",
  ];

  return (
    <LayoutWithBack
      title={`First Aid Inventory`}
      description={`${monthName} First Aid Inventory Summary`}
    >
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search first aid items..."
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
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
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
            Showing {startIndex} - {endIndex} of {totalItems} items
          </span>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="text-sm"
          />
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
            <h2 className="font-bold text-lg">First Aid Inventory Report</h2>
            <p className="text-sm">Month: {monthName}</p>
          </div>

          {isLoading ? (
            <div className="w-full h-[100px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading inventory...</span>
            </div>
          ) : (
            <TableLayout
              header={tableHeader}
              rows={paginatedRecords.map((item) => [
                item.fa_name,
                item.opening.toString(),
                item.dispensed.toString(),
                item.closing.toString(),
                item.unit,
                item.expiry
                  ? new Date(item.expiry).toLocaleDateString()
                  : "N/A",
              ])}
              tableClassName="w-full border"
              headerCellClassName="font-medium text-sm p-2 border text-center"
              bodyCellClassName="p-2 border text-sm text-center"
            />
          )}
        </div>
      </div>
    </LayoutWithBack>
  );
}
