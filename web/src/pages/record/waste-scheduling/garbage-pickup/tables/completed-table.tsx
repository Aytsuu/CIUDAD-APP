import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Eye, Image, FileInput, Check, Circle } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGetGarbageCompleteRequest, type GarbageRequestComplete } from "../queries/GarbageRequestFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { Skeleton } from "@/components/ui/skeleton";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";
import { formatTime } from "@/helpers/timeFormatter";

type ViewMode = 'partial' | 'full';

export default function CompletedTable() {
  const [viewMode, setViewMode] = useState<ViewMode>('partial');
  const [selectedAssignment, setSelectedAssignment] = useState<GarbageRequestComplete | null>(null);
  const { data: completedReqData = [], isLoading } = useGetGarbageCompleteRequest();

  const handleViewAssignment = (assignment: GarbageRequestComplete) => {
    setSelectedAssignment(assignment);
    console.log('Assignment Info:', assignment.assignment_info);
  };

  const getCommonColumns = (): ColumnDef<GarbageRequestComplete>[] => [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "garb_location", header: "Location"},
    { accessorKey: "garb_waste_type", header: "Waste Type"},
    { 
      accessorKey: "garb_created_at", 
      header: "Request Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return date ? formatTimestamp(date) : 'N/A';
      }
    },
    { 
      accessorKey: "conf_staff_conf_date", 
      header: "Staff Confirmed Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return date ? formatTimestamp(date) : 'N/A';
      }
    },
  ];

  const getFullCompletionColumns = (): ColumnDef<GarbageRequestComplete>[] => [
    { 
      accessorKey: "conf_resident_conf_date", 
      header: "Resident Confirmed Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return date ? formatTimestamp(date) : 'N/A';
      }
    },
  ];

  // Filter data based on view mode
  const filteredData = completedReqData.filter(request => {
    const staffConfirmed = request.conf_staff_conf === true;
    const residentConfirmed = request.conf_resident_conf === true;

    if (viewMode === 'partial') {
      return staffConfirmed && !residentConfirmed;
    }
    if (viewMode === 'full') {
      return staffConfirmed && residentConfirmed;
    }

    return false;
  });

  // Action column component
  const ActionsCell = ({ row }: { row: any }) => (
    <div className="flex justify-center gap-2">
      <TooltipLayout
        trigger={
          <div 
            className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"
            onClick={() => handleViewAssignment(row.original)}
          >
            <Eye size={16} />
          </div>
        }
        content="View Assignment"
      />
      <TooltipLayout
        trigger={
          <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer">
            <Image size={16} />
          </div>
        }
        content="View Image"
      />
    </div>
  );

  // Combine columns based on view mode
  const columns = [
    ...getCommonColumns(),
    ...(viewMode === 'full' ? getFullCompletionColumns() : []),
    {
      id: "actions",
      cell: ActionsCell,
      header: "Action",
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
      {/* Assignment Details Dialog */}
      {selectedAssignment && (
        <DialogLayout
          isOpen={!!selectedAssignment}
          onOpenChange={(open) => {
            if (!open) setSelectedAssignment(null);
          }}
          title="Pickup Assignment and Schedule Details"
          description="Detailed information about the garbage pickup assignment"
          mainContent={
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
            </div>
          }
        />
      )}

      {/* Table Header with Count, Toggle, and Export Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-800">
            {viewMode === 'partial' ? 'Partially Completed' : 'Fully Completed'} 
            <span className="ml-2 text-gray-500">({filteredData.length})</span>
          </h2>
          
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
            className="inline-flex bg-slate-100 rounded-lg p-1 shadow-sm"
          >
            <ToggleGroupItem
              value="partial"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              aria-label="Partial completions"
            >
              <Circle size={16} className="transition-colors" />
              Partial
            </ToggleGroupItem>
            <ToggleGroupItem
              value="full"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:shadow-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              aria-label="Full completions"
            >
              <Check size={16} className="transition-colors" />
              Full
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

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

      {/* Data Table */}
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}