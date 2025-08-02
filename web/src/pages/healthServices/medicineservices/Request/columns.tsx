import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { MedicineRequest } from "./types";
import { calculateAge } from "@/helpers/ageCalculator";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

const getPatientDisplayInfo = (request: MedicineRequest) => {
  const personalInfo = request.personal_info || {};
  const fullName =
    [personalInfo.per_lname, personalInfo.per_fname, personalInfo.per_mname]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unknown Patient";

  const dob = personalInfo.per_dob;
  const age = dob ? calculateAge(dob) : "N/A";
  const sex = personalInfo.per_sex || "N/A";
  const contact = personalInfo.per_contact || "N/A";

  return { fullName, age, sex, contact };
};

export const medicineRequestColumns: ColumnDef<MedicineRequest>[] = [
    {
        accessorKey: "request_id",
        header: "Request ID",
        cell: ({ row }) => (
            <div className="flex justify-center min-w-[100px] px-2">
                <div className="text-center w-full">
                    {row.original.medreq_id || "N/A"}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "patient",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Patient <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => {
            const { fullName, age, sex, contact } = getPatientDisplayInfo(
                row.original
            );
            const id = row.original.pat_id || row.original.rp_id;

            return (
                <div className="flex justify-start min-w-[200px] px-2">
                    <div className="flex flex-col w-full">
                        <div className="font-medium truncate">{fullName}</div>
                        <div className="text-sm text-darkGray">
                            {sex}, {age}
                        </div>
                        <div className="text-sm text-darkGray">{contact}</div>
                        {id && (
                            <div className="text-xs text-blue-600">
                                {row.original.pat_id
                                    ? `Patient ID: ${id}`
                                    : `Resident ID: ${id}`}
                            </div>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <div className="flex justify-start min-w-[200px] px-2">
                <div className="w-full truncate">
                    {row.original.address?.full_address || "No address provided"}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "requested_at",
        header: "Request Date",
        cell: ({ row }) => (
            <div className="flex justify-center min-w-[150px] px-2">
                <div className="text-center w-full">
                    {row.original.requested_at
                        ? new Date(row.original.requested_at).toLocaleDateString()
                        : "N/A"}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "total_quantity",
        header: "Total Quantity",
        cell: ({ row }) => (
            <div className="flex justify-center min-w-[100px] px-2">
                <div className="text-center w-full font-semibold text-blue-600">
                    {row.original.total_quantity || 0}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <div className="flex justify-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={!row.original.medreq_id}
                    aria-label="View details"
                >
                    <Link
                        to="/medicine-request-detail"
                        state={{ request: row.original }}
                    >
                        View
                    </Link>
                </Button>
            </div>
        ),
    },
];