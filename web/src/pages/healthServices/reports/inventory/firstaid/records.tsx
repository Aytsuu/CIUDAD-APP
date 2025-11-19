import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Search, Loader2, AlertTriangle } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../../export/export-report";
import { ExportDropdown } from "../../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useMonthlyFirstAidRecords } from "./queries/fetch";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function MonthlyInventoryFirstAidDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiResponse, isLoading, error } = useMonthlyFirstAidRecords(month, currentPage, pageSize, searchTerm);

  const records: any[] = useMemo(() => apiResponse?.data?.inventory_summary || [], [apiResponse]);

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
    const unit = item.unit;
    return unit.toLowerCase() === "boxes" ? "pcs" : unit;
  };

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalItems = apiResponse?.data?.total_items || filteredRecords.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const prepareExportData = () =>
    filteredRecords.map((item) => ({
      "Date Received": item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
      "First Aid Item": item.fa_name,
      "Opening Stock": formatQuantityForExport(item, "opening"),
      "Received Items": formatQuantityForExport(item, "received"),
      "Dispensed Items": formatQuantityForExport(item, "dispensed"),
      "Wasted":`${item.wasted} ${formatUnitDisplay(item)}`,
      "Closing Stock": formatQuantityForExport(item, "closing"),
      "Expiry Date": item.expiry ? new Date(item.expiry).toLocaleDateString() : "N/A"
    }));

  const handleExportCSV = () => exportToCSV(prepareExportData(), `firstaid_inventory_${monthName.replace(" ", "_")}`);
  const handleExportExcel = () => exportToExcel(prepareExportData(), `firstaid_inventory_${monthName.replace(" ", "_")}`);
  const handleExportPDF = () => exportToPDF("landscape");

  const tableHeader = [
    "Date Received",
    "First Aid Item",
    <div className="text-center flex flex-col items-center">
      {" "}
      <span> Stock on Hand Available </span>
      <span>(beg. balance),</span>
    </div>,
    "Stock Used",
    "Stock Wasted",
    <div className="text-center flex flex-col items-center">
      {" "}
      <span> Stock on Hand </span>
      <span>(Present Month)</span>
    </div>,
    "Expiry Date"
  ];

  return (
    <LayoutWithBack title={`First Aid Inventory`} description={`${monthName} First Aid Inventory Summary`}>
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search first aid items..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
        </div>
      </div>
      <div className="flex justify-end pt-4 bg-white">
        <Button
          variant="ghost"
          onClick={() =>
            navigate("/firstaid-expired-out-of-stock-summary/details", {
              state: {
                month,
                monthName
              }
            })
          }
          className="gap-2 italic text-red-500 underline hover:text-red-400 hover:bg-transparent"
        >
          View First Aid Items that Need Restocks
          <AlertTriangle className="h-4 w-4" />
        </Button>
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
                item.date_received ? new Date(item.date_received).toLocaleDateString() : "N/A",
                item.fa_name,
                // Custom rendering for Opening Stock
                <div key={`opening-${item.fa_name}`}>{formatQuantityDisplay(item, "opening")}</div>,
                // Custom rendering for Stock Used (dispensed)
                <div key={`dispensed-${item.fa_name}`}>
                  {item.dispensed -item.wasted} {formatUnitDisplay(item)}
                </div>,
                 <div key={`dispensed-${item.fa_name}`}>
                 {item.wasted} {formatUnitDisplay(item)}
               </div>,
               
                // Custom rendering for Closing Stock
                <div key={`closing-${item.fa_name}`}>{formatQuantityDisplay(item, "closing")}</div>,
                item.expiry ? new Date(item.expiry).toLocaleDateString() : "N/A"
              ])}
              tableClassName="w-full border border-black"
              headerCellClassName="font-medium text-sm p-2 border  border-black text-center text-black"
              bodyCellClassName="p-2 border border-black text-sm text-center"
              defaultRowCount={15}
            />
          )}
        </div>
      </div>
    </LayoutWithBack>
  );
}
