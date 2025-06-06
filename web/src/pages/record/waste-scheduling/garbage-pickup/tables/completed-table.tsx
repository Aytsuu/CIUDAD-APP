// import { ColumnDef } from "@tanstack/react-table"
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import {Eye, Image} from "lucide-react"
// import { DataTable } from "@/components/ui/table/data-table";

// export type CompletedRequest = {
//     garb_id: string;
//     garb_location: string;
//     garb_requester: string;
//     garb_waste_type: string;
//     garb_created_at: string;
//     dec_id: string;
//     dec_date: string;
// }

// export default function CompletedTable() {
// //   const completedData = SampleData.filter(item => item.garb_req_status === "completed");

//   const columns: ColumnDef<CompletedRequest>[]=[
//         { accessorKey: "garb_requester", header:"Requester"},
//         { accessorKey: "garb_location", header: "Location"},
//         { accessorKey: "garb_waste_type", header: "Waste Type"},
//         { accessorKey: "garb_created_at", header: "Request Date"},
//         { accessorKey: "dec_date", header: "Decision Date"},
//         { 
//             accessorKey: "actions", 
//             header: "Action", 
//             cell: ({row}) => (
//                 <div className="flex justify-center gap-2">
//                     <TooltipLayout
//                       trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"> <Eye size={16} /></div> }
//                       content="View Assignment"
//                     />
//                     <TooltipLayout
//                         trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"> <Image size={16} /></div> }
//                         content="View Image"
//                     />
//                 </div>
//             )
//         }
//     ]
  
// //   return <DataTable columns={columns} data={completedData} />;
// }


import { ColumnDef } from "@tanstack/react-table"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { Eye, Image } from "lucide-react"
import { DataTable } from "@/components/ui/table/data-table"

export type CompletedRequest = {
  garb_id: string
  garb_location: string
  garb_requester: string
  garb_waste_type: string
  garb_created_at: string
  dec_id: string
  dec_date: string
}

export default function CompletedTable() {
  const columns: ColumnDef<CompletedRequest>[] = [
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
        </div>
      ),
    },
  ]

  const sampleData: CompletedRequest[] = [
    {
      garb_id: "1",
      garb_location: "Zone 5, Barangay Central",
      garb_requester: "Juan Dela Cruz",
      garb_waste_type: "Biodegradable",
      garb_created_at: "2025-06-01T09:15:00Z",
      dec_id: "D001",
      dec_date: "2025-06-02T10:30:00Z",
    },
    {
      garb_id: "2",
      garb_location: "Zone 2, Barangay North",
      garb_requester: "Maria Clara",
      garb_waste_type: "Non-Biodegradable",
      garb_created_at: "2025-06-03T14:45:00Z",
      dec_id: "D002",
      dec_date: "2025-06-04T08:00:00Z",
    },
    {
      garb_id: "3",
      garb_location: "Purok 3, Barangay East",
      garb_requester: "Andres Bonifacio",
      garb_waste_type: "Recyclable",
      garb_created_at: "2025-06-05T11:20:00Z",
      dec_id: "D003",
      dec_date: "2025-06-06T07:50:00Z",
    },
    {
      garb_id: "4",
      garb_location: "Blk 8 Lot 12, Greenfields Subdivision",
      garb_requester: "Jose Rizal",
      garb_waste_type: "Electronic Waste",
      garb_created_at: "2025-05-30T16:00:00Z",
      dec_id: "D004",
      dec_date: "2025-05-31T09:00:00Z",
    },
  ]

  return <DataTable columns={columns} data={sampleData} />
}
