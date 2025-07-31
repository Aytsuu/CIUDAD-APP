"use client";
import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  Search,
  FileInput,
  Badge,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ImmunizationTracking } from "./types";
import { ColumnDef } from "@tanstack/react-table";
import { TableSkeleton } from "@/pages/healthServices/skeleton/table-skeleton";
import { getOrdinalSuffix } from "@/helpers/getOrdinalSuffix";

type Page3Props = {
  onPrevious: () => void;
  onNext: () => void;
  immunizationTracking: ImmunizationTracking[];
  isLoading?: boolean;
};

const immunizationColumns: ColumnDef<ImmunizationTracking>[] = [
  {
    accessorKey: "vaccine_name",
    header: "Vaccine",
    cell: ({ row }) => (
      <div className="font-medium text-gray-900">
        {row.getValue("vaccine_name")}
      </div>
    ),
  },

  {
    accessorKey: "dose_number",
    header: "Dose",
    cell: ({ row }) => {
      const doseNumber = Number(row.getValue("dose_number"));
      return (
        <div className="text-gray-800 flex justify-center ">
          <div className="w-20 text-sm  bg-blue-500 text-white rounded-md py-1 ">
            {getOrdinalSuffix(doseNumber)} Dose
          </div>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     const status = row.getValue("status");
  //     return (
  //       <div className={`text-sm font-medium ${
  //         status === "completed" ? "text-green-600" :
  //         status === "pending" ? "text-yellow-600" :
  //         "text-gray-600"
  //       }`}>
  //         {status as string}
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "batch_number",
    header: "Batch",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("batch_number") || (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "follow_up",
    header: "Next Dose",
    cell: ({ row }) => {
      const followUpDate = row.original.follow_up_date;
      const followUpStatus = row.original.follow_up_status;
      return (
        <div className="text-sm">
          {followUpDate ? (
            <div className="flex flex-col">
              <span className="font-medium">{followUpDate}</span>
              {followUpStatus && (
                <span className="text-xs text-gray-500">{followUpStatus}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      );
    },
  },
];

export default function ChildHRPage3({
  onPrevious,
  onNext,
  immunizationTracking,
  isLoading = false,
}: Page3Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = React.useMemo(() => {
    return immunizationTracking.filter((record) => {
      const searchText =
        `${record.vaccine_name} ${record.batch_number}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, immunizationTracking]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex justify-end items-start mb-6">
        <span className="text-sm font-light text-gray-400">Page 3 of 4</span>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Immunization History
        </h2>
        <p className="text-sm text-gray-500">Track all administered vaccines</p>
      </div>

      {/* Search and Filter Section */}
      <div className="w-full flex flex-col sm:flex-row gap-2 mb-2 mt-6">
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search vaccines..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Exact Table Container Replica */}
      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-3 justify-start items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-[70px] h-8 flex items-center justify-center text-center"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
                setCurrentPage(1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div className="flex justify-end sm:justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  aria-label="Export data"
                  className="flex items-center gap-2"
                >
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
          {isLoading ? (
            <TableSkeleton columns={immunizationColumns} rowCount={5} />
          ) : (
            <DataTable columns={immunizationColumns} data={paginatedData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-3 items-center pt-6 mt-4 border-t">
        <Button variant="outline" onClick={onPrevious} className="gap-2 px-6">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          className="gap-2 px-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continue
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
