import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Search, Trash, ChevronLeft, Plus, FileInput } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import FirstAidModal from "../inventoryModal/FirstAidModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import { SelectLayout } from "@/components/ui/select/select-layout";

export default function FirstAidList() {
  // Updated type for first aid records
  type FirstAidRecords = {
    id: number;
    itemName: string;
    category: string;
  };

  // Updated columns for first aid data
  const columns: ColumnDef<FirstAidRecords>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="text-center font-semibold">{row.original.id}</div>
      ),
    },
    {
      accessorKey: "itemName",
      header: "Item Name",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: () => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer">
                    <Trash size={16} />
                  </div>
                }
                mainContent={<></>}
              />
            }
            content="Delete"
          />
        </div>
      ),
    },
  ];

  // Sample data
  const sampleData: FirstAidRecords[] = [
    { id: 1, itemName: "Bandage", category: "Wound Care" },
    { id: 2, itemName: "Antiseptic Wipes", category: "Disinfectant" },
  ];

  const filterOptions = [
    { id: "0", name: "All" },
    { id: "1", name: "Condom" },
    { id: "2", name: "IUD" },
  ];

  // Fixed state initialization
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All"); // Added missing state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] =
    useState<FirstAidRecords[]>(sampleData); // Fixed type
  const [currentData, setCurrentData] = useState<FirstAidRecords[]>([]); // Fixed type
  const [totalPages, setTotalPages] = useState(1);

  // Combined filter effect for search and category
  useEffect(() => {
    const filtered = sampleData.filter((item) => {
      const searchMatch = `${item.id} ${item.itemName} ${item.category}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const categoryMatch =
        selectedFilter === "All" || item.category === selectedFilter;

      return searchMatch && categoryMatch;
    });

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedFilter, pageSize]); // Added selectedFilter to dependencies

  // Pagination effect
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  // Fixed handler for filter change
  const handleFilterChange = (selectedValue: string) => {
    setSelectedFilter(selectedValue);
  };

  // Fixed search input binding
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

  // Handle page change from the PaginationLayout component
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 bg-snow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            FirstAid List
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patients information
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

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
                value={searchQuery} // Fixed: Changed searchTerm to searchQuery
                onChange={handleSearchChange}
              />
            </div>
            <SelectLayout
              className="w-full md:w-[200px] bg-white text-black"
              label="Select Category"
              placeholder="All"
              options={filterOptions}
              value={selectedFilter}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <DialogLayout
          trigger={
            <div className="w-auto flex justify-end items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
              <Plus size={15} /> Add
            </div>
          }
          title="First List"
          description="Add New First Aid"
          mainContent={<FirstAidModal />}
        />
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
            {Math.min(currentPage * pageSize, filteredData.length)} of
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
  );
}
