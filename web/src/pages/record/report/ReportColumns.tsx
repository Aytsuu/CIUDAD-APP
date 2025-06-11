import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { IRReport, ARReport } from "./ReportTypes";
import { Button } from "@/components/ui/button/button";
import ViewButton from "@/components/ui/view-button";
import { useNavigate } from "react-router";
import { Checkbox } from "@/components/ui/checkbox";

// Define the columns for the data table
export const IRColumns = (): ColumnDef<IRReport>[] => [
  {
    accessorKey: "ir_id",
    header: 'Report No.'
  },
  {
      accessorKey: "ir_location", 
      header: "Location",
      cell: ({row}) => {
        const sitio = row.original.ir_sitio;
        const street = row.original.ir_street;

        return `Sitio ${sitio}, ${street} `
      }
  },
  {
      accessorKey: "ir_add_details", 
      header: "Description",
  },
  {
    accessorKey: "ir_type",
    header: "Type"
  },
  {
      accessorKey: "ir_reported_by", 
      header: "Reported By",
  },
  {
      accessorKey: "ir_time", 
      header: "Time", 
  },
  {
      accessorKey: "ir_date", 
      header: "Date", 
  },
  {
      accessorKey: "action",
      header: "Action",
      cell: ({row}) => {
        const navigate = useNavigate()

        const handleViewClick = () => {
          navigate('form', {
            state: {
              params: {
                data: row.original
              }
            }
          });
        }

        return (
          <ViewButton onClick={handleViewClick}/>
        )
      },
  },
]

export const ARColumns = (isCreatingWeeklyAR: boolean): ColumnDef<ARReport>[] => [
  {
    accessorKey: "select",
    header: ({ table }) => {
      if(isCreatingWeeklyAR) {
        return <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border border-gray w-5 h-5"
        />
      }
    },
    cell: ({ row }) => { 
      if(isCreatingWeeklyAR) {
        return <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border border-gray w-5 h-5"
        />
      }
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ar_id",
    header: "Report No.",
  },
  {
    accessorKey: "ar_title",
    header: "Incident/Activity",
  },
  {
    accessorKey: "ar_location",
    header: "Location", 
    cell: ({row}) => {
      const sitio = row.original.ar_sitio;
      const street = row.original.ar_street;

      return `Sitio ${sitio}, ${street} `
    }
  },
  {
    accessorKey: "ar_date", 
    header: "Date",
  },
  {
    accessorKey: "ar_status", 
    header: "Status",
  },
  {
    header: "Action",
    cell: ({row}) => {
      const navigate = useNavigate()

      const handleViewClick = () => {
        navigate('form', {
          state: {
            params: {
              data: row.original
            }
          }
        });
      }

      return (
        <ViewButton onClick={handleViewClick}/>
      )
    },
  },
];