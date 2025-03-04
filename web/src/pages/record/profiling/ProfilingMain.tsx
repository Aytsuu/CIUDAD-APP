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
import { useState, useEffect } from "react";

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

// Sample data 
export const reports: Report[] = [
  {
    id: "001",
    householdNo: "H-001",
    familyNo: "F-001",
    sitio: "Sitio A",
    lastName: "Smith",
    firstName: "John",
    mi: "D",
    suffix: "Jr",
    dateRegistered: "2025-01-15",
  },
  {
    id: "002",
    householdNo: "H-001",
    familyNo: "F-001",
    sitio: "Sitio A",
    lastName: "Smith",
    firstName: "Jane",
    mi: "L",
    suffix: "",
    dateRegistered: "2025-01-15",
  },
  {
    id: "003",
    householdNo: "H-002",
    familyNo: "F-002",
    sitio: "Sitio B",
    lastName: "Johnson",
    firstName: "Robert",
    mi: "K",
    suffix: "",
    dateRegistered: "2025-01-18",
  },
  {
    id: "004",
    householdNo: "H-002",
    familyNo: "F-002",
    sitio: "Sitio B",
    lastName: "Johnson",
    firstName: "Mary",
    mi: "J",
    suffix: "",
    dateRegistered: "2025-01-18",
  },
  {
    id: "005",
    householdNo: "H-003",
    familyNo: "F-003",
    sitio: "Sitio C",
    lastName: "Williams",
    firstName: "David",
    mi: "R",
    suffix: "",
    dateRegistered: "2025-01-20",
  },
  // Add more sample data as needed
];

// Generate additional sample data for testing pagination
const generateMoreData = (): Report[] => {
  const moreData: Report[] = [];
  for (let i = 6; i <= 150; i++) {
    moreData.push({
      id: `${i.toString().padStart(3, '0')}`,
      householdNo: `H-${Math.floor((i-1)/2) + 3}`,
      familyNo: `F-${Math.floor((i-1)/2) + 3}`,
      sitio: `Sitio ${String.fromCharCode(67 + Math.floor((i-1)/2))}`,
      lastName: `LastName${i}`,
      firstName: `FirstName${i}`,
      mi: String.fromCharCode(65 + (i % 26)),
      suffix: i % 5 === 0 ? "Jr" : "",
      dateRegistered: `2025-02-${(i % 28) + 1}`,
    });
  }
  return moreData;
};

// Complete dataset combining initial and generated data
const fullDataset: Report[] = [...reports, ...generateMoreData()];

export default function ProfilingMain() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<Report[]>(fullDataset);
  const [currentData, setCurrentData] = useState<Report[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Filter data based on search query
  useEffect(() => {
    const filtered = fullDataset.filter(report => {
      const searchText = `${report.id} ${report.householdNo} ${report.familyNo} ${report.sitio} ${report.lastName} ${report.firstName} ${report.mi} ${report.suffix} ${report.dateRegistered}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, pageSize]);

  // Update data based on page and page size
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setPageSize(value);
    } else {
      setPageSize(10); // Default to 10 if invalid input
    }
  };

  // Handle page change from the PaginationLayout component
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
            options={[
              {id: "1", name: ""},
              {id: "2", name: "By date"},
              {id: "3", name: "By location"}, 
            ]}
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
            <Input 
              type="number" 
              className="w-14 h-6" 
              value={pageSize}
              onChange={handlePageSizeChange}
              min="1"
            />
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
          <DataTable columns={columns} data={currentData} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
          </p>

          {/* Pagination - using the PaginationLayout component */}
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}