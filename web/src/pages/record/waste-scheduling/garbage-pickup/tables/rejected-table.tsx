import { ColumnDef } from "@tanstack/react-table"
import type { GarbageRequestReject } from "../queries/GarbageRequestFetchQueries"
import { DataTable } from "@/components/ui/table/data-table";
import { useGetGarbageRejectRequest } from "../queries/GarbageRequestFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button"
import { FileInput, Image } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";


export default function RejectedTable() {

  const { data: rejectedReqData = [], isLoading } = useGetGarbageRejectRequest();
  console.log("Rejected data:", rejectedReqData);
  
  const columns: ColumnDef<GarbageRequestReject>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "garb_location", header: "Location"},
    { accessorKey: "garb_waste_type", header: "Waste Type" },
    { 
      accessorKey: "garb_created_at", 
      header: "Request Date",
      cell: ({ row }) => {
        const date = row.original.garb_created_at;
        return formatTimestamp(date);
      }
    },
    { accessorKey: "dec_reason", header: "Rejection Reason" },
    {
      accessorKey: "dec_date",
      header: "Decision Date",
      cell: ({ row }) => {
        const date = row.original.dec_date;
        if (!date) return ""; 
        return formatTimestamp(date as string | Date);
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
        {/* Table Header with Count and Export Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
          {/* Left side - Title and Count */}
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-800">Rejected Requests ({rejectedReqData.length})</h2>
          </div>

          {/* Right side - Export Button */}
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
          <DataTable columns={columns} data={rejectedReqData} />
        </div>
      </div>
    );
}