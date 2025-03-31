import React from "react";
import { Search, Plus, FileInput } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { familyColumns } from "./FamilyColumns";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import FamilyProfileOptions from "./FamilyProfileOptions";
import { useQuery } from "@tanstack/react-query";
import { FamilyRecord } from "../profilingTypes";
import {
  getFamilies,
  getHouseholds,
  getResidents,
} from "../restful-api/profilingGetAPI";
import { Skeleton } from "@/components/ui/skeleton";

export default function FamilyRecords() {
  // Initialize states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch families and residents using useQuery
  const { data: families, isLoading: isLoadingFamilies } = useQuery({
    queryKey: ["families"],
    queryFn: getFamilies,
    refetchOnMount: true,
    staleTime: 0,
  });

  const { data: residents, isLoading: isLoadingResidents } = useQuery({
    queryKey: ["residents"],
    queryFn: getResidents,
    refetchOnMount: true,
    staleTime: 0,
  });

  const { data: households, isLoading: isLoadingHouseholds } = useQuery({
    queryKey: ["households"],
    queryFn: getHouseholds,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Format family to populate data table
  const formatFamilyData = (): FamilyRecord[] => {
    if (!families) return [];

    return families.map((family: any) => {
      const mother = family.mother;
      const father = family.father;
      const dependents = family.dependents;

      const totalMembers =
        (mother ? 1 : 0) + (father ? 1 : 0) + dependents.length;

      return {
        id: family.fam_id || "-",
        noOfMembers: totalMembers || 1,
        building: family.fam_building || "-",
        indigenous: family.fam_indigenous || "-",
        dateRegistered: family.fam_date_registered || "-",
        registeredBy: family.staff || "-",
      };
    });
  };

  const filteredFamilies = React.useMemo(() => {
    let filtered = formatFamilyData();

    filtered = filtered.filter((record: any) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    return filtered;
  }, [searchQuery, families]);

  const totalPages = Math.ceil(filteredFamilies.length / pageSize);

  const paginatedFamilies = filteredFamilies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoadingFamilies || isLoadingResidents || isLoadingHouseholds) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-darkBlue2">
          Family Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view family information
        </p>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="hidden lg:flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* DialogLayout with state management */}
        <DialogLayout
          trigger={
            <Button>
              <Plus /> Register
            </Button>
          }
          mainContent={
            <FamilyProfileOptions
              residents={residents}
              households={households}
            />
          }
        />
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                if (value >= 1) {
                  setPageSize(value);
                } else {
                  setPageSize(1); // Reset to 1 if invalid
                }
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline">
                <FileInput className="mr-2" /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <DataTable
            columns={familyColumns(families)}
            data={paginatedFamilies}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredFamilies.length)} of{" "}
            {filteredFamilies.length} rows
          </p>
          {filteredFamilies.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
