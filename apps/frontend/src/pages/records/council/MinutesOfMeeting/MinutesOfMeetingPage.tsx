

import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus, Search } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import AddEvent from '@/pages/AddEvent-Modal';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router';

import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Meeting>[] = [
    {
        accessorKey: "meetingDate", // Key for location data
        header: "Date", // Column header
        cell: ({ row }) => (
            <div className="w-[100px]">
                {row.getValue("meetingDate")}
            </div>
        ),
    },    
    {
        accessorKey: "meetingAgenda",
        header: "Meeting Agenda",
        cell: ({ row }) => (
            <div className="w-[450px]">
                {row.getValue("meetingAgenda")}
            </div>
        ),
    },
    {
        accessorKey: "meetingTitle",
        header: "Meeting Title",
        cell: ({ row }) => (
            <div className="w-[150px]">
                {row.getValue("meetingTitle")}
            </div>
        ),
    },
    {
        accessorKey: "meetingAreaOfFocus",
        header: "Area of Focus",
        cell: ({ row }) => (
            <div className="text-center space-y-1 w-[150px]"> {/* Add text-left and space-y-1 for spacing */}
                {row.original.meetingAreaOfFocus.join("\n").split("\n").map((line, index) => (
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
            <div className="flex gap-2 mt-1 pr-2 pl-2 justify-center">
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
                            trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"> <Pencil size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />
                    }
                    content="Update"
                />
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} // Replace with actual image path
                        />
                    }
                    content="Delete"
                />
            </div>
        ),
        enableSorting: false, // Disable sorting
        enableHiding: false, // Disable hiding
    },
]

type Meeting = {
    meetingDate: string
    meetingTitle: string
    meetingAgenda: string
    meetingAreaOfFocus: string[]
}

export const meetingRecords: Meeting[] = [
    {
        meetingDate: "02/10/24",
        meetingTitle: "Budget Plan Meeting",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
        meetingAreaOfFocus: ["GAD", "Council"]
    },
    {
        meetingDate: "02/13/24",
        meetingTitle: "Escuchas a tellus Hectesus ",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
        meetingAreaOfFocus: ["GAD"]
    },
    {
        meetingDate: "02/15/24",
        meetingTitle: "Las Palabras Pellentesque ",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
        meetingAreaOfFocus: ["GAD", "Waste Committee"]
    },
]



function MinutesOfMeetingPage() {

    const data = meetingRecords;

    const filterOptions = [
        { id: "all", name: "All" }, // Use "all" instead of an empty string
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" }
    ];

    const [filter, setFilter] = useState<string>("all"); // Default to "all"

    const filteredData = filter === "all"
        ? meetingRecords
        : meetingRecords.filter(record => record.meetingAreaOfFocus.includes(filter));

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="flex-col items-center mb-4">
                    <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                        Minutes Of Meeting
                    </h1>
                    <p className="text-xs sm:text-sm text-darkGray">
                        Manage and view documentation information
                    </p>
                </div>
                <hr className="border-gray mb-6 sm:mb-10" /> 

                <div className='w-full flex justify-between mb-4'>
                    {/**FILTER (SELECT)*/}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                            <Input placeholder="Search..." className="pl-10 w-72 bg-white" />
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
                    <div>
                        <Link to=""><Button>Create<Plus className="ml-2" /></Button></Link>
                    </div>
                </div>                    

                <div className="w-full bg-white border border-gray rounded-[5px]">                

                    <DataTable columns={columns} data={filteredData} />
                </div>                
            </div>
        </div>
    );
}
export default MinutesOfMeetingPage;