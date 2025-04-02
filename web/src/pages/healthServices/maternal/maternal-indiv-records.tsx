import { useState } from "react";
import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown, Eye, Trash, Search } from "lucide-react";
import { FileInput } from "lucide-react";

import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown/dropdown-menu";

import MotherInfo from "./maternal-indiv-info";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"


export default function MaternalIndivRecords() {
  type maternalIndivRecords = {
    id: number;
    dateCreated: string;
    address: string;
    sitio: "Logarta" | "Bolinawan";
    type: "Transient" | "Resident";
    recordType: "Prenatal" | "Postpartum";
  };
  const columns: ColumnDef<maternalIndivRecords>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dateCreated",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[120px]">
          <div className="w-full truncate">{row.original.dateCreated}</div>
        </div>
      )
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.address}</div>
        </div>
      ),
    },

    {
      accessorKey: "sitio",
      header: "Sitio",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.sitio}</div>
        </div>
      ),
    },
    {
      accessorKey: "recordType",
      header: "Record Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.recordType}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.type}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const recordType = row.original.recordType;
        const viewPath = recordType === "Prenatal" ? "/prenatalviewing" : "/postpartumviewing";

        return(
          <div className="flex justify-center gap-2 ">
            <TooltipLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                  <Link to={viewPath}>
                    <Eye size={15} />
                  </Link>
                </div>
              }
              content="View"
            />

            <TooltipLayout
              trigger={
                <DialogLayout
                  trigger={
                    <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                      {" "}
                      <Trash size={16} />
                    </div>
                  }
                  className=""
                  title="Delete Record"
                  description="Are you sure you want to delete this record?"
                  mainContent={<></>}
                />
              }
              content="Delete"
            />
          </div>
        )
      },
    },
  ];

  const sampleData: maternalIndivRecords[] = [
    {
      id: 1,
      dateCreated: "2025-10-03",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Transient",
      recordType: "Prenatal",
    },

    {
      id: 2,
      dateCreated: "2024-10-02",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Transient",
      recordType: "Prenatal",
    },

    {
      id: 3,
      dateCreated: "2023-10-01",
      address: "Bonsai Bolinawan Carcar City",
      sitio: "Logarta",
      type: "Resident",
      recordType: "Postpartum",
    },
  ];

  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [searchTerm, setSearchTerm] = useState("");
  const data = sampleData;

  const filter = [
    { id: "0", name: "All" },
    { id: "1", name: "Transient" },
    { id: "2", name: "Logarta" },
  ];
  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

  const filteredData =
    selectedFilter === "All"
      ? data
      : data.filter(
          (item) =>
            item.type === selectedFilter || item.sitio === selectedFilter
        );

  // const [value, setValue] = useState("");
  return (
    <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view mother's information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      <div className="mb-5">
        <MotherInfo />
      </div>

      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        {/* Search Input and Filter Dropdown */}
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={17}
              />
              <Input placeholder="Search..." className="pl-10 w-72 bg-white" />
            </div>
            <SelectLayout
              className="w-full md:w-[200px] bg-white"
              label=""
              placeholder="Select"
              options={filter}
              value={selectedFilter}
              onChange={setSelectedFilter}
            />
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default">New Record</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link to="/prenatalform">Prenatal</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/postpartumform">Postpartum</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/*  */}

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
    </div>
  );
}
