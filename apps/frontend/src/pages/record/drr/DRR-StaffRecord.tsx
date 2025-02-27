// Import necessary components and types
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Link } from "react-router";
import { Search } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";

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
        <div className="w-full h-full  flex flex-col">
            {/* Header Section */}
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Staff Records
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view staff information
                </p>
            </div>
            <hr className="border-gray mb-5 sm:mb-8" />

            <div>  
                <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
                    <div className="flex gap-x-2">
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
            </div>

            <div className="w-full h-full bg-white border border-gray rounded-[5px]">
                <div className="w-full flex items-center p-3">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                            <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                </div>
                {/* DataTable component to display the records */}
                <DataTable columns={columns} data={data} />
            </div>
            <PaginationLayout className="justify-end h-[10%]"/>
        </div>
    );
} 