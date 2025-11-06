import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewButton from "@/components/ui/view-button";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const useChildImmunizationColumns = (): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "child",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Child <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{toTitleCase(fullName)}</div>
              <div className="text-sm text-darkGray">
                {toTitleCase(row.original.sex)}, {row.original.age}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "mother",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Mother <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const fullName = `${row.original.mother_lname}, ${row.original.mother_fname} ${row.original.mother_mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{toTitleCase(fullName)}</div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "father",
      header: "Father",
      cell: ({ row }) => {
        const fullName = `${row.original.father_lname}, ${row.original.father_fname} ${row.original.father_mname}`.trim();
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{toTitleCase(fullName)}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-[250px] break-words">{toTitleCase(row.original.address)}</div>
        </div>
      ),
    },
    {
      accessorKey: "family_no",
      header: "Family No.",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.family_no || "N/A"}</div>
        </div>
      ),
    },
    // {
    //   accessorKey: "delivery_type",
    //   header: "Delivery Type",
    //   cell: ({ row }) => (
    //     <div className="flex justify-center min-w-[120px] px-2">
    //       <div className="text-center w-full">{toTitleCase(row.original.delivery_type || "N/A")}</div>
    //     </div>
    //   )
    // },
    {
      accessorKey: "pat_type",
      header: "Patient Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{toTitleCase(row.original.pat_type || "N/A")}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <ViewButton
            onClick={() => {
              // Clear localStorage before navigation
              localStorage.removeItem("immunization_vaccines");
              localStorage.removeItem("immunization_existing_vaccines");
              localStorage.removeItem("immunization_vital_signs");
              localStorage.removeItem("immunization_form_data");

              navigate("/child-immunization", {
                state: {
                  ChildHealthRecord: row.original,
                  mode: "immunization",
                },
              });
            }}
          />
        </div>
      ),
    },
  ];
};
