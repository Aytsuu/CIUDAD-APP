import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  Trash,
  Plus,
  FileInput,
  Minus,
  Edit,
  CircleCheck,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import WastedDoseForm from "../addstocksModal/WastedDoseModal";
import EditVacStockForm from "../editModal/EditVacStockModal";
import VaccineStockForm from "../addstocksModal/VacStockModal";
import ImmunizationSupplies from "../addstocksModal/ImmunizationSupplies";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api/api";
import EditImmunizationForm from "../editModal/EditImzSupply";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { archiveInventory } from "../REQUEST/Archive/ArchivePutAPI";
import { getStockColumns } from "./columns/AntigenCol";
import { Link, useNavigate } from "react-router";
import { StockRecords } from "./type";
import { getCombinedStock } from "../REQUEST/Antigen/restful-api/AntigenGetAPI";
import { useAntigenCombineStocks } from "../REQUEST/Antigen/queries/AntigenFetchQueries";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [inventoryToArchive, setInventoryToArchive] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

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

  // Auto-archive expired vaccines and supplies after 10 days
  useEffect(() => {
    if (!stockData) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    stockData.forEach((record: StockRecords) => {
      if (!record.expiryDate) return;

      const expiryDate = new Date(record.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      const archiveDate = new Date(expiryDate);
      archiveDate.setDate(expiryDate.getDate() + 10);
      archiveDate.setHours(0, 0, 0, 0);

      console.log("Record ID:", record.inv_id);
      console.log("Expiry Date:", expiryDate);
      console.log("Archive Date:", archiveDate);
      console.log("is Archived:", record.isArchived);
      if (now >= archiveDate && !record.isArchived) {
        archiveInventory(record.inv_id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
          })
          .catch((error) => {
            console.error("Auto-archive failed:", error);
          });
      }
    });
  }, [stockData, queryClient]);


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

  const handleArchiveInventory = (inv_id: string) => {
    setInventoryToArchive(inv_id);
    setIsArchiveConfirmationOpen(true);
  };

  const confirmArchiveInventory = async () => {
    if (inventoryToArchive !== null) {
      setIsArchiveConfirmationOpen(false);
      
      const toastId = toast.loading(
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Archiving inventory item...
        </div>,
        { duration: Infinity }
      );

      try {
        await archiveInventory(inventoryToArchive);
        queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
        
        toast.success("Inventory item archived successfully", {
          id: toastId,
          icon: <CircleCheck size={20} className="text-green-500" />,
          duration: 2000,
        });
      } catch (error) {
        console.error("Failed to archive inventory:", error);
        toast.error("Failed to archive inventory item", {
          id: toastId,
          duration: 5000,
        });
      } finally {
        setInventoryToArchive(null);
      }
    }
  };

  const columns = getStockColumns(handleArchiveInventory);

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

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className=" hover:bg-buttonBlue/90 group">
                <Plus size={15} /> New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[200px]" align="end">
              <DropdownMenuItem
                onSelect={() => navigate("/addVaccineStock")}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                Vaccine
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => navigate("/addImzSupplyStock")}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                Immunization Supplies
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onOpenChange={setIsArchiveConfirmationOpen}
        onConfirm={confirmArchiveInventory}
        title="Archive Inventory Item"
        description="Are you sure you want to archive this item? It will be preserved in the system but removed from active inventory."
      />
    </>
  );
}