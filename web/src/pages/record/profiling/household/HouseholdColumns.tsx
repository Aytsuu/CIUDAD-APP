import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleChevronRight, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { HouseholdFamRecord, HouseholdRecord } from "../profilingTypes";
import { Label } from "@/components/ui/label";

// Define the columns for household the data tables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const householdColumns = (
  residents: any[],
  households: any[]
): ColumnDef<HouseholdRecord>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Household No.
        <ArrowUpDown size={14} />
      </div>
    ),
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
    accessorKey: 'streetAddress',
    header: 'Street Address',
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
    header: 'Action',
    cell: ({ row }) => (
        <Link to="/household/view" 
          state={{
            params: {
              residents: residents,
              household: households.find((household) => household.hh_id == row.original.id)
            }
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
    )
  },
]

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const householdFamColumns = (
  residents: any[]
): ColumnDef<HouseholdFamRecord>[] => [
  {
    accessorKey: 'data',
    header: '',
    cell: ({ row }) => {
      const family = row.getValue('data') as any;
      const totalMembers = family.family_compositions.length;
      const staff = family.staff.rp.per;

      return (
        <div className="w-full border shadow-md flex px-4 py-2 rounded-lg">
          <div className="w-full grid grid-cols-7 items-center justify-center">
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="w-[90%] py-1.5 text-black/70 bg-muted rounded-full">
                {family.fam_id}
              </Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{totalMembers}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="w-[50%] py-1.5 text-white bg-green-500 rounded-full">
                {family.fam_building}
              </Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{family.fam_indigenous}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{family.fam_date_registered}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">
              {`${staff.per_lname}, ${staff.per_fname} 
              ${staff.per_mname ? staff.per_mname[0] + '.' : ''}`}
              </Label>
            </div>
          </div>
          <div className="w-1/12 flex justify-end items-center">
            <Link to="/family/view"
              state={{
                params: {
                  residents: residents,
                  family: family
                }
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
          </div>
        </div>
      );
    }
  },
]
