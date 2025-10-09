import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleChevronRight } from "lucide-react";
import { Link } from "react-router";
import { Label } from "@/components/ui/label";
import { FamilyRequestRecord, IndividualRequestRecord } from "../ProfilingTypes";
import { calculateAge } from "@/helpers/ageCalculator";
import { Combobox } from "@/components/ui/combobox";
import { formatRequestComposition } from "../ProfilingFormats";
import { formatDate } from "@/helpers/dateHelper";

// Define the colums for the data table
export const IndividualRequestColumns: ColumnDef<IndividualRequestRecord>[] = [
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
    accessorKey: "req_created_at",
    header: "Requested",
    cell: ({ row }) => (
      formatDate(row.original.req_created_at, "short")
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        to="/profiling/request/pending/individual/registration"
        state={{
          params: {
            title: "Registration Request",
            description:
              "This is a registration request submitted by the user. Please review the details and approve accordingly.",
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

export const FamilyRequestColumns: ColumnDef<FamilyRequestRecord>[] = [
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
    accessorKey: "respondent",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Respondent
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      const data = row.original.respondent;
      const lname = data?.per_lname;
      const fname = data?.per_fname;
      const mname = data?.per_mname;

      return <p>{`${lname}, ${fname}${mname ? ` ${mname}` : ""}`}</p>
    },
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Age
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <p>{calculateAge(row.original.respondent?.per_dob)}</p>
    )
  },
  {
    accessorKey: "members",
    header: "Members",
    cell: ({row}) => {
      const formattedCompositions = formatRequestComposition(row.original.compositions)

      return (
        <Combobox
          options={formattedCompositions}
          value={formattedCompositions.length}
          placeholder="Search member"
          emptyMessage="No resident found"
          staticVal={true}
          size={400}
        />
      )
    }
  },
  {
    accessorKey: "req_created_at",
    header: "Requested",
    cell: ({ row }) => (
      formatDate(row.original.req_created_at, "short")
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        to="/profiling/request/pending/family/registration"
        state={{
          params: {
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

