import { useState, useMemo, useEffect } from "react";
import {  useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Search, Loader2,AlertTriangle } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../../export/export-report";
import { ExportDropdown } from "../../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useMonthlyVaccineRecords } from "./queries/fetch";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useNavigate } from "react-router-dom";

export default function MonthlyInventoryAntigenDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};
  const { showLoading, hideLoading } = useLoading();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiResponse, isLoading, error } = useMonthlyVaccineRecords(month, currentPage, pageSize, searchTerm);
  const records = apiResponse?.data?.inventory_summary || [];

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch vaccine records");
      toast("Retrying...");
      setTimeout(() => window.location.reload(), 2000);
    }
  }, [error]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const lower = searchTerm.toLowerCase();
    return records.filter((item) => item.name.toLowerCase().includes(lower) || item.batch_number.toLowerCase().includes(lower));
  }, [records, searchTerm]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalItems = apiResponse?.data?.total_items || filteredRecords.length;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const prepareExportData = () =>
    filteredRecords.map((item) => ({
      Name: item.name,
      "BATCH NUMBER": item.batch_number,
      "BEGIINING BAL. VIAL DOSE": item.opening,
      "WASTED DOSE": item.wasted,
      "ADMINISTERED VIAL DOSE": item.administered,
      "BEGINNING BAL. VIAL DOSE": item.closing,
      "EXPIRY DATES": new Date(item.expiry).toLocaleDateString(),
    }));

  const handleExportCSV = () => exportToCSV(prepareExportData(), `vaccine_inventory_${monthName.replace(" ", "_")}`);

  const handleExportExcel = () => exportToExcel(prepareExportData(), `vaccine_inventory_${monthName.replace(" ", "_")}`);

  const handleExportPDF = () => exportToPDF('portrait');


  const tableHeader = [
    "ANTIGEN",
    "BATCH NUMBER",
    "BEGINNING BALANCE DOSE",
    "RECEIVED DURING THE MONTH VIAL DOSE",
    "WASTED DOSE",
    "ADMINISTERED VIAL DOSE",
    "TOTAL AVAIL. VIAL DOSE",
    "EXPIRY DATES",
  ];

  return (
    <LayoutWithBack title={`Vaccine Inventory`} description={`${monthName} Vaccine Inventory Summary`}>
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search vaccines..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
         
        </div>
      </div>

       <div className="flex justify-end pt-4 bg-white">
              <Button
                variant="ghost"
                onClick={() =>
                  navigate("/antigen-expired-out-of-stock-summary/details", {
                    state: {
                      month,
                      monthName,
                    },
                  })
                }
                className="gap-2 italic text-red-500 underline hover:text-red-400 hover:bg-transparent"
              >
                View Antigen that Need Restocks
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
          <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />
        </div>
      </div>

      <div className="bg-white overflow-x-auto">
        <div
          style={{
            minHeight: "19in",
            width: "13in",
            position: "relative",
            margin: "0 auto",
            padding: "0.5in",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            height: "19in",
          }}
        >
          <div className="bg-white p-4 print-area" id="printable-area">
            <div className="text-center mb-6 print-only">
              <h2 className="font-bold text-lg">EPI INVENTORY AND UTILIZATION REPORT</h2>
              <p className="text-sm">Month: {monthName}</p>
           
            </div>

            {isLoading ? (
              <div className="w-full h-[100px] flex items-center justify-center text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading inventory...</span>
              </div>
            ) : filteredRecords.length > 0 ? (
              <TableLayout
                header={tableHeader}
                rows={paginatedRecords.map((item) => [
                  item.name, 
                  item.batch_number, 
                  item.opening.toString() || "-", 
                  item.received.toString()  || "-", 
                  item.wasted.toString()  || "-", 
                  item.administered.toString()  || "-", 
                  item.closing.toString()  || "-", 
                  new Date(item.expiry).toLocaleDateString()  || "-"
                ])}
                tableClassName="w-full border rounded-lg"
                headerCellClassName="font-bold text-sm border border-gray-600 text-black text-center p-2"
                bodyCellClassName="border border-gray-600 text-center text-sm p-2"
                defaultRowCount={40}
              />
            ) : (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <p>No vaccine records found for {monthName}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
