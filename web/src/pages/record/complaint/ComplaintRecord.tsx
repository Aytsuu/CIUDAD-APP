import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Plus, Search, Archive, ClipboardList, Calendar, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetComplaint } from "./complaint-hooks";
import { complaintColumns } from "./ComplaintColumn";
import { useMemo } from "react";
import { BlotterRecordSkeleton } from "./skeleton/blotter-rec-skeleton";
import type { ComplaintRecord } from "./complaint-type";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

export default function ComplaintRecord() {
  const DEFAULT_PAGE_SIZE = 10;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageSizeInput, setPageSizeInput] = useState(DEFAULT_PAGE_SIZE.toString());
  const [currentPage, setCurrentPage] = useState(1);
  const { data: complaints = [], isLoading, error } = useGetComplaint();
  const [timeFilter, setTimeFilter] = useState<string | null>(null); // New state for time filter

  const columns = useMemo(() => complaintColumns(complaints), [complaints]);

  // Filter data based on search query and time filter
  const filteredData = useMemo(() => {
    let result = complaints;
    
    // Apply time filter if selected
    if (timeFilter) {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - now.getDay()); // Start of current week
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate.setDate(1); // First day of current month
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          startDate.setMonth(0, 1); // January 1st of current year
          startDate.setHours(0, 0, 0, 0);
          break;
      }
      
      result = result.filter((complaint: ComplaintRecord) => {
        const complaintDate = new Date(complaint.comp_created_at);
        return complaintDate >= startDate;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter((complaint: ComplaintRecord) => {
        const searchFields = [
          complaint.comp_id.toString(),
          complaint.comp_incident_type,
          complaint.comp_allegation,
          complaint.cpnt.cpnt_name,
          ...(complaint.accused_persons?.map(accused => accused.acsd_name) || []),
          new Date(complaint.comp_datetime).toLocaleString(),
          complaint.cpnt.add.add_province,
          complaint.cpnt.add.add_city,
          complaint.cpnt.add.add_barangay,
          ...(complaint.accused_persons?.flatMap(accused => [
            accused.add.add_province,
            accused.add.add_city,
            accused.add.add_barangay
          ]) || [])
        ];
        
        return searchFields.some(value => 
          value && String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    
    return result;
  }, [complaints, searchQuery, timeFilter]);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset to first page when search query or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Update pageSizeInput when pageSize changes externally
  useEffect(() => {
    setPageSizeInput(pageSize.toString());
  }, [pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // Handle page size input change
  const handlePageSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageSizeInput(e.target.value);
  };

  const applyPageSize = () => {
    const newSize = parseInt(pageSizeInput, 10);
    if (!isNaN(newSize) && newSize > 0) {
      setPageSize(Math.min(newSize, 100)); // Limit to 100 max
    }
    setPageSizeInput(pageSize.toString()); // Reset to current size if invalid
  };

  if (isLoading) {
    return <BlotterRecordSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-red-500">Error loading data: {error.message}</p>
        <Button
          className="mt-4 bg-buttonBlue hover:bg-buttonBlue/90 text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Calculate the actual displayed entries range
  const entriesStart = filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const entriesEnd = Math.min(currentPage * pageSize, filteredData.length);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col justify-center mb-4">
        <h1 className="flex flex-row font-semibold text-xl sm:text-2xl text-darkBlue2 items-center">
          Complaint Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view complaint information
        </p>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Search and filters */}
      <div className="relative flex flex-row justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-72 bg-white">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Time Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar size={17} />
                Filter
                <ChevronDown size={17} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuItem onClick={() => setTimeFilter(null)}>
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('week')}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('month')}>
                This Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeFilter('year')}>
                This Year
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Complaint Button */}
          <Link to="/complaint-report">
            <Button className="text-white flex items-center p-3">
              <Plus size={17} className="" />
              Report
            </Button>
          </Link>
        </div>

        {/* Right side: Archived Button */}
        <div className="flex items-center">
          <Link to="/complaint-archive">
            <Button variant="outline" className="flex items-center">
              <Archive size={17} className="mr-1" />
              Archived
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white flex p-3">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              min="1"
              max="100"
              className="w-14 h-8"
              value={pageSizeInput}
              onChange={handlePageSizeInputChange}
              onBlur={applyPageSize}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyPageSize();
                }
              }}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white">
          <DataTable 
            columns={columns} 
            data={paginatedData} 
            // emptyMessage="No complaints found"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {entriesStart}-{entriesEnd} of {filteredData.length} entries
        </p>

        {/* Pagination */}
        <div className="w-full sm:w-auto flex justify-center">
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}