import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Eye, Image, FileInput, Search, Circle, Check } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

type ViewMode = 'partial' | 'full';

export default function CompletedTable() {
  const [viewMode, setViewMode] = useState<ViewMode>('partial');
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState<GarbageRequestComplete | null>(null);
  const { data: completedReqData = [], isLoading } = useGetGarbageCompleteRequest();

  // Combine search + view-mode filtering
  const searchedData = completedReqData.filter((request) => {
    const combined = [
      request.garb_requester,
      request.garb_location,
      request.garb_waste_type,
      request.garb_created_at,
      request.conf_staff_conf_date,
      request.conf_resident_conf_date
    ].join(" ").toLowerCase();
    return combined.includes(searchQuery.toLowerCase());
  });

  const filteredData = searchedData.filter(request => {
    const staffConfirmed = request.conf_staff_conf === true;
    const residentConfirmed = request.conf_resident_conf === true;
    if (viewMode === 'partial') return staffConfirmed && !residentConfirmed;
    return staffConfirmed && residentConfirmed;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewAssignment = (assignment: GarbageRequestComplete) => {
    setSelectedAssignment(assignment);
  };

  const getCommonColumns = (): ColumnDef<GarbageRequestComplete>[] => [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "garb_location", header: "Location" },
    { accessorKey: "garb_waste_type", header: "Waste Type" },
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
    </div>
  );

  const columns: ColumnDef<GarbageRequestComplete>[] = [
    ...getCommonColumns(),
    ...(viewMode === 'full' ? getFullCompletionColumns() : []),
    { id: "actions", header: "Action", cell: ActionsCell }
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
      {/* Assignment Dialog */}
      {selectedAssignment && (
        <DialogLayout
          isOpen={!!selectedAssignment}
          onOpenChange={(open) => { if (!open) setSelectedAssignment(null); }}
          title="Pickup Assignment and Schedule Details"
          description="Detailed information about the garbage pickup assignment"
          mainContent={
            <div className="flex flex-col gap-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-b pb-2">
                  <Label className="text-sm font-medium text-gray-500">Driver</Label>
                  <p className="font-sm">{selectedAssignment.assignment_info?.driver || "Not assigned"}</p>
                </div>
                <div className="border-b pb-2">
                  <Label className="text-sm font-medium text-gray-500">Truck</Label>
                  <p className="font-sm">{selectedAssignment.assignment_info?.truck || "Not assigned"}</p>
                </div>
                <div className="border-b pb-2">
                  <Label className="text-sm font-medium text-gray-500">Scheduled Date</Label>
                  <p className="font-sm">{selectedAssignment.assignment_info?.pick_date || "Not scheduled"}</p>
                </div>
                <div className="border-b pb-2">
                  <Label className="text-sm font-medium text-gray-500">Scheduled Time</Label>
                  <p className="font-sm">
                    {selectedAssignment.assignment_info?.pick_time
                      ? formatTime(selectedAssignment.assignment_info.pick_time)
                      : "Not scheduled"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-500">Collectors</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                  {selectedAssignment.assignment_info?.collectors?.length ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedAssignment.assignment_info.collectors.map((c, i) => (
                        <li key={i} className="font-sm py-1">{c}</li>
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

      {/* Header: Title, Toggle, Search, Export */}
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

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FileInput size={16} /> Export
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

      {/* Entries per page selector - moved up here */}
      <div className="flex justify-between p-3 border-t">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm">Show</p>
          <Input
            type="number"
            className="w-14 h-8"
            min={1}
            value={pageSize}
            onChange={(e) => {
              const v = +e.target.value;
              setPageSize(v >= 1 ? v : 1);
              setCurrentPage(1);
            }}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={paginatedData} />

      {/* Pagination Controls - simplified version */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
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