import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import VaccinationForm from "./vaccinationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { FileInput, Search } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";

export default function ProcessingQueueTable() {
  type ProcessingQueueRec = {
    id: string;
    patient: {
      firstName: string;
      lastName: string;
      middlename: string;
      gender: string;
      age: number;
    };
    address: string;
    service: string;
    date: string;
  };

  const sampledata: ProcessingQueueRec[] = [
    {
      id: "1",
      patient: {
        firstName: "Juan",
        lastName: "Dela Cruz",
        middlename: "Santos",
        gender: "F",
        age: 20,
      },
      address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
      service: "Vaccination",
      date: "2022-01-01",
    },
    {
      id: "2",
      patient: {
        firstName: "Maria",
        lastName: "Santos",
        middlename: "Dela Cruz",
        gender: "F",
        age: 25,
      },
      address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
      service: "Prenatal",
      date: "2022-01-01",
    },
    {
      id: "3",
      patient: {
        firstName: "Pedro",
        lastName: "Penduko",
        middlename: "Santos",
        gender: "M",
        age: 30,
      },
      address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
      service: "Postpartum",
      date: "2022-01-01",
    },
    {
      id: "4",
      patient: {
        firstName: "Ana",
        lastName: "Perez",
        middlename: "Santos",
        gender: "F",
        age: 5,
      },
      address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
      service: "Child",
      date: "2022-01-01",
    },
  ];

  const columns: ColumnDef<ProcessingQueueRec>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 w-auto px-3 py-1 rounded-md text-center font-semibold">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "patient",
      header: () => <div className="text-center">Patient</div>, // Center-align header
      cell: ({ row }) => {
        const patient = row.original.patient;
        const fullName =
          `${patient.lastName}, ${patient.firstName} ${patient.middlename}`.trim();

        return (
          <div className="flex flex-col items-center text-center ">
            {" "}
            <div className="w-[200px]">
              {/* Center-align cell content */}
              <div className="font-medium whitespace-normal">{fullName}</div>
              <div className="text-sm text-darkGray">
                {patient.gender}, {patient.age} yr old
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
        <div className="flex flex-col items-center text-center ">
          <div className="w-[200px]">{row.original.address}</div>
        </div>
      ),
    },
    {
      accessorKey: "service",
      header: "Service",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex flex-col items-center text-center w-full">
          <div className="w-[200px]">{row.original.date}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const service = row.original.service;

        return (
          <div className="flex gap-2 justify-center min-w-[120px] px-2">
            <div>
              {service === "Vaccination" ? (
                <VaccinationForm />
              ) : service === "Prenatal" ? (
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700"
                  onClick={() =>
                    console.log("Prenatal record:", row.original.id)
                  }
                >
                  Assess
                </Button>
              ) : service === "Postpartum" ? (
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700"
                  onClick={() =>
                    console.log("Postpartum record:", row.original.id)
                  }
                >
                  Assess
                </Button>
              ) : service === "Child" ? (
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700"
                  onClick={() => console.log("Child record:", row.original.id)}
                >
                  Assess
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700"
                  onClick={() =>
                    console.log("Unknown service:", row.original.id)
                  }
                >
                  Assess
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const data = sampledata;

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
            item.service === selectedFilter || item.service === selectedFilter
        );

  return (
    <>
      <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-col items-center mb-4">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Processing Queue
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view patients information
            </p>
          </div>
        </div>
        <hr className="border-gray mb-6 sm:mb-10" />
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
                />
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
      </div>
    </>
  );
}
