// firstAidColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { SignatureModal } from "@/pages/healthServices/medicineservices/tables/columns/inv-med-col";
import { useState } from "react";
export const firstAidColumns: ColumnDef<any>[] = [
  {
    accessorKey: "dates",
    header: "Date",
    cell: ({ row }) => {
      const usedAt = new Date(row.original.created_at);
      return (
        <div className="flex flex-col text-sm">
          <div>{usedAt.toLocaleDateString()}</div>
        </div>
      );
    }
  },
  {
    accessorKey: "firstaid_item",
    header: "First Aid Item",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[200px] px-2">
        <div className="font-medium">
          {row.original.finv_details?.fa_detail?.fa_name || "Unknown"}
          <div className="text-xs text-gray-500">
            Category: {row.original.finv_details?.fa_detail?.catlist || "N/A"}
          </div>
        </div>
      </div>
    )
  },
  {
    accessorKey: "qty",
    header: "Qty used",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[200px] px-2">
        <div className="text-sm">{row.original.qty}</div>
      </div>
    )
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <div>{row.original.reason || "No reason provided"}</div>
      </div>
    )
  },
  {
     accessorKey: "signature",
     header: "Signature",
     cell: ({ row }) => {
       const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
 
       return (
         <div className="flex justify-center px-3 py-2">
           {row.original.signature ? (
             <>
               <div className="h-12 w-32 border border-gray-200 rounded bg-white p-1 cursor-pointer hover:shadow-md transition-shadow group relative" onClick={() => setIsSignatureModalOpen(true)}>
                 <img src={`data:image/png;base64,${row.original.signature}`} alt="Authorized Signature" className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                 {/* Hover overlay */}
                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                   <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">Click to enlarge</span>
                 </div>
               </div>
 
               <SignatureModal signature={row.original.signature} isOpen={isSignatureModalOpen} onClose={() => setIsSignatureModalOpen(false)} />
             </>
           ) : (
             <div className="text-xs text-gray-400 italic">No signature</div>
           )}
         </div>
       );
     }
   },
];