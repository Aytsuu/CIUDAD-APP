import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { calculateAge } from "@/helpers/ageCalculator";
import { Link } from "react-router-dom";
import { DocumentModal } from "../../tables/columns/inv-med-col";
import { useState } from "react";
const getPatientDisplayInfo = (request: any) => {
  const personalInfo = request.personal_info || {};
  const fullName = [personalInfo.per_fname, personalInfo.per_lname, personalInfo.per_mname].filter(Boolean).join(" ").trim() || "Unknown Patient";

  const dob = personalInfo.per_dob;
  const age = dob ? calculateAge(dob) : "N/A";
  const sex = personalInfo.per_sex || "N/A";
  const contact = personalInfo.per_contact || "N/A";

  return { fullName, age, sex, contact };
};

export const medicineRequestColumns: ColumnDef<any>[] = [
  {
    accessorKey: "medreq_id",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Request ID <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[120px] px-2">
        <div className="text-center font-medium">{row.original.medreq_id || "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "patient",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Patient <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => {
      const { fullName, age, sex, contact } = getPatientDisplayInfo(row.original);
      const patientId = row.original.pat_id_value || row.original.pat_id;

      return (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">{fullName}</div>
            <div className="text-sm text-darkGray">
              {sex}, {age}
            </div>
            <div className="text-sm text-darkGray">{contact}</div>
            {patientId && <div className="text-xs text-blue-600">Patient ID: {patientId}</div>}
            <div className="text-xs text-gray-500">Type: {row.original.pat_type || "N/A"}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="flex justify-start min-w-[200px] px-2">
        <div className="w-full truncate">{row.original.address?.full_address || "No address provided"}</div>
      </div>
    )
  },
  {
    accessorKey: "requested_at",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Request Date <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[150px] px-2">
        <div className="text-center w-full">{row.original.requested_at ? new Date(row.original.requested_at).toLocaleDateString() : "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full capitalize">{row.original.mode || "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "total_quantity",
    header: () => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer">
        Total Items <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full font-semibold text-blue-600">{row.original.total_confirmed ?? 0}</div>
      </div>
    )
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" asChild disabled={!row.original.medreq_id} aria-label="View details">
          <Link
            to={"/medicine-request-detail"}
            state={{
              params: {
                request: row.original,
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
            View
          </Link>
        </Button>
      </div>
    )
  }
];

export const confirmedItemsColumns: ColumnDef<any>[] = [
  {
    accessorKey: "medicine",
    header: "Medicine Details",
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <div className="min-w-[250px] px-3 py-2">
          <div className="font-semibold text-gray-900">{row.original.med_name || "No name provided"}</div>
          <div>{row.original.med_type || "No type provided"}</div>
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
            <span className="text-xs text-gray-400 italic">N/A</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div className="min-w-[100px] px-3 py-2 text-center">{row.original.medreqitem_qty || 0}</div>
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <></>
  }
];
