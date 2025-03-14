import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Search } from "lucide-react";

import { Label } from "@radix-ui/react-label";
import { SelectLayout } from "@/components/ui/select/select-layout";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { FileInput } from "lucide-react";
import NotifyResident from "./NotifyUserReceiveMed";
import { Pill } from "lucide-react";

export default function MedicineRequestStatusTable() {
  type requestRecord = {
    id: string;
    patient: {
      firstName: string;
      lastName: string;
      middleName: string;
      gender: string;
      age: number;
      ageTime: string;
    };
    address: string;
    dateRequested: string;
    status: string;
  };

  const sampleData: requestRecord[] = [
    {
      id: "S133",
      patient: {
        lastName: "Caballes",
        firstName: "Katrina Shin",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
      },
      address: "BOnsai Bolinawan Carcar City",
      dateRequested: "23 bpm",
      status: "Pending Receipt",
    },
    {
      id: "P2",
      patient: {
        lastName: "Caballes",
        firstName: "Katrina Shin",
        middleName: "Dayuja",
        gender: "Female",
        age: 10,
        ageTime: "yr",
      },
      address: "BOnsai Bolinawan Carcar City",
      dateRequested: "23 bpm",
      status: "Pending Receipt",
    },
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccessfulModal, setIsSuccessfulModal] = useState(false);

  const handeleClose = () => {
    setIsDialogOpen(false);
  };
  const handeSave = () => {
    setIsDialogOpen(false);
    setIsSuccessfulModal(true);

    setTimeout(() => {
      setIsSuccessfulModal(false);
    }, 800);
  };

  const columns: ColumnDef<requestRecord>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 w-full p-1 rounded-md text-center font-semibold">
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
      accessorKey: "dateRequested",
      header: "Date Requested",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="w-[50px]">{row.original.dateRequested}</div>
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex justify-center ">
          <div className="w-[125px] bg-red-100 rounded-md py-1 text-red-500 font-medium ">
            {row.original.status}
          </div>
        </div>
      ),
    },

    {
      accessorKey: "action",
      header: "Action",
      cell: ({}) => (
        <div>
          <div className="flex gap-2 justify-center min-w-[120px]">
            <div>
              <DialogLayout
                trigger={
                  <div className="bg-white hover:bg-[#f3f2f2]  text-green-600 border border-green-700 px-4 py-2 rounded cursor-pointer">
                    View
                  </div>
                }
                title="Medicine Request Summary"
                description="medicine Request Summary"
                mainContent={
                  <>
                    <div className="h-[200px]  max-h-[calc(100vh-7rem)] overflow-y-auto px-1">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-col gap-2 p-2 rounded-md border border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <Pill className="h-5 w-5 text-blue flex-shrink-0" />

                            <Label className="font-medium">
                              Medicine: <span className="ml-1">Keneme</span>
                            </Label>
                          </div>
                          <div className="flex gap-3 ml-8">
                            <Label className="text-sm text-gray-600">
                              Qty: <span className="font-medium">12</span>
                            </Label>
                            <Label className="text-sm text-red-600">
                              Expiry Date:{" "}
                              <span className="font-medium">12-12-23</span>
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                }
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              />
            </div>

            <div>
              {/* <X size={16} /> */}

              <NotifyResident />
            </div>
          </div>
        </div>
      ),
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
            item.status === selectedFilter || item.address === selectedFilter
        );

  return (
    <div className=" bg-snow w-full h-full">
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
  );
}
