import { ColumnDef } from "@tanstack/react-table";
import { AdministrationRecord } from "../administration/AdministrationTypes";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ArrowUpDown } from "lucide-react";

export const teamColumns: ColumnDef<AdministrationRecord>[] = [
  {
    accessorKey: "lname",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
  },
  {
    accessorKey: "fname",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
  },
  {
    accessorKey: "mname",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Middle Name
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    )
  },
  {
    accessorKey: "sex",
    header: "Sex",
    cell: ({row}) => (
      row.original.sex[0]?.toUpperCase()
    ),
    size: 60
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => (
      <p className="py-2">
        {row.original.position}
      </p>
    ),
  },
  ]