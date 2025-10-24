import React, { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, ChevronLeft, AlertCircle, Syringe } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { IndivVaccineColumns } from "../columns/indiv_vac-col";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { Patient } from "@/pages/healthServices/restful-api-patient/type";
import { useIndivPatientVaccinationRecords, useFollowupVaccines, useUnvaccinatedVaccines, usePatientVaccinationDetails } from "../../queries/fetch";
import { VaccinationStatusCards } from "@/components/ui/vaccination-status";
import { FollowUpsCard } from "@/components/ui/ch-vac-followup";
import { VaccinationStatusCardsSkeleton } from "@/pages/healthServices/skeleton/vaccinationstatus-skeleton";
import { ProtectedComponentButton } from "@/ProtectedComponentButton";
import TableLoading from "@/pages/healthServices/table-loading";

export default function IndivVaccinationRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);

  const { data: vaccinationRecords, isLoading: isVaccinationRecordsLoading, isError: isVaccinationRecordsError } = useIndivPatientVaccinationRecords(patientData?.pat_id);

  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(patientData?.pat_id, patientData?.personal_info?.per_dob);

  const { data: followupVaccines = [], isLoading: isFollowVaccineLoading } = useFollowupVaccines(patientData?.pat_id);

  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(patientData?.pat_id);

  const isLoading = isCompleteVaccineLoading || isUnvaccinatedLoading || isFollowVaccineLoading || isVaccinationRecordsLoading;

  const vaccinationCount = vaccinationRecords?.length ?? 0;

  useEffect(() => {
    if (location.state?.params?.patientData) {
      const patientData = location.state.params.patientData;
      setSelectedPatientData(patientData);
    }
  }, [location.state]);

  // Guard clause for missing patientData
  if (!patientData?.pat_id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <Label className="text-base font-semibold text-yellow-500">No patient selected</Label>
        </div>
        <p className="text-sm text-gray-700">Please select a patient from the vaccination records page first.</p>
      </div>
    );
  }

  const filteredData = useMemo(() => {
    if (!vaccinationRecords) return [];
    return vaccinationRecords.filter((record) => {
      const searchText = `${record.vachist_id} ${record.vaccine_name} ${record.batch_number} ${record.vachist_doseNo} ${record.vachist_status}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, vaccinationRecords]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = IndivVaccineColumns(patientData);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Vaccination Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">Manage and view patient's vaccination records</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {selectedPatientData && (
        <div className="mb-4">
          <PatientInfoCard patient={selectedPatientData} />
        </div>
      )}

      {/* Vaccination Status Section */}
      <div className="mb-4w-full">
        {isLoading ? (
          <VaccinationStatusCardsSkeleton />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 mb-4">
            <div className="w-full">
              <VaccinationStatusCards unvaccinatedVaccines={unvaccinatedVaccines} vaccinations={vaccinations} />
            </div>
            <div className="w-full">
              <FollowUpsCard followupVaccines={followupVaccines} />
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg border">
        {/* Vaccination Records Section - Updated to match medical consultation design */}
        <div className="w-full lg:flex justify-between items-center px-4 gap-6 py-4 ">
          <div className="flex gap-2 items-center p-2">
            <div className="flex items-center justify-center">
              <Syringe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Records</p>
            </div>
            <p className="text-sm font-bold text-gray-900">{isVaccinationRecordsLoading ? "..." : vaccinationCount}</p>
          </div>

          <ProtectedComponentButton exclude={["DOCTOR"]}>
            <div className="flex flex-1 justify-between items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
                <Input placeholder="Search by vaccine name, batch number, or status..." className="pl-10 bg-white w-full" value={searchQuery} onChange={handleSearchChange} />
              </div>
              <div>
                <Button className="w-full sm:w-auto" disabled={isVaccinationRecordsLoading || isVaccinationRecordsError}>
                  <Link
                    to="/services/vaccination/form"
                    state={{
                      mode: "addnewvaccination_record",
                      params: { patientData },
                    }}
                  >
                    New Vaccination Record
                  </Link>
                </Button>
              </div>
            </div>
          </ProtectedComponentButton>
        </div>

        <div className="h-full w-full">
          <div className="w-full sm:h-16  flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
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
                disabled={isVaccinationRecordsLoading || isVaccinationRecordsError}
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
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

          <div className=" w-full overflow-x-auto border">
            {isVaccinationRecordsLoading ? (
              <TableLoading />
            ) : isVaccinationRecordsError ? (
              <div className="p-4 flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load vaccination records</span>
              </div>
            ) : (
              <DataTable columns={columns} data={paginatedData} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          {isVaccinationRecordsError
        ? "Error loading records"
        : `Showing ${paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to ${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length} records`}
        </p>

        <div className="w-full sm:w-auto flex justify-center">
          {!isVaccinationRecordsError && filteredData.length > 0 && (
        <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>
    </div>
  );
}
