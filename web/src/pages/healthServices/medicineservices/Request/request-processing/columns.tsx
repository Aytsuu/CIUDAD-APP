import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { calculateAge } from "@/helpers/ageCalculator";
import { useNavigate } from "react-router-dom";
import ViewButton from "@/components/ui/view-button";
import { DocumentModal } from "../../tables/columns/inv-med-col";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/helpers/dateHelper";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const medicineRequestColumns: ColumnDef<any>[] = [
  {
    id: "index",
    header: () => <div className="text-center">#</div>,
    size: 50,
    cell: ({ row, table }) => {
      return <div className="text-center">{table.getRowModel().rows.indexOf(row) + 1}</div>;
    }
  },
  {
    accessorKey: "medreq_id",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Request ID <ArrowUpDown size={15} />
      </div>
    ),
    size: 120,
    cell: ({ row }) => (
      <div className="flex justify-center px-2 py-2">
        <div className="text-center font-medium">{row.original.medreq_id || "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "patient",
    header: () => <div className="text-center">Patient Information</div>,
    size: 220,
    cell: ({ row }) => {
      const personalInfo = row.original.personal_info || {};
      const fullName =
        [personalInfo.per_lname, personalInfo.per_fname, personalInfo.per_mname, personalInfo.per_suffix]
          .filter(Boolean)
          .map((name) => toTitleCase(String(name)))
          .join(", ")
          .trim() || "Unknown Patient";
      const age = personalInfo.per_dob ? calculateAge(personalInfo.per_dob) : "N/A";
      const sex = personalInfo.per_sex ? toTitleCase(personalInfo.per_sex) : "N/A";

      return (
        <div className="px-2 py-2">
          <div className="text-center space-y-1">
            <div className="font-medium text-gray-900 break-words whitespace-normal" title={fullName}>
              {fullName}
            </div>
            <div className="text-xs text-gray-400">
              {sex} • {age}
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "address",
    header: () => <div className="text-center">Address</div>,
    size: 250,
    cell: ({ row }) => {
      const address = row.original.address;
      const addressText = address
        ? [address.add_street, address.add_sitio, address.add_barangay, address.add_city, address.add_province]
            .filter(Boolean)
            .map((addr) => toTitleCase(String(addr)))
            .join(", ")
        : "No address provided";
      return (
        <div className="px-2 py-2">
          <div className="text-sm text-gray-700 break-words whitespace-normal text-center leading-relaxed" title={addressText}>
            {addressText}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "requested_at",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Requested On <ArrowUpDown size={15} />
      </div>
    ),
    size: 140,
    cell: ({ row }) => {
      const { date, time } = formatDateTime(row.original.requested_at);
      return (
        <div className="text-center py-2">
          <div className="font-medium text-gray-900 text-sm">{date}</div>
          {time && <div className="text-xs text-gray-500 mt-1">{time}</div>}
        </div>
      );
    }
  },
  {
    accessorKey: "mode",
    header: () => <div className="text-center">Mode</div>,
    size: 100,
    cell: ({ row }) => {
      const mode = row.original.mode?.toLowerCase();
      let badgeClass = "text-gray-500 bg-gray-50 border-gray-400";
      let displayMode = row.original.mode || "N/A";

      if (mode === "walk-in") {
        badgeClass = "text-purple-600 bg-purple-50 border-purple-500";
        displayMode = "Walk-In";
      } else if (mode === "app") {
        badgeClass = "text-orange-600 bg-orange-50 border-orange-500";
        displayMode = "App";
      } else if (displayMode !== "N/A") {
        displayMode = toTitleCase(displayMode);
      }

      return (
        <div className="flex justify-center py-2">
          <Badge variant="outline" className={`px-3 py-1 text-xs font-medium ${badgeClass}`}>
            {displayMode}
          </Badge>
        </div>
      );
    }
  },
  {
    accessorKey: "total_allocated_quantity",
    header: () => <div className="text-center">Total Items</div>,
    size: 100,
    cell: ({ row }) => (
      <div className="text-center py-2">
        <div className="font-semibold text-blue-600">{row.original.total_allocated_quantity ?? 0}</div>
      </div>
    )
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    size: 100,
    cell: ({ row }) => {
      const navigate = useNavigate();
      return (
        <div className="flex justify-center py-2">
          <ViewButton
            onClick={() => {
              navigate("/request/medicine/pending-pickup", {
                state: {
                  params: {
                    request: row.original,
                    patientData: {
                      pat_type: row.original.pat_type,
                      age: row.original.age,
                      addressFull: row.original.address?.full_address || "No address provided",
                      address: row.original.address
                        ? {
                            add_street: row.original.address.add_street,
                            add_barangay: row.original.address.add_barangay,
                            add_city: row.original.address.add_city,
                            add_province: row.original.address.add_province,
                            add_sitio: row.original.address.add_sitio
                          }
                        : {},
                      households: [{ hh_id: row.original.householdno }],
                      personal_info: {
                        per_fname: row.original.personal_info?.per_fname,
                        per_mname: row.original.personal_info?.per_mname,
                        per_lname: row.original.personal_info?.per_lname,
                        per_dob: row.original.personal_info?.per_dob,
                        per_sex: row.original.personal_info?.per_sex
                      }
                    }
                  }
                }
              });
            }}
          />
        </div>
      );
    }
  }
];

export const confirmedItemsColumns: ColumnDef<any>[] = [
  {
    id: "index",
    header: () => <div className="text-center">#</div>,
    size: 50,
    cell: ({ row, table }) => {
      return <div className="text-center">{table.getRowModel().rows.indexOf(row) + 1}</div>;
    }
  },
  {
    accessorKey: "medicine",
    header: () => <div className="text-center">Medicine Details</div>,
    size: 250,
    cell: ({ row }) => {
      const medName = row.original.med_name ? toTitleCase(row.original.med_name) : "No name provided";
      const medType = row.original.med_type ? toTitleCase(row.original.med_type) : "No type provided";

      return (
        <div className="px-3 py-2">
          <div className="text-center space-y-1">
            <div className="font-semibold text-gray-900">{medName}</div>
         <div className="text-sm text-gray-600 mt-1">
            {row.original.med_dsg} {row.original.med_dsg_unit}  . {row.original.med_form}
          </div>
            <div className="text-sm text-gray-600">{medType}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "reason",
    header: () => <div className="text-center">Reason</div>,
    size: 250,
    cell: ({ row }) => {
      const reason = row.original.reason ? toTitleCase(row.original.reason) : "No reason provided";

      return (
        <div className="px-3 py-2">
          <div className="text-sm text-gray-700 break-words whitespace-normal text-center leading-relaxed line-clamp-3">{reason}</div>
        </div>
      );
    }
  },
  {
    id: "documents",
    header: () => <div className="text-center">Documents</div>,
    size: 120,
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const files = row.original.medicine_files || [];
      const med_type = row.original.med_type || "Prescription";
      const isPrescription = med_type === "Prescription";

      return (
        <div className="px-3 py-2 text-center">
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
    header: () => <div className="text-center">Quantity</div>,
    size: 100,
    cell: ({ row }) => (
      <div className="text-center py-2">
        <div className="font-medium text-gray-900">{row.original.medreqitem_qty || 0}</div>
      </div>
    )
  }
];
