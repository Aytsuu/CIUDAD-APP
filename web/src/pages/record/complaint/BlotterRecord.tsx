import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useGetBlotter } from "./blotter-hooks";
import { blotterColumns } from "./BlotterColumn";
import { useMemo } from "react";
import { BlotterRecordSkeleton } from "./skeleton/blotter-rec-skeleton";

export default function BlotterRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: blotters = [], isLoading, error } = useGetBlotter();

  const columns = useMemo(() => blotterColumns(blotters), [blotters]);

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
              type="number"
              className="w-14 h-8"
              value={pageSize}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white">
          <DataTable columns={blotterColumns(columns)} data={blotters} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        {/* Showing Rows Info */}
        {/* <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
        </p> */}

        {/* Pagination */}
        <div className="w-full sm:w-auto flex justify-center"></div>
      </div>
    </div>
  );
}
