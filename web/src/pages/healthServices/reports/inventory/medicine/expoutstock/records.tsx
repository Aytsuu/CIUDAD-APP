// MedicineProblemDetails.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../../../export/export-report";
import { ExportDropdown } from "../../../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useMonthlyMedicineExpiredOutOfStockDetail } from "./queries/fetch";

export default function MedicineProblemDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiResponse, isLoading, error } = useMonthlyMedicineExpiredOutOfStockDetail(month);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch medicine problem details");
    }
  }, [error]);

  // CORRECTED: Add defensive checks for API response
  const responseData = apiResponse?.data || {};
  // const summary = responseData?.summary || {};

  // Get all problem items with proper fallback
  const allProblemItems = useMemo(() => {
    // Try all_problem_items first, then fall back to combining individual arrays
    if (responseData?.all_problem_items) {
      return responseData.all_problem_items;
    }

    // Fallback: combine all individual arrays
    return [...(responseData?.expired_items || []), ...(responseData?.out_of_stock_items || []), ...(responseData?.expired_out_of_stock_items || []), ...(responseData?.near_expiry_items || [])];
  }, [responseData]);

  // Format quantity unit - convert "boxes" to "pcs"
  const formatQtyUnit = (unit: string) => {
    return unit.toLowerCase() === "boxes" ? "pcs" : unit;
  };

  // Format quantity display - divide by pcs for boxes to get actual box count
  const formatQuantityDisplay = (item: any, field: "opening_stock" | "received" | "dispensed" | "closing_stock") => {
    const quantity = item[field];
    const unit = item.unit;
    const pcs = item.pcs || 1;

    if (unit.toLowerCase() === "boxes" && quantity > 0) {
      // Backend already multiplied by pcs, so we divide to get box count
      const boxCount = quantity / pcs;
      return (
        <div className="text-center">
          {boxCount} boxes ({quantity} pcs)
        </div>
      );
    }

    return (
      <div className="text-center">
        {quantity} {unit}
      </div>
    );
  };

  // Format quantity for export (keep as pieces for consistency)
  const formatQuantityForExport = (item: any, field: "opening_stock" | "received" | "dispensed" | "closing_stock") => {
    const quantity = item[field];
    const unit = item.unit;
    const pcs = item.pcs || 1;

    if (unit.toLowerCase() === "boxes" && quantity > 0) {
      const boxCount = quantity / pcs;
      return `${boxCount} boxes (${quantity} pcs)`;
    }

    return `${quantity} ${unit}`;
  };

  // Format unit for display - convert boxes to pcs
  const formatUnitDisplay = (item: any) => {
    return formatQtyUnit(item.unit);
  };

  // Filter records by search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return allProblemItems;
    const lower = searchTerm.toLowerCase();
    return allProblemItems.filter((item: any) => item.med_name?.toLowerCase().includes(lower) || item.status?.toLowerCase().includes(lower));
  }, [allProblemItems, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalItems = filteredRecords.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Prepare data for export - UPDATED with proper formatting
  const prepareExportData = () =>
    filteredRecords.map((item: any) => ({
      "Date Received": item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
      "Medicine Name": item.med_name || "N/A",
      "Opening Stock": formatQuantityForExport(item, "opening_stock"),
      "Quantity Received": formatQuantityForExport(item, "received"),
      "Quantity Available": formatQuantityForExport(item, "closing_stock"),
      "Quantity used": `${item.dispensed - item.wasted} ${formatQtyUnit(item.unit)}`,
      Wasted: item.wasted,
      "Expiry Date": item.expiry_date || "N/A",
      Status: item.status || "N/A"
    }));

  const handleExportCSV = () => exportToCSV(prepareExportData(), `medicine_problems_${monthName}`);
  const handleExportExcel = () => exportToExcel(prepareExportData(), `medicine_problems_${monthName}`);
  const handleExportPDF = () => exportToPDF("landscape");

  // UPDATED table header for medicine data
  const tableHeader = ["Date Received", "Medicine Name", "Stocks on Hand", "Stock Available", "Quantity Used", "Wasted", "Expiry Date", "Status"];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medicine Restocking Details - {monthName}</h1>
          <p className="text-xs sm:text-sm text-darkGray">Track medicines that need restocking</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />
      {isLoading ? (
        <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <span>Loading medicine problem records...</span>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4 ">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search medicine name or status..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex gap-2 items-center">
              <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
            </div>
          </div>

          {/* Pagination controls */}
          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
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
                  {[15].map((size) => (
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
              {totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />}
            </div>
          </div>

          {/* Table */}

          <div className="flex-1 mb-10 bg-white">
            {/* Printable area - full filtered table (no pagination) */}
            <div
              id="printable-area"
              className="bg-white p-6 mt-6"
              style={{
                minHeight: "11in",
                margin: "0 auto",
                fontSize: "12px"
              }}
            >
              <div className="text-center mb-6 print-only">
                <h2 className="font-bold text-lg">Medicine Restocking Report</h2>
                <p className="text-sm">Month: {monthName}</p>
              </div>

              {filteredRecords.length > 0 ? (
                <TableLayout
                  header={tableHeader}
                  rows={paginatedRecords.map((item: any) => [
                    item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
                    item.med_name || "N/A",
                    // Custom rendering for Quantity Received
                    <div key={`received-${item.med_name}`}>{formatQuantityDisplay(item, "received")}</div>,
                    // Custom rendering for Quantity Available
                    <div key={`closing-${item.med_name}`}>{formatQuantityDisplay(item, "closing_stock")}</div>,
                    // Custom rendering for Quantity Issued
                    <div key={`dispensed-${item.med_name}`}>
                      {item.dispensed - item.wasted} {formatUnitDisplay(item)}
                    </div>,
                    <div key={`wasted-${item.med_name}`}>
                      {item.wasted}
                      {formatUnitDisplay(item)}
                    </div>,
                    item.expiry_date,
                    item.status || "N/A"
                  ])}
                  tableClassName="w-full border rounded-lg"
                  bodyCellClassName="border border-gray-600 text-center text-xs p-2"
                  headerCellClassName="font-bold text-xs border border-gray-600 text-black text-center p-2"
                  defaultRowCount={15}
                />
              ) : (
                <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                  <p>No medicine problems found for {monthName}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
