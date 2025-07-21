import React from "react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, CircleCheck, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns } from "./columns/MedicineCol";
import { toast } from "sonner";
import { Link } from "react-router";
import { useMedicineStocks } from "../queries/fetch";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { MedicineStocksRecord } from "./type";
import { isNearExpiry, isExpired, isLowStock } from "./columns/Alert";
type StockFilter =
  | "all"
  | "low_stock"
  | "out_of_stock"
  | "near_expiry"
  | "expired";

// Using your existing alert functions
export default function MedicineStocks() {
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [medicineToArchive, setMedicineToArchive] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const queryClient = useQueryClient();
  const { data: medicineStocks, isLoading: isLoadingMedicines } =
    useMedicineStocks();

  const formatMedicineStocksData = useCallback((): MedicineStocksRecord[] => {
    if (!medicineStocks) return [];
    return medicineStocks.map((medicineStock: any) => {
      let availQty = medicineStock.minv_qty_avail;
      let unit = medicineStock.minv_qty_unit;
      let qty = medicineStock.minv_qty;
      let pcs= medicineStock.minv_pcs * medicineStock.minv_qty;
      let qty_use = 0

      if (unit=== "boxes") {
         pcs -= availQty;
         unit = "pcs";
        qty_use = pcs
      } else {
        qty -= availQty;
        qty_use = qty
      }

      const total_qty_used = `${qty_use} ${unit}`;

      return {
        id: medicineStock.minv_id,
        minv_id: medicineStock.minv_id,
        medicineInfo: {
          medicineName: medicineStock.med_detail?.med_name,
          dosage: medicineStock.minv_dsg,
          dsgUnit: medicineStock.minv_dsg_unit,
          form: medicineStock.minv_form,
        },
        expiryDate: medicineStock.inv_detail?.expiry_date,
        category: medicineStock.med_detail?.catlist,
        qty: {
          qty: medicineStock.minv_qty,
          pcs: medicineStock.minv_pcs,
        },
        minv_qty_unit: medicineStock.minv_qty_unit,
        availQty: medicineStock.minv_qty_avail,
        distributed: total_qty_used,
        inv_id: medicineStock.inv_id,
      };
    });
  }, [medicineStocks]);

  const filteredData = useMemo(() => {
    const data = formatMedicineStocksData();

    // First filter by search query
    const searchFiltered = data.filter((record) =>
      Object.values(record.medicineInfo)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    // Then apply stock status filter if not 'all'
    if (stockFilter === "all") return searchFiltered;

    return searchFiltered.filter((record) => {
      const { availQty, expiryDate, minv_qty_unit, qty } = record;
      const availableQty = parseInt(availQty);
      const pcs = qty.pcs;

      switch (stockFilter) {
        case "low_stock":
          return isLowStock(availableQty, minv_qty_unit, pcs);
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
  }, [searchQuery, formatMedicineStocksData, stockFilter]);

  

  if (isLoadingMedicines) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  const columns = getColumns();
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
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
        <Button>
          <Link
            to="/addMedicineStock"
            className="flex justify-center items-center gap-2 px-2"
          >
            <Plus size={15} /> New
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
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
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedData} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
          </p>
          {paginatedData.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

    
    </div>
  );
}
