import { ColumnDef } from "@tanstack/react-table";
import { AllRecordCombined } from "./ProfilingTypes";
import ViewButton from "@/components/ui/view-button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { formatDate } from "@/helpers/dateHelper";

export const allRecordColumns: ColumnDef<AllRecordCombined>[] = [
  {
    accessorKey: 'type',
    header: "",
    cell: ({ row }) => (
      <Badge className={`rounded-full ${row.original.type == 'Business' ? 
        "bg-purple-50 border-purple-400 text-purple-700 hover:bg-purple-50" :
        ""}`}>
        {row.original.type}
      </Badge>
    ),
    size: 100
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
    header: "Suffix",
    size: 100
  },
  {
    accessorKey: 'sex',
    header: "Sex",
    cell: ({row}) => (
      row.original.sex[0]
    ),
    size: 100
  },
  {
    accessorKey: 'date_registered',
    header: "Registered",
    cell: ({row}) => (
      formatDate(row.original.date_registered, "short" as any)
    )
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({row}) => {
      const navigate = useNavigate();
      const route = row.original.type === 'Resident' ? 
                  "/profiling/resident/view/personal" :
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