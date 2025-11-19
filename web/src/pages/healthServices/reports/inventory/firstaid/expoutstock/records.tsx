// FirstAidProblemDetails.tsx
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
import { useMonthlyFirstAidExpiredOutOfStockDetail } from "./queries/fetch";

export default function FirstAidProblemDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiResponse, isLoading, error } = useMonthlyFirstAidExpiredOutOfStockDetail(month);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch first aid problem details");
    }
  }, [error]);

  // Get all problem items
  const allProblemItems = apiResponse?.data?.all_problem_items || [];

  // Filter records by search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return allProblemItems;
    const lower = searchTerm.toLowerCase();
    return allProblemItems.filter((item) => item.fa_name.toLowerCase().includes(lower));
  }, [allProblemItems, searchTerm]);

  // Format quantity display - divide by pcs for boxes to get actual box count
  const formatQuantityDisplay = (item: any, field: "opening_stock" | "received" | "dispensed" | "closing_stock" | "wasted") => {
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
  const formatQuantityForExport = (item: any, field: "opening_stock" | "received" | "dispensed" | "closing_stock" | "wasted") => {
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
    const unit = item.unit;
    return unit.toLowerCase() === "boxes" ? "pcs" : unit;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalItems = filteredRecords.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Prepare data for export
  const prepareExportData = () =>
    filteredRecords.map((item:any) => ({
      "Date Received": item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
      "First Aid Item": item.fa_name,
      "Stock on Hand Available": formatQuantityForExport(item, "opening_stock"),
      "Stock Used": `${item.dispensed - (item.wasted || 0)} ${formatUnitDisplay(item)}`,
      "Stock Wasted": `${item.wasted || 0} ${formatUnitDisplay(item)}`,
      "Stock on Hand": formatQuantityForExport(item, "closing_stock"),
      "Expiry Date": item.expiry_date,
      "Status": item.status
    }));

  const handleExportCSV = () => exportToCSV(prepareExportData(), `firstaid_problems_${monthName}`);
  const handleExportExcel = () => exportToExcel(prepareExportData(), `firstaid_problems_${monthName}`);
  const handleExportPDF = () => exportToPDF("landscape");

  const tableHeader = [
    "Date Received",
    "First Aid Item",
    <div className="text-center flex flex-col items-center">
      <span> Stock on Hand Available </span>
      <span>(beg. balance)</span>
    </div>,
    "Stock Used",
    "Stock Wasted",
    <div className="text-center flex flex-col items-center">
      <span> Stock on Hand </span>
      <span>(Present Month)</span>
    </div>,
    "Expiry Date",
    "Status"
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">First Aid Restocking Details - {monthName}</h1>
          <p className="text-xs sm:text-sm text-darkGray">Track first aid items that need restocking</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {!apiResponse?.data ? (
        <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <span>Loading first aid problem records...</span>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search first aid items..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-b-lg overflow-hidden">
            <div
              id="printable-area"
              className="p-4"
              style={{
                minHeight: "11in",
                margin: "0 auto",
                fontSize: "12px"
              }}
            >
              <div className="text-center mb-6 print-only">
                <h2 className="font-bold text-lg">First Aid Restocking Report</h2>
                <p className="text-sm">Month: {monthName}</p>
              </div>

              {isLoading ? (
                <div className="w-full h-[100px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading inventory...</span>
                </div>
              ) : filteredRecords.length > 0 ? (
                <TableLayout
                  header={tableHeader}
                  rows={paginatedRecords.map((item:any) => [
                    item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
                    item.fa_name,
                    // Custom rendering for Stock on Hand Available (opening)
                    <div key={`opening-${item.fa_name}`}>{formatQuantityDisplay(item, "opening_stock")}</div>,
                    // Custom rendering for Stock Used (dispensed - wasted)
                    <div key={`used-${item.fa_name}`}>
                      {item.dispensed - (item.wasted || 0)} {formatUnitDisplay(item)}
                    </div>,
                    // Custom rendering for Stock Wasted
                    <div key={`wasted-${item.fa_name}`}>
                      {item.wasted || 0} {formatUnitDisplay(item)}
                    </div>,
                    // Custom rendering for Stock on Hand (closing_stock_stock)
                    <div key={`closing_stock-${item.fa_name}`}>{formatQuantityDisplay(item, "closing_stock")}</div>,
                    item.expiry_date,
                    item.status
                  ])}
                  tableClassName="w-full border border-black"
                  headerCellClassName="font-medium text-sm p-2 border border-black text-center text-black"
                  bodyCellClassName="p-2 border border-black text-sm text-center"
                  defaultRowCount={15}
                />
              ) : (
                <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                  <p>No items found for {monthName}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}