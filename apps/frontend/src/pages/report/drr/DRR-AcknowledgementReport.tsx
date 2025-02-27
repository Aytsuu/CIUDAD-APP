// Import necessary components and icons
import { DataTable } from "@/components/ui/table/data-table"; 
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Search } from "lucide-react";

// Define the type for the Report object
type Report = {
    id: string; 
    incidentActivity: string;
    location: string;
    sitio: string; 
    date: string;
    status: "Unsigned" | "Signed"; 
};

// Define the columns for the DataTable
export const columns: ColumnDef<Report>[] = [
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
        header: "Action", // Column header
    },
];

// Sample data for the reports
export const reports: Report[] = [
    {
        id: "Lorem",
        incidentActivity: "Lorem",
        location: "Lorem",
        sitio: "Lorem",
        date: "Lorem",
        status: "Signed",
    },
];

// Main component for the DRR Acknowledgement Report
export default function DRRAcknowledgementReport() {
    const data = reports; // Assign sample data to `data`

    return (
        <div className="w-full h-full flex flex-col ">
            {/* Header Section */}
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Acknowledgement Reports
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and AR reports
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

            {/* Left Section: Contains the table and year dropdown */}
            <div className="flex flex-col">
                <div className="bg-white p-3">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                            <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                </div>

                {/* DataTable component to display the reports */}
                <div className="bg-white">
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
    );
}