"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Printer, Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../firstaid-report/export-report";
import { ExportDropdown } from "../firstaid-report/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { useYearlyOPTRecords } from "./queries/fetch";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterSitio } from "../filter-sitio";
import { SelectedFiltersChips } from "../selectedFiltersChipsProps ";
import { FilterStatus } from "../filter-nutstatus";
import { nutritionalStatusCategories, nutritionalStatusOptions } from "../options";

type Quarter = "Q1" | "Q2" | "Q3";

const quarterConfig = {
  Q1: {
    name: "January - March",
    months: [
      { key: "january", name: "January" },
      { key: "february", name: "February" },
      { key: "march", name: "March" }
    ]
  },
  Q2: {
    name: "April - August",
    months: [
      { key: "april", name: "April" },
      { key: "may", name: "May" },
      { key: "june", name: "June" },
      { key: "july", name: "July" },
      { key: "august", name: "August" }
    ]
  },
  Q3: {
    name: "September - December",
    months: [
      { key: "september", name: "September" },
      { key: "october", name: "October" },
      { key: "november", name: "November" },
      { key: "december", name: "December" }
    ]
  }
};

export default function QuarterlyOPTDetails() {
  const location = useLocation();
  const state = location.state as { year: string; yearName: string };
  const { year, yearName } = state || {};
  const { showLoading, hideLoading } = useLoading();

  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>("Q1");
  const [sitioSearch, setSitioSearch] = useState("");
  const [nutritionalStatus, setNutritionalStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);
  const [selectedNutritionalStatuses, setSelectedNutritionalStatuses] = useState<string[]>([]);

  // Fetch sitio list
  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  const debouncedSitioSearch = useDebounce(sitioSearch, 500);
  const debouncedNutritionalStatus = useDebounce(nutritionalStatus, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSitioSearch, debouncedNutritionalStatus, selectedSitios, selectedNutritionalStatuses]);

  // Combine selected sitios with search query
  const combinedSitioSearch = selectedSitios.length > 0 ? selectedSitios.join(",") : sitioSearch;

  const combinedNutritionalStatus = selectedNutritionalStatuses.length > 0 ? selectedNutritionalStatuses.join(",") : nutritionalStatus;

  const { data: apiResponse, isLoading, error } = useYearlyOPTRecords(year, currentPage, pageSize, combinedSitioSearch, combinedNutritionalStatus);

  const records = apiResponse?.results?.children_data || [];
  const totalEntries = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalEntries / pageSize);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch yearly OPT records");
      console.error("API Error:", error);
    }
  }, [error]);

  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalEntries);

  const currentQuarterConfig = quarterConfig[selectedQuarter];

  const prepareExportData = useCallback(() => {
    return records.map((item: any) => {
      const exportItem: Record<string, string | number | null> = {
        "Child ID": item.child_id || "N/A",
        "Household No": item.household_no || "N/A",
        "Child Name": item.child_name || "N/A",
        Sex: item.sex || "N/A",
        "Date of Birth": item.date_of_birth || "N/A",
        "Age (months)": item.age_in_months || "N/A",
        "Mother's Name": item.parents?.mother || "N/A",
        "Father's Name": item.parents?.father || "N/A",
        Address: item.address || "N/A",
        Sitio: item.sitio || "N/A",
        Transient: item.transient ? "Yes" : "No"
      };

      // Add only current quarter's monthly data
      currentQuarterConfig.months.forEach((month) => {
        const monthData = item.monthly_data[month.key];
        const monthName = month.name;

        exportItem[`${monthName} Weighing Date`] = monthData?.date_of_weighing || "N/A";
        exportItem[`${monthName} Weight (kg)`] = monthData?.weight || "N/A";
        exportItem[`${monthName} Height (cm)`] = monthData?.height || "N/A";
        exportItem[`${monthName} WFA Status`] = monthData?.body_measurement?.wfa || "N/A";
        exportItem[`${monthName} LHFA Status`] = monthData?.body_measurement?.lhfa || "N/A";
        exportItem[`${monthName} WFL Status`] = monthData?.body_measurement?.wfl || "N/A";
        exportItem[`${monthName} Feeding Type`] = monthData?.type_of_feeding || "N/A";
      });

      return exportItem;
    });
  }, [records, currentQuarterConfig]);

  const handleExportCSV = () => exportToCSV(prepareExportData(), `opt_${selectedQuarter}_records_${yearName.replace(" ", "_")}`);

  const handleExportExcel = () => exportToExcel(prepareExportData(), `opt_${selectedQuarter}_records_${yearName.replace(" ", "_")}`);

  const handleExportPDF = () => exportToPDF(`opt_${selectedQuarter}_records_${yearName.replace(" ", "_")}`);

  const handlePrint = () => {
    const printContent = document.getElementById("printable-area");
    if (!printContent) return;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const formatDate = (dateString: string | null) => {
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
      setSelectedSitios(selectedSitios.filter((sitio) => sitio !== sitio_name));
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
      setSelectedNutritionalStatuses(selectedNutritionalStatuses.filter((s) => s !== status));
    }
  };

  const handleSelectAllNutritionalStatuses = (checked: boolean) => {
    if (checked) {
      setSelectedNutritionalStatuses(nutritionalStatusOptions.map((option) => option.value).filter((v) => v !== "all"));
      setNutritionalStatus("");
    } else {
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
    const statusInfo = nutritionalStatusOptions.find((opt) => opt.value === statusValue);
    return statusInfo?.label || statusValue;
  };

  return (
    <LayoutWithBack title={`Quarterly OPT Tracking`} description={`${yearName} Child Health Records - ${currentQuarterConfig.name}`}>
      {/* Quarter Selection */}
      <div className="bg-white p-4 border-b">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700 flex items-center">Select Period:</span>
          {Object.entries(quarterConfig).map(([quarter, config]) => (
            <Button key={quarter} variant={selectedQuarter === quarter ? "default" : "outline"} size="sm" onClick={() => setSelectedQuarter(quarter as Quarter)} className="text-xs">
              {config.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Export Controls */}
      <div className="bg-white p-4 border-b flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by Name or Sitio..." className="pl-10 w-full" value={sitioSearch} onChange={(e) => handleManualSitioSearch(e.target.value)} />
          </div>

          <FilterSitio sitios={sitios} isLoading={isLoadingSitios} selectedSitios={selectedSitios} onSitioSelection={handleSitioSelection} onSelectAll={handleSelectAllSitios} onManualSearch={handleManualSitioSearch} manualSearchValue={sitioSearch} />

          <FilterStatus statusOptions={nutritionalStatusOptions} groupedStatuses={groupedNutritionalStatuses} selectedStatuses={selectedNutritionalStatuses} onStatusSelection={handleNutritionalStatusSelection} onSelectAll={handleSelectAllNutritionalStatuses} />
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
          <Button onClick={handlePrint} className="gap-2 border-gray-200 hover:bg-gray-50">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </div>
      </div>

      <SelectedFiltersChips items={selectedSitios} onRemove={(sitio) => handleSitioSelection(sitio, false)} onClearAll={() => setSelectedSitios([])} label="Filtered by sitios" chipColor="bg-blue-100" textColor="text-blue-800" />

      <SelectedFiltersChips
        items={selectedNutritionalStatuses}
        onRemove={(status) => handleNutritionalStatusSelection(status, false)}
        onClearAll={() => setSelectedNutritionalStatuses([])}
        label="Filtered by nutritional status"
        chipColor="bg-green-100"
        textColor="text-green-800"
        getDisplayName={getStatusDisplayName}
      />

      {/* Pagination Controls */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Input
            type="number"
            className="w-[70px] h-8"
            value={pageSize}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value);
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
                <Loader2 className="h-8 w-8 animate-spin" />
                Loading...
              </span>
            ) : (
              `Showing ${startIndex} - ${endIndex} of ${totalEntries} records`
            )}
          </span>
          {!isLoading && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white overflow-hidden">
        <div
          id="printable-area"
          className="p-4"
          style={{
            minHeight: "11in",
            margin: "0 auto",
            fontSize: "10px",
            lineHeight: "1.2"
          }}
        >
          <div className="w-full">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="font-bold text-sm uppercase mb-2">Monthly Record Growth Monitoring and Promotion</h1>
              <h2 className="font-semibold text-xs mb-2">
                {currentQuarterConfig.name} - {year}
              </h2>
            </div>

            <div className="text-start mb-4 flex justify-between items-center text-xs">
              <div className="flex">
                <span className="mr-1 font-semibold">Barangay/Sitio:</span>
                <span className="underline">{selectedSitios.length > 0 ? selectedSitios.join(", ") : sitioSearch || "All Sitios"}</span>
              </div>
              <div>
                <span className="font-semibold">Calendar Year: </span>
                <span className="underline">{year}</span>
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
                  <p className="text-gray-600">{sitioSearch || nutritionalStatus || selectedSitios.length > 0 || selectedNutritionalStatuses.length > 0 ? "No records found matching your filters" : "No records found for this period"}</p>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse border border-black text-xs">
                  <thead className="text-center">
                    <tr>
                      <th rowSpan={2} className="border border-black p-1 w-[18%] font-bold bg-gray-50">
                        Name of Child
                      </th>
                      <th rowSpan={2} className="border border-black p-1 w-[10%] font-bold bg-gray-50">
                        Date of Birth
                        <br />
                        (Y/M/D)
                      </th>
                      <th rowSpan={2} className="border border-black p-1 w-[6%] font-bold bg-gray-50">
                        Sex
                      </th>
                      {currentQuarterConfig.months.map((month) => (
                        <th key={month.key} colSpan={4} className="border border-black p-1 font-bold bg-gray-100">
                          {month.name}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {currentQuarterConfig.months.map((month) => (
                        <React.Fragment key={`${month.key}-headers`}>
                          <th className="border border-black p-1 w-[6%] font-bold bg-gray-50">
                            Age in
                            <br />
                            Mos.
                          </th>
                          <th className="border border-black p-1 w-[6%] font-bold bg-gray-50">
                            Wt. in
                            <br />
                            (kg)
                          </th>
                          <th className="border border-black p-1 w-[6%] font-bold bg-gray-50">
                            Lt/Ht
                            <br />
                            (cm)
                          </th>
                          <th className="border border-black p-1 w-[12%] font-bold bg-gray-50">Nutritional Status</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((item: any, index: any) => (
                      <>
                        {/* WFA Row */}
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

                          {currentQuarterConfig.months.map((month) => {
                            const monthData = item.monthly_data[month.key];
                            return (
                              <React.Fragment key={`${month.key}-wfa`}>
                                <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                                  {monthData?.age_at_weighing || item.age_in_months || ""}
                                </td>
                                <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                                  {monthData?.weight ? Number(monthData.weight).toFixed(1) : ""}
                                </td>
                                <td rowSpan={4} className="border border-black p-1 text-center align-middle">
                                  {monthData?.height ? Number(monthData.height).toFixed(1) : ""}
                                </td>
                                <td className="border border-black p-1 text-left">
                                  WFA:
                                  <span className="ml-1 font-bold">{monthData?.body_measurement?.wfa || ""}</span>
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>

                        {/* L/HFA Row */}
                        <tr key={`${index}-lhfa`} className="hover:bg-gray-50">
                          {currentQuarterConfig.months.map((month) => {
                            const monthData = item.monthly_data[month.key];
                            return (
                              <td key={`${month.key}-lhfa`} className="border border-black p-1 text-left">
                                L/HFA:
                                <span className="ml-1 font-bold">{monthData?.body_measurement?.lhfa || ""}</span>
                              </td>
                            );
                          })}
                        </tr>

                        {/* WFL/Ht Row */}
                        <tr key={`${index}-wfl`} className="hover:bg-gray-50">
                          {currentQuarterConfig.months.map((month) => {
                            const monthData = item.monthly_data[month.key];
                            return (
                              <td key={`${month.key}-wfl`} className="border border-black p-1 text-left">
                                WFL/Ht:
                                <span className="ml-1 font-bold">{monthData?.body_measurement?.wfl || ""}</span>
                              </td>
                            );
                          })}
                        </tr>
                        <tr key={`${index}-remarks`} className="hover:bg-gray-50">
                          {currentQuarterConfig.months.map((month) => {
                            const monthData = item.monthly_data[month.key];
                            return (
                              <td key={`${month.key}-remarks`} className="border border-black p-1 text-left">
                                Remarks:
                                <span className="ml-1 font-bold">{monthData?.body_measurement?.remarks || ""}</span>
                              </td>
                            );
                          })}
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
