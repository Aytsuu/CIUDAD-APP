import React from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Plus, ClockArrowUp, FileInput, Search } from "lucide-react";
import { Link } from "react-router";
import { DataTable } from "@/components/ui/table/data-table";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { residentColumns } from "./ResidentColumns";
import { ResidentRecord } from "../../profilingTypes";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { Skeleton } from "@/components/ui/skeleton";
import { useResidentsTableHealth } from "../queries/profilingFetchQueries";
import { useDebounce } from "@/hooks/use-debounce";

export default function ResidentRecords() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // Use debounced search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: residentsTableData, isLoading: isLoadingResidents } = useResidentsTableHealth(
    currentPage,
    pageSize,
    debouncedSearchQuery
  );

  const residents = residentsTableData?.results || [];
  const totalCount = residentsTableData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // The backend ResidentProfileTableSerializer already returns the correct structure
  // with registered_by field properly formatted, so we can use the data directly
  const formatResidentData = React.useCallback((): ResidentRecord[] => {
    if (!residents) return [];

    return residents.map((resident: any) => ({
      id: resident.rp_id || "",
      householdNo: resident.household_no || "",
      sitio: "", // This might need to be added to the backend serializer if needed
      familyNo: resident.family_no || "",
      lname: resident.lname || "",
      fname: resident.fname || "",
      mname: resident.mname || "-",
      suffix: "", // This might need to be added to the backend serializer if needed  
      dateRegistered: resident.rp_date_registered || "",
      registeredBy: resident.registered_by || "-" // Use the backend formatted value directly
    }));
  }, [residents]);

  // Use the formatted data directly - no need for client-side filtering since backend handles it
  const formattedResidents = formatResidentData();

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
          <Link to="/resident/pending">
            <Button variant="outline">
              <ClockArrowUp /> Pending
            </Button>
          </Link>
          <Link
            to="/resident/form"
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
            data={formattedResidents}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, totalCount)} of{" "}
            {totalCount} rows
          </p>
          {formattedResidents?.length > 0 && (
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
