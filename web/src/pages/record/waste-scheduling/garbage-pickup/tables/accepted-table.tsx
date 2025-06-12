import { ColumnDef } from "@tanstack/react-table"
import { Check, Eye, Image, FileInput, Pen } from "lucide-react"
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
import { formatTime } from "@/helpers/timeFormatter"
import EditAcceptPickupRequest from "../assignment-edit-form"

export default function AcceptedTable() {
  const { data: acceptedReqData = [], isLoading} = useGetGarbageAcceptRequest(); 
  const { mutate: confirmRequest} = useUpdateGarbageRequestStatus();
  const [selectedAssignment, setSelectedAssignment] = useState<GarbageRequestAccept | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleConfirm = (garb_id: string) => {
    confirmRequest(garb_id);
  }

  const handleViewAssignment = (assignment: GarbageRequestAccept) => {
    setSelectedAssignment(assignment);
    setIsEditing(false);
    console.log('Assignment Info:', assignment.assignment_info);
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    setSelectedAssignment(null);
  };

  const columns: ColumnDef<GarbageRequestAccept>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
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
                  title="Confirmation"
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

      {/* Table Header with Count and Export Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-800">Accepted Requests ({acceptedReqData.length})</h2>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
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

      {/* Data Table */}
      <div>
        <DataTable columns={columns} data={acceptedReqData} />
      </div>
    </div>
  );
}
