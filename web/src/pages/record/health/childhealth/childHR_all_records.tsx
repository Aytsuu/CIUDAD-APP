import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import { Search, Trash, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { FileInput } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";

export default function AllChildHealthRecords() {
  type ChrRecords = {
    id: number;
    // patientName: string;
    patient: {
      firstName: string;
      lastName: string;
      middleName: string;
      gender: string;
      age: number;
      ageTime: string;
    };
    address: string;
    sitio: string;
    type: string;
  };
  const columns: ColumnDef<ChrRecords>[] = [
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
      header: "Patient",
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
      header: "Address",
      cell: ({ row }) => (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.address}</div>
        </div>
      ),
    },
    {
      accessorKey: "sitio",
      header: "sitio",
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
                  <Link to="/invtablechr">
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

  const sampleData: ChrRecords[] = [
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
      type: "transient",
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
      type: "transient",
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
      sitio: "Bolinawan",
      type: "transient",
    },
  ];

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

  const navigate = useNavigate();
  function toChildHealthForm() {
    navigate("/newAddChildHRForm", { state: { recordType: "nonexistingPatient" } });
  }

  return (
<<<<<<< HEAD:apps/frontend/src/pages/record/health/childhealth/childHR_all_records.tsx
    <div className="w-full bg-snow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
=======
    <div className="w-full">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
>>>>>>> 4d0d0c735422622c1d6ee33aa4b97cc61c8471f9:web/src/pages/record/health/childhealth/childHR_all_records.tsx
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Child Health Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
              Manage and view child's information
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

        <div className="w-full md:w-auto">
<<<<<<< HEAD:apps/frontend/src/pages/record/health/childhealth/childHR_all_records.tsx
        <Button onClick={toChildHealthForm}>New Record</Button>

=======
          <Link to="/newAddChildHRForm">
            <Button className=" w-full md:w-auto">New Record</Button>
          </Link>
>>>>>>> 4d0d0c735422622c1d6ee33aa4b97cc61c8471f9:web/src/pages/record/health/childhealth/childHR_all_records.tsx
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
