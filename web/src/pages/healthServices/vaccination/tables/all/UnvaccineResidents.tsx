"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnvaccinatedVaccinesSummary } from "../../queries/fetch";
import { Loader2 } from "lucide-react";
import { PaginatedResidentListDialog } from "./ResidentListDialog";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

interface VaccineAgeGroup {
  age_group_id: number | string | null;
  age_group_name: string;
  min_age?: number;
  max_age?: number;
  time_unit?: string;
  unvaccinated_count: number;
}

interface VaccineSummary {
  vac_id: number;
  vac_name: string;
  vac_description?: string;
  total_unvaccinated: number;
  age_groups: VaccineAgeGroup[];
}

interface PaginatedResponse {
  success: boolean;
  results: VaccineSummary[];
  count: number;
  next: string | null;
  previous: string | null;
}

export default function UnvaccinatedResidents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const queryParams = React.useMemo(
    () => ({
      page: currentPage,
      page_size: pageSize,
      search: searchQuery.trim()
    }),
    [currentPage, pageSize, searchQuery]
  );

  const { data: vaccinesSummaryResponse, isLoading } = useUnvaccinatedVaccinesSummary(queryParams);

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

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex gap-2 mr-2 mb-4 mt-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search vaccine name or description..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div>
          <Button className="w-full sm:w-auto">
            <Link to="/patNewVacRecF3/vaccination-record-form" state={{ mode: "newvaccination_record" }}>
              New Record
            </Link>
          </Button>
        </div>
      </div>

      {/* Page size selector */}
      <div className="w-full bg-white flex items-center justify-between p-4 border rounded-lg mb-4">
        <div className="flex gap-x-3 justify-start items-center">
          <p className="text-xs sm:text-sm">Show</p>
          <Input type="number" className="w-[70px] h-8 flex items-center justify-center text-center" value={pageSize} onChange={(e) => handlePageSizeChange(parseInt(e.target.value) || 10)} min="1" />
          <p className="text-xs sm:text-sm">Vaccines per page</p>
        </div>

        {response?.success && <div className="text-sm text-gray-600">Total: {totalCount} vaccines</div>}
      </div>

      {isLoading ? (
        <div className="w-full h-[100px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccines.map((vaccine: VaccineSummary) => {
              const hasUnvaccinatedResidents = vaccine.total_unvaccinated > 0;

              return (
                <div key={vaccine.vac_id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="mb-2">
                    <h3 className="text-xl font-semibold text-darkBlue2 mb-1">{vaccine.vac_name}</h3>
                    {vaccine.vac_description && <p className="text-sm text-gray-600 mb-2">{vaccine.vac_description}</p>}
                    <p className="text-sm font-medium text-blue-600">Total Unvaccinated: {vaccine.total_unvaccinated}</p>
                  </div>

                  {!hasUnvaccinatedResidents ? (
                    <div className="text-center text-gray-500 py-4">No unvaccinated residents found</div>
                  ) : (
                    <div className="space-y-3">
                      {vaccine.age_groups.map((ageGroup: VaccineAgeGroup) => {
                        if (ageGroup.unvaccinated_count === 0) return null;

                        const ageRange = ageGroup.min_age !== undefined && ageGroup.max_age !== undefined ? `${ageGroup.min_age}-${ageGroup.max_age} ${ageGroup.time_unit === "NA" ? "" : ageGroup.time_unit}` : "";

                        return (
                          <div key={`${vaccine.vac_id}-${ageGroup.age_group_id}`}>
                            <Button variant="outline" className="w-full justify-between p-4 h-auto text-left flex items-center bg-gray-50 hover:bg-gray-100" onClick={() => handleOpenDialog(vaccine.vac_id, vaccine.vac_name, ageGroup.age_group_id, ageGroup.age_group_name)}>
                              <span className="font-medium text-darkBlue1">
                                {ageGroup.age_group_name} {ageRange ? `(${ageRange})` : ""}
                              </span>
                              <span className="text-sm text-gray-600">{ageGroup.unvaccinated_count} Residents</span>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {vaccines.length === 0 && !isLoading && <div className="text-center text-gray-500 py-10">{searchQuery.trim() ? "No matching vaccines found" : "No vaccine data available"}</div>}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex justify-center items-center mt-6 p-4">
              <div className="flex items-center gap-4">
                <p className="text-xs sm:text-sm font-normal text-gray-500">
                  Showing {vaccines.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} vaccines
                </p>

                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          )}

          {currentVaccineId && <PaginatedResidentListDialog isOpen={dialogOpen} onClose={handleCloseDialog} title={currentDialogTitle} vaccineId={currentVaccineId} ageGroupId={currentAgeGroupId} />}
        </>
      )}
    </div>
  );
}
