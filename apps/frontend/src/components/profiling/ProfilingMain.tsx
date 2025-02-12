import React from "react";
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

import TableLayout from "../ui/table/table-layout";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Input } from "../ui/input";

export default function ProfilingMain() {
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
              <Button
                variant="outline"
                className="gap-2 font-normal"
              >
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
              className="flex items-center justify-center shadow-sm w-32 bg-white rounded-md hover:bg-gray-100 hover:bg-gray/20"
            >
              Pending
            </Link>
            <Link
              to="/residentRegistration"
              className="flex gap-x-2 shadow-sm items-center justify-center w-32 rounded-md text-white bg-blue hover:bg-sky-400"
            >
              <span>
                <FaPlus />
              </span>
              Register
            </Link>
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
          <TableLayout
            header={[
              "Resident No.",
              "Household No.",
              "Family No.",
              "Sitio",
              "Last Nmae",
              "First Name",
              "M.I",
              "Suffix",
              "Date Registered",
              "Action",
            ]}
            rows={Array(10).fill([
              "Paolo Araneta Jr. Senpai",
              "Josef Virtucio AKA The Sheeesh",
              "Row3",
              "Row4",
              "Row4",
              "Row4",
              "Row4",
              "Row4",
              "Row4",
              "Row4",
            ])}
          />
        </div>
        <div className="flex items-center justify-between w-full py-3">
          {/* Showing Rows Info */}
          <p className="pl-4 text-sm font-normal text-darkGray">Showing 1-10 of 150 rows</p>

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
