import { ColumnDef } from "@tanstack/react-table";
import { voterRecord } from "../ProfilingTypes";

export const voterColumns: ColumnDef<voterRecord>[] = [
  {
    accessorKey: "voter_id",
    header: "Voter ID"
  },
  {
    accessorKey: "voter_name",
    header: "Last Name"
  },
  {
    accessorKey: "voter_address",
    header: "First Name"
  },
  {
    accessorKey: "voter_category",
    header: "Middle Name"
  },
  {
    accessorKey: "voter_precinct",
    header: "Suffix"
  },
]