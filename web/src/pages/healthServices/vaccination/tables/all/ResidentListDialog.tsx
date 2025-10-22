"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/table/data-table";
import { Search, ArrowUpDown, Users, UserCheck, UserX, Download, Filter } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useUnvaccinatedResidentsDetails } from "../../queries/fetch";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useLocation } from "react-router-dom";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import { Button } from "@/components/ui/button/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import TableLoading from "@/pages/healthServices/table-loading";

interface ResidentData {
  rp_id: string;
  pat_id: string | null;
  status: string;
  vaccination_status: "unvaccinated" | "partially_vaccinated" | "fully_vaccinated";
  name: string;
  age: number;
  sex: string;
  address: string;
  sitio: string;
  contact: string;
  birth_date: string;
  completed_doses: number;
  total_doses: number;
  dose_progress: string;
  is_conditional: boolean;
  has_dose_requirement: boolean;
}

interface VaccinationStats {
  unvaccinated: number;
  partially_vaccinated: number;
  fully_vaccinated: number;
  total: number;
}

// Define the vaccination status options to match backend
const VACCINATION_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "unvaccinated", label: "Unvaccinated" },
  { value: "partially_vaccinated", label: "Partially Vaccinated" },
  { value: "fully_vaccinated", label: "Fully Vaccinated" },
] as const;

type VaccinationStatus = "all" | "unvaccinated" | "partially_vaccinated" | "fully_vaccinated";

export function ResidentListSection() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get state params from navigation
  const { vaccineId, ageGroupId, title, vaccinationStatus } = location.state?.params || {};

  const finalVaccineId = vaccineId || 0;
  const finalAgeGroupId = ageGroupId || null;
  const finalTitle = title || "Resident List";
  
  // Initialize with state param if provided, otherwise use "all"
  const initialVaccinationStatus = (vaccinationStatus && VACCINATION_STATUS_OPTIONS.find(opt => opt.value === vaccinationStatus)) 
    ? vaccinationStatus as VaccinationStatus 
    : "all";

  const [selectedVaccinationStatus, setSelectedVaccinationStatus] = useState<VaccinationStatus>(initialVaccinationStatus);

  const queryParams = React.useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      age_group_id: finalAgeGroupId,
      search: searchQuery.trim(),
      // Only send vaccination_status if it's not "all"
      vaccination_status: selectedVaccinationStatus !== "all" ? selectedVaccinationStatus : undefined
    }),
    [currentPage, pageSize, finalAgeGroupId, searchQuery, selectedVaccinationStatus]
  );

  const { data: residentsResponse, isLoading } = useUnvaccinatedResidentsDetails(finalVaccineId, queryParams);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize >= 1 ? newPageSize : 1);
    setCurrentPage(1);
  };

  const handleVaccinationStatusChange = (status: string) => {
    setSelectedVaccinationStatus(status as VaccinationStatus);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Check if vaccine is conditional
  const isConditionalVaccine = residentsResponse?.vaccine_info?.is_conditional || false;

  // Use vaccination_counts from backend response
  const vaccinationStats: VaccinationStats = useMemo(() => {
    if (!residentsResponse?.success || !residentsResponse.vaccination_counts) {
      return { unvaccinated: 0, partially_vaccinated: 0, fully_vaccinated: 0, total: 0 };
    }

    return {
      unvaccinated: residentsResponse.vaccination_counts.unvaccinated || 0,
      partially_vaccinated: residentsResponse.vaccination_counts.partially_vaccinated || 0,
      fully_vaccinated: residentsResponse.vaccination_counts.fully_vaccinated || 0,
      total: residentsResponse.vaccination_counts.total || residentsResponse.count || 0
    };
  }, [residentsResponse]);

  // Format data for DataTable
  const formatResidentData = React.useCallback((): ResidentData[] => {
    if (!residentsResponse?.success) return [];

    return residentsResponse.results.map((resident: any) => {
      const info = resident.personal_info || {};
      const addresses = info.per_addresses || [];
      const vaccinationStatus = resident.vaccination_status || {};

      // Get dose information from vaccination_status (individual for each resident)
      const completedDoses = vaccinationStatus.completed_doses || 0;
      const totalDoses = vaccinationStatus.total_required_doses || 0;
      const status = vaccinationStatus.status || "unvaccinated";
      const isConditional = vaccinationStatus.is_conditional || false;
      const hasDoseRequirement = vaccinationStatus.has_dose_requirement || false;

      // Construct address string from per_addresses array
      const addressString = addresses.length > 0 && addresses[0] ? [addresses[0].add_street, addresses[0].add_barangay, addresses[0].add_city, addresses[0].add_province].filter((part) => part && part.trim().length > 0).join(", ") || "No address provided" : "No address provided";

      // Get sitio from address
      const sitio = addresses.length > 0 && addresses[0] ? addresses[0].sitio || "N/A" : "N/A";

      // Use per_age from the response or calculate from per_dob
      let age = info.per_age || 0;
      if (!age && info.per_dob) {
        const birthDate = new Date(info.per_dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      // Format name
      const nameParts = [];
      if (info.per_lname) nameParts.push(info.per_lname);
      if (info.per_fname) nameParts.push(info.per_fname);
      if (info.per_mname) nameParts.push(info.per_mname);
      const name = nameParts.join(", ");

      // For conditional vaccines with unvaccinated status, always show 0/? and messages
      const isUnvaccinatedConditional = isConditional && status === "unvaccinated";

      return {
        rp_id: resident.rp_id || "",
        pat_id: resident.pat_id || null,
        status: resident.status || "",
        vaccination_status: status,
        name: name,
        age: age,
        sex: info.per_sex || "",
        address: addressString,
        sitio: sitio,
        contact: info.per_contact || "N/A",
        birth_date: info.per_dob || "",
        completed_doses: completedDoses,
        total_doses: totalDoses,
        dose_progress: isUnvaccinatedConditional 
          ? "0/?"  // Always show 0/? for unvaccinated in conditional vaccines
          : hasDoseRequirement 
            ? `${completedDoses}/${totalDoses}` 
            : `${completedDoses}/?`,
        is_conditional: isConditional,
        has_dose_requirement: hasDoseRequirement
      };
    });
  }, [residentsResponse]);

  const totalCount = residentsResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const formattedData = formatResidentData();

  // Debug: Log the current filter and query params
  React.useEffect(() => {
    console.log('Current filter:', selectedVaccinationStatus);
    console.log('Query params sent to API:', queryParams);
    console.log('Total residents:', totalCount);
    console.log('Filtered data count:', formattedData.length);
  }, [selectedVaccinationStatus, queryParams, totalCount, formattedData.length]);

  // Export functionality
  const prepareExportData = () => {
    return formattedData.map((record) => ({
      "Full Name": record.name,
      Age: record.age,
      Sex: record.sex,
      "Vaccination Status": getStatusLabel(record.vaccination_status),
      "Dose Progress": record.dose_progress,
      "Total Required Doses": record.total_doses,
      Address: record.address,
      Sitio: record.sitio,
      "Birth Date": record.birth_date,
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    const fileName = `resident_vaccination_list_${new Date().toISOString().slice(0, 10)}`;
    exportToCSV(dataToExport, fileName);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    const fileName = `resident_vaccination_list_${new Date().toISOString().slice(0, 10)}`;
    exportToExcel(dataToExport, fileName);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    const fileName = `resident_vaccination_list_${new Date().toISOString().slice(0, 10)}`;
    exportToPDF2(dataToExport, fileName, "Resident Vaccination List");
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "unvaccinated":
        return "bg-red-100 text-red-800 border border-red-200";
      case "partially_vaccinated":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "fully_vaccinated":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "unvaccinated":
        return "Unvaccinated";
      case "partially_vaccinated":
        return "Partially Vaccinated";
      case "fully_vaccinated":
        return "Fully Vaccinated";
      default:
        return "Unknown";
    }
  };

  const getDisplayLabel = (status: VaccinationStatus) => {
    const option = VACCINATION_STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.label : "All Statuses";
  };

  const columns: ColumnDef<ResidentData>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-600">ID: {row.original.rp_id}</div>
            <div className="flex items-center gap-2 mt-1 justify-center">
              <span className="font-medium text-gray-900">{row.original.age} years</span>,<span className="text-xs text-gray-500 capitalize">({row.original.sex.toLowerCase() === "female" ? "F" : "M"})</span>
            </div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer hover:bg-gray-50 py-2 rounded" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[250px] max-w-[350px] px-3 py-2">
          <div className="w-full">
            <div className="text-sm text-gray-900 break-words whitespace-normal leading-tight">{row.original.address}</div>
            {row.original.sitio && row.original.sitio !== "N/A" && <div className="text-xs text-blue-600 font-medium mt-1">Sitio: {row.original.sitio}</div>}
          </div>
        </div>
      )
    },
    {
      accessorKey: "dose_progress",
      header: "Vaccine Progress",
      cell: ({ row }) => {
        const isUnvaccinatedConditional = row.original.is_conditional && row.original.vaccination_status === "unvaccinated";
        
        return (
          <div className="flex justify-center min-w-[120px] px-3 py-2">
            <div className="text-center w-full">
              <div className="font-medium text-sm text-gray-900 mb-1">
                {row.original.dose_progress}
              </div>
              
              {/* Always show these messages for unvaccinated in conditional vaccines */}
              {isUnvaccinatedConditional && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="italic">No dose requirement set</div>
                </div>
              )}
              
              {/* Show message for unvaccinated in non-conditional vaccines */}
              {!row.original.is_conditional && row.original.vaccination_status === "unvaccinated" && (
                <div className="text-xs text-gray-500 italic">No doses required</div>
              )}

              {/* Progress bar - only show if has dose requirement AND not unvaccinated conditional */}
              {row.original.has_dose_requirement && !isUnvaccinatedConditional ? (
                <>
                  <div className="w-full max-w-[150px] bg-gray-200 rounded-full h-2.5 mt-2 mx-auto">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        row.original.completed_doses >= row.original.total_doses 
                          ? "bg-green-500" 
                          : row.original.completed_doses > 0 
                            ? "bg-yellow-500" 
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max((row.original.completed_doses / Math.max(row.original.total_doses, 1)) * 100, 5),
                          100
                        )}%`
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {row.original.completed_doses === 0 
                      ? "No doses" 
                      : row.original.completed_doses < row.original.total_doses 
                        ? `${row.original.total_doses - row.original.completed_doses} dose(s) needed` 
                        : "Complete"
                    }
                  </div>
                </>
              ) : (
                !row.original.is_conditional && !isUnvaccinatedConditional && (
                  <div className="text-xs text-gray-400 italic mt-2">No doses required</div>
                )
              )}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "vaccination_status",
      header: "Vaccination Status",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center min-w-[160px] px-3 py-2">
            <div className="text-center w-full">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getStatusBadgeColor(row.original.vaccination_status)}`}>
                {getStatusLabel(row.original.vaccination_status)}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[130px] px-2 py-2">
          <div className="text-center w-full">
            <div className="text-sm text-gray-900">{row.original.contact && row.original.contact !== "N/A" ? row.original.contact : "No contact"}</div>
          </div>
        </div>
      )
    }
  ];

  const getPageTitle = () => {
    const vaccineName = finalTitle || "Unknown Vaccine";
    return `${vaccineName}`;
  };

  return (
    <LayoutWithBack title={getPageTitle()} description="Detailed list of residents and their vaccination statuses" >
      <div className="w-full h-full flex flex-col">
        {/* Enhanced Summary Cards - All Three Statuses */}
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <EnhancedCardLayout
              title="Total Residents"
              description="All residents in this vaccine group"
              value={vaccinationStats.total}
              valueDescription="Total residents"
              icon={<Users className="h-5 w-5 text-blue-500" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <EnhancedCardLayout
              title="Fully Vaccinated"
              description="Residents who completed all required doses"
              value={vaccinationStats.fully_vaccinated}
              valueDescription="Completed vaccination"
              icon={<UserCheck className="h-5 w-5 text-green-500" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <EnhancedCardLayout
              title="Partially Vaccinated"
              description="Residents with some but not all doses"
              value={vaccinationStats.partially_vaccinated}
              valueDescription="Incomplete vaccination"
              icon={<ArrowUpDown className="h-5 w-5 text-yellow-500" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />

            <EnhancedCardLayout
              title="Unvaccinated"
              description="Residents who haven't received any dose"
              value={vaccinationStats.unvaccinated}
              valueDescription="Need vaccination"
              icon={<UserX className="h-5 w-5 text-red-500" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
            </div>
        </div>

        {/* Conditional Vaccine Info Banner */}
        {isConditionalVaccine && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Conditional Vaccine</h3>
                <p className="text-sm text-blue-700">Each resident has individual dose requirements based on their medical condition and vaccination record.</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Controls Section */}
        <div className="w-full flex flex-col sm:flex-row gap-2 py-4 px-4 border bg-white no-print">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
              <Input
                placeholder="Search by name, ID, address, contact, or status..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            {/* Vaccination Status Filter */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <Select value={selectedVaccinationStatus} onValueChange={handleVaccinationStatusChange}>
                
                <SelectTrigger className="w-full bg-white">
                <Filter className="text-gray-500" size={17} />

                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {VACCINATION_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page size selector */}
        <div className="w-full h-auto sm:h-16 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0 no-print">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" value={pageSize} onChange={(e) => handlePageSizeChange(parseInt(e.target.value) || 10)} min="1" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          
          {/* Filter status display */}
          <div className="text-xs sm:text-sm text-gray-600">
            {selectedVaccinationStatus === "all" ? (
              "Showing all residents"
            ) : (
              <span>
                Filtered by: <span className="font-medium">{getDisplayLabel(selectedVaccinationStatus)}</span>
                {formattedData.length > 0 && (
                  <span> ({formattedData.length} resident{formattedData.length !== 1 ? 's' : ''})</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <TableLoading/>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden border border-gray-200 rounded-lg">
            <div className="bg-white w-full overflow-auto flex-1">
              {formattedData.length > 0 ? (
                <DataTable columns={columns} data={formattedData} />
              ) : (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                  <div className="text-lg font-medium mb-2">
                    {searchQuery.trim() || selectedVaccinationStatus !== "all" 
                      ? "No matching residents found" 
                      : "No residents found"
                    }
                  </div>
                  {(searchQuery.trim() || selectedVaccinationStatus !== "all") && (
                    <div className="text-sm text-gray-400">
                      Try adjusting your search terms or filter settings
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 no-print">
                <p className="text-sm font-normal text-gray-700">
                  Showing {formattedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} resident{totalCount !== 1 ? "s" : ""}
                  {selectedVaccinationStatus !== "all" && (
                    <span className="text-gray-500"> (Filtered)</span>
                  )}
                </p>

                {totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutWithBack>
  );
}