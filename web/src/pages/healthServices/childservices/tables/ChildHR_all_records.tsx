//// filepath: /c:/CIUDAD-APP/web/src/pages/healthServices/childservices/tables/ChildHR_all_records.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Users, Home, UserCheck } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useChildHealthRecords } from "../forms/queries/fetchQueries";
import { filterOptions } from "./types";
import { childColumns } from "./columns/all_col";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useDebounce } from "@/hooks/use-debounce";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { FilterSitio } from "../../reports/filter-sitio";
import { SelectedFiltersChips } from "../../reports/selectedFiltersChipsProps ";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";
import { formatChildHealthData } from "./formattedData";
import TableLoading from "../../table-loading";

export default function AllChildHealthRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTypeFilter, setPatientTypeFilter] = useState("all");
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);

  // Fetch sitio data
  const { data: sitioData, isLoading: isLoadingSitios } = useSitioList();
  const sitios = sitioData || [];

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, patientTypeFilter, selectedSitios]);

  // Build the combined search query that includes selected sitios
  const combinedSearchQuery = useMemo(() => {
    let query = debouncedSearchQuery || "";
    if (selectedSitios.length > 0) {
      const sitioQuery = selectedSitios.join(",");
      query = query ? `${query},${sitioQuery}` : sitioQuery;
    }
    return query || undefined;
  }, [debouncedSearchQuery, selectedSitios]);

  // Build query parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: combinedSearchQuery,
      patient_type: patientTypeFilter !== "all" ? patientTypeFilter : undefined
    }),
    [currentPage, pageSize, combinedSearchQuery, patientTypeFilter]
  );

  // Fetch data with parameters
  const { data: apiResponse, isLoading, error } = useChildHealthRecords(queryParams);

  // Handle API response structure
  const { childRecords, totalCount, totalPages: apiTotalPages } = useMemo(() => {
    if (!apiResponse) {
      return { childRecords: [], totalCount: 0, totalPages: 1 };
    }

    if (apiResponse.results) {
      return {
        childRecords: apiResponse.results,
        totalCount: apiResponse.count || 0,
        totalPages: Math.ceil((apiResponse.count || 0) / pageSize)
      };
    } else if (Array.isArray(apiResponse)) {
      return {
        childRecords: apiResponse,
        totalCount: apiResponse.length,
        totalPages: Math.ceil(apiResponse.length / pageSize)
      };
    } else {
      return { childRecords: [], totalCount: 0, totalPages: 1 };
    }
  }, [apiResponse, pageSize]);

  // Use the separated helper to format data
  const formattedData = useMemo(() => {
    return formatChildHealthData(childRecords);
  }, [childRecords]);

  const totalPages = apiTotalPages || Math.ceil(totalCount / pageSize);

  // Calculate resident and transient counts
  const calculateCounts = useCallback(() => {
    if (!childRecords) return { residents: 0, transients: 0, totalCount: 0 };
    let residents = 0;
    let transients = 0;
    childRecords.forEach((record: any) => {
      const patrecDetails = record.patrec_details || {};
      const patientDetails = patrecDetails.pat_details || {};
      const patType = patientDetails.pat_type || "";
      if (patType === "Resident") residents++;
      if (patType === "Transient") transients++;
    });
    return { residents, transients, totalCount: residents + transients };
  }, [childRecords]);

  const { residents, transients, totalCount: calculatedTotalCount } = calculateCounts();

  // Sitio filter handlers
  const handleSitioSelection = (sitio_name: string, checked: boolean) => {
    if (checked) {
      setSelectedSitios([...selectedSitios, sitio_name]);
    } else {
      setSelectedSitios(selectedSitios.filter((sitio) => sitio !== sitio_name));
    }
  };

  const handleSelectAllSitios = (checked: boolean) => {
    if (checked && sitios.length > 0) {
      setSelectedSitios(sitios.map((sitio: any) => sitio.sitio_name));
    } else {
      setSelectedSitios([]);
    }
  };

  // Export functionality
  const prepareExportData = () => {
    return formattedData.map((record) => ({
      "Patient No": record.pat_id,
      "Full Name": `${record.lname}, ${record.fname} ${record.mname ? record.mname : ""}`.trim(),
      "Sex": record.sex,
      "Age": record.age,
      "Date of Birth": record.dob || "N/A",
      "Patient Type": record.pat_type,
      "Full Address": record.address,
      "Sitio": record.sitio || "N/A",
      "Mother's Name": `${record.mother_fname} ${record.mother_mname || ""} ${record.mother_lname}`.trim() || "N/A",
      "Mother's Occupation": record.mother_occupation || "N/A",
      "Father's Name": `${record.father_fname} ${record.father_mname || ""} ${record.father_lname}`.trim() || "N/A",
      "Father's Occupation": record.father_occupation || "N/A",
      "Health Checkup Count": record.health_checkup_count
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `child_health_records_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `child_health_records_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `child_health_records_${new Date().toISOString().slice(0, 10)}`, "Child Health Records");
  };

  return (
    <MainLayoutComponent title="Child Health Record" description="Manage and View Child's Record">
      <div className="w-full h-full flex flex-col">
        {/* Summary Cards */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <EnhancedCardLayout 
              title="Total Records" 
              description="All child health records" 
              value={calculatedTotalCount} 
              valueDescription="Total records" 
              icon={<Users className="h-5 w-5 text-muted-foreground" />} 
              cardClassName="border shadow-sm rounded-lg" 
              headerClassName="pb-2" 
              contentClassName="pt-0" 
            />
            <EnhancedCardLayout
              title="Resident Children"
              description="Children who are residents"
              value={residents}
              valueDescription="Total residents"
              icon={<Home className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
            <EnhancedCardLayout
              title="Transient Children"
              description="Children who are transients"
              value={transients}
              valueDescription="Total transients"
              icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white no-print">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search by name, address, or sitio..." 
                className="pl-10 bg-white w-full" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <SelectLayout 
              placeholder="Patient Type" 
              label="" 
              className="bg-white w-full sm:w-48" 
              options={filterOptions} 
              value={patientTypeFilter} 
              onChange={(value) => setPatientTypeFilter(value)} 
            />
            <FilterSitio 
              sitios={sitios} 
              isLoading={isLoadingSitios} 
              selectedSitios={selectedSitios} 
              onSitioSelection={handleSitioSelection} 
              onSelectAll={handleSelectAllSitios} 
              manualSearchValue="" 
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <ExportDropdown 
                onExportCSV={handleExportCSV} 
                onExportExcel={handleExportExcel} 
                onExportPDF={handleExportPDF} 
                className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200" 
              />
            </div>
            <ProtectedComponentButton exclude={["DOCTOR"]}>
              <div className="w-full sm:w-auto">
                <Link
                  to="/services/childhealthrecords/form"
                  state={{
                    params: {
                      mode: "newchildhealthrecord"
                    }
                  }}
                >
                  <Button className="w-full sm:w-auto">New Record</Button>
                </Link>
              </div>
            </ProtectedComponentButton>
          </div>
        </div>

        {/* Selected Filters Chips */}
        {selectedSitios.length > 0 && (
          <SelectedFiltersChips 
            items={selectedSitios} 
            onRemove={(sitio: any) => handleSitioSelection(sitio, false)} 
            onClearAll={() => setSelectedSitios([])} 
            label="Filtered by sitios" 
            chipColor="bg-blue-100" 
            textColor="text-blue-800" 
          />
        )}

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0 no-print">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                  setCurrentPage(1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="bg-white w-full overflow-x-auto border">
            {isLoading ? (
             <TableLoading/>
            ) : error ? (
              <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
                <span>Error loading data. Please try again.</span>
              </div>
            ) : (
              <DataTable columns={childColumns} data={formattedData} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white border no-print">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {formattedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}