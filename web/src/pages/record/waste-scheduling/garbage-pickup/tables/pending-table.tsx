import { ColumnDef } from "@tanstack/react-table"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"
import { CheckCircle, XCircle, Image } from "lucide-react"
import AcceptPickupRequest from "../accept-request-form"
import RejectPickupForm from "../reject-request-form"
import type { GarbageRequestPending } from "../queries/GarbageRequestFetchQueries"
import { DataTable } from "@/components/ui/table/data-table"
import { useState } from "react"
import { useGetGarbagePendingRequest } from "../queries/GarbageRequestFetchQueries"
import { Skeleton } from "@/components/ui/skeleton"

// interface TableColumnsProps {
//   editingRowId: number | null
//   setEditingRowId: (id: number | null) => void
// }

// export const getPendingColumns = ({ 
//   editingRowId, 
//   setEditingRowId 
// }: TableColumnsProps): ColumnDef<GarbageRequestPending>[] => [
//   { accessorKey: "garb_requester", header: "Requester" },
//   { accessorKey: "garb_location", header: "Location" },
//   { accessorKey: "garb_waste_type", header: "Waste Type" },
//   { accessorKey: "garb_pref_date", header: "Preferred Date" },
//   { accessorKey: "garb_pref_time", header: "Preferred Time" },
//   { accessorKey: "garb_created_at", header: "Request Date" },
//   { accessorKey: "garb_additional_notes", header: "Additional Notes" },
//   { 
//     accessorKey: "actions", 
//     header: "Action", 
//     cell: ({ row }) => (
//       <div className="flex justify-center gap-2">
//         <TooltipLayout
//           trigger={
//             <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-3 rounded cursor-pointer">
//               <Image size={16} />
//             </div>
//           }
//           content="View Image"
//         />
//         <TooltipLayout
//           trigger={
//             <DialogLayout
//               trigger={
//                 <div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center">
//                   <CheckCircle size={16} />
//                 </div>
//               }
//               title="Schedule & Assign for Pickup"
//               description="Set date, time, team and vehicle for garbage pickup."  
//               mainContent={<AcceptPickupRequest />}
//             />
//           }
//           content="Accept"
//         />
//         <TooltipLayout
//           trigger={
//             <DialogLayout
//               title="Confirm Rejection"
//               trigger={
//                 <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center">
//                   <XCircle size={16} />
//                 </div>
//               }
//               description="Reject the selected garbage pickup request. A reason is required before confirming this action."
//               mainContent={
//                 <RejectPickupForm 
//                   garb_id={row.original.garb_id}
//                   onSuccess={() => setEditingRowId(null)}
//                 />
//               }
//               isOpen={editingRowId === Number(row.original.garb_id)}
//               onOpenChange={(open) => setEditingRowId(open ? Number(row.original.garb_id) : null)}
//             />
//           }
//           content="Reject"
//         />
//       </div>
//     )
//   }
// ]



export default function PendingTable() {
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const { data: pendingReqData = [], isLoading} = useGetGarbagePendingRequest(); 

    const columns: ColumnDef<GarbageRequestPending>[] = [
    { accessorKey: "garb_requester", header: "Requester" },
    { accessorKey: "garb_location", header: "Location" },
    { accessorKey: "garb_waste_type", header: "Waste Type" },
    { accessorKey: "garb_pref_date", header: "Preferred Date" },
    { accessorKey: "garb_pref_time", header: "Preferred Time" },
    { accessorKey: "garb_created_at", header: "Request Date" },
    { accessorKey: "garb_additional_notes", header: "Additional Notes" },
    { 
      accessorKey: "actions", 
      header: "Action", 
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
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
              <DialogLayout
                trigger={
                  <div className="bg-[#17AD00] hover:bg-[#17AD00]/80 border text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center">
                    <CheckCircle size={16} />
                  </div>
                }
                title="Schedule & Assign for Pickup"
                description="Set date, time, team and vehicle for garbage pickup."  
                mainContent={<AcceptPickupRequest />}
              />
            }
            content="Accept"
          />
          <TooltipLayout
            trigger={
              <DialogLayout
                title="Confirm Rejection"
                trigger={
                  <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] border-none text-white px-4 py-3 rounded cursor-pointer shadow-none h-full flex items-center">
                    <XCircle size={16} />
                  </div>
                }
                description="Reject the selected garbage pickup request. A reason is required before confirming this action."
                mainContent={
                  <RejectPickupForm 
                    garb_id={row.original.garb_id}
                    onSuccess={() => setEditingRowId(null)}
                  />
                }
                isOpen={editingRowId === Number(row.original.garb_id)}
                onOpenChange={(open) => setEditingRowId(open ? Number(row.original.garb_id) : null)}
              />
            }
            content="Reject"
          />
        </div>
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

  return <DataTable columns={columns} data={pendingReqData} />;
}
