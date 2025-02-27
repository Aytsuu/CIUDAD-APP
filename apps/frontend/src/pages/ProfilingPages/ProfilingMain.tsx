import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ClockArrowUp, FileInput, ArrowUpDown, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

import { Link, Outlet } from "react-router";
import { Input } from "../../components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "../../components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import RegistrationOptions from "./RegistrationOptions";

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
          <div className="w-[50px] h-[35px] border flex justify-center items-center rounded-[5px] shadow-sm text-[13px]">
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
];

export default function ProfilingMain() { 
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

      {/* The Header is hidden on small screens */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search..." className="pl-10 w-72 bg-white" />
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
        <div>
          <div className="flex gap-2">
            <Link to="/profilingRequest">
              <Button variant="outline">
                <ClockArrowUp />
                Pending
              </Button>
            </Link>

            {/* Registration Button */}
            <DialogLayout 
              trigger={
                <div className="flex items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90"> 
                  <Plus size={15}/> Register
                </div>
              }
              className=""
              title=""
              description=""
              mainContent={<RegistrationOptions />}
            />
          </div>
        </div>
      </div>

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
                <Button variant="outline">
                  <FileInput />
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
            <PaginationLayout />
          </div>
        </div>
      </div>
    </div>
  );
}