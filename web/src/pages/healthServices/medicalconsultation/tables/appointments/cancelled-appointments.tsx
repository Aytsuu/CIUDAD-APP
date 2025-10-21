import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, FileInput, Loader2, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState, useEffect } from "react";
import { medicalAppointmentRefferedColumns } from "../columns/referred-appointment";
import { useAppointments } from "../../queries/fetch";

export default function CancelledMedicalAppointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: apiResponse, isLoading } = useAppointments(currentPage, pageSize, debouncedSearch, undefined, ["cancelled"], undefined, true);

  // Extract data from paginated response
  const appointments = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      {/* Filters Section (no date/meridiem filters) */}
      <div className="w-full flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input placeholder="Search by patient name, contact, appointment ID, or chief complaint..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Referred</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="h-full w-full rounded-md border border-gray-200">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3 sm:gap-0 border-b">
          <div className="flex gap-3 items-center">
            <p className="text-sm text-gray-700">Show</p>
            <Input
              type="number"
              className="w-20 h-8 text-center"
              value={pageSize}
              onChange={(e) => {
                const value = Math.max(1, +e.target.value);
                setPageSize(value);
                setCurrentPage(1);
              }}
              min="1"
            />
            <p className="text-sm text-gray-700">entries</p>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={appointments.length === 0}>
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

        {/* Table Content */}
        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <div className="w-full h-32 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-gray-600">Loading referred appointments...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="w-full h-32 flex flex-col items-center justify-center text-gray-500">
              <Calendar className="h-12 w-12 mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-1">No referred appointments found</p>
              <p className="text-sm">{debouncedSearch ? "No referred appointments match your search criteria" : "No referred appointments at the moment"}</p>
            </div>
          ) : (
            <DataTable columns={medicalAppointmentRefferedColumns} data={appointments} />
          )}
        </div>

        {/* Pagination */}
        {appointments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-4 gap-3 bg-white border-t">
            <p className="text-sm text-gray-600 px-4">
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </p>

            <div className="w-full sm:w-auto flex justify-center px-4">
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
