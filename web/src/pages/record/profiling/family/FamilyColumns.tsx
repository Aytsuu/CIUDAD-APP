import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { FamilyRecord, DependentRecord} from "../profilingTypes";

// Define the columns for family data tables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyColumns = (families: any[]): ColumnDef<FamilyRecord>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family No.
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: 'noOfMembers',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        No. of Members
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
    header: 'Indigenous'
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
    header: 'Action',
    cell: ({ row }) => (
      <Link 
        to="/family/view"
        state={{
          params: {
            data: families.find((family) => family.fam_id == row.original.id)
          }
        }}  
      >
        <Button variant={"outline"}>
          View <MoveRight />
        </Button>
      </Link>
    )
  },
]

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyViewColumns = (): ColumnDef<DependentRecord>[] => [
  {
      accessorKey: 'id',
      header: 'Resident No.'
  },
  {
      accessorKey: 'lname',
      header: 'Last Name'
  },
  {
      accessorKey: 'fname',
      header: 'First Name'
  },
  {
      accessorKey: 'mname',
      header: 'Middle Name'
  },
  {
      accessorKey: 'suffix',
      header: 'Suffix'
  },
  {
      accessorKey: 'sex',
      header: 'Sex'
  },
  {
    accessorKey: 'age',
    header: 'Age'
  },
  {
      accessorKey: 'dateOfBirth',
      header: 'Date of Birth'
  },
  {
    accessorKey: 'role',
    header: 'Role'
  },
  {
    accessorKey: 'action',
    header: ''
  }
]