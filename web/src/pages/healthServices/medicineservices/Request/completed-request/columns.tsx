import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { calculateAge } from "@/helpers/ageCalculator";
import { useNavigate } from "react-router-dom";
import ViewButton from "@/components/ui/view-button";
import { DocumentModal } from "../../tables/columns/inv-med-col";
import { useState } from "react";
import { formatDateTime } from "@/helpers/dateHelper";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const medicineRequestCompletedColumns: ColumnDef<any>[] = [
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
        <div className="text-center font-medium">{row.original.medreq_id.toString().padStart(5, "0")}</div>
      </div>
    )
  },
  {
    accessorKey: "personal_info",
    header: () => <div className="text-center">Patient Information</div>,
    size: 220,
    cell: ({ row }) => {
      const personalInfo = row.original.personal_info || {};
      const fullName = [personalInfo.per_lname, personalInfo.per_fname, personalInfo.per_mname, personalInfo.per_suffix]
        .filter(Boolean)
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
    accessorKey: "total_quantity",
    header: () => <div className="text-center">Total Items</div>,
    size: 100,
    cell: ({ row }) => (
      <div className="text-center py-2">
        <div className="font-semibold text-blue-600">{row.original.item_counts.completed || 0}</div>
      </div>
    )
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
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    size: 100,
    cell: ({ row }) => {
      const navigate = useNavigate();
      const address = row.original.address || {};
      
      return (
        <div className="flex justify-center py-2">
          <ViewButton
            onClick={() => {
              navigate(`/services/medicine/requests/completed/view`, {
                state: {
                  params: {
                    medreq_id: row.original.medreq_id,
                    patientData: {
                      pat_id: row.original.pat_id,
                      pat_type: row.original.pat_type,
                      age: row.original.age,
                      addressFull: address.full_address || "No address provided",
                      address: {
                        add_street: address.add_street || "",
                        add_barangay: address.add_barangay || "",
                        add_city: address.add_city || "",
                        add_province: address.add_province || "",
                        add_sitio: address.add_sitio || ""
                      },
                      households: [{ hh_id: row.original.householdno }],
                      personal_info: {
                        per_fname: row.original.personal_info?.per_fname || "",
                        per_mname: row.original.personal_info?.per_mname || "",
                        per_lname: row.original.personal_info?.per_lname || "",
                        per_dob: row.original.personal_info?.per_dob || "",
                        per_sex: row.original.personal_info?.per_sex || ""
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
]

  

export const completedDetailsIColumns: ColumnDef<any>[] = [
    {
      id: "index",
      header: () => <div className="text-center">#</div>,
      size: 50,
      cell: ({ row, table }) => {
        return <div className="text-center">{table.getRowModel().rows.indexOf(row) + 1}</div>;
      }
    },
    {
        accessorKey: "requested_at",
        header: ({ column }) => (
          <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Requested Date <ArrowUpDown size={15} />
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
      accessorKey: "medicine",
      header: () => <div className="text-center">Medicine Details</div>,
      size: 300,
      cell: ({ row }) => {
        // Use formatted_med_name which includes dosage and form (e.g., "Paracetamol 500mg Tablet")
        const formattedName = row.original.med_name 
    
        
        const medType = row.original.med_type ? toTitleCase(row.original.med_type) : "No type provided";
        
        // Show dosage and form info separately if available
        const dosageInfo = row.original.dosage && row.original.dosage_unit 
          ? `${row.original.dosage}${row.original.dosage_unit}`
          : row.original.dosage 
            ? row.original.dosage 
            : null;
        
        const formInfo = row.original.form ? toTitleCase(row.original.form) : null;
  
        return (
          <div className="px-3 py-2">
            <div className="text-center space-y-1">
              <div className="font-semibold text-gray-900">{formattedName}</div>
              <div className="text-sm text-gray-600">{medType}</div>
              {(dosageInfo || formInfo) && (
                <div className="text-xs text-gray-500">
                  {dosageInfo && <span className="font-medium">{dosageInfo}</span>}
                  {dosageInfo && formInfo && <span className="mx-1">•</span>}
                  {formInfo && <span>{formInfo}</span>}
                </div>
              )}
            </div>
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
      accessorKey: "total_allocated_qty",
      header: () => <div className="text-center">Total Qty Given</div>,
      size: 120,
      cell: ({ row }) => {
        const allocated = row.original.total_allocated_qty || 0;
  
        return (
          <div className="text-center py-2">
            <div className="font-medium text-green-600">{allocated}</div>
          
          </div>
        );
      }
    },
   
    {
        accessorKey: "fulfilled_at",
        header: ({ column }) => (
          <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Fulfilled Date <ArrowUpDown size={15} />
          </div>
        ),
        size: 140,
        cell: ({ row }) => {
          const { date, time } = formatDateTime(row.original.fulfilled_at);
          return (
          <div className="text-center py-2">
            <div className="font-medium text-gray-900 text-sm">{date}</div>
            {time && <div className="text-xs text-gray-500 mt-1">{time}</div>}
          </div>
          );
        }
      }, 
   
    
  ];