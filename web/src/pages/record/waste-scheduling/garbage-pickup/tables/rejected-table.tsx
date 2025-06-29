import { ColumnDef } from "@tanstack/react-table"
import type { GarbageRequestReject } from "../queries/GarbageRequestFetchQueries"
import { DataTable } from "@/components/ui/table/data-table";
import { useGetGarbageRejectRequest } from "../queries/GarbageRequestFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button"
import { FileInput, Image, Search } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";


export default function RejectedTable() {
  const { data: rejectedReqData = [], isLoading } = useGetGarbageRejectRequest();

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = rejectedReqData.filter((request) => {
    const searchString = `${request.garb_requester} ${request.garb_location} ${request.garb_waste_type} ${request.dec_reason}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Paginate the filtered data
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<GarbageRequestReject>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "garb_location", header: "Location" },
    { accessorKey: "garb_waste_type", header: "Waste Type" },
    {
      accessorKey: "garb_created_at",
      header: "Request Date",
      cell: ({ row }) => formatTimestamp(row.original.garb_created_at)
    },
    { accessorKey: "dec_reason", header: "Rejection Reason" },
    {
      accessorKey: "dec_date",
      header: "Decision Date",
      cell: ({ row }) => {
        const date = row.original.dec_date;
        return date ? formatTimestamp(date as string | Date) : "";
      }
    }, 
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({row}) => (
        <TooltipLayout
            trigger={
                <div className="flex justify-center gap-2">
                    <DialogLayout
                      trigger={<div className="bg-stone-200 hover:bg-stone-300 text-sm text-gray-500 px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"><Image size={16} /></div>}
                      title="Request Image"
                      mainContent={
                        <div className="flex justify-center items-center w-full h-full p-4">
                          <img
                            src={row.original.file_url} alt="Rejected request"
                            className="max-w-full max-h-[500px] object-contain rounded-md shadow"
                          />
                        </div>

                      }
                    />
                </div>
            }
            content="View Image"
        />
      )
    }
  ];

  if (isLoading) {
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
    <div className="bg-white rounded-lg shadow-sm mt-6">
      {/* Table Header with Count, Search, and Export */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
        {/* Left - Title & Count */}
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-800">
            Rejected Requests ({filteredData.length})
          </h2>
        </div>

        {/* Right - Search & Export */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
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

      {/* Entries per page */}
      <div className="flex justify-between p-3 border-t">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm">Show</p>
          <Input
            type="number"
            className="w-14 h-8"
            min="1"
            value={pageSize}
            onChange={(e) => {
              const value = +e.target.value;
              setPageSize(value >= 1 ? value : 1);
              setCurrentPage(1);
            }}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
      </div>

      {/* Table */}
      <div>
        <DataTable columns={columns} data={paginatedData} />
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
        </p>
        {filteredData.length > 0 && (
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
