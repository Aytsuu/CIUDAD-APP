import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { FamilyRecord} from "../profilingTypes";

// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyColumns: ColumnDef<FamilyRecord>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family (#)
        <ArrowUpDown size={14} />
      </div>
    ),
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
  },
  {
    accessorKey: 'noOfDependents',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        (#) of Dependents
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: 'building',
    header: 'Building'
  },
  {
    accessorKey: 'indigenous',
    header: 'Indigenous?'
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
      <Link to="">
        <Button variant={"outline"}>
          View <MoveRight />
        </Button>
      </Link>
    )
  },
]

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

