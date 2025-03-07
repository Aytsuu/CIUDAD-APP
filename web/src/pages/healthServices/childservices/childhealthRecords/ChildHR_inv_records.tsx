import React, { useState, useEffect } from "react";
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
    // Add more sample data as needed
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<ChrRecords[]>(sampleData);
  const [currentData, setCurrentData] = useState<ChrRecords[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Filter data based on search query
  useEffect(() => {
    const filtered = sampleData.filter((item) => {
      const matchesSearch = `${item.age} ${item.wt} ${item.ht} ${item.vaccineStat} ${item.nutritionStat} ${item.updatedAt}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, pageSize]);

  // Update data based on page and page size
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
    if (!isNaN(value) && value > 0) {
      setPageSize(value);
    } else {
      setPageSize(10); // Default to 10 if invalid input
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const navigate = useNavigate();
  function toChildHealthForm() {
    navigate("/newAddChildHRForm", { state: { recordType: "existingPatient" } });
  }

  return (
    <div className="w-full bg-snow">
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
            Manage and view child's information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 " />

      <div className="mb-5">
        <ChildInfo />
      </div>
      <div className="w-full md:w-auto flex justify-end mb-2">
        <Button onClick={toChildHealthForm}>Update Record</Button>
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
          <DataTable columns={columns} data={currentData} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} rows
          </p>

          {/* Pagination */}
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
  );
}