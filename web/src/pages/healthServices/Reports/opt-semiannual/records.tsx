"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../firstaid-report/export-report";
import { ExportDropdown } from "../firstaid-report/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useSemiAnnualOPTRecords } from "./queries/fetch";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import type { SemiAnnualChildRecord } from "./types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { FilterSitio } from "../filter-sitio";
import { SelectedFiltersChips } from "../selectedFiltersChipsProps ";
import { FilterStatus } from "../filter-nutstatus";
import {  nutritionalStatusCategories, nutritionalStatusOptions } from "../options";
import { useDebounce } from "@/hooks/use-debounce";

const periodOptions = [
  { value: "both", label: "Both Periods" },
  { value: "first", label: "First Semi-Annual Only" },
  { value: "second", label: "Second Semi-Annual Only" }
];

export default function SemiAnnualOPTDetails() {
  const location = useLocation();
  const state = location.state as { year: string; yearName: string };
  const { year, yearName } = state || {};
  const { showLoading, hideLoading } = useLoading();

  const [sitioSearch, setSitioSearch] = useState("");
  const [nutritionalStatus, setNutritionalStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [periodFilter, setPeriodFilter] = useState("both");
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);
  const [selectedNutritionalStatuses, setSelectedNutritionalStatuses] = useState<string[]>([]);

  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  const debouncedSitioSearch = useDebounce(sitioSearch, 500);
  const debouncedNutritionalStatus = useDebounce(nutritionalStatus, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSitioSearch, debouncedNutritionalStatus, selectedSitios, selectedNutritionalStatuses, periodFilter]);

  const combinedSitioSearch = selectedSitios.length > 0 
    ? selectedSitios.join(',')
    : sitioSearch;

  const combinedNutritionalStatus = selectedNutritionalStatuses.length > 0 
    ? selectedNutritionalStatuses.join(',')
    : nutritionalStatus;

    const { data: apiResponse, isLoading, error } = useSemiAnnualOPTRecords(year, currentPage, pageSize, combinedSitioSearch, combinedNutritionalStatus);


  const records: SemiAnnualChildRecord[] = apiResponse?.results?.children_data || [];
  const summary = apiResponse?.results?.summary;
  const totalEntries: number = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalEntries / pageSize);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch semi-annual OPT records");
      console.error("API Error:", error);
    }
  }, [error]);

  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  const prepareExportData = useCallback(() => {
    return records.map((item) => ({
      "Child ID": item.child_id || "N/A",
      "Household No": item.household_no || "N/A",
      "Child Name": item.child_name || "N/A",
      Sex: item.sex || "N/A",
      "Date of Birth": item.date_of_birth || "N/A",
      "Age (months)": item.age_in_months?.toString() || "N/A",
      "Mother's Name": item.parents?.mother || "N/A",
      "Father's Name": item.parents?.father || "N/A",
      Address: item.address || "N/A",
      Sitio: item.sitio || "N/A",
      Transient: item.transient ? "Yes" : "No",
      // First Semi-Annual Data
      "1st Semi Weighing Date": item.first_semi_annual?.date_of_weighing || "N/A",
      "1st Semi Weight (kg)": item.first_semi_annual?.weight || "N/A",
      "1st Semi Height (cm)": item.first_semi_annual?.height || "N/A",
      "1st Semi WFA Status": item.first_semi_annual?.nutritional_status?.wfa || "N/A",
      "1st Semi LHFA Status": item.first_semi_annual?.nutritional_status?.lhfa || "N/A",
      "1st Semi WFL Status": item.first_semi_annual?.nutritional_status?.wfl || "N/A",
      "1st Semi MUAC (mm)": item.first_semi_annual?.nutritional_status?.muac || "N/A",
      "1st Semi Feeding Type": item.first_semi_annual?.type_of_feeding || "N/A",
      // Second Semi-Annual Data
      "2nd Semi Weighing Date": item.second_semi_annual?.date_of_weighing || "N/A",
      "2nd Semi Weight (kg)": item.second_semi_annual?.weight || "N/A",
      "2nd Semi Height (cm)": item.second_semi_annual?.height || "N/A",
      "2nd Semi WFA Status": item.second_semi_annual?.nutritional_status?.wfa || "N/A",
      "2nd Semi LHFA Status": item.second_semi_annual?.nutritional_status?.lhfa || "N/A",
      "2nd Semi WFL Status": item.second_semi_annual?.nutritional_status?.wfl || "N/A",
      "2nd Semi MUAC (mm)": item.second_semi_annual?.nutritional_status?.muac || "N/A",
      "2nd Semi Feeding Type": item.second_semi_annual?.type_of_feeding || "N/A"
    }));
  }, [records]);

  const handleExportCSV = () => exportToCSV(prepareExportData(), `opt_semi_annual_records_${yearName.replace(" ", "_")}`);

  const handleExportExcel = () => exportToExcel(prepareExportData(), `opt_semi_annual_records_${yearName.replace(" ", "_")}`);

  const handleExportPDF = () => exportToPDF(prepareExportData(), `opt_semi_annual_records_${yearName.replace(" ", "_")}`);

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

  // Filter handlers
  const handleSitioSelection = (sitio_name: string, checked: boolean) => {
    if (checked) {
      setSelectedSitios([...selectedSitios, sitio_name]);
      setSitioSearch("");
    } else {
      setSelectedSitios(selectedSitios.filter(sitio => sitio !== sitio_name));
    }
  };

  const handleSelectAllSitios = (checked: boolean) => {
    if (checked && sitios.length > 0) {
      setSelectedSitios(sitios.map((sitio: any) => sitio.sitio_name));
      setSitioSearch("");
    } else {
      setSelectedSitios([]);
    }
  };

  const handleManualSitioSearch = (value: string) => {
    setSitioSearch(value);
    if (value) {
      setSelectedSitios([]);
    }
  };

  const handleNutritionalStatusSelection = (status: string, checked: boolean) => {
    if (checked) {
      setSelectedNutritionalStatuses([...selectedNutritionalStatuses, status]);
      setNutritionalStatus("");
    } else {
      setSelectedNutritionalStatuses(selectedNutritionalStatuses.filter(s => s !== status));
    }
  };

  const handleSelectAllNutritionalStatuses = (checked: boolean) => {
    if (checked) {
      setSelectedNutritionalStatuses(nutritionalStatusOptions.map(option => option.value).filter(v => v !== "all"));
      setNutritionalStatus("");
    } else {
      setSelectedNutritionalStatuses([]);
    }
  };

  const handleManualNutritionalStatusSearch = (value: string) => {
    setNutritionalStatus(value);
    if (value) {
      setSelectedNutritionalStatuses([]);
    }
  };

  const getStatusCategory = (status: string) => {
    if (nutritionalStatusCategories.wfa.includes(status)) return "WFA";
    if (nutritionalStatusCategories.lhfa.includes(status)) return "LHFA";
    if (nutritionalStatusCategories.wfh.includes(status)) return "WFH";
    if (nutritionalStatusCategories.muac.includes(status)) return "MUAC";
    return "Other";
  };

  const groupedNutritionalStatuses = nutritionalStatusOptions.reduce((acc, option) => {
    if (option.value === "all") return acc;
    
    const category = getStatusCategory(option.value);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {} as Record<string, typeof nutritionalStatusOptions>);

  const getStatusDisplayName = (statusValue: string) => {
    const statusInfo = nutritionalStatusOptions.find(opt => opt.value === statusValue);
    return statusInfo?.label || statusValue;
  };

  return (
    <LayoutWithBack title={`Semi-Annual OPT Tracking`} description={`${yearName} Child Health Records`}>
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by Name or Sitio..." 
              className="pl-10 w-full" 
              value={sitioSearch} 
              onChange={(e) => handleManualSitioSearch(e.target.value)} 
            />
          </div>

          <div className="flex-1 max-w-md">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <FilterSitio
            sitios={sitios}
            isLoading={isLoadingSitios}
            selectedSitios={selectedSitios}
            onSitioSelection={handleSitioSelection}
            onSelectAll={handleSelectAllSitios}
            onManualSearch={handleManualSitioSearch}
            manualSearchValue={sitioSearch}
          />
          
          <FilterStatus
            statusOptions={nutritionalStatusOptions}
            groupedStatuses={groupedNutritionalStatuses}
            selectedStatuses={selectedNutritionalStatuses}
            onStatusSelection={handleNutritionalStatusSelection}
            onSelectAll={handleSelectAllNutritionalStatuses}
          />
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
          <Button onClick={handlePrint} className="gap-2 border-gray-200 hover:bg-gray-50">
            <Printer className="h-4 w-4 " />
            <span>Print</span>
          </Button>
        </div>
      </div>

      <SelectedFiltersChips
        items={selectedSitios}
        onRemove={(sitio) => handleSitioSelection(sitio, false)}
        onClearAll={() => setSelectedSitios([])}
        label="Filtered by sitios"
        chipColor="bg-blue-100"
        textColor="text-blue-800"
      />
      
      <SelectedFiltersChips
        items={selectedNutritionalStatuses}
        onRemove={(status) => handleNutritionalStatusSelection(status, false)}
        onClearAll={() => setSelectedNutritionalStatuses([])}
        label="Filtered by nutritional status"
        chipColor="bg-green-100"
        textColor="text-green-800"
        getDisplayName={getStatusDisplayName}
      />

      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Input
            type="number"
            className="w-[70px] h-8"
            value={pageSize}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setPageSize(value > 0 ? value : 1);
              setCurrentPage(1);
            }}
            min={1}
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
            minHeight: "13in",
            margin: "0 auto",
            fontSize: "10px",
            lineHeight: "1.2"
          }}
        >
          <div className="w-full">
            <div className="flex mt-4 text-xs">
              <p className="font-semibold uppercase mr-1">Semi Annual Record Growth Monitoring and Promotion</p>
            </div>
            <div className="text-start mb-4 mt-2 flex justify-between items-center text-xs">
              <div className="flex">
                <span className="mr-1 font-semibold">Baranagy/Sitio:</span>
                <span className="underline">
                  {selectedSitios.length > 0 
                    ? selectedSitios.join(", ") 
                    : sitioSearch || "All Sitios"
                  }
                </span>
              </div>
              <div>
                <span className="font-semibold">Calendar Year: </span>
                <span className="underline">{year}</span>
              </div>
              <div>
                <span className="font-semibold">Period: </span>
                <span className="underline">
                  {periodFilter === "both" ? "Both Periods" : 
                   periodFilter === "first" ? "First Semi-Annual" : "Second Semi-Annual"}
                </span>
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
                    {sitioSearch || nutritionalStatus || selectedSitios.length > 0 || selectedNutritionalStatuses.length > 0
                      ? "No records found matching your filters"
                      : "No records found for this year"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <table className="w-full border-collapse table-fixed">
                  <thead className="text-xs text-center">
                    <tr>
                      <th rowSpan={2} className="border border-black p-1 w-[18%] font-bold">
                        Name of Child
                      </th>
                      <th rowSpan={2} className="border border-black p-1 w-[10%] font-bold">
                        Date of Birth
                        <br />
                        (Y/M/D)
                      </th>
                      <th rowSpan={2} className="border border-black p-1 w-[6%] font-bold">
                        Sex
                      </th>

                      <th colSpan={4} className="border border-black p-1 font-bold">
                        1st Weighing
                      </th>
                      <th colSpan={4} className="border border-black p-1 font-bold">
                        2nd Weighing
                      </th>
                    </tr>
                    <tr>
                      <th rowSpan={2} className="border border-black p-1 w-[8%] font-bold">
                        Age in
                        <br />
                        Mos.
                      </th>
                      <th className="border border-black p-1 w-[6%] font-bold">
                        Wt. in
                        <br />
                        (kg)
                      </th>
                      <th className="border border-black p-1 w-[6%] font-bold">
                        Lt/Ht
                        <br />
                        (cm)
                      </th>
                      <th className="border border-black p-1 w-[12%] font-bold">Nutritional Status</th>
                      <th className="border border-black p-1 w-[6%] font-bold">
                        Age in
                        <br />
                        Mos.
                      </th>
                      <th className="border border-black p-1 w-[6%] font-bold">
                        Wt. in
                        <br />
                        (kg)
                      </th>
                      <th className="border border-black p-1 w-[6%] font-bold">
                        Lt/Ht
                        <br />
                        (cm)
                      </th>
                      <th className="border border-black p-1 w-[12%] font-bold">Nutritional Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {records.map((item, index) => (
                      <>
                        <tr key={`${index}-wfa`} className="hover:bg-gray-50">
                          <td rowSpan={4} className="border border-black p-1 text-left align-middle break-words">
                            {item.child_name || ""}
                          </td>
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                            {formatDate(item.date_of_birth)}
                          </td>
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                            {item.sex === "Male" ? "M" : item.sex === "Female" ? "F" : ""}
                          </td>

                          {/* 1st Weighing Age - from backend */}
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                            {item.first_semi_annual ? item.age_in_months || "" : ""}
                          </td>

                          {/* 1st Weighing data */}
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                            {item.first_semi_annual?.weight ? Number(item.first_semi_annual.weight).toFixed(1) : ""}
                          </td>
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                            {item.first_semi_annual?.height ? Number(item.first_semi_annual.height).toFixed(1) : ""}
                          </td>
                          <td className="border border-black p-1 text-left">
                            WFA:
                            <span className="ml-1 font-bold">{item.first_semi_annual?.nutritional_status?.wfa || ""}</span>
                          </td>

                          {/* 2nd Weighing data */}
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle bg-green-25">
                            {item.second_semi_annual ? item.age_in_months || "" : ""}
                          </td>
                          {/* 2nd Weighing data */}
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle bg-green-25">
                            {item.second_semi_annual?.weight ? Number(item.second_semi_annual.weight).toFixed(1) : ""}
                          </td>
                          <td rowSpan={4} className="border border-black p-1 text-center align-middle bg-green-25">
                            {item.second_semi_annual?.height ? Number(item.second_semi_annual.height).toFixed(1) : ""}
                          </td>
                          <td className="border border-black p-1 text-left bg-green-25">
                            WFA:
                            <span className="ml-1 font-bold">{item.second_semi_annual?.nutritional_status?.wfa || ""}</span>
                          </td>
                        </tr>

                        {/* Rest of the rows remain the same */}
                        <tr key={`${index}-lhfa`} className="hover:bg-gray-50">
                          <td className="border border-black p-1 text-left">
                            L/HFA:
                            <span className="ml-1 font-bold">{item.first_semi_annual?.nutritional_status?.lhfa || ""}</span>
                          </td>
                          <td className="border border-black p-1 text-left bg-green-25">
                            L/HFA:
                            <span className="ml-1 font-bold">{item.second_semi_annual?.nutritional_status?.lhfa || ""}</span>
                          </td>
                        </tr>
                        <tr key={`${index}-wfl`} className="hover:bg-gray-50">
                          <td className="border border-black p-1 text-left">
                            WFL/Ht:
                            <span className="ml-1 font-bold">{item.first_semi_annual?.nutritional_status?.wfl || ""}</span>
                          </td>
                          <td className="border border-black p-1 text-left bg-green-25">
                            WFL/Ht:
                            <span className="ml-1 font-bold">{item.second_semi_annual?.nutritional_status?.wfl || ""}</span>
                          </td>
                        </tr>
                        <tr key={`${index}-remarks`} className="hover:bg-gray-50">
                          <td className="border border-black p-1 text-left">Remarks:</td>
                          <td className="border border-black p-1 text-left bg-green-25">Remarks:</td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
