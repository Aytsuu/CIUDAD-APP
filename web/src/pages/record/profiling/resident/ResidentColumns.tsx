import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import { ArrowUpDown, CircleAlert, MoveRight } from "lucide-react";
import { ResidentRecord } from "../profilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const residentColumns = (residents: any[]): ColumnDef<ResidentRecord>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Resident (#)
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "householdNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Household (#)
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
        const familyNo: string = row.getValue("familyNo");
        
        return familyNo ? (<div>{familyNo}</div>) :
        (<TooltipLayout
            trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
            content={"Family not registered"}
        />)
    },
  },
  {
    accessorKey: "familyNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family (#)
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
        const familyNo: string = row.getValue("familyNo");
        
        return familyNo ? (<div>{familyNo}</div>) :
        (<TooltipLayout
            trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
            content="Family not registered"
        />)
    },
  },
  {
    accessorKey: "sitio",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sitio
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
        const familyNo: string = row.getValue("familyNo");
        
        return familyNo ? (<div>{familyNo}</div>) :
        (<TooltipLayout
            trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
            content="Family not registered"
        />)
    },
  },
  {
    accessorKey: "lname",
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
        {row.getValue("lname")}
      </div>
    ),
  },
  {
    accessorKey: "fname",
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
        {row.getValue("fname")}
      </div>
    ),
  },
  {
    accessorKey: "mname",
    header: "Middle Name",
    cell: ({ row }) => (
        <div className="hidden lg:block max-w-xs truncate">
          {row.getValue("mname")}
        </div>
    ),
  },
  {
    accessorKey: "suffix",
    header: "Suffix",
    cell: ({ row }) => (
        <div className="hidden lg:block max-w-xs truncate">
          {row.getValue("suffix")}
        </div>
    ),
  },
  {
    accessorKey: "dateRegistered",
    header: "Date Registered",
    cell: ({ row }) => (
        <div className="hidden lg:block max-w-xs truncate">
          {row.getValue("dateRegistered")}
        </div>
    ),
  },
  {
    accessorKey: "registeredBy",
    header: "Registered By",
    cell: ({ row }) => (
        <div className="hidden lg:block max-w-xs truncate">
          {row.getValue("registeredBy")}
        </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to="/resident-form" 
        state={{
          params: {
            type: 'viewing',
            title: 'Resident Details',
            description: 'Information is displayed in a clear, organized, and secure manner.',
            data: residents.find((resident) => resident.per_id === row.original.id),
          }
        }}
      >
        <Button variant="outline">
          View <MoveRight/>
        </Button>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];