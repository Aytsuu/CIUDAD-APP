import { BsChevronLeft } from "react-icons/bs";
import { Link } from "react-router";
import { BsSearch } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaFilter, FaSort } from "react-icons/fa";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import ViewInfo from "../../pages/ProfilingPages/ProfilingViewInfo";

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
  },
  {
    accessorKey: "description",
    header: "Description",
    // Hide description on small screens
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "incidentTime",
    header: "Time of Incident",
  },
  {
    accessorKey: "reportedBy",
    header: "Reported By",
  },
  {
    accessorKey: "timeReported",
    header: "Time Reported",
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
        description=""
        title=""
        className=""
        mainContent={<ViewInfo />}
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
];

export default function ProfilingRequest() {
  const data = reports;
  return (
    <div className="w-full px-2 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-2 py-4">
        {/* Header - Stacks vertically on mobile */}
        <Link
          to="/"
          className="text-black p-2 hover:bg-darkGray/25 hover:rounded-full self-start"
        >
          <BsChevronLeft />
        </Link>
        <div className="flex flex-col">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Awaiting Approval
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Submissions under review and pending authorization
          </p>
        </div>  
      </div>

      <hr className="text-darkGray mt-2 mb-4 sm:mt-4 sm:mb-8" />

      {/* Search and filters - Stacks on mobile */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-x-2">
          <div className="relative flex w-full sm:w-auto">
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <Input placeholder="Search..." className="pl-10 w-full sm:w-72" />
          </div>

          <div className="flex gap-2 sm:gap-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 font-normal flex-1 sm:flex-none"
                >
                  <FaFilter />
                  <span className="block">Filter</span>
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
                <Button
                  variant="outline"
                  className="gap-2 font-normal flex-1 sm:flex-none"
                >
                  <FaSort />
                  <span className="block">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Location</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table Layout */}
      <div>
        <div className="mt-2 sm:mt-4 overflow-x-auto">
          {/* Wrap the DataTable in a scrollable container */}
          <div className="min-w-full overflow-hidden overflow-x-auto bg-white">
            <DataTable columns={columns} data={data} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            {/* Showing Rows Info */}
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing 1-10 of 150 rows
            </p>

            {/* Pagination */}
            <div className="w-full sm:w-auto flex justify-center">
              <PaginationLayout />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
