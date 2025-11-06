// MedicineProblemDetails.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Printer, Search, Loader2 } from "lucide-react";
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
  const [pageSize, setPageSize] = useState(10);
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
  const summary = responseData?.summary || {};

  // Get all problem items with proper fallback
  const allProblemItems = useMemo(() => {
    // Try all_problem_items first, then fall back to combining individual arrays
    if (responseData?.all_problem_items) {
      return responseData.all_problem_items;
    }

    // Fallback: combine all individual arrays
    return [...(responseData?.expired_items || []), ...(responseData?.out_of_stock_items || []), ...(responseData?.expired_out_of_stock_items || []), ...(responseData?.near_expiry_items || [])];
  }, [responseData]);

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

  // Prepare data for export - UPDATED for medicine data structure
  const prepareExportData = () =>
    filteredRecords.map((item: any) => ({
      "Medicine Name": item.med_name || "N/A",
      "Expiry Date": item.expiry_date || "N/A",
      "Opening Stock": item.opening_stock || 0,
      Received: item.received || 0,
      Dispensed: item.dispensed || 0,
      "Closing Stock": item.closing_stock || 0,
      Unit: item.unit || "pcs",
      Status: item.status || "N/A",
    }));

  const handleExportCSV = () => exportToCSV(prepareExportData(), `medicine_problems_${monthName}`);

  const handleExportExcel = () => exportToExcel(prepareExportData(), `medicine_problems_${monthName}`);

  const handleExportPDF = () => exportToPDF("landscape");

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // UPDATED table header for medicine data
  const tableHeader = ["Medicine Name", "Expiry Date", "Opening", "Received", "Dispensed", "Closing", "Unit", "Status"];

  // Show loading state while API response is being processed
  // if (isLoading) {
  //   return (
  //     <div className="w-full h-screen flex items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //       <span className="ml-2">Loading medicine problem details...</span>
  //     </div>
  //   );
  // }

  // Show error state if API call failed
  if (error || !apiResponse?.success) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load medicine problem details</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant="outline" onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Medicine Problems Details - {monthName}</h1>
          <p className="text-xs sm:text-sm text-darkGray">Track medicine items needing attention - expired, out of stock, and near expiry - ({summary.total_problems || 0} found)</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />
      (! ? (
      <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <span>Loading medicine problem records...</span>
      </div>
      ) : (
      <>
        {/* Summary Stats */}
        {summary && (
          <div className="bg-gray-50 p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.expired_count || 0}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.out_of_stock_count || 0}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.expired_out_of_stock_count || 0}</div>
              <div className="text-sm text-gray-600">Expired & Out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.near_expiry_count || 0}</div>
              <div className="text-sm text-gray-600">Near Expiry</div>
            </div>
          </div>
        )}

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
            <Button variant="outline" onClick={handlePrint} className="gap-2 border-gray-200 hover:bg-gray-50">
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
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
            {totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white p-4 border">
          {filteredRecords.length > 0 ? (
            <TableLayout
              header={tableHeader}
              rows={paginatedRecords.map((item: any) => [
                item.med_name || "N/A",
                item.expiry_date || "N/A",
                item.opening_stock?.toString() || "0",
                item.received?.toString() || "0",
                item.dispensed?.toString() || "0",
                item.closing_stock?.toString() || "0",
                item.unit || "pcs",
                item.status || "N/A",
              ])}
              tableClassName="w-full border rounded-lg"
              bodyCellClassName="border border-gray-600 text-center text-xs p-2"
              headerCellClassName="font-bold text-xs border border-gray-600 text-black text-center p-2"
            />
          ) : (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <p>No medicine problems found for {monthName}</p>
            </div>
          )}
        </div>

        {/* Printable area */}
        <div id="printable-area" className="hidden">
          <div className="text-center mb-6">
            <h2 className="font-bold uppercase tracking-wide text-lg">Medicine Problems Summary - {monthName}</h2>
            {summary && (
              <div className="flex justify-center gap-8 my-4">
                <div>Expired: {summary.expired_count || 0}</div>
                <div>Out of Stock: {summary.out_of_stock_count || 0}</div>
                <div>Expired & Out: {summary.expired_out_of_stock_count || 0}</div>
                <div>Near Expiry: {summary.near_expiry_count || 0}</div>
              </div>
            )}
          </div>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                {tableHeader.map((header) => (
                  <th key={header} className="border border-gray-400 p-2 bg-gray-100 font-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2">{item.med_name || "N/A"}</td>
                  <td className="border border-gray-400 p-2">{item.expiry_date || "N/A"}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.opening_stock || 0}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.received || 0}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.dispensed || 0}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.closing_stock || 0}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.unit || "pcs"}</td>
                  <td className="border border-gray-400 p-2 text-center">{item.status || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
      ) )
    </div>
  );
}
