import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Report } from "./ReportTypes";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DRRReportForm from "./incident/IRFormLayout";
import ViewButton from "@/components/ui/view-button";
import { useNavigate } from "react-router";

// Define the columns for the data table
export const IRColumns = (): ColumnDef<Report>[] => [
  {
    accessorKey: "ir_id",
    header: 'Report No.'
  },
  {
      accessorKey: "ir_location", 
      header: "Location", 
  },
  {
      accessorKey: "ir_add_details", 
      header: "Description",
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
          navigate('/report/incident/form', {
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
      enableSorting: false, // Disable sorting
      enableHiding: false, // Disable hiding
  },
]

export const acknowledgeReportColumns: ColumnDef<Report>[] = [
  {
    accessorKey: "incidentActivity",
    header: "Incident/Activity",
  },
  {
    accessorKey: "location",
    header: "Location", 
  },
  {
    accessorKey: "sitio",
    header: "Sitio",
  },
  {
    accessorKey: "date", 
    header: "Date",
  },
  {
    accessorKey: "status", 
    header: "Status",
  },
  {
    accessorKey: "action", // Key for action column (empty for now)
    header: "Action",
    cell: ({ row }) => (
    <Button variant={"outline"}>View <MoveRight/></Button>
    )
  },
];