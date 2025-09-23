// src/features/vaccination/pages/AllVaccinationRecords.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, FileInput, Users2, Loader2, ChevronLeft, Home, UserCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useVaccinationRecords } from "../../queries/fetch";
import { calculateAge } from "@/helpers/ageCalculator";
import { vaccinationColumns } from "../columns/all-vac-col";
import { BasicInfoVaccinationRecord, VaccinationCounts } from "../columns/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext";

export default function AllVaccinationRecords() {
  const { showLoading, hideLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("all");

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Build query parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearchQuery || undefined,
      patient_type: patientTypeFilter !== "all" ? patientTypeFilter : undefined
    }),
    [currentPage, pageSize, debouncedSearchQuery, patientTypeFilter]
  );

  // Fetch data with parameters
  const { data: apiResponse, isLoading, error } = useVaccinationRecords(queryParams);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, patientTypeFilter]);

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

  return (
    <div className="w-full h-full flex flex-col">
     
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Users2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vaccinated</p>
              <p className="text-2xl font-bold text-gray-800">{calculatedTotalCount}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">All</span>
          </div>
        </div>
        
        {/* Resident Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Residents</p>
              <p className="text-2xl font-bold text-gray-800">{residentCount}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Resident</span>
          </div>
        </div>
        
        {/* Transient Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transients</p>
              <p className="text-2xl font-bold text-gray-800">{transientCount}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">Transient</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search by name, vaccine, or address..." 
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
        </div>

        <div className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Link to="/services/vaccination/form" state={{ mode: "newvaccination_record" }}>
              New Record
            </Link>
          </Button>
        </div>
      </div>

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
  );
}