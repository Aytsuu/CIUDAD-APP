import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FaPlus,
  FaFilter,
  FaFileImport,
  FaSort,
  FaEllipsisV,
} from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
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

import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Input } from "../ui/input";

import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "../ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Modal from "./profilingModal/FormTypeModal";

// Define the type for the Report object
type Report = {
  id: string;
  category: string;
  location: string;
  description: string;
  incidentTime: string;
  reportedBy: string;
  timeReported: string;
  date: string;
};

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
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
    ),
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
    cell: (
      { row } // Add action button to all existing rows
    ) => (
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
        mainContent={"/"}
      />
    ),
    enableSorting: false, // Disable sorting
    enableHiding: false, // Disable hiding
  },
];

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
    date: "Lorem",
  },
  {
    id: "Lorem",
    category: "Aorem",
    location: "Lorem",
    description: "Lorem",
    incidentTime: "Lorem",
    reportedBy: "Lorem",
    timeReported: "Lorem",
    date: "Lorem",
  },
];

export default function ProfilingMain() {
  const [isModalOpen, setIsModalOpen] = useState(false); //
  const data = reports;
  return (
    <div>
      <Outlet />
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-2xl text-darkBlue2">
          Resident Record
        </h1>
        <p className="text-sm text-darkGray">
          Manage and view resident information
        </p>
      </div>
      <hr className="border-gray mb-10" />

      {/* Header Structure */}
      <div className="relative w-full flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FaEllipsisV />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>...</DropdownMenuItem>
              <DropdownMenuItem>...</DropdownMenuItem>
              <DropdownMenuItem>...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <div className="flex space-x-3 h-9">
            <Link
              to="/profilingRequest"
              className="flex items-center justify-center shadow-sm w-32 rounded-md"
            >
              Pending
            </Link>

            {/* Registration Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex gap-x-2 shadow-sm items-center justify-center w-32 rounded-md text-white bg-blue hover:bg-sky-400"
            >
              <span>
                <FaPlus />
              </span>
              Register
            </button>

            {/* This is rendered everytime the register button is clicked */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Register Resident</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Your registration form content goes here */}
                <div className="mb-4">
                  <div className="w-full h-[20rem] space-x-3 grid grid-cols-2">

                    {/* Registration Form */}
                    <Link
                      to="/residentRegistration"
                      className="relative inline-block overflow-hidden group border-2 col-span-1 h-full rounded-lg"
                    >
                      {/* Background image */}
                      <div
                        className="absolute inset-0 bg-[url('../assets/images/sanRoqueLogo.svg')] bg-cover bg-center 
                            blur-sm group-hover:blur-none transition-all duration-300"
                      ></div>

                      {/* Overlay for better text visibility */}
                      <div
                        className="absolute inset-0 bg-black/40 group-hover:bg-black/30 
                            transition-all duration-300"
                      ></div>

                      {/* Text content */}
                      <div className="relative flex items-center justify-center h-full">
                        <span className="text-white font-medium">
                          Registration Form
                        </span>
                      </div>
                    </Link>
                    <Link
                      to="/residentRegistration"
                      className="relative inline-block overflow-hidden group border-2 col-span-1 h-full rounded-lg"
                    >
                      {/* Background image */}
                      <div
                        className="absolute inset-0 bg-[url('../assets/images/sanRoqueLogo.svg')] bg-cover bg-center 
                            blur-sm group-hover:blur-none transition-all duration-300"
                      ></div>

                      {/* Overlay for better text visibility */}
                      <div
                        className="absolute inset-0 bg-black/40 group-hover:bg-black/30 
                            transition-all duration-300"
                      ></div>

                      {/* Text content */}
                      <div className="relative flex items-center justify-center h-full">
                        <span className="text-white font-medium">
                          Household Form
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue text-white rounded-md hover:bg-sky-400">
                    Submit
                  </button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        <div className="w-full h-16 bg-white border-b-2 flex justify-between items-center p-4">
          <div className="flex gap-x-2 items-center">
            <p className="text-sm">Show</p>
            <Input type="number" className="w-14 h-8"></Input>
            <p className="text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-center w-32 p-1 rounded-md gap-x-2 font-normal"
                >
                  <FaFileImport />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="bg-white">
          {/* Table Placement */}
          <DataTable columns={columns} data={data} />
        </div>
        <div className="flex items-center justify-between w-full py-3">
          {/* Showing Rows Info */}
          <p className="pl-4 text-sm font-normal text-darkGray">
            Showing 1-10 of 150 rows
          </p>

          {/* Pagination */}
          <div>
            <Pagination className="flex items-center gap-2">
              <PaginationContent className="flex items-center gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className="px-3 py-1.5 rounded-lg hover:bg-gray/25 font-normal"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="px-3 py-1.5 rounded-lg hover:bg-gray/25 font-normal"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="px-3 py-1.5 rounded-lg hover:bg-gray/25 font-normal"
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="px-3 py-1.5 rounded-lg hover:bg-gray/25 font-normal"
                  >
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis className="px-3 py-1.5" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className="px-3 py-1.5 rounded-lg hover:bg-gray/20 font-normal"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
