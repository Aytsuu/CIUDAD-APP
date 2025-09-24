// all-medical-records-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import ViewButton from "@/components/ui/view-button";

export const getAllMedicalRecordsColumns = (): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "pat_id",
      header: "Patient ID",
      cell: ({ row }) => <div className="flex justify-center ">{row.original.pat_id}</div>
    },
    {
      accessorKey: "patient",
      header: ({ column }: { column: any }) => (
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
          <div className="w-full whitespace-pre-wrap break-words">
            {row.original.address ? row.original.address : "No address provided"}
          </div>
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
      accessorKey: "medicalrec_count",
      header: "No of Records",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.medicalrec_count}</div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
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
            per_sex: row.original.sex,
            per_contact: row.original.contact
          }
        };

        return (
          <ViewButton
            onClick={() => {
              navigate("/services/medical-consultation/records", {
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
};

export const exportColumns = [
  {
    key: "index",
    header: "#",
    format: (value: number) => value + 1 // Adjusting index for export
  },
  {
    key: "patient",
    header: "Patient",
    format: (row: any) => `${row.lname}, ${row.fname} ${row.mname}`.trim()
  },
  {
    key: "sex_age",
    header: "Sex/Age",
    format: (row: any) => `${row.sex}, ${row.age}`
  },
  {
    key: "address",
    header: "Address",
    format: (row: any) => row.address || "No address provided"
  },
  {
    key: "sitio",
    header: "Sitio",
    format: (row: any) => row.sitio || "N/A"
  },
  {
    key: "pat_type",
    header: "Type",
    format: (row: any) => row.pat_type
  },
  {
    key: "medicalrec_count",
    header: "No of Records",
    format: (row: any) => row.medicalrec_count
  }
];
