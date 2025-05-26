import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { FileInput } from "lucide-react";

export default function VaccinationList() {
  type VaccinationRecords = {
    id: number;
    category: string;
    vaccineName: string;
    ageGroup: string;
    noOfDoses: number;
    interval: {
      interval: number;
      timeUnits: string;
    };
    specifyAge: string;
  };

  const sampleData: VaccinationRecords[] = [
    {
      id: 1,
      vaccineName: "COVID-19 Vaccine",
      category: "MedicalSupplies",
      ageGroup: "0-5 yrs old",
      noOfDoses: 2,
      interval: {
        interval: 18,
        timeUnits: "Months",
      },
      specifyAge: " ",
    },
    {
      id: 2,
      vaccineName: "Influenza Vaccine",
      category: "vaccine",
      ageGroup: "0-5 yrs old",
      noOfDoses: 1,
      interval: {
        interval: 18,
        timeUnits: "Weeks",
      },
      specifyAge: "",
    },
  ];

  const columns: ColumnDef<VaccinationRecords>[] = [
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
      accessorKey: "vaccineName",
      header: "Vaccine Name",
    },

    {
      accessorKey:"category",
      header:"Category"

    },
    {
      accessorKey: "ageGroup",
      header: "Age Group",
    },
    {
      accessorKey: "noOfDoses",
      header: "Required Doses",
    },
    {
      accessorKey: "interval",
      header: "Interval",
      cell: ({ row }) => {
        const interval=row.original.interval
        return(
          <div>
            {interval.interval} {" "} {interval.timeUnits}
          </div>
        )
      }
    },
   
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] =
    useState<VaccinationRecords[]>(sampleData);
  const [currentData, setCurrentData] = useState<VaccinationRecords[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const filtered = sampleData.filter((vaccine) => {
      const searchText =
        `${vaccine.id} ${vaccine.vaccineName} ${vaccine.ageGroup} ${vaccine.noOfDoses}`.toLowerCase();
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
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
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
              placeholder="Filter by"
              label=""
              className="bg-white"
              options={[
                { id: "1", name: "" },
                { id: "2", name: "By age group" },
                { id: "3", name: "By interval" },
              ]}
              value=""
              onChange={() => {}}
            />
          </div>
        </div>
     
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
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
          <DataTable columns={columns} data={currentData} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
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
    </>
  );
}
