// childHealthColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewButton from "@/components/ui/view-button";import { ChildHealthRecord } from "../../forms/multi-step-form/types";

export const childColumns: ColumnDef<ChildHealthRecord>[] = [
  {
    accessorKey: "child",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Child <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => {
      const fullName =
        `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
      return (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">{fullName}</div>
            <div className="text-sm text-darkGray">
              {row.original.sex}, {row.original.age} old
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "mother",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Mother <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => {
      const fullName =
        `${row.original.mother_lname}, ${row.original.mother_fname} ${row.original.mother_mname}`.trim();
      return (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">{fullName}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Address <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-start px-2">
        <div className="w-[250px] break-words">{row.original.address}</div>
      </div>
    ),
  },
  {
    accessorKey: "family_no",
    header: "Family No.",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full">{row.original.family_no}</div>
      </div>
    ),
  },
  {
    accessorKey: "sitio",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sitio <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full">{row.original.sitio}</div>
      </div>
    ),
  },
  {
    accessorKey: "pat_type",
    header: "Patient Type",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full capitalize">
          {row.original.pat_type.toLowerCase()}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();
 
      return (
            <ViewButton
              onClick={() =>
              navigate(`/child-health-records`, {
                state: {
                ChildHealthRecord: row.original,
                mode: "addnewchildhealthrecord",
                },
              })
              }
            />
      );
    },
  }
];