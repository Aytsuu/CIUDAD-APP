

import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Eye, Plus, Search } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from '@/components/ui/input';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"


import { Link } from 'react-router';

export const columns: ColumnDef<Ordinance>[] = [
    {
        accessorKey: "ordNo",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Ordinance No.
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="capitalize w-[140px]">{row.getValue("ordNo")}</div>
        )
    },
    {
        accessorKey: "ordTitle",
        header: "Ordinance Title",
    },
    {
        accessorKey: "ordAreaOfFocus",
        header: "Area of Focus",
        cell: ({ row }) => (
            <div className="text-center space-y-1 w-[150px]"> {/* Add text-left and space-y-1 for spacing */}
                {row.original.ordAreaOfFocus.join("\n").split("\n").map((line, index) => (
                    <div key={index} className="text-sm">{line}</div>
                ))}
            </div>
        )
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({}) => (
            <div className="flex justify-between gap-2 pr-3">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={
                                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                                    <Eye size={16} />
                                </div>
                            }
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
                        />
                    }
                    content="View"
                />
                <TooltipLayout
                    trigger={
                        <div className="flex items-center h-10">
                            <Link to="/update-ord">
                                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer shadow-none h-full flex items-center">
                                    <Pencil size={16} />
                                </div>
                            </Link>
                        </div>
                    }
                    content="Update"
                />
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={
                                <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8.5">
                                    <Trash size={16} />
                                </div>
                            }
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Image Details"
                            description="Here is the image related to the report."
                            mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />}
                        />
                    }
                    content="Delete"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

type Ordinance = {
    ordNo: string
    ordTitle: string
    ordAreaOfFocus: string[]
}

export const ordinanceRecords: Ordinance[] = [
    {
        ordNo: "001 - 24",
        ordTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        ordAreaOfFocus: ["GAD", "Council"]
    },
    {
        ordNo: "003 - 24",
        ordTitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        ordAreaOfFocus: ["Council", "Waste Committee"]
    },
    {
        ordNo: "001 - 25",
        ordTitle: "Escucha las palabras de las brujas, los secretos escondidos en la noche, los antiguos dioses invocamos ahora la obra de la.",
        ordAreaOfFocus: ["Waste Committee"]
    },
]

function OrdinancePage() {
    const filterOptions = [
        { id: "all", name: "All" }, // Use "all" instead of an empty string
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" }
    ];

    const [filter, setFilter] = useState<string>("all"); // Default to "all"

    const filteredData = filter === "all"
        ? ordinanceRecords
        : ordinanceRecords.filter(record => record.ordAreaOfFocus.includes(filter)); // Filter based on the selected value

    return (
        <div className="w-full h-full">
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Ordinance Record
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view ordinance information
                </p>
            </div>
            <hr className="border-gray mb-6 sm:mb-8" />        

            <div className='w-full flex flex-col md:flex-row justify-between mb-4 gap-2'>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input placeholder="Search..." className="pl-10 w-full md:w-72 bg-white" />
                    </div>

                    <SelectLayout
                        className="bg-white"
                        label=""
                        placeholder="Filter"
                        options={filterOptions}
                        value={filter}
                        onChange={(value) => setFilter(value)} // Update the filter state
                    />     
                </div>
                <div className="w-full md:w-auto mt-4 md:mt-0">
                    <Link to="/add-ord"><Button className="w-full md:w-auto"><Plus />Create</Button></Link>
                </div>
            </div>                    

            {/*TABLE*/}
            <div className="w-full border-none bg-white">
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
    );
}
export default OrdinancePage;
