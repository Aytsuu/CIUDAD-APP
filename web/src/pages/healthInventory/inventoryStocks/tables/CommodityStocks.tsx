import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, CircleCheck, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import CommodityStockForm from "../addstocksModal/ComStockModal";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getCommodityStocks } from "../REQUEST/Commodity/restful-api/CommodityGetAPI";
import { archiveInventory } from "../REQUEST/Archive/ArchivePutAPI";
import { CommodityStocksColumns } from "./columns/CommodityCol";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { Link } from "react-router";
import { CommodityStocksRecord } from "./type";
import { useCommodityStocks } from "../REQUEST/Commodity/queries/CommodityFetchQueries";

type StockFilter =
  | "all"
  | "low_stock"
  | "out_of_stock"
  | "near_expiry"
  | "expired";

// Using your existing alert functions
const isNearExpiry = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  oneMonthFromNow.setHours(0, 0, 0, 0);

  return expiry > today && expiry <= oneMonthFromNow;
};

const isExpired = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  return expiry <= today;
};

const isLowStock = (availQty: number, unit: string, pcs: number) => {
  if (availQty <= 0) {
    return false;
  }

  if (unit.toLowerCase() === "boxes") {
    const boxCount = Math.ceil(availQty / pcs);
    return boxCount <= 2 && pcs > 0;
  }
  return availQty <= 10;
};

export default function CommodityStocks() {
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [commodityToArchive, setCommodityToArchive] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const queryClient = useQueryClient();

  const { data: commodityStocks, isLoading, error } = useCommodityStocks();

  const formatCommodityStocksData =
    React.useCallback((): CommodityStocksRecord[] => {
      if (!commodityStocks) return [];
      return commodityStocks
        .filter((stock: any) => !stock.inv_detail?.is_Archived)
        .map((commodityStock: any) => ({
          cinv_id: commodityStock.cinv_id,
          commodityInfo: {
            com_name: commodityStock.com_detail?.com_name,
          },
          expiryDate: commodityStock.inv_detail?.expiry_date,
          category: commodityStock.com_detail?.catlist,
          qty: {
            cinv_qty: commodityStock.cinv_qty,
            cinv_pcs: commodityStock.cinv_pcs,
          },
          cinv_qty_unit: commodityStock.cinv_qty_unit,
          availQty: commodityStock.cinv_qty_avail,
          dispensed: commodityStock.cinv_dispensed,
          recevFrom: commodityStock.cinv_recevFrom,
          inv_id: commodityStock.inv_id,
        }));
    }, [commodityStocks]);

  const formatMedicineStocksData =
    React.useCallback((): CommodityStocksRecord[] => {
      if (!commodityStocks) return [];
      return commodityStocks
        .filter((stock: any) => !stock.inv_detail?.is_Archived)
        .map((medicineStock: any) => ({
          cinv_id: medicineStock.cinv_id,
          commodityInfo: {
            com_name: medicineStock.med_detail?.med_name,
          },
          expiryDate: medicineStock.inv_detail?.expiry_date,
          category: medicineStock.med_detail?.category,
          qty: {
            cinv_qty: medicineStock.cinv_qty,
            cinv_pcs: medicineStock.cinv_pcs,
          },
          cinv_qty_unit: medicineStock.cinv_qty_unit,
          availQty: medicineStock.cinv_qty_avail,
          dispensed: medicineStock.cinv_dispensed,
          recevFrom: medicineStock.cinv_recevFrom,
          inv_id: medicineStock.inv_id,
        }));
    }, [commodityStocks]);

  const filteredData = React.useMemo(() => {
    const data = formatCommodityStocksData();
    // First filter by search query
    const searchFiltered = data.filter((record) =>
      Object.values(record.commodityInfo)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    // Then apply stock status filter if not 'all'
    if (stockFilter === "all") return searchFiltered;

    return searchFiltered.filter((record) => {
      const { availQty, expiryDate, cinv_qty_unit, qty } = record;
      const availableQty = parseInt(availQty);
      const pcs = qty.cinv_pcs;

      switch (stockFilter) {
        case "low_stock":
          return isLowStock(availableQty, cinv_qty_unit, pcs);
        case "out_of_stock":
          return availableQty <= 0;
        case "near_expiry":
          return isNearExpiry(expiryDate);
        case "expired":
          return isExpired(expiryDate);
        default:
          return true;
      }
    });
  }, [
    searchQuery,
    formatCommodityStocksData,
    formatMedicineStocksData,
    stockFilter,
  ]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const confirmArchiveInventory = async () => {
    if (commodityToArchive !== null) {
      setIsArchiveConfirmationOpen(false);

      try {
        await archiveInventory(commodityToArchive);
        queryClient.invalidateQueries({
          queryKey: ["commodityinventorylist"],
        });
        queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
        toast.success(` archived successfully`, {
          icon: <CircleCheck size={20} className="text-green-500" />,
          duration: 2000,
        });
      } catch (error) {
        toast.error(`Failed to archive`, {
          duration: 5000,
        });
        setIsArchiveConfirmationOpen(false);
        setCommodityToArchive(null);
      }
    }
  };

  // const confirmArchiveInventory = async () => {
  //   if (commodityToArchive !== null) {
  //     setIsArchiveConfirmationOpen(false);

  //     const toastId = toast.loading(
  //       <div className="flex items-center gap-2">
  //         <Loader2 className="h-4 w-4 animate-spin" />
  //         Archiving {activeTab === "commodity" ? "commodity" : "medicine"}...
  //       </div>,
  //       { duration: Infinity }
  //     );

  //     try {
  //       await archiveInventory(commodityToArchive);
  //       queryClient.invalidateQueries({
  //         queryKey: [
  //           activeTab === "commodity"
  //             ? "commodityinventorylist"
  //             : "medicineinventorylist",
  //         ],
  //       });

  //       toast.success(
  //         `${
  //           activeTab === "commodity" ? "Commodity" : "Medicine"
  //         } item archived successfully`,
  //         {
  //           id: toastId,
  //           icon: <CircleCheck size={20} className="text-green-500" />,
  //           duration: 2000,
  //         }
  //       );
  //     } catch (error) {
  //       console.error("Failed to archive inventory:", error);
  //       toast.error(
  //         `Failed to archive ${
  //           activeTab === "commodity" ? "commodity" : "medicine"
  //         } item`,
  //         {
  //           id: toastId,
  //           duration: 5000,
  //         }
  //       );
  //     } finally {
  //       setCommodityToArchive(null);
  //     }
  //   }
  // };

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

  const columns = CommodityStocksColumns(
    setCommodityToArchive,
    setIsArchiveConfirmationOpen
  );

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
              placeholder="Search..."
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
          <Button>
            <Link
              to="/addCommodityStock"
              className="flex justify-center items-center gap-2 px-2"
            >
              <Plus size={15} /> New
            </Link>
          </Button>
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
          <DataTable columns={columns} data={paginatedData} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
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
        title={`ArchiveCommodity`}
        description="Are you sure you want to archive this item? It will be preserved in the system but removed from active inventory."
      />
    </>
  );
}
