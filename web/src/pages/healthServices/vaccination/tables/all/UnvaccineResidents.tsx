"use client";

import React, { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnvaccinatedVaccinesSummary } from "../../queries/fetch";
import { PaginatedResidentListDialog } from "./ResidentListDialog";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import ViewButton from "@/components/ui/view-button"; // Import your ViewButton
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
interface VaccineAgeGroup {
  age_group_id: number | string | null;
  age_group_name: string;
  min_age?: number;
  max_age?: number;
  time_unit?: string;
  unvaccinated_count: number;
  total_residents_count: number;
}

interface VaccineSummary {
  vac_id: number;
  vac_name: string;
  vac_description?: string;
  total_unvaccinated: number;
  age_groups: VaccineAgeGroup[];
  total_residents_count?: number;
}

interface PaginatedResponse {
  success: boolean;
  results: VaccineSummary[];
  count: number;
  next: string | null;
  previous: string | null;
  total_residents_count?: number;
}

// Reusable component for Age Group View Buttons
const AgeGroupViewButtons = ({ 
  vaccine, 
  onOpenDialog 
}: { 
  vaccine: VaccineSummary;
  onOpenDialog: (vaccineId: number, vaccineName: string, ageGroupId: number | string | null, ageGroupName: string) => void;
}) => {
  const hasUnvaccinated = vaccine.age_groups.some(ageGroup => ageGroup.unvaccinated_count > 0);
  
  if (!hasUnvaccinated) {
    return <div className="text-sm text-gray-500 italic">No actions available</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {vaccine.age_groups
        .filter(ageGroup => ageGroup.unvaccinated_count > 0)
        .map((ageGroup) => {
          const ageRange = ageGroup.min_age !== undefined && ageGroup.max_age !== undefined 
            ? `${ageGroup.min_age}-${ageGroup.max_age} ${ageGroup.time_unit === "NA" ? "" : ageGroup.time_unit}`
            : "";
            
          return (
            <ViewButton
              key={ageGroup.age_group_id}
              onClick={() => onOpenDialog(
                vaccine.vac_id, 
                vaccine.vac_name, 
                ageGroup.age_group_id, 
                `${ageGroup.age_group_name} ${ageRange && `(${ageRange})`}`
              )}
           
            />
          );
        })}
    </div>
  );
};

export default function UnvaccinatedResidents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: searchQuery.trim()
    }),
    [currentPage, pageSize, searchQuery]
  );

  const { data: vaccinesSummaryResponse, isLoading, isError } = useUnvaccinatedVaccinesSummary(queryParams);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentVaccineId, setCurrentVaccineId] = useState<number | null>(null);
  const [currentAgeGroupId, setCurrentAgeGroupId] = useState<number | string | null>(null);
  const [currentDialogTitle, setCurrentDialogTitle] = useState("");

  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize >= 1 ? newPageSize : 1);
    setCurrentPage(1);
  };

  const handleOpenDialog = (vaccineId: number, vaccineName: string, ageGroupId: number | string | null, ageGroupName: string) => {
    setCurrentVaccineId(vaccineId);
    setCurrentAgeGroupId(ageGroupId);
    setCurrentDialogTitle(`${vaccineName} - ${ageGroupName}`);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentVaccineId(null);
    setCurrentAgeGroupId(null);
    setCurrentDialogTitle("");
  };

  // Type-safe data extraction
  const response = vaccinesSummaryResponse as PaginatedResponse;
  const vaccines = response?.success ? response.results : [];
  const totalCount = response?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const totalResidentsCount = response?.total_residents_count || 0;
  // Define table columns
  const unvaccinatedColumns: ColumnDef<VaccineSummary>[] = [
    {
      accessorKey: "vac_name",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Vaccine Name <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[200px] px-2">
          <div className="flex flex-col items-center w-full">
            <div className="font-medium">{row.original.vac_name}</div>
            {row.original.vac_description && (
              <div className="text-sm text-gray-600">{row.original.vac_description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: "total_unvaccinated",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total Unvaccinated <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className={`text-center w-full font-medium ${row.original.total_unvaccinated > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
            {row.original.total_unvaccinated}
          </div>
        </div>
      )
    },
    {
      id: "age_groups",
      header: "Age Groups (Resident Count)",
      cell: ({ row }) => {
        const hasUnvaccinated = row.original.age_groups.some(ageGroup => ageGroup.unvaccinated_count > 0);
        
        return (
          <div className="flex flex-col items-center gap-2 min-w-[300px]">
            {row.original.age_groups.length === 0 ? (
              <div className="text-sm text-gray-500 italic">No age groups defined</div>
            ) : (
              row.original.age_groups.map((ageGroup) => {
                const ageRange = ageGroup.min_age !== undefined && ageGroup.max_age !== undefined 
                  ? `${ageGroup.min_age}-${ageGroup.max_age} ${ageGroup.time_unit === "NA" ? "" : ageGroup.time_unit}`
                  : "";
                
                return (
                  <div key={ageGroup.age_group_id} className="flex justify-between items-center text-sm w-full">
                    <span className="font-medium text-darkBlue1 text-center">
                      {ageGroup.age_group_name} {ageRange && `(${ageRange})`}
                    </span>
                    <span className={ageGroup.unvaccinated_count > 0 ? "text-gray-600" : "text-gray-400"}>
                      {ageGroup.unvaccinated_count} / {ageGroup.total_residents_count} Residents
                    </span>
                  </div>
                );
              })
            )}
            
            {!hasUnvaccinated && row.original.age_groups.length > 0 && (
              <div className="text-sm text-gray-500 italic mt-2">No unvaccinated residents in any age group</div>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <AgeGroupViewButtons 
            vaccine={row.original} 
            onOpenDialog={handleOpenDialog} 
          />
        </div>
      )
    }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Total Residents Card */}
    <div className="full">
      <div className="w-[400px]">
      <EnhancedCardLayout
              title="Total Residents"
              description="All vaccination records"
              value={totalResidentsCount}
              valueDescription="Total vaccinated"
              icon={<Users2 className="h-5 w-5 text-muted-foreground" />}
              cardClassName="border shadow-sm rounded-lg"
              headerClassName="pb-2"
              contentClassName="pt-0"
            />
      </div>
    </div>

      <div className="w-full flex gap-2 mr-2  mt-4 border p-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search vaccine name or description..." 
              className="pl-10 bg-white w-full" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>
        <div>
          <Button className="w-full sm:w-auto">
            <Link to="/services/vaccination/form" state={{ mode: "newvaccination_record" }}>
              New Record
            </Link>
          </Button>
        </div>
      </div>

      {/* Page size selector */}
      <div className="w-full flex items-center justify-between p-4 border  bg-gray-50">
        <div className="flex gap-x-3 justify-start items-center">
          <p className="text-xs sm:text-sm">Show</p>
          <Input 
            type="number" 
            className="w-[70px] h-8 flex items-center justify-center text-center" 
            value={pageSize} 
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value) || 10)} 
            min="1" 
          />
          <p className="text-xs sm:text-sm">Vaccines per page</p>
        </div>

        {response?.success && <div className="text-sm text-gray-600">Total: {totalCount} vaccines</div>}
      </div>

      <div >
        {isLoading ? (
          <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : isError ? (
          <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
            <span>Error loading data. Please try again.</span>
          </div>
        ) : (
          <DataTable columns={unvaccinatedColumns} data={vaccines} />
        )}
      </div>
      
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 ">
                   <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                   Showing {vaccines.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} vaccines
                   </p>
                   <div className="w-full sm:w-auto flex justify-center">
                     <PaginationLayout 
                       currentPage={currentPage} 
                       totalPages={totalPages} 
                       onPageChange={setCurrentPage} 
                     />
                   </div>
                 </div>
      

      {currentVaccineId && (
        <PaginatedResidentListDialog 
          isOpen={dialogOpen} 
          onClose={handleCloseDialog} 
          title={currentDialogTitle} 
          vaccineId={currentVaccineId} 
          ageGroupId={currentAgeGroupId} 
        />
      )}
    </div>
  );
}