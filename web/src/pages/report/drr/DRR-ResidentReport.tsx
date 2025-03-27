// Import necessary components and icons
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import DRRReportForm from "./DRR-ReportForm"
import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown, Link, Plus, Search, UserRoundCog } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { Button } from "@/components/ui/button/button"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"

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
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Resident Reports
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view reports
                </p>
            </div>
            <hr className="border-gray mb-5 sm:mb-8" />


            <div className="relative w-full lg:flex justify-between items-center mb-4">
                <div className="flex gap-2">
                    <div className="relative flex-1 bg-white">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input placeholder="Search..." className="pl-10 w-72" />
                    </div>
                    <SelectLayout 
                        placeholder="Filter by"
                        label=""
                        className="bg-white"
                        options={[]}
                        value=""
                        onChange={() => {}}
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="bg-white p-3">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                            <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                </div>
                {/* DataTable component to display the reports */}
                <div className="flex bg-white">
                    <DataTable columns={columns} data={data} />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                {/* Showing Rows Info */}
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing 1-10 of 150 rows
                </p>
    
                {/* Pagination */}
                <div className="w-full sm:w-auto flex justify-center">
                    <PaginationLayout />
                </div>
            </div>
        </div>
    )
}