import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { CheckCircle, XCircle, Image, FileInput, Search } from "lucide-react";
import AcceptPickupRequest from "../assignment-form";
import RejectPickupForm from "../reject-request-form";
import type { GarbageRequestPending } from "../queries/GarbageRequestFetchQueries";
import { useGetGarbagePendingRequest } from "../queries/GarbageRequestFetchQueries";
import { DataTable } from "@/components/ui/table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { DropdownMenu,DropdownMenuTrigger,DropdownMenuItem,DropdownMenuContent} from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

export default function PendingTable() {
  const [acceptedRowId, setAcceptedRowId] = useState<number | null>(null);
  const [rejectedRowId, setRejectedRowId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: pendingReqData = [], isLoading } = useGetGarbagePendingRequest();

  const filteredData = pendingReqData.filter((request) => {
    const searchString = `
      ${request.garb_requester} 
      ${request.garb_location} 
      ${request.garb_waste_type} 
      ${request.garb_pref_date} 
      ${request.garb_pref_time} 
      ${request.garb_additional_notes}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: ColumnDef<GarbageRequestPending>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "sitio_name", header: "Sitio" },
    { accessorKey: "garb_location", header: "Location" },
    { accessorKey: "garb_waste_type", header: "Waste Type" },
    { accessorKey: "garb_pref_date", header: "Preferred Date" },
    { accessorKey: "garb_pref_time", header: "Preferred Time" },
    {
      accessorKey: "garb_created_at",
      header: "Request Date",
      cell: ({ row }) => formatTimestamp(row.original.garb_created_at),
    },
    { accessorKey: "garb_additional_notes", header: "Additional Notes" },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          {/* View Image */}
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer">
                    <Image size={16} />
                  </div>
                }
                mainContent={row.original.file_url}
              />
            }
            content="View Image"
          />

          {/* Accept Request */}
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-[#17AD00] hover:bg-[#17AD00]/80 text-white px-4 py-3 rounded cursor-pointer flex items-center">
                    <CheckCircle size={16} />
                  </div>
                }
                title="Schedule & Assign for Pickup"
                description="Set date, time, team and vehicle for garbage pickup."
                mainContent={
                  <AcceptPickupRequest
                    garb_id={row.original.garb_id}
                    onSuccess={() => setAcceptedRowId(null)}
                  />
                }
                isOpen={acceptedRowId === Number(row.original.garb_id)}
                onOpenChange={(open) =>
                  setAcceptedRowId(open ? Number(row.original.garb_id) : null)
                }
              />
            }
            content="Accept"
          />

          {/* Reject Request */}
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-3 rounded cursor-pointer flex items-center">
                    <XCircle size={16} />
                  </div>
                }
                title="Confirm Rejection"
                description="Reject the selected garbage pickup request. A reason is required before confirming this action."
                mainContent={
                  <RejectPickupForm
                    garb_id={row.original.garb_id}
                    onSuccess={() => setRejectedRowId(null)}
                  />
                }
                isOpen={rejectedRowId === Number(row.original.garb_id)}
                onOpenChange={(open) =>
                  setRejectedRowId(open ? Number(row.original.garb_id) : null)
                }
              />
            }
            content="Reject"
          />
        </div>
      ),
    },
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
        <h2 className="text-lg font-medium text-gray-800">
          Pending Requests ({filteredData.length})
        </h2>

        {/* Search + Export */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={17}
            />
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

      {/* Entries Selector */}
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

      {/* Footer Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
          {filteredData.length} rows
        </p>
        {filteredData.length > 0 && (
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
}
