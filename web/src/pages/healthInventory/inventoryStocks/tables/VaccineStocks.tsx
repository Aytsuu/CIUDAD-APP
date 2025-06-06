import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
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
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import WastedDoseForm from "../addstocksModal/WastedDoseModal";
import EditVacStockForm from "../editModal/EditVacStockModal";
import VaccineStockForm from "../addstocksModal/VacStockModal";
import ImmunizationSupplies from "../addstocksModal/ImmunizationSupplies";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/pages/api/api";
import EditImmunizationForm from "../editModal/EditImzSupply";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { archiveInventory } from "../REQUEST/Archive/ArchivePutAPI";
import { getStockColumns } from "./columns/AntigenCol";
import { Link, useNavigate } from "react-router";
import { StockRecords } from "./type";
import { getCombinedStock } from "../REQUEST/Antigen/restful-api/AntigenGetAPI";
import { useAntigenCombineStocks } from "../REQUEST/Antigen/queries/AntigenFetchQueries";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

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

export default function CombinedStockTable() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [inventoryToArchive, setInventoryToArchive] = useState<number | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data: stockData, isLoading, error } = useAntigenCombineStocks();

  //   const { data: stockData, isLoading, error,} = useQuery({
  //     queryKey: ["combinedStocks"],
  //     queryFn: getCombinedStock,
  //     refetchOnMount: true,
  //  });

  const filteredStocks = React.useMemo(() => {
    if (!stockData) return [];
    return stockData.filter((record: StockRecords) => {
      const searchText =
        `${record.batchNumber} ${record.item.antigen}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, stockData]);

  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleArchiveInventory = (inv_id: number) => {
    setInventoryToArchive(inv_id);
    setIsArchiveConfirmationOpen(true);
  };

  const confirmArchiveInventory = async () => {
    if (inventoryToArchive !== null) {
      try {
        await archiveInventory(inventoryToArchive);
        queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
        toast.success(` archived successfully`, {
          icon: <CircleCheck size={20} className="text-green-500" />,
          duration: 2000,
        });
      } catch (error) {
        console.error("Failed to archive inventory:", error);
        toast.error(`Failed to archive`, {
          duration: 5000,
        });
      } finally {
        setIsArchiveConfirmationOpen(false);
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
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search inventory..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter items"
              label=""
              className="bg-white"
              options={[
                { id: "all", name: "All Items" },
                { id: "vaccine", name: "Vaccines" },
                { id: "medsupplies", name: "Medical Supplies" },
              ]}
              value=""
              onChange={() => {}}
            />
          </div>
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
