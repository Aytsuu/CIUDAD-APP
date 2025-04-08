import React from "react";
import { Search, Plus, FileInput } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { householdColumns } from "./HouseholdColumns";
import { HouseholdRecord } from "../profilingTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { Link } from "react-router";
import { useHouseholds, useRequests, useSitio } from "../queries/profilingFetchQueries";

export default function HouseholdRecords() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const { data: households, isLoading: isLoadingHouseholds } = useHouseholds();
  const { data: sitio, isLoading: isLoadingSitio } = useSitio();
  const { data: residents, isLoading: isLoadingResidents } = useRequests();

  // Format households to populate data table
  const formatHouseholdData = React.useCallback((): HouseholdRecord[] => {
    if (!households) return [];

    return households.map((house: any) => {
      const sitio = house.sitio;
      const personal = house.rp?.per;
      const staff = house.staff?.rp?.per;

      return {
        id: house.hh_id || "-",
        streetAddress: house.hh_street || "-",
        sitio: sitio?.sitio_name || "-",
        nhts: house.hh_nhts || "-",
        headNo: house.rp.rp_id,
        head:
          (`${personal.per_lname},
           ${personal.per_fname} 
           ${personal.per_mname ? 
            personal.per_mname?.slice(0, 1) + '.' : ''
          }` || "-"),
        dateRegistered: house.hh_date_registered || "-",
        registeredBy: 
          (staff ? `${staff.per_lname}, 
          ${staff.per_fname} 
          ${staff.per_mname ? staff.per_mname.slice(0,1) + '.' : ''}` : '-')
      };
    });
  }, [households]);

  const filteredHouseholds = React.useMemo(() => {
    let formattedData = formatHouseholdData();

    return formattedData.filter((record: any) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  }, [searchQuery, households]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredHouseholds.length / pageSize);

  // Slice the data for the current page
  const paginatedHouseholds = filteredHouseholds.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (
    isLoadingHouseholds ||
    isLoadingSitio ||
    isLoadingResidents
  ) {
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
      title="Household Profiling"
      description="View and manage household records"
    >
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
        <Link
          to="/household/form"
          state={{
            params: {
              sitio: sitio,
              residents: residents,
              households: households,
            },
          }}
        >
          <Button>
            <Plus size={15} /> Register
          </Button>
        </Link>
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
            columns={householdColumns(households)}
            data={paginatedHouseholds}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredHouseholds.length)} of{" "}
            {filteredHouseholds.length} rows
          </p>
          {paginatedHouseholds.length > 0 && (
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
