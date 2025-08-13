import React, { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileInput,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";

import { Skeleton } from "@/components/ui/skeleton";

import { getStockColumns } from "./columns/AntigenCol";
import { StockRecords } from "./type";
import { useAntigenCombineStocks } from "../queries/fetch";


export function isVaccine(
  record: StockRecords
): record is StockRecords & { type: "vaccine" } {
  return record.type === "vaccine";
}

export function isSupply(
  record: StockRecords
): record is StockRecords & { type: "supply" } {
  return record.type === "supply";
}

type StockFilter =
  | "all"
  | "low_stock"
  | "out_of_stock"
  | "near_expiry"
  | "expired";

export default function CombinedStockTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [inventoryToArchive, setInventoryToArchive] = useState<string | null>(
    null
  );

  const { data: stockData, isLoading, error } = useAntigenCombineStocks();

  const isLowStock = (
    availableQty: number,
    threshold: number = 10
  ): boolean => {
    return availableQty <= threshold;
  };

  const isNearExpiry = (
    expiryDate: string | null,
    days: number = 30
  ): boolean => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= days;
  };

  const isExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };
  const filteredStocks = useMemo(() => {
    if (!stockData) return [];

    // First filter by search query
    const searchFiltered = stockData.filter((record: StockRecords) => {
      const searchText =
        `${record.batchNumber} ${record.item.antigen}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });

    // Then apply stock status filter if not 'all'
    if (stockFilter === "all") return searchFiltered;

    return searchFiltered.filter((record: StockRecords) => {
      // Common properties for both vaccines and supplies
      const availableStock = record.availableStock;
      const expiryDate = record.expiryDate;

      if (isSupply(record)) {
        // Apply all filters to supplies
        switch (stockFilter) {
          case "low_stock":
            return isLowStock(availableStock);
          case "out_of_stock":
            return availableStock <= 0;
          case "near_expiry":
            return expiryDate && isNearExpiry(expiryDate);
          case "expired":
            return expiryDate && isExpired(expiryDate);
          default:
            return true;
        }
      } else {
        // Apply all filters to vaccines
        switch (stockFilter) {
          case "low_stock":
            return isLowStock(availableStock);
          case "out_of_stock":
            return availableStock <= 0;
          case "near_expiry":
            return expiryDate && isNearExpiry(expiryDate);
          case "expired":
            return expiryDate && isExpired(expiryDate);
          default:
            return true;
        }
      }
    });
  }, [searchQuery, stockData, stockFilter]);
  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  const columns = getStockColumns();

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading stock data</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search inventory..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <SelectLayout
            placeholder="Filter by stock status"
            label=""
            className="bg-white w-48"
            options={[
              { id: "all", name: "All Items" },
              { id: "low_stock", name: "Low Stock" },
              { id: "out_of_stock", name: "Out of Stock" },
              { id: "near_expiry", name: "Near Expiry" },
              { id: "expired", name: "Expired" },
            ]}
            value={stockFilter}
            onChange={(value) => setStockFilter(value as StockFilter)}
          />
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
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileInput />
                  Export Data
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
          <DataTable columns={columns} data={paginatedStocks} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filteredStocks.length)}-
            {Math.min(currentPage * pageSize, filteredStocks.length)} of{" "}
            {filteredStocks.length} items
          </p>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

    </>
  );
}
