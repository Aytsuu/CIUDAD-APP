import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewButton from "@/components/ui/view-button";
import { toTitleCase } from "@/helpers/ToTitleCase";
import { getPatType } from "@/pages/record/health/patientsRecord/PatientsRecordMain";

export const vaccinationColumns: ColumnDef<any>[] = [
  {
    accessorKey: "patient_no",
    header: ({ column }) => (
      <div className="flex w-full gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Patient No. <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[120px] ">
        <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md text-center font-semibold">{row.original.pat_id}</div>
      </div>
    )
  },
  {
    accessorKey: "patient",
    header: ({ column }) => (
      <div className="flex gap-2 cursor-pointer py-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span>Patient</span> <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => {
      const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
      return (
        <div className="py-2">
          <div className="font-medium break-words">{toTitleCase(fullName)}</div>
          <div className="text-sm text-darkGray">
            {toTitleCase(row.original.sex || "")}, {row.original.age}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "address",
    size: 300,
    header: ({ column }) => (
      <div className="flex gap-2 cursor-pointer py-2 " onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        <span>Address</span> <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="py-2 px-4 whitespace-pre-wrap break-words">
        {toTitleCase(row.original.address || "No address provided")}
      </div>
    )
  },
  {
    accessorKey: "sitio",
    header: "Sitio",
    cell: ({ row }) => (
      <div className="flex min-w-[120px]">
        <div className="w-full">{toTitleCase(row.original.sitio || "N/A")}</div>
      </div>
    )
  },
  {
    accessorKey: "pat_type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex min-w-[100px]">
        <div className={getPatType(row.original.pat_type)}>
          {toTitleCase(row.original.pat_type)}
        </div>
      </div>
    )
  },
  {
    accessorKey: "vaccination_count",
    header: "No of Records",
    cell: ({ row }) => (
      <div className="flex min-w-[100px]">
        <div className="w-full">{row.original.vaccination_count}</div>
      </div>
    )
  },
  {
    accessorKey: "latest_vaccination_date",
    header: "Latest Record Date",
    cell: ({ row }) => (
      <div className="flex min-w-[120px] ">
        <div className="w-full">
          {row.original.latest_vaccination_date
            ? new Date(row.original.latest_vaccination_date).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                day: "2-digit",
              })
            : "N/A"}
        </div>
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