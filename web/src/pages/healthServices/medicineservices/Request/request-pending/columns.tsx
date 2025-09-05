// components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { useState } from "react";
import { DocumentModal } from "../../tables/columns/inv-med-col";
import { Reject } from "./reject";
import { Link } from "react-router-dom";

export const medicineRequestPendingColumns: ColumnDef<any>[] = [
  {
    accessorKey: "medreq_id",
    header: "Request ID",
    cell: ({ row }) => <span>MR{row.original.medreq_id.toString().padStart(5, "0")}</span>
  },
  {
    accessorKey: "personal_info",
    header: "Patient Name",
    cell: ({ row }) => {
      const { per_fname, per_mname, per_lname, per_suffix } = row.original.personal_info;
      return `${per_fname} ${per_mname ? per_mname.charAt(0) + "." : ""} ${per_lname} ${per_suffix}`.trim();
    }
  },
  {
    accessorKey: "personal_info.per_contact",
    header: "Contact Number"
  },
  {
    accessorKey: "total_quantity",
    header: "Total Items"
  },
  {
    accessorKey: "requested_at",
    header: "Request Date",
    cell: ({ row }) => {
      const date = new Date(row.original.requested_at);
      return date.toLocaleDateString();
    }
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link
          to={`/medicine-request/pending-items`}
          state={{
            params: {
              medreq_id: row.original.medreq_id, // Pass the entire row data if needed
              patientData: {
                pat_id: row.original.pat_id_value,
                pat_type: row.original.pat_type,
                age: row.original.age,
                addressFull: row.original.address.full_address || "No address provided",
                address: {
                  add_street: row.original.address.add_street,
                  add_barangay: row.original.address.add_barangay,
                  add_city: row.original.address.add_city,
                  add_province: row.original.address.add_province,
                  add_sitio: row.original.address.add_sitio
                },
                households: [{ hh_id: row.original.householdno }],
                personal_info: {
                  per_fname: row.original.personal_info.per_fname,
                  per_mname: row.original.personal_info.per_mname,
                  per_lname: row.original.personal_info.per_lname,
                  per_dob: row.original.personal_info.per_dob,
                  per_sex: row.original.personal_info.per_sex
                }
              }
            }
          }}
        >
          View Items
        </Link>
      </Button>
    )
  }
];



export const pendingItemsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "medicine",
    header: "Medicine Details",
    cell: ({ row }) => (
     <div className="flex justify-center items-center">
       <div className="min-w-[250px] px-3 py-2">
        <div className="font-semibold text-gray-900">{row.original.med_name || "No name provided"}</div>
        <div> {row.original.med_type || "No type provided"}</div>
      </div>
     </div>
    )
  },
  // {
  //   accessorKey: "medreqitem_qty",
  //   header: "Requested Quantity",
  //   cell: ({ row }) => (
  //     <div className="flex justify-center min-w-[120px] px-2">
  //       <div className="flex flex-col items-center">
  //         <div className="text-lg font-semibold text-blue-600">{row.original.medreqitem_qty}</div>
  //         <div className="text-xs text-gray-500">units requested</div>
  //       </div>
  //     </div>
  //   )
  // },

  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="min-w-[200px] max-w-[300px] px-3 py-2">
        <div className="text-sm text-gray-700 line-clamp-3">{row.original.reason || "No reason provided"}</div>
      </div>
    )
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="min-w-[200px] max-w-[300px] px-3 py-2">
        <div className="text-sm text-gray-700 line-clamp-3">{row.original.medreqitem_id || "No reason provided"}</div>
      </div>
    )
  },
  {
    accessorKey: "inventory",
    header: "Total Available Stock",
    cell: ({ row }) => {
      return (
        <div className="min-w-[180px] px-3 py-2">
          <>
            <div className="text-xs ">Qty: {row.original.total_available_stock}</div>
          </>
        </div>
      );
    }
  },

  {
    id: "documents",
    header: "Documents",
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const files = row.original.medicine_files || [];

      return (
        <div className="px-3 py-2 min-w-[120px]">
          {files.length > 0 ? (
            <>
              <Button onClick={() => setIsModalOpen(true)} variant="outline" size="sm" className="text-xs">
                View ({files.length})
              </Button>
              <DocumentModal files={files} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">No documents</span>
          )}
        </div>
      );
    }
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="min-w-[100px] px-3 py-2">
        {row.original.status === "pending" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
        {row.original.status === "confirmed" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Confirmed</span>}
        {row.original.status === "referred" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Referred</span>}
        {row.original.status === "on referred" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">On Referred</span>}
      </div>
    )
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isRejectOpen, setIsRejectOpen] = useState(false);
      const [isProcessing, setIsProcessing] = useState(false);
      const med_type = row.original.med_type || "Prescription";
      const handleConfirm = async () => {
        // Your confirm logic here
        console.log("Confirming:", row.original);
      };

     
      return (
        <div className="flex justify-center ">
          {med_type === "Prescription" && (
            <>
              <Button size="sm" variant="destructive" className="text-xs" onClick={() => setIsRejectOpen(true)}>
                Reject Document
              </Button>
              <Reject isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)}  data={row.original} isLoading={isProcessing} />
            </>
          )}
        </div>
      );
    }
  }
];
