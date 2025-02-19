

import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import AddEvent from '@/pages/AddEvent-Modal';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Resolution>[] = [
    {
        accessorKey: "meetingDate", // Key for location data
        header: "Date", // Column header
    },    
    {
        accessorKey: "meetingAgenda",
        header: "Meeting Agenda",
    },
    {
        accessorKey: "meetingTitle",
        header: "Meeting Title",
    },
    {
        accessorKey: "action", // Key for action data
        header: "Action", // Column header
        cell: ({row}) => ( // Add action button to all existing rows
            // DialogLayout component to show detailed report on click
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 pr-2 pl-2">
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

type Resolution = {
    meetingDate: string
    meetingTitle: string
    meetingAgenda: string
}

export const resolutionRecords: Resolution[] = [
    {
        meetingDate: "02/10/24",
        meetingTitle: "Vivamus a tellus. Pellentesque ",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et"
    },
    {
        meetingDate: "02/13/24",
        meetingTitle: "Escuchas a tellus. Pellentesque ",
                meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et"
    },
    {
        meetingDate: "02/15/24",
        meetingTitle: "Las Palabras Pellentesque ",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et"
    },
]



function MinutesOfMeetingPage() {

    const data = resolutionRecords;

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="text-lg font-semibold leading-non tracking-tight pb-3 text-[#394360]">
                    <h1>MINUTES OF MEETING</h1>
                </div>

                <div className="w-full bg-white border border-gray rounded-[5px]">
                    <div className='w-full flex justify-between mb-4 p-5'>
                        {/**FILTER (SELECT)*/}
                        <div className="flex gap-3">
                            <Input
                                placeholder="Filter by search..."
                                className="max-w-sm"
                            />

                            <SelectLayout
                                className = {''}
                                label=""
                                placeholder="Filter"
                                options={[
                                    { id: "Council", name: "Council" },
                                    { id: "Waste", name: "Waste" },
                                    { id: "GAD", name: "GAD" }
                                ]}
                                value=""
                                onChange={() => { }}
                            />                                
                        </div>
                        <div>
                            <DialogLayout
                                trigger={<div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor -pointer flex items-center"> Create <Plus className="ml-2" /></div>}
                                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                                title="Schedule Event"
                                description="Set an upcoming event."
                                mainContent={<AddEvent />}
                            />
                        </div>
                    </div>                    

                    <DataTable columns={columns} data={data} />
                </div>                
            </div>
        </div>
    );
}
export default MinutesOfMeetingPage;