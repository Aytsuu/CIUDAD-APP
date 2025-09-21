import { ColumnDef } from "@tanstack/react-table";
import { VoterRecord } from "../ProfilingTypes";

export const voterColumns: ColumnDef<VoterRecord>[] = [
  {
    accessorKey: "voter_id",
    header: "No.",
    size: 20
  },
  {
    accessorKey: "voter_name",
    header: "Voter Name"
  },
  {
    accessorKey: "voter_address",
    header: "Voter Address"
  },
  {
    accessorKey: "voter_category",
    header: "Type",
    size: 70
  },
  {
    accessorKey: "voter_precinct",
    header: "Precinct No.",
    cell: ({ row }) => (
      <p className="py-2">
        {row.original.voter_precinct}
      </p>
    ),
    size: 70
  },
]