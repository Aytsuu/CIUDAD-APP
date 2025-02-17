// Import necessary components and icons
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import DRRReportForm from "./drr-report-form"
import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

// Define the type for the Report object
type Report = {
    id: string
    category: string
    location: string
    description: string
    incidentTime: string
    reportedBy: string
    timeReported: string
    date: string
}

// Define the columns for the data table
export const columns: ColumnDef<Report>[] = [
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

// Sample data for the reports
export const reports: Report[] = [
    {
        id: "Lorem",
        category: "Lorem", 
        location: "Lorem",
        description: "Lorem", 
        incidentTime: "Lorem",
        reportedBy: "Lorem", 
        timeReported: "Lorem", 
        date: "Lorem"
    },
    {
        id: "Lorem",
        category: "Aorem", 
        location: "Lorem",
        description: "Lorem", 
        incidentTime: "Lorem",
        reportedBy: "Lorem", 
        timeReported: "Lorem", 
        date: "Lorem"
    },
]

// Main component for displaying the DRR Resident Report
export default function DRRResidentReport(){

    const data = reports;

    return (
        // Container for the entire page
        <div className="w-screen h-screen bg-snow flex justify-center items-center p-4 sm:p-0">
            {/* Container for the data table */}
            <div className="w-full sm:w-[80%] h-full sm:h-2/3 bg-white border border-gray p-3 rounded-[5px]">
                {/* DataTable component to display the reports */}
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}