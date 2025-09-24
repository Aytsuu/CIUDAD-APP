// src/features/vaccination/pages/AllVaccinationRecords.tsx
import  { useState, useEffect, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, FileInput, Users2, Loader2, Home, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useVaccinationRecords } from "../../queries/fetch";
import { calculateAge } from "@/helpers/ageCalculator";
import { vaccinationColumns } from "../columns/all-vac-col";
import { BasicInfoVaccinationRecord, VaccinationCounts } from "../columns/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useSitioList } from "@/pages/record/profiling/queries/profilingFetchQueries";
import { FilterSitio } from "@/pages/healthServices/Reports/filter-sitio";
import { SelectedFiltersChips } from "@/pages/healthServices/Reports/selectedFiltersChipsProps ";


export default function AllVaccinationRecords() {
  const { showLoading, hideLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");
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
  const { data: apiResponse, isLoading, error } = useVaccinationRecords(queryParams);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // Handle API response structure
  const {
    vaccinationRecords,
    totalCount,
    totalPages: apiTotalPages
  } = useMemo(() => {
    if (!apiResponse) {
      return { vaccinationRecords: [], totalCount: 0, totalPages: 1 };
    }

    // Check if response is paginated
    if (apiResponse.results) {
      // Paginated response
      return {
        vaccinationRecords: apiResponse.results,
        totalCount: apiResponse.count || 0,
        totalPages: Math.ceil((apiResponse.count || 0) / pageSize)
      };
    } else if (Array.isArray(apiResponse)) {
      // Direct array response (fallback)
      return {
        vaccinationRecords: apiResponse,
        totalCount: apiResponse.length,
        totalPages: Math.ceil(apiResponse.length / pageSize)
      };
    } else {
      // Unknown structure
      return { vaccinationRecords: [], totalCount: 0, totalPages: 1 };
    }
  }, [apiResponse, pageSize]);

  const formatVaccinationData = useCallback((): BasicInfoVaccinationRecord[] => {
    if (!vaccinationRecords || !Array.isArray(vaccinationRecords)) {
      return [];
    }

    return vaccinationRecords.map((record: any) => {
      const details = record.patient_details || {};
      const info = details.personal_info || {};
      const address = details.address || {};

      const addressString = [address.add_street, address.add_barangay, address.add_city, address.add_province].filter((part) => part && part.trim().length > 0).join(", ") || "";

      return {
        pat_id: record.pat_id,
        fname: info.per_fname || "",
        lname: info.per_lname || "",
        mname: info.per_mname || "",
        sex: info.per_sex || "",
        age: calculateAge(info.per_dob).toString(),
        dob: info.per_dob || "",
        householdno: details.households?.[0]?.hh_id || "",
        street: address.add_street || "",
        sitio: address.add_sitio || "",
        barangay: address.add_barangay || "",
        city: address.add_city || "",
        province: address.add_province || "",
        pat_type: details.pat_type || "",
        address: addressString,
        vaccination_count: record.vaccination_count || 0
      };
    });
  }, [vaccinationRecords]);

  const formattedData = formatVaccinationData();
  const totalPages = apiTotalPages || Math.ceil(totalCount / pageSize);

  // Calculate resident and transient counts
  const calculateCounts = useCallback((): VaccinationCounts => {
    if (!vaccinationRecords) return { residentCount: 0, transientCount: 0, totalCount: 0 };
    
    let residents = 0;
    let transients = 0;
    
    vaccinationRecords.forEach((record: any) => {
      const details = record.patient_details || {};
      const patType = details.pat_type || "";
      
      if (patType === 'Resident') residents++;
      if (patType === 'Transient') transients++;
    });
    
    return { 
      residentCount: residents, 
      transientCount: transients, 
      totalCount: residents + transients 
    };
  }, [vaccinationRecords]);
  
  const { residentCount, transientCount, totalCount: calculatedTotalCount } = calculateCounts();

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
    <MainLayoutComponent title="Vaccination Records" description="Manage and view patient vaccination records">
      <div className="w-full h-full flex flex-col">
        {/* Summary Cards - Updated with EnhancedCardLayout */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <EnhancedCardLayout
              title="Total Vaccinated"
              description="All vaccination records"
              value={calculatedTotalCount}
              valueDescription="Total vaccinated"
              icon={<Users2 className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <EnhancedCardLayout
              title="Resident Patients"
              description="Patients who are residents"
              value={residentCount}
              valueDescription="Total residents"
              icon={<Home className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <EnhancedCardLayout
              title="Transient Patients"
              description="Patients who are transients"
              value={transientCount}
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
              <Input 
                placeholder="Search by name, vaccine, address, or sitio..." 
                className="pl-10 bg-white w-full" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <SelectLayout
              placeholder="Patient Type"
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
              <Link to="/services/vaccination/form" state={{ mode: "newvaccination_record" }}>
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
                  setCurrentPage(1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div className="flex justify-end sm:justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data" className="flex items-center gap-2">
                    <FileInput size={16} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
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
              <DataTable columns={vaccinationColumns} data={formattedData} />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white border">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {formattedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
            </p>
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayoutComponent>
  );
}