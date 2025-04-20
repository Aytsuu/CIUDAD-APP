import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useGetBlotter } from "./blotter-hooks";
import { blotterColumns } from "./BlotterColumn";
import { useMemo } from "react";
import { BlotterRecordSkeleton } from "./skeleton/blotter-rec-skeleton";

export default function BlotterRecord() {
  const DEFAULT_PAGE_SIZE = 10;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageSizeInput, setPageSizeInput] = useState(DEFAULT_PAGE_SIZE.toString());
  const [currentPage, setCurrentPage] = useState(1);
  const { data: blotters = [], isLoading, error } = useGetBlotter();

  const columns = useMemo(() => blotterColumns(blotters), [blotters]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return blotters;
    
    return blotters.filter((blotter: any) => {
      // Search through all string and number values in the blotter object
      return Object.values(blotter).some(value => 
        value !== null && 
        value !== undefined && 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [blotters, searchQuery]);

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

  // Handle page size input change - just update the input field
  const handlePageSizeInputChange = (e: any) => {
    setPageSizeInput(e.target.value);
  };

  const applyPageSize = () => {
    const newSize = parseInt(pageSizeInput, 10);
    if (!isNaN(newSize) && newSize > 0) {
      setPageSize(newSize);
    } else {
      // Reset the input to the current valid page size
      setPageSizeInput(pageSize.toString());
    }
  };

  if(isLoading){
    return <BlotterRecordSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-red-500">Error loading data: {error.message}</p>
        <Button
          className="mt-4 bg-buttonBlue hover:bg-buttonBlue/90 text-white"
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
      {/* Header Section */}
      <div className="flex flex-col justify-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Resident Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view resident information
        </p>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Search and filters - Stacks on mobile */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2 flex-1">
          <div className="relative flex-1 bg-white w-full">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Link to="/blotter-report" className="ml-4">
          <Button className="bg-buttonBlue hover:bg-buttonBlue/90 text-white flex flex-row">
            <Plus size={17} className="mr-1" />
            Report
          </Button>
        </Link>
      </div>

      <div className="w-full flex flex-col">
        <div className="w-full h-auto bg-white flex p-3">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
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
          <DataTable columns={columns} data={paginatedData} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {entriesStart}-{entriesEnd} of {filteredData.length} rows
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