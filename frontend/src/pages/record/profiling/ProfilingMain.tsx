import { Button } from "@/components/ui/button";
import {
  Plus,
  ClockArrowUp,
  FileInput,
  ArrowUpDown,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

import { Link, Outlet } from "react-router";
import { Input } from "../../../components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { DataTable } from "../../../components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import RegistrationOptions from "./RegistrationOptions";
import { useState } from "react";

// Define the type for the Report object
type Report = {
  id: string;
  householdNo: string;
  familyNo: string;
  sitio: string;
  lastName: string;
  firstName: string;
  mi: string;
  suffix: string;
  dateRegistered: string;
};

// Define the columns for the data table
export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Resident No.
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "householdNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Household No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("householdNo")}</div>
    ),
  },
  {
    accessorKey: "familyNo",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sitio.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("familyNo")}</div>
    ),
  },
  {
    accessorKey: "sitio",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("sitio")}
      </div>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("lastName")}
      </div>
    ),
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("firstName")}
      </div>
    ),
  },
  {
    accessorKey: "mi",
    header: "M.I",
    cell: ({ row }) => (
      <div className="hidden xl:block">{row.getValue("mi")}</div>
    ),
  },
  {
    accessorKey: "suffix",
    header: "Suffix",
    cell: ({ row }) => (
      <div className="hidden xl:block">{row.getValue("suffix")}</div>
    ),
  },
  {
    accessorKey: "dateRegistered",
    header: "Date Registered",
    cell: ({ row }) => (
      <div className="hidden xl:block">{row.getValue("dateRegistered")}</div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to="/resident-information">
        <Button variant="outline">View</Button>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

// Sample data for the reports
export const reports: Report[] = [
  {
    id: "Lorem",
    householdNo: "Lorem",
    familyNo: "Lorem",
    sitio: "Lorem",
    lastName: "Lorem",
    firstName: "Lorem",
    mi: "Lorem",
    suffix: "Lorem",
    dateRegistered: "Lorem",
  },
  {
    id: "Lorem",
    householdNo: "Lorem",
    familyNo: "Lorem",
    sitio: "Lorem",
    lastName: "Lorem",
    firstName: "Lorem",
    mi: "Lorem",
    suffix: "Lorem",
    dateRegistered: "Lorem",
  },
];

export default function ProfilingMain() {
  const [searchQuery, setSearchQuery] = useState("");
  const data = reports;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // const filteredPatients = patients.filter((patient) => {
  //   const searchString =
  //     `${patient.fname} ${patient.lname} ${patient.age} ${patient.gender} ${patient.date} ${patient.exposure} ${patient.siteOfExposure} ${patient.bitingAnimal}`.toLowerCase();
  //   return searchString.includes(searchQuery.toLowerCase());
  // });

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex flex-col justify-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Resident Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view resident information
        </p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* The Header is hidden on small screens */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1 bg-white">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
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
            <Link to="/registration-request">
              <Button variant="outline">
                <ClockArrowUp />
                Pending
              </Button>
            </Link>

            {/* Registration Button */}
            <DialogLayout
              trigger={
                <div className="flex items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
                  <Plus size={15} /> Register
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
        <div className="w-full bg-white flex flex-row justify-between p-3">
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
