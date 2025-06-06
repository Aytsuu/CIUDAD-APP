import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { ColumnDef } from "@tanstack/react-table"
import { Check, Eye, Image, FileInput } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { DataTable } from "@/components/ui/table/data-table"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown/dropdown-menu";
import { Button } from "@/components/ui/button/button"

export type AcceptedRequest = {
  garb_id: string
  garb_location: string
  garb_requester: string
  garb_waste_type: string
  garb_created_at: string
  dec_id: string
  dec_date: string
}

export default function AcceptedTable() {
  const columns: ColumnDef<AcceptedRequest>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "garb_location", header: "Location" },
    { accessorKey: "garb_waste_type", header: "Waste Type" },
    { accessorKey: "garb_created_at", header: "Request Date" },
    { accessorKey: "dec_date", header: "Decision Date" },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => (
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
                />
              </div>
            }
            content="Confirm"
          />
        </div>
      ),
    },
  ]

  const sampleData: AcceptedRequest[] = [
    {
      garb_id: "002",
      garb_requester: "John Santos",
      garb_location: "Sitio 1",
      garb_waste_type: "Recyclable Waste",
      garb_created_at: "2025-06-02T10:00:00Z",
      dec_id: "DEC001",
      dec_date: "2025-06-04T10:00:00Z",
    },
    {
      garb_id: "005",
      garb_requester: "Elena Cruz",
      garb_location: "Barangay West",
      garb_waste_type: "Biodegradable Waste",
      garb_created_at: "2025-06-03T08:30:00Z",
      dec_id: "DEC005",
      dec_date: "2025-06-04T13:15:00Z",
    },
    {
      garb_id: "006",
      garb_requester: "Mark Rivera",
      garb_location: "Zone 4, Sitio Luna",
      garb_waste_type: "Non-Biodegradable",
      garb_created_at: "2025-06-04T12:45:00Z",
      dec_id: "DEC006",
      dec_date: "2025-06-05T09:00:00Z",
    },
    {
      garb_id: "007",
      garb_requester: "Lea Salonga",
      garb_location: "Purok 7, Barangay Central",
      garb_waste_type: "Recyclable",
      garb_created_at: "2025-06-05T07:10:00Z",
      dec_id: "DEC007",
      dec_date: "2025-06-06T10:30:00Z",
    },
  ]

  return (
       <div className="bg-white rounded-lg shadow-sm mt-6">
        {/* Table Header with Count and Export Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
          {/* Left side - Title and Count */}
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-800">Accepted Requests ({sampleData.length})</h2>
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
          <DataTable columns={columns} data={sampleData} />
        </div>
      </div>
    );
}

