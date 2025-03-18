import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FamilyRecord, HouseholdRecord, ResidentRecord} from "./profilingTypes";
// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------
export const residentColumns: ColumnDef<ResidentRecord>[] = [
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
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("householdNo")}</div>
    ),
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
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("familyNo")}</div>
    ),
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
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("sitio")}
      </div>
    ),
  },
  {
    accessorKey: "lastName",
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
        {row.getValue("lastName")}
      </div>
    ),
  },
  {
    accessorKey: "firstName",
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
        {row.getValue("firstName")}
      </div>
    ),
  },
  {
    accessorKey: "mi",
    header: "M.I",
    cell: ({ row }) => (
      <div className="hidden xl:block">{row.getValue("mi")}</div>
    ),
  },
  {
    accessorKey: "suffix",
    header: "Suffix",
    cell: ({ row }) => (
      <div className="hidden xl:block">{row.getValue("suffix")}</div>
    ),
  },
  {
    accessorKey: "dateRegistered",
    header: "Date Registered",
    cell: ({ row }) => (
      <div className="hidden xl:block">{row.getValue("dateRegistered")}</div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to="/resident-registration">
        <Button variant="outline">View</Button>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

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
    header: 'action'
  },
]

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
    header: 'action'
  },
]

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

