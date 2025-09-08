// components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { useState } from "react";
import { DocumentModal } from "../../tables/columns/inv-med-col";
import { ActionModal } from "./reject";
import { Link } from "react-router";


export const medicineRequestPendingColumns: ColumnDef<any>[] = [
  {
    accessorKey: "patient",
    header: "Patient Details",
    cell: ({ row }) => {
      const patientInfo = row.original.patient_info || {};
      const patientName = row.original.patient_name || "Unknown Patient";
   
      
      return (
        <div className="flex justify-center items-center">
          <div className="min-w-[250px] px-3 py-2">
            <div className="font-semibold text-gray-900">{patientName}</div>
            <div className="text-xs text-gray-500">
              {patientInfo.pat_id ? `ID: ${patientInfo.pat_id}` : ''}
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "sitio",
    header: "Sitio",
    cell: ({ row }) => {
   
      
      return (
        <div className="flex justify-center items-center">
          <div className="min-w-[250px] px-3 py-2">
            <div className="font-semibold text-gray-900">{row.original.patient_info?.address?.add_sitio}</div>
           
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "medicine",
    header: "Medicine Details",
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <div className="min-w-[200px] px-3 py-2">
          <div className="font-semibold text-gray-900">{row.original.med_name || "No name provided"}</div>
          <div className="text-sm text-gray-600">{row.original.med_type || "No type provided"}</div>
          <div className="text-xs text-gray-500">ID: {row.original.med_id || "N/A"}</div>
        </div>
      </div>
    )
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="min-w-[150px] max-w-[200px] px-3 py-2">
        <div className="text-sm text-gray-700 line-clamp-3">{row.original.reason || "No reason provided"}</div>
      </div>
    )
  },
 
  {
    accessorKey: "inventory",
    header: "Available Stock",
    cell: ({ row }) => {
      // Since inventory is empty in the API response, we need to handle this
      const hasInventoryData = row.original.inventory && Object.keys(row.original.inventory).length > 0;
      
      return (
        <div className="min-w-[120px] px-3 py-2 text-center">
          <div className="text-xs">
            {hasInventoryData ? row.original.inventory.total_available_stock : "N/A"}
          </div>
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
      const med_type = row.original.med_type || "";

      // Only show documents for prescription type
      const isPrescription = med_type.toLowerCase() === "prescription";

      return (
        <div className="px-3 py-2 min-w-[100px] text-center">
          {isPrescription ? (
            files.length > 0 ? (
              <>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" size="sm" className="text-xs">
                  View ({files.length})
                </Button>
                <DocumentModal files={files} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No documents</span>
            )
          ) : (
            <span className="text-xs text-gray-400 italic">N/A</span>
          )}
        </div>
      );
    }
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="min-w-[100px] px-3 py-2 text-center">
        {row.original.status === "pending" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
        {row.original.status === "rejected" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>}
        {row.original.status === "referred" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Referred</span>}
        {row.original.status === "on referred" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">On Referred</span>}
      </div>
    )
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isActionModalOpen, setIsActionModalOpen] = useState(false);
      const [isReferOpen, setIsReferOpen] = useState(false);
      const status = row.original.status;
      const med_type = row.original.med_type || "";
      
      // Only show action buttons for pending items of type "Prescription"
      const isPrescription = med_type.toLowerCase() === "prescription";

      return (
        <div className="flex justify-center gap-2 px-3 py-2">
          {status === "pending" && isPrescription ? (
            <>
              {/* Refer Button */}
              <Button size="sm" variant="outline" onClick={() => setIsReferOpen(true)}>
                Refer
              </Button>

              {/* ActionModal Button */}
              <Button size="sm" variant="destructive" className="text-xs" onClick={() => setIsActionModalOpen(true)}>
                Reject
              </Button>

              {/* ActionModal Modal */}
              <ActionModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                data={row.original}
                mode="reject"
              />

              <ActionModal
                isOpen={isReferOpen}
                onClose={() => setIsReferOpen(false)}
                data={row.original}
                mode="refer"
              />
            </>
          ) : status === "pending" && !isPrescription ? (
            <span className="text-xs text-gray-500 italic">
              Prescription only
            </span>
          ) : (
            <span className="text-xs text-gray-500 italic">
              {status !== "pending" ? "Completed" : "N/A"}
            </span>
          )}
        </div>
      );
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
              medicineRequestData: row.original,
              // medreq_id: row.original.medreq_id, // Pass the entire row data if needed
              patientData: {
                pat_id: row.original.patient_info.pat_id,
                pat_type: row.original.type,
                age: row.original.age,
                address: {
                  add_street: row.original.patient_info.address.add_street,
                  add_barangay: row.original.patient_info.address.add_barangay,
                  add_city: row.original.patient_info.address.add_city,
                  add_province: row.original.patient_info.address.add_province,
                  add_sitio: row.original.patient_info.address.add_sitio
                },
                households: [{ hh_id: row.original.householdno }],
                personal_info: {
                  per_fname: row.original.patient_info.per_fname,
                  per_mname: row.original.patient_info.per_mname,
                  per_lname: row.original.patient_info.per_lname,
                  per_dob: row.original.patient_info.per_dob,
                  per_sex: row.original.patient_info.per_sex
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



// ========================================================
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
      const med_type = row.original.med_type || "Prescription";

      // Only show documents for prescription type
      const isPrescription = med_type === "Prescription";

      return (
        <div className="px-3 py-2 min-w-[120px]">
          {isPrescription ? (
            files.length > 0 ? (
              <>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" size="sm" className="text-xs">
                  View ({files.length})
                </Button>
                <DocumentModal files={files} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No documents</span>
            )
          ) : (
            <span className="text-xs text-gray-400 italic"></span>
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
        {row.original.status === "rejected" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>}
        {row.original.status === "referred" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Referred</span>}
        {row.original.status === "on referred" && <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">On Referred</span>}
      </div>
    )
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isActionModalOpen, setIsActionModalOpen] = useState(false);
      const [isReferOpen, setIsReferOpen] = useState(false);
      const status = row.original.status;

      // Only show action buttons for pending items of type "Prescription"

      return (
        <div className="flex justify-center gap-2">
          {status === "pending" ? (
            <>
              {/* Refer Button */}
              <Button size="sm" variant="outline" onClick={() => setIsReferOpen(true)}>
          Refer Request
              </Button>

              {/* ActionModal Button */}
              <Button size="sm" variant="destructive" className="text-xs" onClick={() => setIsActionModalOpen(true)}>
          Reject Document
              </Button>

              {/* ActionModal Modal */}
              <ActionModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          data={row.original}
          mode="reject"
              />

              <ActionModal
          isOpen={isReferOpen}
          onClose={() => setIsReferOpen(false)}
          data={row.original}
          mode="refer"
              />
            </>
          ) : (
            <span className="text-xs text-gray-500 italic">
              {status !== "pending" ? "Action completed" : "Actions not available"}
            </span>
          )}
        </div>
      );
    }
  }
];