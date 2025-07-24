// src/components/unvaccinated-residents/UnvaccinatedResidents.tsx
import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, FileInput } from "lucide-react";
import { calculateAge } from "@/helpers/ageCalculator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { unvaccinatedColumns } from "./columns/unvac-col";
import { useUnvaccinatedResidents } from "../restful-api/fetch";
import { Resident, UnvaccinatedResident, VaccineCounts } from "./columns/types";
import { VaccineCountCards } from "@/components/ui/unvaccinated-count";


export default function UnvaccinatedResidents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: unvaccinated, isLoading } = useUnvaccinatedResidents();

  const vaccineCounts: VaccineCounts = React.useMemo(() => {
    if (!unvaccinated || typeof unvaccinated !== "object") return {};
    const counts: VaccineCounts = {};
    Object.entries(unvaccinated).forEach(([vaccine_name, residents]) => {
      if (Array.isArray(residents)) {
        counts[vaccine_name] = residents.length;
      }
    });
    return counts;
  }, [unvaccinated]);

  const formattedData: UnvaccinatedResident[] = React.useMemo(() => {
    if (!unvaccinated || typeof unvaccinated !== "object") return [];
    
    return Object.entries(unvaccinated).flatMap(([vaccine_name, residents]) =>
      Array.isArray(residents)
        ? residents.map((resident: Resident) => ({
            vaccine_name: resident.vaccine_not_received || "Unknown",
            pat_id: resident.pat_id || "N/A",
            fname: resident.personal_info?.per_fname || "N/A",
            lname: resident.personal_info?.per_lname || "N/A",
            mname: resident.personal_info?.per_mname || "N/A",
            sex: resident.personal_info?.per_sex || "N/A",
            dob: resident.personal_info?.per_dob || "N/A",
            age: resident.personal_info?.per_dob
              ? calculateAge(resident.personal_info.per_dob).toString()
              : "N/A",
            sitio: resident.personal_info?.per_addresses?.[0]?.sitio || "N/A",
            address: [
              resident.personal_info?.per_addresses?.[0]?.add_street,
              resident.personal_info?.per_addresses?.[0]?.sitio,
              resident.personal_info?.per_addresses?.[0]?.add_barangay,
              resident.personal_info?.per_addresses?.[0]?.add_city,
              resident.personal_info?.per_addresses?.[0]?.add_province,
            ]
              .filter(Boolean)
              .join(", "),
            pat_type: "Resident",
          }))
        : []
    );
  }, [unvaccinated]);

  const filteredData = React.useMemo(() => {
    return formattedData.filter((record) => {
      const searchText =
        `${record.pat_id} ${record.lname} ${record.fname} ${record.sitio} ${record.vaccine_name}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formattedData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <VaccineCountCards vaccineCounts={vaccineCounts} />

      <div className="w-full flex gap-2 mr-2 mb-4 mt-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Button className="w-full sm:w-auto">
            <Link to={`/patNewVacRecForm`}>New Record</Link>
          </Button>
        </div>
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-3 justify-start items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-[70px] h-8 flex items-center justify-center text-center"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div className="flex justify-end sm:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  aria-label="Export data"
                  className="flex items-center gap-2"
                >
                  <FileInput />
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
        <div className="bg-white w-full overflow-x-auto">
          <DataTable columns={unvaccinatedColumns} data={paginatedData} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
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