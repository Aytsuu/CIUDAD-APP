import { BsChevronLeft } from "react-icons/bs";
import { Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { FaFilter, FaSort } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination/pagination";

import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { DataTable } from "../ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { ProfilingForm } from "./Form/ProfilingForm";
import ViewInfo from "./ProfilingViewInfo";

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
                description=""
                title=""
                className=""
                mainContent={<ViewInfo/>}
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


export default function ProfilingRequest() {
  const data = reports;
  return (
    <div className="w-full">
      <div className="flex items-center gap-x-2">
        {/* Header */}
        <Link
          to="/"
          className="text-black p-2 hover:bg-darkGray/25 hover:rounded-full"
        >
          <BsChevronLeft />
        </Link>
        <div className="flex flex-col">
          <h1 className="font-semibold text-2xl text-darkBlue2">
            Awaiting Approval
          </h1>
          <p className="text-sm text-darkGray">
            Submissions under review and pending authorization
          </p>
        </div>
      </div>

      <hr className="text-darkGray mt-4 mb-8" />
      {/* Body */}
      <div className="">
        <div className="flex gap-x-2">
          <div className="relative flex">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <Input placeholder="Search..." className="pl-10 w-72" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 font-normal">
                <FaFilter />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>By Date</DropdownMenuItem>
              <DropdownMenuItem>By Status</DropdownMenuItem>
              <DropdownMenuItem>By Location</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 font-normal">
                <FaSort />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
              <DropdownMenuItem>Location</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table Layout */}
        <div>
        <div className="bg-white mt-4">
                {/* DataTable component to display the reports */}
                <DataTable columns={columns} data={data} />
            </div>
        </div>
      </div>
    </div>
  );
}
