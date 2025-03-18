import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import VaccinationForm from "./VaccinationModal";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowUpDown, Eye, Trash, Search } from "lucide-react";
import { Link } from "react-router-dom";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { FileInput } from "lucide-react";

export default function AllVaccinationRecords() {
  type vacRecords = {
    id: number;
    patient: {
      firstName: string;
      lastName: string;
      middleName: string;
      gender: string;
      age: number;
      ageTime: string;
    };
    address: string;
    sitio: "Logarta" | "Bolinawan";
    type: "Transient" | "Resident";
  };

  const columns: ColumnDef<vacRecords>[] = [
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
      accessorKey: "patient",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Patient <ArrowUpDown size={15} />
        </div>
      ),
      cell: ({ row }) => {
        const patient = row.original.patient;
        const fullName =
          `${patient.lastName}, ${patient.firstName} ${patient.middleName}`.trim();

        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {patient.gender}, {patient.age} {patient.ageTime} old
              </div>
            </div>
          </div>
        );
      },
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
      cell: ({}) => (
        <>
          <div className="flex justify-center gap-2 ">
            <TooltipLayout
              trigger={
                <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                  <Link to="/invVaccinationRecord">
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
                  mainContent={<></>}
                />
              }
              content="Delete"
            />
          </div>
        </>
      ),
    },
  ];

  const sampleData: vacRecords[] = [
    {
      id: 1,
      patient: {
        lastName: "Caballes",
        firstName: "Katrina Shin",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
      },
      address: "BOnsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Transient",
    },
    {
      id: 2,
      patient: {
        lastName: "Caballes",
        firstName: "Katrina",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
      },
      address: "BOnsai Bolinawan Carcar City",
      sitio: "Bolinawan",
      type: "Transient",
    },
    {
      id: 3,
      patient: {
        lastName: "Caballes",
        firstName: "Katrina",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
      },
      address: "BOnsai Bolinawan Carcar City",
      sitio: "Logarta",
      type: "Resident",
    },
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [value, setValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<vacRecords[]>(sampleData);
  const [currentData, setCurrentData] = useState<vacRecords[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const filtered = sampleData.filter((record) => {
      const searchText = `${record.id} 
        ${record.patient.firstName} 
        ${record.patient.lastName} 
        ${record.address} 
       `.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

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
    setPageSize(!isNaN(value) && value > 0 ? value : 10);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-col">
        {/* Header Section */}
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Vaccination Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          {/* Search Input and Filter Dropdown */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex gap-x-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                  size={17}
                />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-72 bg-white"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <SelectLayout
                placeholder="Filter records"
                label=""
                className="bg-white"
                options={[
                  { id: "1", name: "All Types" },
                  { id: "2", name: "Recent" },
                  { id: "3", name: "Archived" },
                ]}
                value=""
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <DialogLayout
              trigger={
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setValue("nonExistingPatient")}
                >
                  New Record
                </Button>
              }
              className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] h-full sm:h-auto"
              title="Vaccination"
              mainContent={
                <div>
                  <VaccinationForm recordType={value} />
                </div>
              }
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-2 items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-14 h-8"
                value={pageSize}
                onChange={handlePageSizeChange}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="Export data">
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
            <DataTable columns={columns} data={currentData} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
              Showing{" "}
              {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}-
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} rows
            </p>

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
    </>
  );
}
