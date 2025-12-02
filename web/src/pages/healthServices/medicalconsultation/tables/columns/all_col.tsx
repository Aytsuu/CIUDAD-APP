import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown } from "lucide-react";
import ViewButton from "@/components/ui/view-button";
import { toTitleCase } from "@/helpers/ToTitleCase";
import { getPatType } from "@/pages/record/health/patientsRecord/PatientsRecordMain";

export const getAllMedicalRecordsColumns = (): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "pat_id",
      header: "Patient ID",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-2 sm:px-3 py-1 rounded-md text-center font-semibold text-xs sm:text-sm">
            {row.original.pat_id || ""}
          </div>
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
      header: ({ column }) => (
        <div className="flex justify-center items-center gap-2 cursor-pointer py-2 px-4" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <span className="text-center">Address</span> <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center py-2 px-4 whitespace-pre-wrap break-words">
          {toTitleCase(row.original.address || "No address provided")}
        </div>
      )
    },
    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{toTitleCase(row.original.sitio || "N/A")}</div>
        </div>
      )
    },
    {
      accessorKey: "pat_type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className={getPatType(row.original.pat_type)}>
            {toTitleCase(row.original.pat_type)}
          </div>
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
      accessorKey: "latest_consultation_date",
      header: "Latest Consultation Date",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[150px] px-2">
          <div className="text-center w-full">
            {row.original.latest_consultation_date
              ? new Date(row.original.latest_consultation_date).toLocaleDateString("en-US", {
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
        const patientData = {
          pat_id: row.original.pat_id || "",
          pat_type: row.original.pat_type || "",
          age: row.original.age || "",
          addressFull: row.original.address || "No address provided",
          address: {
            add_street: row.original.street || "",
            add_barangay: row.original.barangay || "",
            add_city: row.original.city || "",
            add_province: row.original.province || "",
            add_sitio: row.original.sitio || ""
          },
          households: [{ hh_id: row.original.householdno || "" }],
          personal_info: {
            per_fname: row.original.fname || "",
            per_mname: row.original.mname || "",
            per_lname: row.original.lname || "",
            per_dob: row.original.dob || "",
            per_sex: row.original.sex || "",
            per_contact: row.original.contact || "",
            per_status: row.original.per_status || ""
          },
          additional_info: {
            philhealth_id: row.original.philhealth_id || ""
          }
        };

        return (
          <ViewButton
            onClick={() => {
              navigate("/services/medical-consultation/records/individual-records", {
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