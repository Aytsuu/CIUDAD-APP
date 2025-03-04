import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router";
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
import { Label } from "@/components/ui/label";
import CardLayout from "@/components/ui/card/card-layout";
import { ChevronLeft } from "lucide-react";
import ChildInfo from "./ChildsInformation";

export default function InvChildHealthRecords() {
  type ChrRecords = {
    id: number;
    age: string;
    wt: number;
    ht: number;
    vaccineStat: String;
    nutritionStat: String;
    updatedAt: string;
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
      accessorKey: "age",
      header: "Age",
    },
    {
      accessorKey: "wt",
      header: "WT",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.updatedAt}</div>
        </div>
      ),
    },
    {
      accessorKey: "ht",
      header: "HT",
    },

    {
      accessorKey: "vaccineStat",
      header: "Immunization Status",
    },
    {
      accessorKey: "nutritionStat",
      header: "Nutrtion Status",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.updatedAt}</div>
        </div>
      ),
    },

    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.updatedAt}</div>
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
                  <Eye size={15} />
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
      age: "4 days",
      wt: 12,
      ht: 34,
      vaccineStat: "Not FIC",
      nutritionStat: "Not FIC",
      updatedAt: "2024-02-21",
    },
  ];

  const data = sampleData;

  const navigate = useNavigate();
  function toChildHealthForm() {
    navigate("/newAddChildHRForm", { state: { recordType: "existingPatient" } });
  }

  return (
    <div className="w-full   bg-snow">
      <Link to="/allChildHRTable">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"}>
          <ChevronLeft />
        </Button>
      </Link>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Individual Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view childs information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 " />

<<<<<<< HEAD:apps/frontend/src/pages/record/health/childhealth/childHR_inv_records.tsx
      <div className="mb-5">
        <ChildInfo />
      </div>
      <div className="w-full md:w-auto flex justify-end mb-2">
        <Button onClick={toChildHealthForm}>Update Record</Button>
=======
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
          <Link to="/newAddChildHRForm">
            <Button className=" w-full md:w-auto">New Record</Button>
          </Link>
        </div>
>>>>>>> 4d0d0c735422622c1d6ee33aa4b97cc61c8471f9:web/src/pages/record/health/childhealth/childHR_inv_records.tsx
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
          <DataTable columns={columns} data={data} />
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
