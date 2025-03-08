import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import CommodityStockForm from "../addstocksModal/ComStockModal";

export default function CommodityStocks() {
  type CommodityStocksRecord = {
    id: number;
    batchNumber: string;
    commodityName: string;
    category: string;
    recevFrom: string;
    qty: string;
    availQty: string;
    expiryDate: string;
    dispensed: string;
  };

  const columns: ColumnDef<CommodityStocksRecord>[] = [
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
      accessorKey: "batchNumber",
      header: "Batch No.",
    },
    {
      accessorKey: "commodityName",
      header: "Item Name",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: "recevFrom",
      header: "Received From",
      cell: ({ row }) => (
        <div className="text-center">{row.original.recevFrom}</div>
      )
    },
    {
      accessorKey: "qty",
      header: "Stocks",
      cell: ({ row }) => (
        <div className="text-center">{row.original.qty}</div>
      )
    },
    {
        accessorKey: "dispensed",
        header: "Dispensed",
        cell: ({ row }) => (
          <div className="text-center text-red-600">{row.original.dispensed}</div>
        )
      },
    {
      accessorKey: "availQty",
      header: "Available",
      cell: ({ row }) => (
        <div className="text-green-700">{row.original.availQty}</div>
      )
    },
  
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.expiryDate}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({}) => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
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

  const sampleData: CommodityStocksRecord[] = [
    {
      id: 1,
      batchNumber: "122A",
      commodityName: "Condom",
      category: "Condom",
      recevFrom: "DOH",
      qty: "10 bx/s (500 pc/s)",
      availQty: "10 bx/s (500 pc/s)",
      dispensed: "0",
      expiryDate: "2025-12-31"
    },
    {
      id: 2,
      batchNumber: "12S2A",
      commodityName: "pills COC",
      category: "Pills",
      recevFrom: "DOH",
      qty: "10 pcs",
      availQty: "0",
      dispensed: "10 pcs",
      expiryDate: "2024-06-30"
    },
   
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<CommodityStocksRecord[]>(sampleData);
  const [currentData, setCurrentData] = useState<CommodityStocksRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const filtered = sampleData.filter((item) => {
      const searchTerms = [
        item.id.toString(),
        item.batchNumber,
        item.commodityName,
        item.category,
        item.recevFrom,
        item.qty.toString(),
        item.availQty.toString(),
        item.dispensed.toString(),
        item.expiryDate
      ].join(" ").toLowerCase();

      return searchTerms.includes(searchQuery.toLowerCase());
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
                { id: "1", name: "All" },
                { id: "2", name: "By date" },
                { id: "3", name: "By category" },
              ]}
              value=""
              onChange={() => {}}
            />
          </div>
        </div>
        <DialogLayout
          trigger={
            <div className="w-auto flex justify-end items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
              <Plus size={15} /> New 
            </div>
          }
          title="Commodity Inventory"
          description="Add New Commodity Item"
          mainContent={<CommodityStockForm/>}
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
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} entries
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