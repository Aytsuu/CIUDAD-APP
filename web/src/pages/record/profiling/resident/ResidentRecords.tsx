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
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { useResidentsTable } from "../queries/profilingFetchQueries";
import { useDebounce } from "@/hooks/use-debounce";

export default function ResidentRecords() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 100);
  const debouncedPageSize = useDebounce(pageSize, 100);
  const {data: residentsTableData, isLoading } = useResidentsTable(
    currentPage, 
    debouncedPageSize,
    debouncedSearchQuery
  );
  
  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const residents = residentsTableData?.results || [];
  const totalCount = residentsTableData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

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
                origin: 'create',
                title: "Resident Registration",
                Description: "Provide the necessary details, and complete the registration."
              }
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
        <DataTable
          columns={residentColumns}
          data={residents}
          isLoading={isLoading}
        />
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, totalCount)} of{" "}
            {totalCount} rows
          </p>
          {totalPages > 0 && (
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
