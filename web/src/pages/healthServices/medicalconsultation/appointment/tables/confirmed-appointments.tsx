import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Search, FileInput, Loader2, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState, useEffect } from "react";
import { medicalAppointmentConfirmedColumns } from "../columns/confirmed-appointments";
import { useAppointments } from "../../queries/fetch";

export default function ConfirmedMedicalAppointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [meridiemFilter, setMeridiemFilter] = useState<"all" | "AM" | "PM">("all");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useAppointments(
    currentPage,                                      // page?
    pageSize,                                         // pageSize?
    debouncedSearch,                                  // search?
    dateFilter,                                       // dateFilter?
    ["confirmed"],                                    // statuses? -> only confirmed
    meridiemFilter === "all" ? undefined : [meridiemFilter], // meridiems? optional
    true                                              // enabled?
  );

  // Extract data from paginated response
  const appointments = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Calculate stats
  const todayCount = appointments.filter((apt: any) => {
    const today = new Date().toDateString();
    return new Date(apt.created_at).toDateString() === today;
  }).length;

  const thisWeekCount = appointments.filter((apt: any) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    return new Date(apt.created_at) >= startOfWeek;
  }).length;

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-lg mb-4">Failed to load confirmed appointments</div>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters Section */}
      <div className="w-full flex flex-col sm:flex-row gap-3 mb-6">
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input 
              placeholder="Search by patient name, contact, appointment ID, or chief complaint..." 
              className="pl-10 bg-white w-full" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
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
              { id: "this-month", name: "This Month" },
            ]}
            value={dateFilter}
            onChange={(value) => {
              setDateFilter(value);
              setCurrentPage(1);
            }}
          />

          {/* Meridiem Filter */}
          <SelectLayout
            placeholder="Meridiem"
            label=""
            className="bg-white w-full sm:w-40"
            options={[
              { id: "all", name: "All" },
              { id: "AM", name: "AM" },
              { id: "PM", name: "PM" }
            ]}
            value={meridiemFilter}
            onChange={(value) => {
              setMeridiemFilter(value as "all" | "AM" | "PM");
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{thisWeekCount}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
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
              <span className="text-gray-600">Loading confirmed appointments...</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="w-full h-32 flex flex-col items-center justify-center text-gray-500">
              <Calendar className="h-12 w-12 mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-1">No confirmed appointments found</p>
              <p className="text-sm">
                {debouncedSearch || dateFilter !== "all" || meridiemFilter !== "all"
                  ? "No confirmed appointments match your search criteria"
                  : "No confirmed appointments at the moment"}
              </p>
            </div>
          ) : (
            <DataTable 
              columns={medicalAppointmentConfirmedColumns} 
              data={appointments} 
            />
          )}
        </div>

        {/* Pagination */}
        {appointments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-4 gap-3 bg-white border-t">
            <p className="text-sm text-gray-600 px-4">
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{" "}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
            </p>

            <div className="w-full sm:w-auto flex justify-center px-4">
              <PaginationLayout 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}