import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import CardLayout from "@/components/ui/card/card-layout";
import { Label } from "@/components/ui/label";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import VaccinationForm from "./VaccinationModal";
import { Syringe, ArrowLeft, ArrowUpDown, ChevronLeft } from "lucide-react";
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
    dateAdministered: string;
    vaccine: string;
    dose: string;
    pr: number;
    bp: string;
    o2: number;
    temp: number;
    signature: string;
  };

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [currentData, setCurrentData] = useState<vacRecords[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Sample data
  const sampleData: vacRecords[] = [
    {
      id: 1,
      dateAdministered: "2023-12-23",
      vaccine: "COVID-19",
      dose: "1st Dose",
      pr: 72,
      bp: "120/80",
      o2: 98,
      temp: 36.6,
      signature: "Shin",
    },
    {
      id: 2,
      dateAdministered: "2023-11-15",
      vaccine: "Influenza",
      dose: "Annual Dose",
      pr: 68,
      bp: "110/75",
      o2: 97,
      temp: 36.8,
      signature: "JohnD",
    },
    // Add more records as needed
  ];

  // Columns configuration
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
      accessorKey: "pr",
      header: "PR (bpm)",
      cell: ({ row }) => (
        <div className="text-center text-sm text-darkGray">
          {row.original.pr}
        </div>
      ),
    },
    {
      accessorKey: "bp",
      header: "BP",
      cell: ({ row }) => (
        <div className="text-center text-sm text-darkGray">
          {row.original.bp}
        </div>
      ),
    },
    {
      accessorKey: "o2",
      header: "O2 (%)",
      cell: ({ row }) => (
        <div className="text-center text-sm text-darkGray">
          {row.original.o2}
        </div>
      ),
    },
    {
      accessorKey: "temp",
      header: "Temp (°C)",
      cell: ({ row }) => (
        <div className="text-center text-sm text-darkGray">
          {row.original.temp}
        </div>
      ),
    },
    {
      accessorKey: "signature",
      header: "Signature",
      cell: ({ row }) => (
        <div className="flex justify-center px-2 w-[100px]">
          <img
            src={row.original.signature}
            alt="Signature"
            className="w-12 h-12 object-contain rounded-md"
          />
        </div>
      ),
    },
  ];

  // Filtering and pagination logic
  const filteredData = sampleData.filter((item) => {
    const matchesFilter =
      selectedFilter === "All" || item.vaccine === selectedFilter;
    const searchText = ` ${item.vaccine} ${item.dose}`.toLowerCase();
    return matchesFilter && searchText.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const total = Math.ceil(filteredData.length / pageSize);
    setTotalPages(total);
    if (currentPage > total) setCurrentPage(1);
  }, [filteredData, pageSize, currentPage]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPageSize(!isNaN(value) && value > 0 ? value : 10);
  };

  const vaccinesList = [
    { name: "Influenza", dose: "3 Dose" },
    { name: "COVID-19 Booster", dose: "1 Dose" },
    { name: "Tetanus", dose: "1 Dose" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row  gap-4 mb-8">
        <Link to="/allVaccinationRecord">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
          >
            <ChevronLeft />
          </Button>
        </Link>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
        <div className="mb-8">
          <CardLayout
            cardTitle="Patient Information"
            CardTitleClassName="text-blue text-xl"
            cardClassName="mb-8"
            cardContent={
              <div className="w-full flex flex-col gap-3 mt-[-10px]">
                {/* Name, Age, Sex Row */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-20 items-baseline">
                  <div className="flex gap-2 items-center">
                    <Label className="font-medium ">Name:</Label>
                    <span className="truncate">
                      Caballes, Katrina Shin Dayuja
                    </span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Label className="font-medium ">Age:</Label>
                    <span>10</span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <Label className="font-medium ">Sex:</Label>
                    <span>Female</span>
                  </div>
                </div>

                {/* Address Row */}
                <div className="flex gap-2 w-full items-baseline">
                  <Label className="font-medium ">Address:</Label>
                  <span className="truncate">
                    Bonsai Bolinawan, Carcar City, Cebu
                  </span>
                </div>
              </div>
            }
          />
          <div className="rounded-lg w-full">
            <h1 className="text-lg font-semibold flex gap-2 text-darkBlue2 pb-4">
              <Syringe />
              Upcoming Vaccinations
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vaccinesList.map((vaccine, index) => {
                const bgColors = [
                  "bg-blue",
                  "bg-purple-500",
                  "bg-green-500",
                  "bg-orange-500",
                  "bg-pink-500",
                  "bg-teal-500",
                ];

                const textColors = [
                  "text-white",
                  "text-purple-100",
                  "text-green-100",
                  "text-orange-100",
                  "text-pink-100",
                  "text-teal-100",
                ];

                const bgColor = bgColors[index % bgColors.length];
                const textColor = textColors[index % textColors.length];

                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="flex flex-1">
                      {/* Vaccine Name Section */}
                      <div
                        className={`${bgColor} flex-1 p-3  flex items-center rounded-l-lg`}
                      >
                        <h3
                          className={`${textColor} font-medium text-sm sm:text-base leading-tight break-words`}
                        >
                          {vaccine.name}
                        </h3>
                      </div>

                      {/* Dose Information Section */}
                      <div className="flex items-center justify-end p-3 bg-white rounded-r-lg flex-shrink-0">
                        <span className="text-sm sm:text-base font-semibold text-gray-800">
                          {vaccine.dose}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
          <div className="w-full flex justify-end">
            <DialogLayout
              trigger={
                <Button className="bg-blue hover:bg-blue-700 text-white">
                  + New Record
                </Button>
              }
              className="max-w-4xl"
              title="Add New Vaccination Record"
              mainContent={<VaccinationForm recordType={""} />}
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
          </div>
        </div>

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
