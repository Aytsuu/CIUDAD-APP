import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Printer, Search, Loader2, AlertTriangle } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../../export/export-report";
import { ExportDropdown } from "../../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useMonthlyMedicineRecords } from "./queries/fetch";

export default function MonthlyMedicineDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiResponse, isLoading, error } = useMonthlyMedicineRecords(month, currentPage, pageSize, searchTerm);

  const records: any[] = useMemo(() => apiResponse?.data?.inventory_summary || [], [apiResponse]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch medicine records");
      toast("Retrying...");
      setTimeout(() => window.location.reload(), 2000);
    }
  }, [error]);

  // Filter records by search term (client-side filtering on med_name)
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const lower = searchTerm.toLowerCase();
    return records.filter((item) => item.med_name.toLowerCase().includes(lower));
  }, [records, searchTerm]);

  // Format quantity unit - convert "boxes" to "pcs"
  const formatQtyUnit = (unit: string) => {
    return unit.toLowerCase() === "boxes" ? "pcs" : unit;
  };

  // Format quantity display - divide by pcs for boxes to get actual box count
  const formatQuantityDisplay = (item: any, field: "opening" | "received" | "dispensed" | "closing") => {
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
  const formatQuantityForExport = (item: any, field: "opening" | "received" | "dispensed" | "closing") => {
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

  // Pagination calculations (for on-screen table only)
  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Calculate "Showing X - Y of Z items"
  const totalItems = apiResponse?.data?.total_items ? Number(apiResponse.data.total_items) : filteredRecords.length;

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Prepare data for export (full filtered records)
  const prepareExportData = () =>
    filteredRecords.map((item) => ({
      "Date Received": item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
      "Medicine Name": item.med_name,
      "Stocks On Hand": formatQuantityForExport(item, "opening"),
      "Stock Available": formatQuantityForExport(item, "closing"),
      "Qty Used": `${item.dispensed} ${formatUnitDisplay(item)}`,
      "Qty Wasted": `${item.wasted} ${formatUnitDisplay(item)}`,
      Expiry: item.expiry ? new Date(item.expiry).toLocaleDateString() : "N/A"
    }));

  // Export handlers
  const handleExportCSV = () => exportToCSV(prepareExportData(), `medicine_inventory_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  const handleExportExcel = () => exportToExcel(prepareExportData(), `medicine_inventory_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  const handleExportPDF = () => exportToPDF("landscape");

  const tableHeader = ["Date Received", "Medicine Name", "Stocks On Hand", "Stock Available", "Qty Used", "Qty Wasted", "Expiry"];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Monthly Medicine Inventory Summary</h1>
          <p className="text-xs sm:text-sm text-darkGray">Month: {monthName}</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Action Bar */}
      <div className="bg-white p-4 border  flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search medicine..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
        </div>
      </div>

      <div className="flex justify-end  pt-4 bg-white">
        <Button
          variant="ghost"
          onClick={() =>
            navigate("/medicine-expired-out-of-stock-summary/details", {
              state: {
                month,
                monthName
              }
            })
          }
          className="gap-2 italic text-red-500 underline hover:text-red-400 hover:bg-transparent"
        >
          View Medicine that Need Restocks
          <AlertTriangle className="h-4 w-4" />
        </Button>
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
          <div className="text-center mb-6">
            <h2 className="font-bold uppercase tracking-wide text-lg">Medicine Inventory Summary</h2>
            <p>Month: {monthName}</p>
          </div>

          {/* On-screen paginated table */}
          <div className="bg-white p-4 mt-4">
            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">loading....</span>
              </div>
            ) : (
              <TableLayout
                header={tableHeader}
                rows={paginatedRecords.map((item) => [
                  item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
                  item.med_name,
                  // Custom rendering for Stocks On Hand (opening)
                  <div key={`opening-${item.med_name}`}>{formatQuantityDisplay(item, "opening")}</div>,
                  // Custom rendering for Stock Available (closing)
                  <div key={`closing-${item.med_name}`}>{formatQuantityDisplay(item, "closing")}</div>,
                  // Custom rendering for Qty Used (dispensed)
                  <div key={`dispensed-${item.med_name}`}>
                    {Math.abs(item.dispensed - item.wasted)} {formatUnitDisplay(item)}
                  </div>,
                  <div key={`wasted-${item.med_name}`}>
                    {item.wasted} {formatUnitDisplay(item)}
                  </div>,
                  item.expiry ? new Date(item.expiry).toLocaleDateString() : "N/A"
                ])}
                tableClassName="border rounded-lg w-full"
                bodyCellClassName="border border-gray-600 text-center text-xs p-2"
                headerCellClassName="font-bold text-xs border border-gray-600 text-black text-center p-2"
                defaultRowCount={15}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
