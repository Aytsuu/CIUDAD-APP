import { Check, Eye, Image, FileInput, Pen, Search } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { DataTable } from "@/components/ui/table/data-table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button"
import { useGetGarbageAcceptRequest, type GarbageRequestAccept } from "../queries/GarbageRequestFetchQueries"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { useUpdateGarbageRequestStatus } from "../queries/GarbageRequestUpdateQueries"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { formatTime } from "@/helpers/timeFormatter";
import EditAcceptPickupRequest from "../assignment-edit-form"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { ColumnDef } from "@tanstack/react-table";

export default function AcceptedTable() {
  const { data: acceptedReqData = [], isLoading } = useGetGarbageAcceptRequest(); 
  const { mutate: confirmRequest } = useUpdateGarbageRequestStatus();
  const [selectedAssignment, setSelectedAssignment] = useState<GarbageRequestAccept | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = acceptedReqData.filter((request) => {
    const searchString = `${request.garb_requester} ${request.garb_location} ${request.garb_waste_type} ${request.garb_created_at} ${request.dec_date}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleConfirm = (garb_id: string) => {
    confirmRequest(garb_id);
  }

  const handleViewAssignment = (assignment: GarbageRequestAccept) => {
    setSelectedAssignment(assignment);
    setIsEditing(false);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    setSelectedAssignment(null);
  };

  const columns: ColumnDef<GarbageRequestAccept>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "sitio_name", header: "Sitio" },
    { accessorKey: "garb_location", header: "Location" },
    { accessorKey: "garb_waste_type", header: "Waste Type" },
    { 
      accessorKey: "garb_created_at", 
      header: "Request Date",
      cell: ({ row }) => {
          const date = row.original.garb_created_at;
          return formatTimestamp(date);
      }
    },
    { 
      accessorKey: "dec_date", 
      header: "Decision Date",
      cell: ({ row }) => {
          const date = row.original.dec_date;
          return formatTimestamp(date);
      }
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <div 
                className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"onClick={() => handleViewAssignment(row.original)}>
                <Eye size={16} />
              </div>
            }
            content="View Assignment"
          />
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
          <TooltipLayout
            trigger={
              <div>
                <ConfirmationModal
                  trigger={
                    <div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center">
                      <Check size={16} />
                    </div>
                  }
                  title="Confirm Pickup"
                  description="Would you like to confirm that the pickup has been done?"
                  actionLabel="Confirm"
                  onClick={() => handleConfirm(row.original.garb_id)} 
                />
              </div>
            }
            content="Confirm"
          />
        </div>
      ),
    },
  ]

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
      {selectedAssignment && (
        <DialogLayout
          isOpen={!!selectedAssignment}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedAssignment(null);
              setIsEditing(false);
            }
          }}
          title={isEditing ? "Edit Pickup Assignment" : "Pickup Assignment and Schedule Details"}
          description={isEditing ? "" : "Detailed information about the garbage pickup assignment"}
          mainContent={
            isEditing ? (
              <EditAcceptPickupRequest
                pick_id={selectedAssignment.pickup_assignment_id ?? ''}
                acl_id={selectedAssignment.assignment_collector_ids ?? []}
                onSuccess={handleEditSuccess}
                assignment={{
                  driver: selectedAssignment.driver_id ?? undefined,
                  truck: selectedAssignment.truck_id ?? undefined,
                  pick_date: selectedAssignment.assignment_info?.pick_date,
                  pick_time: selectedAssignment.assignment_info?.pick_time,
                  collectors: selectedAssignment.collector_ids,
                }}
              />
            ) : (
             <div className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Driver</Label>
                    <p className="font-sm">
                      {selectedAssignment.assignment_info?.driver || "Not assigned"}
                    </p>
                  </div>
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Truck</Label>
                    <p className="font-sm">
                      {selectedAssignment.assignment_info?.truck || "Not assigned"}
                    </p>
                  </div>
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Scheduled Date</Label>
                    <p className="font-sm">
                      {selectedAssignment.assignment_info?.pick_date || "Not scheduled"}
                    </p>
                  </div>
                  <div className="border-b pb-2">
                    <Label className="text-sm font-medium text-gray-500">Scheduled Time</Label>
                    <p className="font-sm">
                      {selectedAssignment.assignment_info?.pick_time ? formatTime(selectedAssignment.assignment_info.pick_time) : "Not scheduled"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-500">Collectors</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {selectedAssignment.assignment_info?.collectors?.length ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedAssignment.assignment_info.collectors.map((collector, index) => (
                          <li key={index} className="font-sm py-1">{collector}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-sm text-center py-2">No collectors assigned</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pen size={16} />Edit Assignment
                  </Button>
                </div>
              </div>
            )
          }
        />
      )}

      {/* Table Header with Count, Search, and Export Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
        {/* Left side - Title and Count */}
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-800">Accepted Requests ({filteredData.length})</h2>
        </div>

        {/* Right side - Search and Export Button */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search Input */}
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
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
          </div>

          {/* Export Button */}
          <div>
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
      </div>

      {/* Entries per page selector */}
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
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
      </div>

      {/* Data Table */}
      <div>
        <DataTable columns={columns} data={paginatedData} />
      </div>

      {/* Pagination Section */}
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
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        )}
      </div>
    </div>
  );
}