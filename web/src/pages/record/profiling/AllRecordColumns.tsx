import { ColumnDef } from "@tanstack/react-table";
import { AllRecordCombined } from "./ProfilingTypes";
import ViewButton from "@/components/ui/view-button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

export const allRecordColumns: ColumnDef<AllRecordCombined>[] = [
  {
    accessorKey: 'type',
    header: "",
    cell: ({ row }) => (
      <Badge className={`${row.original.type == 'Business' ? 
        "bg-purple-500 hover:bg-purple-400" :
        ""}`}>
        {row.original.type}
      </Badge>
    )
  },
  {
    accessorKey: 'id',
    header: "ID",
  },
  {
    accessorKey: 'lname',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown size={14} />
      </div>
    )
  },
  {
    accessorKey: 'fname',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown size={14} />
      </div>
    )
  },
  {
    accessorKey: 'mname',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Middle Name
        <ArrowUpDown size={14} />
      </div>
    )
  },
  {
    accessorKey: 'suffix',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Suffix
        <ArrowUpDown size={14} />
      </div>
    )
  },
  {
    accessorKey: 'date_registered',
    header: "Date Registered"
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({row}) => {
      const navigate = useNavigate();
      const route = row.original.type === 'Resident' ? 
                  "/profiling/resident/view" :
                  "/profiling/business/record/respondent/details"
      const handleViewClick = async () => {
        navigate(route, {
          state: {
            params: {
              type: 'viewing',
              data: {
                residentId: row.original.id,
                respondentId: row.original.id,
                familyId: row.original.family_no,
              },
            }
          }
        });
      }

      return (
        <ViewButton 
          onClick={handleViewClick}
        />
      )
    }
  }
]