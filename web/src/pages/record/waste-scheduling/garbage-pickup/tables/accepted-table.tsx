// import DialogLayout from "@/components/ui/dialog/dialog-layout"
// import { ColumnDef } from "@tanstack/react-table"
// import {Check, Eye, Image} from "lucide-react"
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
// import { ConfirmationModal } from "@/components/ui/confirmation-modal"
// import { DataTable } from "@/components/ui/table/data-table";


// export type AcceptedRequest = {
//     garb_id: string;
//     garb_location: string;
//     garb_requester: string;
//     garb_waste_type: string;
//     garb_created_at: string;
//     dec_id: string;
//     dec_date: string;
// }

// type RequestData = {
//   garb_id: string;
//   garb_requester: string;
//   garb_location: string;
//   garb_waste_type: string;
//   garb_pref_date?: string;
//   garb_pref_time?: string;
//   garb_created_at: string;
//   garb_additional_note?: string;
//   garb_req_status: "pending" | "accepted" | "completed" | "rejected";
//   dec_id?: string;
//   dec_date?: string;
//   dec_reason?: string;
//   file_id: "";
// };

// export const SampleData: RequestData[] = [
//   {
//     garb_id: "001",
//     garb_requester: "Maria Mercedes",
//     garb_location: "Sitio 2",
//     garb_waste_type: "Household Waste",
//     garb_pref_date: "Jun 5, 2025",
//     garb_pref_time: "8:00am",
//     garb_created_at: "2025-06-01T09:00:00Z",
//     garb_additional_note: "",
//     garb_req_status: "pending",
//     file_id: "",
//   },
//   {
//     garb_id: "002",
//     garb_requester: "John Santos",
//     garb_location: "Sitio 1",
//     garb_waste_type: "Recyclable Waste",
//     garb_pref_date: "Jun 6, 2025",
//     garb_pref_time: "9:30am",
//     garb_created_at: "2025-06-02T10:00:00Z",
//     garb_additional_note: "",
//     garb_req_status: "accepted",
//     dec_id: "DEC001",
//     dec_date: "2025-06-04T10:00:00Z",
//     file_id: "",
//   },
//   {
//     garb_id: "003",
//     garb_requester: "Ana Reyes",
//     garb_location: "Sitio 3",
//     garb_waste_type: "Household Waste",
//     garb_pref_date: "Jun 7, 2025",
//     garb_pref_time: "10:00am",
//     garb_created_at: "2025-06-03T11:00:00Z",
//     garb_additional_note: "",
//     garb_req_status: "completed",
//     dec_id: "DEC002",
//     dec_date: "2025-06-05T14:00:00Z",
//     file_id: "",
//   },
//   {
//     garb_id: "004",
//     garb_requester: "Carlos Mendoza",
//     garb_location: "Sitio 2",
//     garb_waste_type: "Hazardous Waste",
//     garb_created_at: "2025-06-04T08:30:00Z",
//     garb_req_status: "rejected",
//     dec_id: "DEC003",
//     dec_date: "2025-06-06T11:30:00Z",
//     dec_reason: "We don't handle hazardous waste",
//     file_id: "",
//   },
// ];


// export default function AcceptedTable() {
//     const acceptedData = SampleData.filter(item => item.garb_req_status === "accepted");

//     const columns: ColumnDef<AcceptedRequest>[]= [
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
//                     <TooltipLayout
//                       trigger={
//                         <div>
//                             {/* <DialogLayout
//                                 trigger={<div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"> <CheckCircle size={16} /></div> }
//                                 title="Schedule & Assign for Pickup"
//                                 description="Set date, time, team and vehicle for garbage pickup."  
//                                 mainContent={
//                                     <AcceptPickupRequest/>
//                                 }
//                             /> */}
//                             <ConfirmationModal
//                                 trigger={<div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"> <Check size={16} /></div> }
//                                 title="Confirmation"
//                                 description="Would you like to confirm that the pickup has been done?"
//                                 actionLabel="Confirm"
//                             />
//                         </div>
//                     }
//                       content="Confirm"
//                     />
//                 </div>
//             )
//         }
//     ]
  
//   return <DataTable columns={columns} data={acceptedData} />;
// }

// // export const AcceptedColumns: ColumnDef<AcceptedRequest>[]=[
// //         { accessorKey: "garb_requester", header:"Requester"},
// //         { accessorKey: "garb_location", header: "Location"},
// //         { accessorKey: "garb_waste_type", header: "Waste Type"},
// //         { accessorKey: "garb_created_at", header: "Request Date"},
// //         { accessorKey: "dec_date", header: "Decision Date"},
// //         { 
// //             accessorKey: "actions", 
// //             header: "Action", 
// //             cell: ({row}) => (
// //                 <div className="flex justify-center gap-2">
// //                     <TooltipLayout
// //                       trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"> <Eye size={16} /></div> }
// //                       content="View Assignment"
// //                     />
// //                     <TooltipLayout
// //                         trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer"> <Image size={16} /></div> }
// //                         content="View Image"
// //                     />
// //                     <TooltipLayout
// //                       trigger={
// //                         <div>
// //                             {/* <DialogLayout
// //                                 trigger={<div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"> <CheckCircle size={16} /></div> }
// //                                 title="Schedule & Assign for Pickup"
// //                                 description="Set date, time, team and vehicle for garbage pickup."  
// //                                 mainContent={
// //                                     <AcceptPickupRequest/>
// //                                 }
// //                             /> */}
// //                             <ConfirmationModal
// //                                 trigger={<div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center"> <Check size={16} /></div> }
// //                                 title="Confirmation"
// //                                 description="Would you like to confirm that the pickup has been done?"
// //                                 actionLabel="Confirm"
// //                             />
// //                         </div>
// //                     }
// //                       content="Confirm"
// //                     />
// //                 </div>
// //             )
// //         }
// //     ]

import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { ColumnDef } from "@tanstack/react-table"
import { Check, Eye, Image } from "lucide-react"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { DataTable } from "@/components/ui/table/data-table"

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

  return <DataTable columns={columns} data={sampleData} />
}

