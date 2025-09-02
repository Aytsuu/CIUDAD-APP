import { ColumnDef } from "@tanstack/react-table";
import { voterRecord } from "../ProfilingTypes";

export const voterColumns: ColumnDef<voterRecord>[] = [
  {
    accessorKey: "voter_id",
    header: "Voter ID"
  },
  {
    accessorKey: "lname",
    header: "Last Name"
  },
  {
    accessorKey: "fname",
    header: "First Name"
  },
  {
    accessorKey: "mname",
    header: "Middle Name"
  },
  {
    accessorKey: "suffix",
    header: "Suffix"
  },
  {
    accessorKey: "sex",
    header: "Sex"
  },
  {
    accessorKey: "dob",
    header: "Date of Birth"
  },
]