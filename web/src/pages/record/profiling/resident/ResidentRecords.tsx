import React from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Plus, ClockArrowUp, FileInput, Search } from "lucide-react";
import { Link } from "react-router";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { exportToCSV, exportToExcel, exportToPDF } from "./ExportFunctions";
import { residentColumns } from "./ResidentColumns";
import { ResidentRecord } from "../profilingTypes";
import { useQuery } from "@tanstack/react-query";
import { getResidents } from "../restful-api/profilingGetAPI";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResidentRecords() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Fetch residents using useQuery
  const { data: residents, isLoading: isLoadingResidents } = useQuery({
    queryKey: ["residents"],
    queryFn: getResidents,
    refetchOnMount: true, // Force refetch on mount
    staleTime: 0, // Ensure data is never considered stale
  });

  // Format resident to populate data table
  const formatResidentData = React.useCallback((): ResidentRecord[] => {
    if (!residents) return [];

    return residents.map((resident: any) => {
      const personal = resident?.per;
      const [family] = resident?.family;
      const household = family?.hh;

      return {
        id: resident.rp_id || "",
        householdNo: household?.hh_id || "",
        sitio: household?.sitio.sitio_name || "",
        familyNo: family?.fam_id || "",
        lname: personal.per_lname || "",
        fname: personal.per_fname || "",
        mname: personal.per_mname || "-",
        suffix: personal.per_suffix || "-",
        dateRegistered: resident.rp_date_registered || "",
        registeredBy: resident.staff || "",
      };
    });
  }, [residents]);

  // Filter residents based on search query
  const filteredResidents = React.useMemo(() => {
    const formattedData = formatResidentData();
    if (!formattedData.length) return [];

    return formattedData.filter((record: any) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, residents]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredResidents.length / pageSize);

  // Slice the data for the current page
  const paginatedResidents = filteredResidents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (isLoadingResidents) {
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
    <MainLayoutComponent
      title="Resident Profiling"
      description="This page displays the list of residents in the community."
    >
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="relative w-full flex gap-2 mr-2">
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
        <div className="flex gap-2">
          <Link to="/registration-request">
            <Button variant="outline">
              <ClockArrowUp /> Pending
            </Button>
          </Link>
          <Link
            to="/resident-form"
            state={{
              params: {
                title: "Resident Registration",
                description:
                  "Provide the necessary details, and complete the registration.",
              },
            }}
          >
            <Button variant="default">
              <Plus size={15} /> Register
            </Button>
          </Link>
        </div>
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
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
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
            columns={residentColumns(residents)}
            data={paginatedResidents}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredResidents.length)} of{" "}
            {filteredResidents.length} rows
          </p>
          {paginatedResidents.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </MainLayoutComponent>
  );
}
