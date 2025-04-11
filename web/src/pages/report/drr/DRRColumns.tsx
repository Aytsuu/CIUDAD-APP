import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Report } from "./DRRTypes";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DRRReportForm from "./resident-report/DRRReportForm";

// Define the columns for the data table
export const ResidentReportColumns = (): ColumnDef<Report>[] => [
  {
      accessorKey: "category",
      header: ({ column }) => (
            <div
              className="flex w-full justify-center items-center gap-2 cursor-pointer"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Category
              <ArrowUpDown size={14}/>
            </div>
      ),
      cell: ({row}) => (
          <div className="capitalize">{row.getValue("category")}</div>
      )
  },
  {
      accessorKey: "location", // Key for location data
      header: "Location", // Column header
  },
  {
      accessorKey: "description", // Key for description data
      header: "Description", // Column header
  },
  {
      accessorKey: "incidentTime", // Key for incident time data
      header: "Time of Incident", // Column header
  },
  {
      accessorKey: "reportedBy", // Key for reported by data
      header: "Reported By",
  },
  {
      accessorKey: "timeReported", // Key for time reported data
      header: "Time Reported", // Column header
  },
  {
      accessorKey: "date", // Key for date data
      header: "Date", // Column header
  },
  {
      accessorKey: "action", // Key for action data
      header: "Action", // Column header
      cell: ({row}) => ( // Add action button to all existing rows
          // DialogLayout component to show detailed report on click
          <DialogLayout   
              trigger={
                  <div className="w-[50px] h-[35px] border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]"> 
                      View 
                  </div>
              }
              className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col"
              title="Report Details"
              description="This report was received on 9th of July, 2025. Please respond accordingly."
              mainContent={<DRRReportForm />}
          /> 
      ),
      enableSorting: false, // Disable sorting
      enableHiding: false, // Disable hiding
  },
]

export const acknowledgeReportColumns: ColumnDef<Report>[] = [
  {
    accessorKey: "incidentActivity", // Key for incident/activity data
    header: "Incident/Activity", // Column header
  },
  {
    accessorKey: "location", // Key for location data
    header: "Location", // Column header
  },
  {
    accessorKey: "sitio", // Key for sitio data
    header: "Sitio", // Column header
  },
  {
    accessorKey: "date", // Key for date data
    header: "Date", // Column header
  },
  {
    accessorKey: "status", // Key for status data
    header: "Status", // Column header
  },
  {
    accessorKey: "action", // Key for action column (empty for now)
    header: "Action",
    cell: ({ row }) => (
    <Button variant={"outline"}>View <MoveRight/></Button>
    )
  },
];