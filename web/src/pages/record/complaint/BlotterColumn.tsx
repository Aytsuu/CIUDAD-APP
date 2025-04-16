import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { BlotterFormValues } from "./blotter-type";

export const blotterColumns = (blotter: any[]): ColumnDef<BlotterFormValues>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <div
        className="flex items-center gap-2 cursor-pointer min-w-[100px]"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Case No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        {row.getValue('id')}
      </div>
    ),
  },
  {
    accessorKey: 'bc_complainant',
    header: ({ column }) => (
      <div
        className="flex items-center justify-center gap-2 cursor-pointer min-w-[150px]"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Complainant
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="min-w-[150px] max-w-[200px] truncate" title={row.getValue('bc_complainant')}>
        {row.getValue('bc_complainant')}
      </div>
    ),
  },
  {
    accessorKey: 'bc_accused',
    header: 'Accused',
    cell: ({ row }) => (
      <div className="min-w-[150px] max-w-[200px] truncate" title={row.getValue('bc_accused')}>
        {row.getValue('bc_accused')}
      </div>
    ),
  },
  {
    accessorKey: 'bc_incident_type',
    header: 'Incident Type',
    cell: ({ row }) => (
      <div className="min-w-[120px] max-w-[180px] truncate" title={row.getValue('bc_incident_type')}>
        {row.getValue('bc_incident_type')}
      </div>
    ),
  },
  {
    accessorKey: 'bc_datetime',
    header: 'Date/Time',
    cell: ({ row }) => {
      const date = new Date(row.original.bc_datetime);
      return (
        <div className="min-w-[150px]">
          {date.toLocaleString()}
        </div>
      );
    }
  },
  {
    accessorKey: 'bc_allegation',
    header: 'Allegation',
    cell: ({ row }) => (
      <div className="min-w-[150px] max-w-[250px] line-clamp-2" title={row.getValue('bc_allegation')}>
        {row.getValue('bc_allegation')}
      </div>
    ),
  },
  // {
  //   accessorKey: 'bc_cmplnt_address',
  //   header: 'Complainant Address',
  //   cell: ({ row }) => (
  //     <div className="min-w-[150px] max-w-[200px] truncate" title={row.getValue('bc_cmplnt_address')}>
  //       {row.getValue('bc_cmplnt_address')}
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: 'bc_accused_address',
  //   header: 'Accused Address',
  //   cell: ({ row }) => (
  //     <div className="min-w-[150px] max-w-[200px] truncate" title={row.getValue('bc_accused_address')}>
  //       {row.getValue('bc_accused_address')}
  //   </div>
  //   ),
  // },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="min-w-[100px]">
        <Link 
          to={`/blotter-record/${row.original.id}`} 
          state={{ blotter: row.original }}
        >
          <Button variant={"outline"} size="sm">
            View <MoveRight size={14} />
          </Button>
        </Link>
      </div>
    )
  },
];