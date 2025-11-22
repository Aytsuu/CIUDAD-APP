import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../../export/export-report";
import { ExportDropdown } from "../../export/export-dropdown";

import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { useChildHealthSupplementsReport } from "./queries/fetch";
import { Input } from "@/components/ui/input";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { showErrorToast } from "@/components/ui/toast";
import { formatDate, formatSupplementDate, formatMnpDates } from "@/helpers/dateHelper";
import { Card, CardContent } from "@/components/ui/card";

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

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const { data, isLoading, error } = useChildHealthSupplementsReport(debouncedSearchQuery, currentPage, pageSize);

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

  // Prepare export data
  const prepareExportData = () => {
    return records.map((record) => ({
      "Date Registered": formatDate(record.date_registered),
      "Child Name": record.child_name,
      "Date of Birth": record.date_of_birth ? formatDate(record.date_of_birth) : "-",
      Sex: record.sex || "-",
      "Mother's Name": record.mother_name === "Not available" ? "-" : record.mother_name,
      "Vitamin A (6-11 months)": formatSupplementDate(record.supplements.vitamin_a["6-11"]),
      "Vitamin A (12-23 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["12-23"]["1st_dose"]),
      "Vitamin A (12-23 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["12-23"]["2nd_dose"]),
      "Vitamin A (24-35 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["24-35"]["1st_dose"]),
      "Vitamin A (24-35 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["24-35"]["2nd_dose"]),
      "Vitamin A (36-47 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["36-47"]["1st_dose"]),
      "Vitamin A (36-47 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["36-47"]["2nd_dose"]),
      "Vitamin A (48-59 months - 1st dose)": formatSupplementDate(record.supplements.vitamin_a["48-59"]["1st_dose"]),
      "Vitamin A (48-59 months - 2nd dose)": formatSupplementDate(record.supplements.vitamin_a["48-59"]["2nd_dose"]),
      "MNP (6-11 months)": formatMnpDates(record.supplements.mnp["6-11"]),
      "MNP (12-23 months)": formatMnpDates(record.supplements.mnp["12-23"]),
      "Deworming (12-23 months - 1st dose)": formatSupplementDate(record.supplements.deworming["12-23"]["1st_dose"]),
      "Deworming (12-23 months - 2nd dose)": formatSupplementDate(record.supplements.deworming["12-23"]["2nd_dose"]),
      "Deworming (24-59 months - 1st dose)": formatSupplementDate(record.supplements.deworming["24-59"]["1st_dose"]),
      "Deworming (24-59 months - 2nd dose)": formatSupplementDate(record.supplements.deworming["24-59"]["2nd_dose"]),
      Sitio: record.sitio || "",
      "Feeding Type": record.type_of_feeding || "",
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, "child_health_supplements_masterlist");
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, "child_health_supplements_masterlist");
  };

  const handleExportPDF = () => {
    exportToPDF("landscape");
  };

  return (
    <LayoutWithBack title="MASTERLIST OF 6-59 MONTH OLD CHILDREN FOR VIT. A,MNP, AND DEWORMING" description="Showing children aged 6-59 months">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by child name, mother's name, or sitio..." className="pl-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />
            </div>
          </div>

          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-20 h-8 bg-white border rounded-md text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-700">entries</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{isLoading ? <span className="flex items-center gap-2"></span> : `Showing ${startIndex} - ${endIndex} of ${totalEntries} children`}</span>
              {!isLoading && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />}
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto" style={{ width: "100%", overflowX: "auto", position: "relative", fontSize: "10px" }}>
            <div className="py-4 px-4" id="printable-area">
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
                    <p className="text-gray-600">{searchQuery ? "No records found matching your search" : "No records found"}</p>
                  </div>
                </div>
              ) : (
                <div className="min-w-full mt-4">
                  <table className="min-w-full text-xs border border-black">
                    <thead>
                      <tr className="border-b border-black">
                        <th rowSpan={3} className="border-r border-black px-2 py-2 text-center font-medium min-w-[80px]">
                          Date of Registration
                        </th>
                        <th rowSpan={3} className="border-r border-black px-2 py-2 text-center font-medium min-w-[120px]">
                          Name of Child
                        </th>
                        <th rowSpan={3} className="border-r border-black px-2 py-2 text-center font-medium min-w-[80px]">
                          Date of Birth
                        </th>
                        <th rowSpan={3} className="border-r border-black px-2 py-2 text-center font-medium min-w-[40px]">
                          Sex
                        </th>
                        <th rowSpan={3} className="border-r border-black px-2 py-2 text-center font-medium min-w-[120px]">
                          Name of Mother
                        </th>

                        <th colSpan={9} className="border-r border-black px-2 py-1 text-center font-medium">
                          Vitamin A Supplementation
                        </th>
                        <th colSpan={2} className="border-r border-black px-2 py-1 text-center font-medium">
                          MNP
                        </th>
                        <th colSpan={4} className="border-r border-black px-2 py-1 text-center font-medium">
                          Deworming
                        </th>

                        <th rowSpan={3} className="px-2 py-2 text-center font-medium min-w-[100px]">
                          Remarks
                        </th>
                      </tr>
                      <tr className="border-b border-black">
                        <th colSpan={1} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          6-11 Months
                        </th>
                        <th colSpan={2} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          12-23 Months
                        </th>

                        <th colSpan={2} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          24-35 Months
                        </th>
                        <th colSpan={2} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          36-47 Months
                        </th>
                        <th colSpan={2} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          48-59 Months
                        </th>

                        <th colSpan={1} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          6-11 Months
                        </th>
                        <th colSpan={1} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          12-23 Months
                        </th>

                        <th colSpan={2} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          12-23 Months
                        </th>
                        <th colSpan={2} className="border-r border-black px-1 py-1 text-center font-medium text-[10px]">
                          24-59 Months
                        </th>
                      </tr>
                      <tr className="border-b border-black">
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">1st Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">1st Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">2nd Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">1st Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">2nd Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">1st Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">2nd Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">1st Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">2nd Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">60 Sachets</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">60 Sachets</th>

                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">1st Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">2nd Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">1st Dose</th>
                        <th className="border-r border-black px-1 py-1 text-center font-medium text-[9px]">2nd Dose</th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record, index) => (
                        <tr key={`${record.child_name}-${index}`} className="border-b border-black">
                          <td className="border-r border-black px-2 py-2 text-center text-[10px]">{formatDate(record.date_registered)}</td>
                          <td className="border-r border-black px-2 py-2 text-left text-[10px] font-medium">{record.child_name}</td>
                          <td className="border-r border-black px-2 py-2 text-center text-[10px]">{record.date_of_birth ? formatDate(record.date_of_birth) : "-"}</td>
                          <td className="border-r border-black px-2 py-2 text-center text-[10px]">{record.sex || "-"}</td>
                          <td className="border-r border-black px-2 py-2 text-left text-[10px]">{record.mother_name === "Not available" ? "-" : record.mother_name}</td>

                          {/* Vitamin A - 6-11 months */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["6-11"])}</td>

                          {/* Vitamin A - 12-23 months */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["12-23"]["1st_dose"])}</td>
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["12-23"]["2nd_dose"])}</td>

                          {/* Vitamin A - 24-35 months */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["24-35"]["1st_dose"])}</td>
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["24-35"]["2nd_dose"])}</td>

                          {/* Vitamin A - 36-47 months */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["36-47"]["1st_dose"])}</td>
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["36-47"]["2nd_dose"])}</td>

                          {/* Vitamin A - 48-59 months */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["48-59"]["1st_dose"])}</td>
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.vitamin_a["48-59"]["2nd_dose"])}</td>

                          {/* MNP - Updated to show all dates */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatMnpDates(record.supplements.mnp["6-11"])}</td>
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatMnpDates(record.supplements.mnp["12-23"])}</td>

                          {/* Deworming - 12-23 months */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.deworming["12-23"]["1st_dose"])}</td>
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.deworming["12-23"]["2nd_dose"])}</td>

                          {/* Deworming - 24-59 months */}
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.deworming["24-59"]["1st_dose"])}</td>
                          <td className="border-r border-black px-1 py-2 text-center text-[10px]">{formatSupplementDate(record.supplements.deworming["24-59"]["2nd_dose"])}</td>

                          {/* Remarks */}
                          <td className="px-2 py-2 text-left text-[10px]">
                            {record.sitio && `Sitio: ${record.sitio}`}
                            {record.type_of_feeding && `, ${record.type_of_feeding}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </LayoutWithBack>
  );
}
