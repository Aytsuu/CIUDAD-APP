// src/features/vaccination/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewButton from "@/components/ui/view-button";

export const vaccinationColumns: ColumnDef<any>[] = [
  {
    accessorKey: "patient_no",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Patient No. <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[120px] px-2">
        <div className="text-center w-full">{row.original.pat_id}</div>
      </div>
    )
  },
  {
    accessorKey: "patient",
    header: ({ column }) => (
      <div className="flex justify-center items-center gap-2 cursor-pointer py-2 px-4" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span className="text-center">Patient</span> <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => {
      const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
      return (
        <div className="text-center py-2 px-4">
          <div className="font-medium break-words ">{fullName}</div>
          <div className="text-sm text-darkGray">
            {row.original.sex}, {row.original.age}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <div className="flex justify-center items-center gap-2 cursor-pointer py-2 px-4" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span className="text-center">Address</span> <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center py-2 px-4 whitespace-pre-wrap break-words">
        {row.original.address ? row.original.address : "No address provided"}
      </div>
    )
  },
  {
    accessorKey: "sitio",
    header: "Sitio",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[120px] px-2">
        <div className="text-center w-full">{row.original.sitio || "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full"> {row.original.pat_type.toUpperCase()}</div>
      </div>
    )
  },
  {
    accessorKey: "vaccination_count",
    header: "No of Records",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full">{row.original.vaccination_count}</div>
      </div>
    )
  },
  {
    accessorKey: "latest_vaccination_date",
    header: "Latest Vaccination Date",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[120px] px-2">
        <div className="text-center w-full"> {new Date(row.original.latest_vaccination_date).toLocaleDateString()}</div>
      </div>
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const patientData = {
        pat_id: row.original.pat_id,
        pat_type: row.original.pat_type,
        age: row.original.age,
        addressFull: row.original.address || "No address provided",
        address: {
          add_street: row.original.street,
          add_barangay: row.original.barangay,
          add_city: row.original.city,
          add_province: row.original.province,
          add_sitio: row.original.sitio
        },
        households: [{ hh_id: row.original.householdno }],
        personal_info: {
          per_fname: row.original.fname,
          per_mname: row.original.mname,
          per_lname: row.original.lname,
          per_dob: row.original.dob,
          per_sex: row.original.sex
        }
      };

      return (
        <ViewButton
          onClick={() => {
            navigate("/services/vaccination/records", {
              state: {
                params: {
                  patientData
                }
              }
            });
          }}
        />
      );
    }
  }
];
