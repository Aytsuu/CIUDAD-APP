// Import necessary components and types
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

// Define the type for the record object
type Record = {
    id: string
    lname: string
    fname: string
    mi: string
    suffix: string
    dob: string
    contact: number
    dateAssigned: string
}

// Define the columns for the DataTable
export const columns: ColumnDef<Record>[] = [
    {
        accessorKey: "lname", // Key for last name data
        header: ({column}) => (
            <div 
                className="w-full h-full flex gap-2 justify-center items-center cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Last Name
                <TooltipLayout
                    trigger={<ArrowUpDown  size={14}/>}
                    content="Sort"
                />
            </div>
        ), // Column header
    },
    {
        accessorKey: "fname", // Key for first name data
        header: ({column}) => (
            <div 
                className="w-full h-full flex gap-2 justify-center items-center cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                First Name
                <TooltipLayout
                    trigger={<ArrowUpDown  size={14}/>}
                    content="Sort"
                />
            </div>
        ), // Column header
    },
    {
        accessorKey: "mi", // Key for middle initial data
        header: ({column}) => (
            <div 
                className="w-full h-full flex gap-2 justify-center items-center cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                M.I
                <TooltipLayout
                    trigger={<ArrowUpDown  size={14}/>}
                    content="Sort"
                />
            </div>
        ), // Column header
    },
    {
        accessorKey: "suffix", // Key for suffix data
        header: "Suffix", // Column header
    },
    {
        accessorKey: "dob", // Key for date of birth data
        header: "Date of Birth", // Column header
    },
    {
        accessorKey: "contact", // Key for contact number data
        header: "Contact", // Column header
    },
    {
        accessorKey: "dateAssigned", // Key for date assigned data
        header: "Date Assigned", // Column header
    },
    {
        accessorKey: "action", // Key for action column (empty for now)
        header: "Action", // Column header
        enableSorting: false,
        enableHiding: false
    },
];

// Sample data for the records
const records: Record[] = [
    {
        id: "Lorem",
        lname: "Lina",
        fname: "Jodi",
        mi: "B",
        suffix: "Lorem",
        dob: "Lorem", 
        contact: 1123, 
        dateAssigned: "Lorem",
    },
    {
        id: "Lorem",
        lname: "Nila",
        fname: "Dijo",
        mi: "A",
        suffix: "Lorem",
        dob: "Lorem", 
        contact: 1123, 
        dateAssigned: "Lorem",
    },
];

// Main component for the DRR Staff Record page
export default function DRRStaffRecord() {
    const data = records; // Assign sample data to `data`

    return (
        // Main container for the page
        <div className="w-screen h-screen bg-snow flex justify-center items-center">
            {/* Container for the DataTable */}
            <div className="w-[80%] h-4/5  flex flex-col">
                <div className="w-full h-full bg-white border border-gray rounded-[5px]">
                    <div className="w-full flex items-center p-5">
                        <Input
                            placeholder="Filter by search..."
                            className="max-w-sm"
                        />
                    </div>
                    {/* DataTable component to display the records */}
                    <DataTable columns={columns} data={data} />
                </div>
                <PaginationLayout className="justify-end h-[10%]"/>
            </div>
        </div>
    );
} 