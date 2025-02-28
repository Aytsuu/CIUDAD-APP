import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientQueueForm from "./patientQueueForm";
import { Check, TimerOff } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { FileInput, Search } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";

export default function PatientsQueueTable() {
  type PatQueueRec = {
    id: string;
    // patientName: string;
    patient: {
      firstName: string;
      lastName: string;
      middleName: string;
      gender: string;
      age: number;
      ageTime: string;
      category: string;
    };

    address: string;

    service: string;
    mode: string;
    time: string;
  };
  const columns: ColumnDef<PatQueueRec>[] = [
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
          <div className="flex min-w-[200px] px-2">
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
        <div className="flex min-w-[200px] px-2">
          <div className="w-full truncate">{row.original.address}</div>
        </div>
      ),
    },

    {
      accessorKey: "service",
      header: "Service",
      cell: ({ row }) => (
        <div className="flex justify-center px-2">
          <div className="text-center w-full">{row.original.service}</div>
        </div>
      ),
    },
    {
      accessorKey: "mode",
      header: "Mode",
      cell: ({ row }) => (
        <div className="flex justify-center px-2">
          <div className="text-center w-full">{row.original.mode}</div>
        </div>
      ),
    },
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => (
        <div className="flex justify-center px-2">
          <div className="text-center w-full">{row.original.time}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center min-w-[120px] px-2">
          <TooltipLayout
            trigger={
              <Button
                variant="outline"
                className=" border-green-600 text-green-700"
                onClick={() => console.log("View record:", row.original.id)}
                style={{ pointerEvents: "none" }}
              >
                <Check />
              </Button>
            }
            content="Assess"
          />

          <TooltipLayout
            trigger={
              <Button
                variant="outline"
                className="border-red-600 text-red-400"
                onClick={() => console.log("View record:", row.original.id)}
                style={{ pointerEvents: "none" }}
              >
                <TimerOff />
              </Button>
            }
            content="Not Arrived"
          />
        </div>
      ),
    },
  ];

  const sampleData: PatQueueRec[] = [
    {
      id: "S11",

      patient: {
        lastName: "Caballes",
        firstName: "Katrina",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
        category: "Senior",
      },
      address: "BOnsai  Carcar City",

      service: "Prenatal",
      mode: "Walkin",
      time: "AM",
    },

    {
      id: "P12",

      patient: {
        lastName: "Caballes",
        firstName: "Katrina",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
        category: "Senior",
      },
      address: "BOnsai Bolinawan Carcar City",
      service: "Prenatal",

      mode: "Walkin",
      time: "AM",
    },
    {
      id: "R1",

      patient: {
        lastName: "Caballes",
        firstName: "Katrina",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
        category: "Senior",
      },

      address: "BOnsai Bolinawan Carcar City",

      service: "Prenatal",

      mode: "Walkin",

      time: "AM",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
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
            item.service === selectedFilter || item.mode === selectedFilter
        );

  return (
    <>
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
        {/* Right Side: Add New Record Button */}
        <div className="w-full md:w-auto">
          <PatientQueueForm />
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
    </>
  );
}
