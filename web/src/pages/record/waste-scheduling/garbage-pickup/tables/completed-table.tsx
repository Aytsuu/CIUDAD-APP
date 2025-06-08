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


type ViewMode = 'partial' | 'full';
const getCommonColumns = (): ColumnDef<GarbageRequestComplete>[] => [
  { accessorKey: "garb_requester",header: "Requester" },
  { accessorKey: "garb_location", header: "Location"},
  { accessorKey: "garb_waste_type", header: "Waste Type"},
  { accessorKey: "garb_created_at", 
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

// Additional columns for full completions
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

  // Action column component
  const ActionsCell = () => (
    <div className="flex justify-center gap-2">
      <TooltipLayout
        trigger={
          <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer">
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

export default function CompletedTable() {
  const [viewMode, setViewMode] = useState<ViewMode>('partial');
  const { data: completedReqData = [], isLoading   } = useGetGarbageCompleteRequest();

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

        {/* Export Button */}
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