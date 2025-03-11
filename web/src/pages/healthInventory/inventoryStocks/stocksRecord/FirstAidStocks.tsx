import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput, Minus, Edit } from "lucide-react";
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
import FirstAidStockForm from "../addstocksModal/FirstAidStockModal";
import UsedFAModal from "../addstocksModal/UsedFAModal";
import EditFirstAidStockForm from "../editModal/EditFirstAidStockModal";
type FirstAidStocksRecord = {
  id: number;
  itemName: string;
  category: string;
  qty: number;
  availQty: number;
  expiryDate: string;
  usedItem: number;
};

export default function FirstAidStocks() {
  const columns: ColumnDef<FirstAidStocksRecord>[] = [
    {
      accessorKey: "id",
      header: "Batch No.",
    },
    {
      accessorKey: "itemName",
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
      accessorKey: "qty",
      header: "Qty",
      cell: ({ row }) => (
        <div className="text-center">{row.original.qty}</div>
      )
    },
    {
      accessorKey: "usedItem",
      header: "Used",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">
            {row.original.usedItem || 0}
          </span>
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <button className="flex items-center justify-center w-7 h-5 text-red-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors">
                    <Minus size={15} />
                  </button>
                }
                mainContent={<UsedFAModal />}
              />
            }
            content="Used Items"
          />
        </div>
      )
    },
    {
      accessorKey: "availQty",
      header: "Available",
      cell: ({ row }) => (
        <div className="text-center text-green-700">{row.original.availQty}</div>
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
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                    <Edit size={16} />
                  </div>
                }
                mainContent={
                  <EditFirstAidStockForm
                    initialData={row.original}
                  />
                }
              />
            }
            content="Edit" 
          />
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

  const sampleData: FirstAidStocksRecord[] = [
    {
      id: 5,
      itemName: "Sterile Gauze Pads",
      category: "Dressings",
      qty: 150,
      availQty: 100,
      usedItem: 50,
      expiryDate: "2025-12-31"
    },
    {
      id: 3,
      itemName: "Adhesive Bandages",
      category: "Wound Care",
      qty: 200,
      availQty: 150,
      usedItem: 50,
      expiryDate: "2024-06-30"
    },
    {
      id: 2,
      itemName: "Antiseptic Solution",
      category: "Cleaning Supplies",
      qty: 75,
      availQty: 50,
      usedItem: 25,
      expiryDate: "2025-03-15"
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<FirstAidStocksRecord[]>(sampleData);
  const [currentData, setCurrentData] = useState<FirstAidStocksRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const filtered = sampleData.filter((item) => {
      const searchText = `${item.id} ${item.itemName} ${item.category} ${item.qty} ${item.availQty} ${item.usedItem} ${item.expiryDate}`.toLowerCase();
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
          title="First Aid Items"
          description="Add New First Aid Item"
          mainContent={<FirstAidStockForm/>}
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