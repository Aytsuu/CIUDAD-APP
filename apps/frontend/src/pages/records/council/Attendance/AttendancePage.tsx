

import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus, Stamp, Search } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import AddEvent from '@/pages/AddEvent-Modal';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

//file components
import Attendees from './Attendees';

export const columns: ColumnDef<Attendance>[] = [
    {
        accessorKey: "attMeetingDate", // Key for location data
        header: "Date",
        cell: ({ row }) => (
            <div className="w-[100px]">
                {row.getValue("attMeetingDate")}
            </div>
        ),
    },
    {
        accessorKey: "attMettingTitle",
        header: "Meeting Title",
        cell: ({ row }) => (
            <div className="w-[830px]">
                {row.getValue("attMettingTitle")}
            </div>
        ),
    },
    {
        accessorKey: "attAreaOfFocus",
        header: "Area of Focus",
        cell: ({ row }) => (
            <div className="text-center space-y-1 w-[100px]"> {/* Add text-left and space-y-1 for spacing */}
                {row.original.attAreaOfFocus.join("\n").split("\n").map((line, index) => (
                    <div key={index} className="text-sm">{line}</div>
                ))}
            </div>
        )
    },    
    {
        accessorKey: "action", // Key for action data
        header: "Action", // Column header
        cell: ({row}) => ( // Add action button to all existing rows
            // DialogLayout component to show detailed report on click
            <div className="flex justify-between gap-2 pr-3">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Eye size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />
                    }
                    content="View"
                />
                <TooltipLayout  
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Stamp size={16} /></div>}
                            className="w-[600px] h-[580px] flex flex-col overflow-auto scrollbar-custom"
                            title="Mark Attendance"
                            description="Check the boxes below."
                            mainContent={<Attendees/>} // Replace with actual image path
                        />
                    }
                    content="Mark"
                />
            </div>
        ),
        enableSorting: false, // Disable sorting
        enableHiding: false, // Disable hiding
    },
]

type Attendance = {
    attMettingTitle: string
    attMeetingDate: string
    attAreaOfFocus: string[]
}

export const attendanceRecords: Attendance[] = [
    {
        attMettingTitle: "Vivamus a tellus. Pellentesque Vivamus a tellus. Pellentesque Vivamus a tellus. Pellentesque Vivamus a tellus. Pellentesque Vivamus a tellus. Pellentesque Vivamus a tellus. Pellentesque",
        attMeetingDate: "02/10/24",
        attAreaOfFocus: ["GAD", "Council"]
    },
    {
        attMettingTitle: "Escuchas a tellus. Pellentesque ",
        attMeetingDate: "02/13/24",
        attAreaOfFocus: ["GAD"]
    },
    {
        attMettingTitle: "Las Palabras Pellentesque ",
        attMeetingDate: "02/15/24",
        attAreaOfFocus: ["Waste Committee"]
    },
]



function AttendancePage() {

    const data = attendanceRecords;

    const filterOptions = [
        { id: "all", name: "All" }, // Use "all" instead of an empty string
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" }
    ];

    const [filter, setFilter] = useState<string>("all"); // Default to "all"

    const filteredData = filter === "all"
        ? attendanceRecords
        : attendanceRecords.filter(record => record.attAreaOfFocus.includes(filter)); // Filter based on the selected value    

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="flex-col items-center mb-4">
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                        Attendance Record
                    </h1>
                    <p className="text-xs sm:text-sm text-darkGray">
                        Mark and view attendance information
                    </p>
                </div>
                <hr className="border-gray mb-6 sm:mb-10" />       

                <div className='w-full mb-4'>
                    {/**FILTER (SELECT)*/}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                            <Input placeholder="Search" className="pl-10 w-[500px] bg-white" />
                        </div>

                        <SelectLayout
                            className={''}
                            label=""
                            placeholder="Filter"
                            options={filterOptions}
                            value={filter}
                            onChange={(value) => setFilter(value)} // Update the filter state
                        />                              
                    </div>
                </div>   

                <div className="w-full bg-white border border-none">
                    <div className="flex gap-x-2 items-center p-4">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>                                     

                    <DataTable columns={columns} data={filteredData} />
                </div>     

                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                    {/* Showing Rows Info */}
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing 1-10 of 150 rows
                    </p>

                    {/* Pagination */}
                    <div className="w-full sm:w-auto flex justify-center">
                        <PaginationLayout className="" />
                    </div>
                </div>                                
            </div>
        </div>
    );
}
export default AttendancePage;