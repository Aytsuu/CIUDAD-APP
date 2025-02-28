
import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import TableLayout from "@/components/ui/table/table-layout.tsx";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Pencil, Trash, Eye, Plus, Search } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";

import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import AddMinutesOfMeeting from "./addMinutesOfMeeting";

export type Meeting = {
    meetingDate: string;
    meetingTitle: string;
    meetingAgenda: string;
    meetingAreaOfFocus: string[];
};

export const meetingRecords: Meeting[] = [
    {
        meetingDate: "02/10/24",
        meetingTitle: "Budget Plan Meeting",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
        meetingAreaOfFocus: ["GAD", "Council"],
    },
    {
        meetingDate: "02/13/24",
        meetingTitle: "Escuchas a tellus Hectesus",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
        meetingAreaOfFocus: ["GAD"],
    },
    {
        meetingDate: "02/15/24",
        meetingTitle: "Las Palabras Pellentesque",
        meetingAgenda: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et",
        meetingAreaOfFocus: ["GAD", "Waste Committee"],
    },
];

export const columns: ColumnDef<Meeting>[] = [
    {
        accessorKey: "meetingDate",
        header: "Date",
        cell: ({ row }) => (
            <div className="w-[120px]">{row.getValue("meetingDate")}</div>
        ),
    },
    {
        accessorKey: "meetingAgenda",
        header: "Meeting Agenda",
        cell: ({ row }) => (
            <div className="max-w-[600px] w-auto overflow-hidden text-ellipsis whitespace-nowrap">
                {row.getValue("meetingAgenda")}
            </div>
        ),
    },
    {
        accessorKey: "meetingTitle",
        header: "Meeting Title",
        cell: ({ row }) => (
            <div className="max-w-[300px]">{row.getValue("meetingTitle")}</div>
        ),
    },
    {
        accessorKey: "meetingAreaOfFocus",
        header: "Area of Focus",
        cell: ({ row }) => (
            <div className="text-center max-w-[120px]">
                {row.original.meetingAreaOfFocus.map((focus, index) => (
                    <div key={index} className="text-sm">
                        {focus}
                    </div>
                ))}
            </div>
        ),
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: () => (
            <div className="flex flex-wrap justify-center gap-1 pr-2">
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={
                                <div className="bg-white hover:bg-gray-200 border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8">
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
                        <Link to="/update-mom">
                            <Button className="bg-white hover:bg-gray-200 border text-black h-[32px] rounded cursor-pointer shadow-none flex items-center">
                                <Pencil size={16} />
                            </Button>
                        </Link>
                    }
                    content="Update"
                />
                <TooltipLayout
                    trigger={
                        <DialogLayout
                            trigger={
                                <div className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8">
                                    <Trash size={16} />
                                </div>
                            }
                            className="max-w-[50%] h-2/3 flex flex-col"
                            title="Delete Confirmation"
                            description="Are you sure you want to delete this meeting record?"
                            mainContent={<p className="text-center text-sm">This action cannot be undone.</p>}
                        />
                    }
                    content="Delete"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

function MinutesOfMeetingPage() {
    const [filter, setFilter] = useState<string>("all");

    const filterOptions = [
        { id: "all", name: "All" },
        { id: "Council", name: "Council" },
        { id: "Waste Committee", name: "Waste Committee" },
        { id: "GAD", name: "GAD" },
    ];

    const filteredData =
        filter === "all" ? meetingRecords : meetingRecords.filter((record) => record.meetingAreaOfFocus.includes(filter));

    return (
        <div className="w-full h-full">
            <div className="flex flex-col mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Minutes Of Meeting</h1>
                <p className="text-xs sm:text-sm text-darkGray">Manage and view documentation information</p>
            </div>
            <hr className="border-gray mb-6 sm:mb-10" />

            {/* Filter & Search */}
            <div className="w-full flex flex-wrap gap-3 justify-between items-center mb-4">
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input placeholder="Search..." className="pl-10 w-full md:w-72 bg-white" />
                    </div>

                    <SelectLayout
                        className="min-w-[150px] bg-white"
                        label=""
                        placeholder="Filter"
                        options={filterOptions}
                        value={filter}
                        onChange={(value) => setFilter(value)}
                    />
                </div>

                <div className="w-full md:w-auto">
                    <Link to="/add-mom">
                        <Button className="w-full md:w-auto">
                            Create <Plus className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Table */}
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
    );
}

export default MinutesOfMeetingPage;



