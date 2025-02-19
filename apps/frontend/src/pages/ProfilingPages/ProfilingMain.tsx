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
} from "../../components/ui/pagination/pagination";

import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Input } from "../../components/ui/input";

import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "../../components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Modal from "../../components/profiling/FormTypeModal";

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
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="hidden md:block">{row.getValue("location")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">{row.getValue("description")}</div>
    ),
  },
  {
    accessorKey: "incidentTime",
    header: "Time of Incident",
    cell: ({ row }) => (
      <div className="hidden md:block">{row.getValue("incidentTime")}</div>
    ),
  },
  {
    accessorKey: "reportedBy",
    header: "Reported By",
    cell: ({ row }) => (
      <div className="hidden lg:block">{row.getValue("reportedBy")}</div>
    ),
  },
  {
    accessorKey: "timeReported",
    header: "Time Reported",
    cell: ({ row }) => (
      <div className="hidden xl:block">{row.getValue("timeReported")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <DialogLayout
        trigger={
          <div className="w-[50px] h-[35px] border border-gray flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
            View
          </div>
        }
        className="max-w-full sm:max-w-[95%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[50%] h-full sm:h-4/5 md:h-3/4 lg:h-2/3 flex flex-col"
        title="Report Details"
        description="This report was received on 9th of July, 2025. Please respond accordingly."
        mainContent={"/"}
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
  {
    id: "Lorem",
    category: "Aorem",
    location: "Lorem",
    description: "Lorem",
    incidentTime: "Lorem",
    reportedBy: "Lorem",
    timeReported: "Lorem",
    date: "Lorem",
  },{
    id: "Lorem",
    category: "Aorem",
    location: "Lorem",
    description: "Lorem",
    incidentTime: "Lorem",
    reportedBy: "Lorem",
    timeReported: "Lorem",
    date: "Lorem",
  },{
    id: "Lorem",
    category: "Aorem",
    location: "Lorem",
    description: "Lorem",
    incidentTime: "Lorem",
    reportedBy: "Lorem",
    timeReported: "Lorem",
    date: "Lorem",
  },{
    id: "Lorem",
    category: "Aorem",
    location: "Lorem",
    description: "Lorem",
    incidentTime: "Lorem",
    reportedBy: "Lorem",
    timeReported: "Lorem",
    date: "Lorem",
  },{
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = reports;
  
  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <Outlet />
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Resident Record
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view resident information
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="flex flex-col gap-4 lg:hidden mb-4">
        <div className="relative w-full">
          <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
          <Input placeholder="Search..." className="pl-10 w-full" />
        </div>
        
        <div className="flex justify-between gap-2">
          <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FaFilter className="mr-1" />
                <span className="hidden xs:inline">Filter</span>
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
                <Button variant="outline" size="sm">
                  <FaSort className="mr-1" />
                  <span className="hidden xs:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Location</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex gap-2">
            <Link to="/profilingRequest">
              <Button variant="outline" size="sm">Pending</Button>
            </Link>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <FaPlus className="mr-1" />
              <span className="hidden xs:inline">Register</span>
            </Button>
          </div>
        </div>
      </div>

      {/* The Header is hidden on small screens */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <Input placeholder="Search..." className="pl-10 w-72" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FaFilter className="mr-1" />
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
              <Button variant="outline">
                <FaSort className="mr-1" />
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
            <Link to="/profilingRequest">
              <Button variant="outline">Pending</Button>
            </Link>

            {/* Registration Button */}
            <Button onClick={() => setIsModalOpen(true)}>
              <FaPlus className="mr-1" />
              Register
            </Button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Register Resident</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Registration form content */}
          <div className="mb-4">
            <div className="w-full h-[14rem] sm:h-[18rem] md:h-[20rem] grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Registration Form */}
              <Link
                to="/residentRegistration"
                className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
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
                className="relative inline-block overflow-hidden group border-2 h-full rounded-lg"
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

          <div className="flex justify-end gap-2 mt-4 sm:mt-6">
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button>
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" defaultValue="10" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:text-base"
                >
                  <FaFileImport className="mr-1" />
                  <span className="hidden xs:inline">Export</span>
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
        <div className="bg-white w-full overflow-x-auto">
          {/* Table Placement */}
          <DataTable columns={columns} data={data} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-10 of 150 rows
          </p>

          {/* Pagination */}
          <div className="w-full sm:w-auto flex justify-center">
            <Pagination className="flex items-center gap-1 sm:gap-2">
              <PaginationContent className="flex items-center gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray/25 font-normal text-xs sm:text-sm"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray/25 font-normal text-xs sm:text-sm"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray/25 font-normal text-xs sm:text-sm"
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem className="hidden xs:block">
                  <PaginationLink
                    href="#"
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray/25 font-normal text-xs sm:text-sm"
                  >
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem className="hidden xs:block">
                  <PaginationEllipsis className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray/20 font-normal text-xs sm:text-sm"
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