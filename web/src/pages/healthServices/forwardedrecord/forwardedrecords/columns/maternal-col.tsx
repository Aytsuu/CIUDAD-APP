import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ViewButton from "@/components/ui/view-button";

import { capitalize } from "@/helpers/capitalize";

export const useMaternalColumns = (): ColumnDef<any>[] => {
  const navigate = useNavigate();

  return [
    {
      accessorKey: "patient",
      size: 250,
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
              <div className="font-medium truncate ">{capitalize(fullName)}</div>
              <div className="text-xs text-darkGray">
                {row.original.sex}, {row.original.age}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "record",
      header: "Record",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.record || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "pat_type",
      header: "Patient Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full capitalize">{row.original.pat_type?.toLowerCase() || "N/A"}</div>
        </div>
      )
    },
    {
      accessorKey: "address",
      size: 300,
      header: ({ column }) => (
        <div className="flex w-full justify-center items-center gap-2 cursor-pointer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center px-2">
          <div className="break-words">{capitalize(row.original.address)}</div>
        </div>
      )
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ }) => (
        <div className="flex justify-center gap-2">
          <div className="text-black px-3 py-1.5 rounded cursor-pointer">
            <ViewButton
              onClick={() => {
                navigate("/", {
                  state: {
                  }
                });
              }}
            />
          </div>
        </div>
      )
    }
  ];
};