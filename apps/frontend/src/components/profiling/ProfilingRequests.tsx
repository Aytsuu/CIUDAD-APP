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

import { DataTable } from "../ui/table/data-table";

export default function ProfilingRequest() {
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
          {/* <DataTable
            columns={[
              { Header: 'ID', accessor: 'id' },
              { Header: 'Name', accessor: 'name' },
              { Header: 'Age', accessor: 'age' },
            ]}
            data={[
              { id: 1, name: 'John', age: 25 },
              { id: 2, name: 'Jane', age: 30 },
              { id: 3, name: 'Doe', age: 28 },
            ]}
          /> */}
        </div>
      </div>
    </div>
  );
}
