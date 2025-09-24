import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Loader2, Search, ChevronLeft, Home, UserCheck, Users, FileInput } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { calculateAge } from "@/helpers/ageCalculator";
import { useMedicalRecord } from "../queries/fetchQueries";
import { MedicalRecord } from "../types";
import { getAllMedicalRecordsColumns, exportColumns } from "./columns/all_col";
import { useLoading } from "@/context/LoadingContext";
import { ExportButton } from "@/components/ui/export";
import { useDebounce } from "@/hooks/use-debounce";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { FilterSitio } from "../../reports/filter-sitio";
import { SelectedFiltersChips } from "../../reports/selectedFiltersChipsProps ";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";

export default function AllMedicalConsRecord() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");
  const [selectedSitios, setSelectedSitios] = useState<string[]>([]);
  const { showLoading, hideLoading } = useLoading();

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
    
    // If sitios are selected, add them to the search query with COMMA separation
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
  const { data: apiResponse, isLoading, error } = useMedicalRecord(queryParams);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Handle API response structure (could be paginated or not)
  const {
    medicalRecords,
    totalCount,
    totalPages: apiTotalPages
  } = useMemo(() => {
    if (!apiResponse) {
      return { medicalRecords: [], totalCount: 0, totalPages: 1 };
    }

    // Check if response is paginated
    if (apiResponse.results) {
      // Paginated response
      return {
        medicalRecords: apiResponse.results,
        totalCount: apiResponse.count || 0,
        totalPages: Math.ceil((apiResponse.count || 0) / pageSize)
      };
    } else if (Array.isArray(apiResponse)) {
      // Direct array response (fallback)
      return {
        medicalRecords: apiResponse,
        totalCount: apiResponse.length,
        totalPages: Math.ceil(apiResponse.length / pageSize)
      };
    } else {
      // Unknown structure
      return { medicalRecords: [], totalCount: 0, totalPages: 1 };
    }
  }, [apiResponse, pageSize]);

  const formatMedicalData = React.useCallback((): any[] => {
    if (!medicalRecords || !Array.isArray(medicalRecords)) {
      return [];
    }

    return medicalRecords.map((record: any) => {
      const details = record.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      // Handle both resident and transient data
      const fname = info.per_fname || "";
      const lname = info.per_lname || "";
      const mname = info.per_mname || "";
      const sex = info.per_sex || "";
      const dob = info.per_dob || "";

      const addressString = [address.add_street || info.per_address || "", address.add_barangay || "", address.add_city || "", address.add_province || ""].filter((part) => part.trim().length > 0).join(", ") || "";

      return {
        rp_id: record.rp_id || null,
        pat_id: record.pat_id,
        fname,
        lname,
        mname,
        sex,
        age: calculateAge(dob).toString(),
        dob,
        householdno: details.households?.[0]?.hh_id || "",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: record.pat_type || details.pat_type || "",
        address: addressString,
        medicalrec_count: record.medicalrec_count || 0,
        contact: info.per_contact || ""
      };
    });
  }, [medicalRecords]);

  const formattedData = formatMedicalData();
  const totalPages = apiTotalPages || Math.ceil(totalCount / pageSize);
  const columns = getAllMedicalRecordsColumns();

  // Calculate resident and transient counts
  const calculateCounts = useCallback(() => {
    if (!medicalRecords) return { residents: 0, transients: 0 };

    let residents = 0;
    let transients = 0;

    medicalRecords.forEach((record: any) => {
      const details = record.patient_details || {};
      const patType = record.pat_type || details.pat_type || "";

      if (patType === "Resident") residents++;
      if (patType === "Transient") transients++;
    });

    return { residents, transients };
  }, [medicalRecords]);

  const { residents, transients } = calculateCounts();
  
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
  
  const handleManualSitioSearch = (value: string) => {
    // Not used since we're using the main search field
  };

  return (
    <MainLayoutComponent title="Medical Consultation" description="Manage Medical Consultation">
      <div className="w-full h-full flex flex-col">
        {/* Summary Cards - Updated with EnhancedCardLayout */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <EnhancedCardLayout
              title="Total Records"
              description="All medical consultation records"
              value={totalCount}
              valueDescription="Total records"
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <EnhancedCardLayout
              title="Resident Patients"
              description="Patients who are residents"
              value={residents}
              valueDescription="Total residents"
              icon={<Home className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <EnhancedCardLayout
              title="Transient Patients"
              description="Patients who are transients"
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
        <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search by name, patient ID, household number, address, or sitio..." 
                className="pl-10 bg-white w-full" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <SelectLayout
              placeholder="Filter records"
              label=""
              className="bg-white w-full sm:w-48"
              options={[
                { id: "all", name: "All Types" },
                { id: "resident", name: "Resident" },
                { id: "transient", name: "Transient" }
              ]}
              value={patientTypeFilter}
              onChange={(value) => setPatientTypeFilter(value)}
            />
            <FilterSitio 
              sitios={sitios} 
              isLoading={isLoadingSitios} 
              selectedSitios={selectedSitios} 
              onSitioSelection={handleSitioSelection} 
              onSelectAll={handleSelectAllSitios} 
              onManualSearch={handleManualSitioSearch}
              manualSearchValue=""
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Link
                to="/services/medical-consultation/form"
                state={{
                  params: {
                    mode: "fromallrecordtable"
                  }
                }}
              >
                New Record
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Selected Filters Chips */}
        {selectedSitios.length > 0 && (
          <SelectedFiltersChips 
            items={selectedSitios} 
            onRemove={(sitio:any) => handleSitioSelection(sitio, false)} 
            onClearAll={() => setSelectedSitios([])} 
            label="Filtered by sitios" 
            chipColor="bg-blue-100" 
            textColor="text-blue-800" 
          />
        )}

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={(e) => {
                  const value = +e.target.value;
                  setPageSize(value >= 1 ? value : 1);
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data" className="flex items-center gap-2">
                    <FileInput className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <ExportButton data={formattedData} filename="medical-consultation-records" columns={exportColumns} />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-white w-full overflow-x-auto border">
            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : error ? (
              <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
                <span>Error loading data. Please try again.</span>
              </div>
            ) : (
              <DataTable columns={columns} data={formattedData} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white border">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {formattedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />
            </div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}