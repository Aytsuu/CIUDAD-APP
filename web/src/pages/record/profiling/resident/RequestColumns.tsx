import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleChevronRight, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import { RequestRecord } from "../profilingTypes";
import { Label } from "@/components/ui/label";

// Define the colums for the data table
export const requestColumns: ColumnDef<RequestRecord>[] = [
  {
    accessorKey: "req_id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Request (#)
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "per_lname",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("per_lname")}
      </div>
    ),
  },
  {
    accessorKey: "per_fname",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("per_fname")}
      </div>
    ),
  },
  {
    accessorKey: "per_mname",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Middle Name
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "req_date",
    header: "Date Requested",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        to="/resident/form"
        state={{
          params: {
            type: "request",
            title: "Registration Request",
            description:
              "This is a registration request submitted by the user. Please review the details and approve or reject accordingly.",
            data: row.original,
          },
        }}
      >
        <div className="group flex justify-center items-center gap-2 px-3 py-2
                  rounded-lg border-none shadow-none hover:bg-muted
                  transition-colors duration-200 ease-in-out">
          <Label className="text-black/40 cursor-pointer group-hover:text-buttonBlue
                  transition-colors duration-200 ease-in-out">
            View
          </Label> 
          <CircleChevronRight
            size={35}
            className="stroke-1 text-black/40 group-hover:fill-buttonBlue 
                group-hover:stroke-white transition-all duration-200 ease-in-out"
          />
        </div>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
