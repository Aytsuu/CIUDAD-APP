import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import { ArrowUpDown, CircleAlert, MoveRight, UserRoundCheck, UserRoundX } from "lucide-react";
import { ResidentRecord } from "../profilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const residentColumns = (residents: any[]): ColumnDef<ResidentRecord>[] => [
  {
    accessorKey: 'account',
    header: '',
    cell: ({ row }) => {
      const resident = residents.find((resident) => resident.rp_id === row.original.id)
      const account = resident?.account

      return (
        <div className="w-7 h-7 flex items-center justify-center">
          {account ? (<UserRoundCheck size={18} className="text-green-500"/>) : (
            <TooltipLayout 
              trigger={
                <Link to="/account/create">
                  <UserRoundX size={18} className="text-red-500"/>
                </Link> 
              }
              content="Account not registered"
            />
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Resident No.
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
        Household No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
        const householdNo: string = row.getValue("householdNo");
        
        return householdNo ? (<div>{householdNo}</div>) :
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
        Family No.
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
        const sitio: string = row.getValue("sitio");
        
        return sitio ? (<div>{sitio}</div>) :
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
  },
  {
    accessorKey: "suffix",
    header: "Suffix"
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
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Registered By
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
        <div className="hidden lg:block max-w-xs truncate">
          {row.getValue("registeredBy") ? row.getValue("registeredBy") : '-'}
        </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to="/resident/view" 
        state={{
          params: {
            type: 'viewing',
            title: 'Resident Details',
            description: 'Information is displayed in a clear, organized, and secure manner.',
            data: residents.find((resident) => resident.rp_id === row.original.id),
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