import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Ellipsis } from "lucide-react";
import { AdministrationRecord } from "./administrationTypes";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Button } from "@/components/ui/button/button";
import { IdCard } from "lucide-react";

export const administrationColumns: ColumnDef<AdministrationRecord>[] = [
  {
    accessorKey: "icon",
    header: "",
    cell: () => (
      <IdCard size={24} className="text-green-600 w-full text-center"/>
    ),
  },
  {
    accessorKey: "staff_id",
    header: ({ column }) => (
      <div
        className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Staff ID
        <TooltipLayout trigger={<ArrowUpDown size={15} />} content={"Sort"} />
      </div>
    ),
  },
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
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("mname") ? row.getValue("mname") : "-"}
      </div>
    ),
  },
  {
    accessorKey: "contact",
    header: "Contact",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "staff_assign_date",
    header: "Date Assigned",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <DropdownLayout
        trigger={
          <Button variant={"outline"} className="border">
            <Ellipsis />
          </Button>
        }
        options={[]}
      />
    ),
  },
];
