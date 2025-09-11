import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, FileInput, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState } from "react";
import { MedicineRequest } from "../types";
import { medicineRequestColumns } from "./columns";
import { useProcessingMedrequest } from "../queries.tsx/fetch";



const filterByDateRange = (data: MedicineRequest[], range: string) => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  switch (range) {
    case "today":
      return data.filter((request) => {
        if (!request.requested_at) return false;
        const requestDate = new Date(request.requested_at);
        return requestDate >= today;
      });
    case "this-week":
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      return data.filter((request) => {
        if (!request.requested_at) return false;
        const requestDate = new Date(request.requested_at);
        return requestDate >= startOfWeek;
      });
    case "this-month":
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return data.filter((request) => {
        if (!request.requested_at) return false;
        const requestDate = new Date(request.requested_at);
        return requestDate >= startOfMonth;
      });
    default:
      return data;
  }
};

export default function MedicineRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const navigate = useNavigate();

  const { data: medicineRequests = [], isLoading, error, refetch } = useProcessingMedrequest();

  const filteredData = React.useMemo(() => {
    let result = medicineRequests;

    // Apply date filter first
    if (dateFilter !== "all") {
      result = filterByDateRange(result, dateFilter);
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter((request: any) => {
        const searchText = [request.medreq_id?.toString() || "", request.personal_info?.per_lname || "", request.personal_info?.per_fname || "", request.personal_info?.per_contact || ""].join(" ").toLowerCase().trim();
        return searchText.includes(searchQuery.toLowerCase());
      });
    }

    return result;
  }, [searchQuery, medicineRequests, statusFilter, dateFilter]);

  const totalPages = Math.max(Math.ceil(filteredData.length / pageSize), 1);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = medicineRequestColumns;
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-lg mb-4">Failed to load medicine requests</div>
        <div className="flex gap-4">
          <Button onClick={() => refetch()}>Retry</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Return Home
          </Button>
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
            <Input
              placeholder="Search by ID, name, or contact..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
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
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto" asChild>
            <Link to="/medicine-request-form">New Request</Link>
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
                <Button variant="outline" aria-label="Export data" className="flex items-center gap-2" disabled={filteredData.length === 0}>
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
            <div className="w-full h-[100px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">loading....</span>
            </div>
          ) : (
            <DataTable columns={columns} data={paginatedData} />
          )}
        </div>

        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0 bg-white">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
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
