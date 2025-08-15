import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { Search, ChevronLeft, Loader2, Printer } from "lucide-react";
import { ExportDropdown } from "../../firstaid-report/export-dropdown";

import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { useChildHealthSupplementsReport } from "./queries/fetch";
import { Input } from "@/components/ui/input";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { showErrorToast } from "@/components/ui/toast";
import {
  handleExportCSV,
  handleExportExcel,
  handleExportPDF,
  handlePrint as handlePrintReport,
} from "./handleprint";
import {formatDate,formatSupplementDate,formatMnpDates} from "@/helpers/dateHelper"



function useDebounce<T>(value: T, delay: number): T {
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

export default function ChildHealthSupplementsReport() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const { data, isLoading, error } = useChildHealthSupplementsReport(
    debouncedSearchQuery,
    currentPage,
    pageSize
  );

  const records = data?.results || [];
  const totalEntries = data?.count || 0;
  const totalPages = Math.ceil(totalEntries / pageSize);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      showErrorToast("Failed to fetch supplements report");
      toast("Retrying to fetch report...");
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  const handlePrint = useCallback(async () => {
    await handlePrintReport(debouncedSearchQuery, showLoading, hideLoading);
  }, [debouncedSearchQuery, showLoading, hideLoading]);
  
  const handleExportCSVCallback = useCallback(async () => {
    await handleExportCSV(debouncedSearchQuery, showLoading, hideLoading);
  }, [debouncedSearchQuery, showLoading, hideLoading]);
  
  const handleExportExcelCallback = useCallback(async () => {
    await handleExportExcel(debouncedSearchQuery, showLoading, hideLoading);
  }, [debouncedSearchQuery, showLoading, hideLoading]);
  
  const handleExportPDFCallback = useCallback(async () => {
    await handleExportPDF(debouncedSearchQuery, showLoading, hideLoading);
  }, [debouncedSearchQuery, showLoading, hideLoading]);

  
  return (
    <LayoutWithBack
      title="MASTERLIST OF 6-59 MONTH OLD CHILDREN FOR VIT. A,MNP, AND DEWORMING"
      description="Showing children aged 6-59 months"
    >
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by child name, mother's name, or sitio..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
        <ExportDropdown
  onExportCSV={handleExportCSVCallback}
  onExportExcel={handleExportExcelCallback}
  onExportPDF={handleExportPDFCallback}
  className="border-gray-200 hover:bg-gray-50"
/>
          <Button
            onClick={handlePrint}
            className="gap-2 "
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            <span>{isExporting ? "Preparing..." : "Print"}</span>
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Input
            type="number"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="w-20 h-8 bg-white border rounded-md text-sm text-center"
            min="1"
            max="100"
          />
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
              `Showing ${startIndex} - ${endIndex} of ${totalEntries} children`
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
        <div id="printable-area" className="mt-4 overflow-x-auto">
          {isLoading ? (
            <div className="w-full h-[200px] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <span className="text-sm text-gray-600">
                  Loading records...
                </span>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="w-full h-[200px] flex items-center justify-center">
              <div className="text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {searchQuery
                    ? "No records found matching your search"
                    : "No records found"}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-full mt-4">
            
              <table className="min-w-full text-xs border border-black">
                <thead>
                  <tr className="border-b border-black">
                    <th
                      rowSpan={3}
                      className="border-r border-black px-2 py-2 text-center font-medium min-w-[80px]"
                    >
                      Date of Registration
                    </th>
                    <th
                      rowSpan={3}
                      className="border-r border-black px-2 py-2 text-center font-medium min-w-[120px]"
                    >
                      Name of Child
                    </th>
                    <th
                      rowSpan={3}
                      className="border-r border-black px-2 py-2 text-center font-medium min-w-[80px]"
                    >
                      Date of Birth
                    </th>
                    <th
                      rowSpan={3}
                      className="border-r border-black px-2 py-2 text-center font-medium min-w-[40px]"
                    >
                      Sex
                    </th>
                    <th
                      rowSpan={3}
                      className="border-r border-black px-2 py-2 text-center font-medium min-w-[120px]"
                    >
                      Name of Mother
                    </th>

                    <th
                      colSpan={9}
                      className="border-r border-black px-2 py-1 text-center font-medium"
                    >
                      Vitamin A Supplementation
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-black px-2 py-1 text-center font-medium"
                    >
                      MNP
                    </th>
                    <th
                      colSpan={4}
                      className="border-r border-black px-2 py-1 text-center font-medium"
                    >
                      Deworming
                    </th>
                    
                    <th
                      rowSpan={3}
                      className="px-2 py-2 text-center font-medium min-w-[100px]"
                    >
                      Remarks
                    </th>
                  </tr>
                  <tr className="border-b border-black">
                    <th
                      colSpan={1}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      6-11 Months
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      12-23 Months
                    </th>
                    
                    <th
                      colSpan={2}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      24-35 Months
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      36-47 Months
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      48-59 Months
                    </th>

                    
                    <th
                      colSpan={1}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      6-11 Months
                    </th>
                    <th
                      colSpan={1}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      12-23 Months
                    </th>

                    <th
                      colSpan={2}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      12-23 Months
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-black px-1 py-1 text-center font-medium text-[10px]"
                    >
                      24-59 Months
                    </th>
                 
                  </tr>
                  <tr className="border-b border-black">
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      1st Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      1st Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      2nd Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      1st Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      2nd Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      1st Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      2nd Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      1st Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      2nd Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                    60 Sachets

                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                    60 Sachets

                    </th>
                   
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      1st Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      2nd Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      1st Dose
                    </th>
                    <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">
                      2nd Dose
                    </th>
                
                  </tr>
                </thead>

                <tbody>
                  {records.map((record, index) => (
                    <tr
                      key={`${record.child_name}-${index}`}
                      className="border-b border-black"
                    >
                      <td className="border-r border-black px-2 py-2 text-center text-[10px]">
                        {formatDate(record.date_registered)}
                      </td>
                      <td className="border-r border-black px-2 py-2 text-left text-[10px] font-medium">
                        {record.child_name}
                      </td>
                      <td className="border-r border-black px-2 py-2 text-center text-[10px]">
                        {record.date_of_birth
                          ? formatDate(record.date_of_birth)
                          : "-"}
                      </td>
                      <td className="border-r border-black px-2 py-2 text-center text-[10px]">
                        {record.sex || "-"}
                      </td>
                      <td className="border-r border-black px-2 py-2 text-left text-[10px]">
                        {record.mother_name === "Not available"
                          ? "-"
                          : record.mother_name}
                      </td>

                      {/* Vitamin A - 6-11 months */}
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["6-11"]
                        )}
                      </td>

                      {/* Vitamin A - 12-23 months */}
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["12-23"]["1st_dose"]
                        )}
                      </td>
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["12-23"]["2nd_dose"]
                        )}
                      </td>

                      {/* Vitamin A - 24-35 months */}
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["24-35"]["1st_dose"]
                        )}
                      </td>
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["24-35"]["2nd_dose"]
                        )}
                      </td>

                      {/* Vitamin A - 36-47 months */}
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["36-47"]["1st_dose"]
                        )}
                      </td>
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["36-47"]["2nd_dose"]
                        )}
                      </td>

                      {/* Vitamin A - 48-59 months */}
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["48-59"]["1st_dose"]
                        )}
                      </td>
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.vitamin_a["48-59"]["2nd_dose"]
                        )}
                      </td>

                       {/* MNP - Updated to show all dates */}
                       <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatMnpDates(record.supplements.mnp["6-11"])}
                      </td>
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatMnpDates(record.supplements.mnp["12-23"])}
                      </td>
                   
                      {/* Deworming - 12-23 months */}
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.deworming["12-23"]["1st_dose"]
                        )}
                      </td>
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.deworming["12-23"]["2nd_dose"]
                        )}
                      </td>

                      {/* Deworming - 24-59 months */}
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.deworming["24-59"]["1st_dose"]
                        )}
                      </td>
                      <td className="border-r border-black px-1 py-2 text-center text-[10px]">
                        {formatSupplementDate(
                          record.supplements.deworming["24-59"]["2nd_dose"]
                        )}
                      </td>

                     

                      {/* Remarks */}
                      <td className="px-2 py-2 text-left text-[10px]">
                        {record.sitio && `Sitio: ${record.sitio}`}
                        {record.type_of_feeding &&
                          `, ${record.type_of_feeding}`}
                      </td>
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
