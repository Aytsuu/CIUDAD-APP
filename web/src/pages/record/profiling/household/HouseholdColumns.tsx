import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { HouseholdRecord } from "../profilingTypes";
import { Row } from "react-day-picker";

// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const householdColumns: ColumnDef<HouseholdRecord>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Household (#)
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: 'streetAddress',
    header: 'Street Address',
  },
  {
    accessorKey: 'sitio',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sitio
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: 'nhts',
    header: 'NHTS?',
  },
  {
    accessorKey: 'head',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Head
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <span className="bg-green-500 text-white py-1 px-2 text-[14px] rounded-md">{"# " + row.original.headNo}</span>
          {row.original.head}
        </div>
    )
  },
  {
    accessorKey: 'dateRegistered',
    header: 'Date Registered'
  },
  {
    accessorKey: 'registeredBy',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Registered By
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: 'action',
    cell: ({ row }) => (
        <Link to="/" state={{params: {data: row.original.id}}}>
            <Button variant={"outline"}>
                View <MoveRight/>
            </Button>
        </Link>
    )
  },
]

// -----------------------------------------------------------------------------------------------------------------------------------------------------------