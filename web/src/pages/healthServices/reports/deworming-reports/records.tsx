

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../export/export-report";
import { ExportDropdown } from "../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useDewormingRecords } from "./queries/fetch";
import type { DewormingRecord } from "./types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import TableLayout from "@/components/ui/table/table-layout";

const roundOptions = [
  { value: "all", label: "All Rounds" },
  { value: "1", label: "Round 1 (January - June)" },
  { value: "2", label: "Round 2 (July - December)" }
];

export default function DewormingDetails() {
  const location = useLocation();
  const state = location.state as { 
    year: string; 
    yearName: string;
    totalRecipients: number;
    totalDoses: number;
  };
  const { year, yearName, totalDoses } = state || {};
  const { showLoading, hideLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [roundFilter, setRoundFilter] = useState("all");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roundFilter]);

  const { data: apiResponse, isLoading, error } = useDewormingRecords(
    year, 
    currentPage, 
    pageSize, 
    roundFilter === "all" ? undefined : roundFilter,
    searchQuery
  );

  const records: DewormingRecord[] = useMemo(() => 
    apiResponse?.results?.data?.records || [], 
    [apiResponse?.results?.data?.records]
  );
  const summary = apiResponse?.results?.data;
  const totalEntries: number = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalEntries / pageSize);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch deworming records");
      console.error("API Error:", error);
    }
  }, [error]);

  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  const prepareExportData = useCallback(() => {
    return records.map((item) => ({
      "Name": [
        item.pat_details.personal_info.per_fname,
        item.pat_details.personal_info.per_mname,
        item.pat_details.personal_info.per_lname
      ].filter(Boolean).join(" "),
      "Date of Birth": item.pat_details.personal_info.per_dob,
      "Sex": item.pat_details.personal_info.per_sex,
      "Full Address": item.pat_details.address.full_address,
      "Sitio": item.pat_details.address.add_sitio,
      "Given At": new Date(item.fulfilled_at).toLocaleDateString(),
    }));
  }, [records]);

  const handleExportCSV = () => exportToCSV(prepareExportData(), `deworming_records_${yearName.replace(" ", "_")}`);

  const handleExportExcel = () => exportToExcel(prepareExportData(), `deworming_records_${yearName.replace(" ", "_")}`);

  const handleExportPDF = () => exportToPDF();

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };

  // Table header and rows for TableLayout (using server-side filtered records)
  const tableHeader = [
    "Patient Name",
    "Date of Birth",
    "Sex",
    "Address",
    "Date Given"
  ];

  const tableRows = records.map((record) => [
    `${record.pat_details.personal_info.per_fname} ${record.pat_details.personal_info.per_lname}`,
    formatDate(record.pat_details.personal_info.per_dob),
    record.pat_details.personal_info.per_sex,
    record.pat_details.address.full_address,
    formatDate(record.fulfilled_at)
  ]);

  return (
    <LayoutWithBack 
      title={`Deworming Records - ${yearName}`} 
      description={`View deworming records for the year ${yearName} (${totalEntries} records found, ${totalDoses} doses given)`}
    >
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by Name, Patient ID, or Address..." 
              className="pl-10 w-full" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>

          <div className="flex-1 max-w-md">
            <Select value={roundFilter} onValueChange={setRoundFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by round" />
              </SelectTrigger>
              <SelectContent>
                {roundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown 
            onExportCSV={handleExportCSV} 
            onExportExcel={handleExportExcel} 
            onExportPDF={handleExportPDF} 
            className="border-gray-200 hover:bg-gray-50" 
          />
          <Button onClick={handlePrint} className="gap-2 border-gray-200 hover:bg-gray-50">
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
              const numValue = parseInt(value);
              setPageSize(numValue >= 1 ? numValue : 1);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[20, 30,].map((size) => (
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
          {!isLoading && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />}
        </div>
      </div>

      <div className="bg-white rounded-b-lg overflow-hidden">
        <div
          id="printable-area"
          className="p-4"
          style={{
            minHeight: "20in",
            margin: "0 auto",
            fontSize: "10px",
            lineHeight: "1.2"
          }}
        >
          <div className="w-full">
            <div className="flex mt-4 text-xs">
              <p className="font-semibold uppercase mr-1">Deworming Records Report</p>
            </div>
            <div className="text-start mb-4 mt-2 flex justify-between items-center text-xs">
              <div className="flex">
                <span className="mr-1 font-semibold">Year:</span>
                <span className="underline">{yearName}</span>
              </div>
              <div>
                <span className="font-semibold">Deworming Round:</span>
                <span className="underline ml-1">
                  {roundFilter === "all" ? "All Rounds" : 
                   roundFilter === "1" ? "Round 1 (January - June)" : 
                   "Round 2 (July - December)"}
                </span>
              </div>
              <div>
                <span className="font-semibold">Total Recipients: </span>
                <span className="underline">{summary?.recipient_count || 0}</span>
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
                    {searchQuery || roundFilter !== "all" ? 
                    "No records found matching your filters" : 
                    "No records found for this year"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <TableLayout
                  header={tableHeader}
                  rows={tableRows}
                  tableClassName="border border-black rounded w-full"
                  bodyCellClassName="border border-black text-center text-sm p-2"
                  headerCellClassName="font-bold text-sm border border-black text-gray-900 text-center p-2"
                  defaultRowCount={30}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}