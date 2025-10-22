// components/medicine-request-pending-table.tsx
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, FileInput } from "lucide-react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState, useEffect } from "react";
import { medicineRequestPendingColumns } from "./columns";
import { usePendingMedRequest } from "../queries/fetch";
import TableLoading from "@/pages/healthServices/table-loading";

export default function PendingConfirmation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data: apiResponse, isLoading, error, refetch } = usePendingMedRequest(currentPage, pageSize, debouncedSearch, dateFilter);

  // Extract data from paginated response
  const medicineRequests = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-lg mb-4">Failed to load pending medicine requests</div>
        <div className="flex gap-4">
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search by ID, name, contact, or patient ID..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <SelectLayout
            placeholder="Filter by date"
            label=""
            className="bg-white w-full sm:w-48"
            options={[
              { id: "all", name: "All Dates" },
              { id: "today", name: "Today" },
              { id: "this-week", name: "This Week" },
              { id: "this-month", name: "This Month" }
            ]}
            value={dateFilter}
            onChange={(value) => {
              setDateFilter(value);
              setCurrentPage(1); // Reset to first page when date filter changes
            }}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto" asChild>
            <Link to="/services/medicine/form">New Request</Link>
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
                const value = Math.max(1, +e.target.value);
                setPageSize(value);
                setCurrentPage(1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div className="flex justify-end sm:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Export data" className="flex items-center gap-2" disabled={medicineRequests.length === 0}>
                  <FileInput size={16} />
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
          {isLoading ? (
           <TableLoading/>
          ) : medicineRequests.length === 0 ? (
            <div className="w-full h-[100px] flex items-center justify-center text-gray-500">
              <span className="ml-2">{debouncedSearch || dateFilter !== "all" ? "No requests found matching your criteria" : "No pending medicine requests found"}</span>
            </div>
          ) : (
            <DataTable columns={medicineRequestPendingColumns} data={medicineRequests} />
          )}
        </div>

        {medicineRequests.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
            </p>

            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
