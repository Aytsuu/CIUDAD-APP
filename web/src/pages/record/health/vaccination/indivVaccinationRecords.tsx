import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
// import { Link } from "react-router";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import VaccinationForm from "./vaccinationModal";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ArrowLeft, ArrowUpDown, Search } from "lucide-react";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { FileInput } from "lucide-react";

export default function IndivVaccinationRecords() {
  type vacRecords = {
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
    dateAdministered: string;
    vaccine: string;
    dose: string;
    vitalSign: {
      pr: number;
      bp: string;
      o2: number;
      temp: number;
    };
    signature: string;
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
        <div className="flex justify-start  px-2">
          <div className="w-full truncate">{row.original.address}</div>
        </div>
      ),
    },

    {
      accessorKey: "dateAdministered",
      header: ({ column }) => (
        <div
          className="flex w-full justify-center items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Administered <ArrowUpDown size={15} />
        </div>
      ),

      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-full truncate">{row.original.dateAdministered}</div>
        </div>
      ),
    },
    {
      accessorKey: "vaccine",
      header: "Vaccine",
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-full truncate">{row.original.vaccine}</div>
        </div>
      ),
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <div className="flex justify-start px-2">
          <div className="w-full truncate">{row.original.dose}</div>
        </div>
      ),
    },

    {
      accessorKey: "vitalSigns",
      header: "Vital Signs",
      cell: ({ row }) => {
        const vitalSign = row.original.vitalSign;

        return (
          <div className="flex justify-center items-center min-w-[120px] px-2">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-center gap-3">
                <div className="text-sm text-darkGray">
                  <span className="font-medium">O2: </span>
                  {vitalSign.o2}
                </div>
                <div className="text-sm text-darkGray">
                  <span className="font-medium">BP: </span>
                  {vitalSign.bp}
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <div className="text-sm text-darkGray">
                  <span className="font-medium">PR: </span>
                  {vitalSign.pr}
                </div>
                <div className="text-sm text-darkGray">
                  <span className="font-medium">TEMP: </span>
                  {vitalSign.temp}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "signature",
      header: "Signature",
      cell: ({ row }) => (
        <div className="flex justify-start px-2 w-[100px]">
          <img
            src={row.original.signature}
            alt="Signature"
            className="w-12 h-12 object-contain rounded-md"
          />{" "}
        </div>
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
      dateAdministered: "12-23-23",
      vaccine: "Bolinawan",
      dose: "1st Dose",
      vitalSign: {
        pr: 12,
        bp: "12/23",
        o2: 23,
        temp: 12,
      },
      signature: "Shin",
    },
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const data = sampleData;

  const filter = [
    { id: "0", name: "All" },
    { id: "1", name: "covid" },
    { id: "2", name: "flu" },
  ];
  const [selectedFilter, setSelectedFilter] = useState(filter[0].name);

  const filteredData =
    selectedFilter === "All"
      ? data
      : data.filter((item) => item.vaccine === selectedFilter);

  const vaccines = [
    { name: "Influenza", dose: "2 Doses" },
    { name: "COVID-19 Booster", dose: "1 Dose" },
    { name: "Tetanus", dose: "1 Dose" },
    // Add more vaccine objects here
  ];

  const [value, setValue] = useState("");

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
      <Link to="/allVaccinationRecord">
        {" "}
        <div className="mb-4 text-darkBlue2">
          <ArrowLeft />
        </div>
      </Link>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
           Vaccination History
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />
      <div className="mb-8">
        {/* <VitalSignsChart /> */}
        <div className=" rounded-lg w-full">
          {/* Card Title */}
          <h1 className="text-m font-semibold text-darkBlue2 py-2">
            Not Yet Administered Vaccines
          </h1>

          <div className=" rounded-lg  w-full">
            {/* Vaccine List */}
            <div className="grid grid-cols-1 gap-2 bg-white rounded-md ">
              {vaccines.map((vaccine, index) => (
                <div
                  key={index}
                  className="p-4  border-b border-x-ashGray"
                >
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                   {vaccine.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Dose: </span>
                    <span>{vaccine.dose}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
          <DialogLayout
            trigger={
              <Button
                className="w-full sm:w-auto"
                onClick={() => setValue("existingPatient")}
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
      </div>{" "}
    </div>
  );
}
