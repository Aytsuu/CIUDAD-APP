// MonthlyChildrenDetails.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {  Search, Loader2 } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../export/export-report";
import { ExportDropdown } from "../export/export-dropdown";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Input } from "@/components/ui/input";
import TableLayout from "@/components/ui/table/table-layout";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { useMonthlyChildrenDetails } from "./queries/fetchQueries";
import { useLoading } from "@/context/LoadingContext";
import { toast } from "sonner";
import { ChildDetail } from "./types";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterSitio } from "../filter-sitio";
import { SelectedFiltersChips } from "../selectedFiltersChipsProps ";

export default function MonthlyNewChildrenDetails() {
  const location = useLocation();
  const state = location.state as {
    month: string;
    monthName: string;
    recordCount: number;
  };

  const { showLoading, hideLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [sitioSearch, setSitioSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);
  const { month, monthName } = state || {};

  // Fetch sitio list
  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedSitioSearch = useDebounce(sitioSearch, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, debouncedSitioSearch, selectedSitios, pageSize]);

  // Combine selected sitios with search query
  const combinedSitioSearch = selectedSitios.length > 0 ? selectedSitios.join(",") : sitioSearch;

  const { data: apiResponse, isLoading, error } = useMonthlyChildrenDetails(month || "", currentPage, pageSize, debouncedSearchTerm, combinedSitioSearch);

  // Access data from paginated response
  const childrenData = useMemo(() => apiResponse?.results?.records || [], [apiResponse]);
  const totalRecords = apiResponse?.results?.total_records || 0;
  const paginationCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(paginationCount / pageSize);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch children details");
    }
  }, [error]);

  const startIndex = childrenData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, paginationCount);

  const prepareExportData = useCallback(() => {
    return childrenData.map((record: ChildDetail) => {
      return {
        "Date Added": record.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A",
        "Child Name": record.child_name || "N/A",
        Sex: record.sex || "N/A",
        "Date of Birth": record.date_of_birth || "N/A",
        "Age (months)": record.age_in_months || "N/A",
        "Mother's Name": record.parents.mother || "N/A",
        "Father's Name": record.parents.father || "N/A",
        Address: record.address || "N/A",
        Sitio: record.sitio || "N/A",
      };
    });
  }, [childrenData]);

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `children_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `children_records_${monthName}_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    exportToPDF("landscape");
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
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

  const tableHeader = ["Date Added", "Child Name", "Sex", "Date of Birth", "Age (months)", "Mother's Name", "Father's Name", "Address", "Sitio"];

  const tableRows = childrenData.map((record: ChildDetail) => {
    return [
      record.created_at ? new Date(record.created_at).toLocaleDateString() : "N/A",
      <div className="flex items-center gap-2">{record.child_name || "N/A"}</div>,
      record.sex || "N/A",
      record.date_of_birth || "N/A",
      record.age_in_months || "N/A",
      record.parents.mother || "N/A",
      record.parents.father || "N/A",
      <div className="flex items-center justify-center gap-2">{record.address || "N/A"}</div>,
      record.sitio || "N/A",
    ];
  });

  return (
    <LayoutWithBack title="New Children Registration" description={`${monthName} Records`}>
      {/* Search and Export Controls */}
      <div className="bg-white p-4 border-b flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by child name, mother, address, household..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
        </div>

        <div className="flex gap-2 items-center">
          <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:bg-gray-50" />
        </div>
      </div>

      {/* Selected Filters Chips */}
      <SelectedFiltersChips
        items={selectedSitios}
        onRemove={(sitio) => handleSitioSelection(sitio, false)}
        onClearAll={() => setSelectedSitios([])}
        label="Filtered by sitios"
        chipColor="bg-blue-100"
        textColor="text-blue-800"
      />

      {/* Pagination Controls */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20 h-8 bg-white border rounded-md text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {[25].map((size) => (
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
              `Showing ${startIndex} - ${endIndex} of ${paginationCount} records`
            )}
          </span>
          {!isLoading && totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="text-sm" />}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-lg overflow-x-auto   ">
        <div
          style={{
            width: "19in",
            overflowX: "auto",
            position: "relative",
            margin: "0 auto",
            fontSize: "12px",
          }}
        >
          <div id="printable-area" className="p-4">
            <div>
              <div className="text-center py-2">
                <Label className="text-sm font-bold uppercase tracking-widest underline block">NEW CHILDREN REGISTRATION RECORDS</Label>
                <Label className="font-medium items-center block">Month: {monthName}</Label>
                <Label className="font-medium items-center block">Total Children: {totalRecords}</Label>
              </div>

              {isLoading ? (
                <div className="w-full h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Loading children details...</span>
                  </div>
                </div>
              ) : childrenData.length === 0 ? (
                <div className="w-full h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">{searchTerm || sitioSearch || selectedSitios.length > 0 ? "No records found matching your filters" : "No records found for this month"}</p>
                  </div>
                </div>
              ) : (
                <TableLayout
                  header={tableHeader}
                  rows={tableRows}
                  tableClassName="border rounded-lg mt-4"
                  bodyCellClassName="border border-gray-600 text-center text-sm p-1"
                  headerCellClassName="font-bold text-sm border border-gray-600 text-black text-center"
                  defaultRowCount={25}
                />
              )}

              <div className="mt-4">
                <Label className="text-xs font-normal">This report shows all new children registered in the system for the specified month.</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
