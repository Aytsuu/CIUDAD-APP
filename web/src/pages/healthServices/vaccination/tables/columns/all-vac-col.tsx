// src/features/vaccination/components/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { BasicInfoVaccinationRecord } from "./types";

export const vaccinationColumns: ColumnDef<BasicInfoVaccinationRecord>[] = [
  {
    accessorKey: "patient",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Patient <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => {
      const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
      return (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">{fullName}</div>
            <div className="text-sm text-darkGray">
              {row.original.sex}, {row.original.age}
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Address <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-start min-w-[200px] px-2">
        <div className="w-full truncate">{row.original.address ? row.original.address : "No address provided"}</div>
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
        <div className="text-center w-full">{row.original.pat_type}</div>
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
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
          <Link
            to="/invVaccinationRecord"
            state={{
              params: {
                patientData: {
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
                }
              }
            }}
          >
            View
          </Link>
        </div>
      </div>
    )
  }
];
