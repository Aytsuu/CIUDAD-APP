"use client"
import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { FirstAidColumns } from "./columns/FirstAidCol"
import { useFirstAidTransactions } from "../queries/fetch"
import { useDebounce } from "@/hooks/use-debounce"
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";

export default function FirstAidTransactionTable() {
  // ------------- STATE INITIALIZATION ----------------
  const [searchInput, setSearchInput] = useState("")
  const [pageSize, setPageSize] = useState(10)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const debouncedSearchQuery = useDebounce(searchInput, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)
  const currentPage = parseInt(searchParams.get("page") || "1", 10)

  const { data: apiResponse, isLoading, error } = useFirstAidTransactions(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : undefined
  )

  // Extract data from API response
  const transactionData = Array.isArray(apiResponse?.results) ? apiResponse.results : []
  const totalCount = apiResponse?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = FirstAidColumns()

  // ------------- SIDE EFFECTS ----------------
  const isInitialMount = useRef(true)

  // Save page state to sessionStorage for this tab
  useEffect(() => {
    sessionStorage.setItem("page_firstaid_transactions", String(currentPage))
  }, [currentPage])

  // Reset to page 1 when search changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (debouncedSearchQuery === "") return
    handlePageChange(1)
  }, [debouncedSearchQuery])

  // ------------- HANDLERS ----------------
  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    handlePageChange(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const handlePageSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value
    const newPageSize = value >= 1 && value <= 50 ? value : value > 50 ? 50 : 1
    handlePageSizeChange(newPageSize)
  }

  // Prepare export data for first aid transactions
  const prepareExportData = () => {
    return transactionData.map((item: any) => {
      const expired = item.isExpired;
      const isLow = item.isLowStock;
      const isOutOfStock = item.isOutOfStock;
      const isNear = item.isNearExpiry;
      const unit = item.finv_qty_unit || "";
      const pcs = item.qty?.finv_pcs || 1;

      // Format Total Qty
      let totalQtyDisplay = "";
      if (unit.toLowerCase() === "boxes" && pcs > 1) {
        totalQtyDisplay = `${item.qty_number} boxes (${item.qty_number * pcs} pcs)`;
      } else {
        totalQtyDisplay = `${item.qty_number} ${unit}`;
      }
      if (expired) totalQtyDisplay += " (Expired)";

      // Format Available Stock
      let availableStockDisplay = "";
      if (unit.toLowerCase() === "boxes" && pcs > 1) {
        const availablePcs = item.availableStock;
        const fullBoxes = Math.floor(availablePcs / pcs);
        const remainingPcs = availablePcs % pcs;
        const totalBoxes = remainingPcs > 0 ? fullBoxes + 1 : fullBoxes;
        availableStockDisplay = `${totalBoxes} box${totalBoxes !== 1 ? 'es' : ''} (${availablePcs} total pcs)`;
      } else {
        availableStockDisplay = `${item.availableStock} ${unit}`;
      }
      if (expired) {
        availableStockDisplay += " (Expired)";
      } else {
        if (isOutOfStock) availableStockDisplay += " (Out of Stock)";
        if (isLow) availableStockDisplay += " (Low Stock)";
      }

      // Status
      let status = "Normal";
      if (expired) status = "Expired";
      else if (isOutOfStock) status = "Out of Stock";
      else if (isLow) status = "Low Stock";
      else if (isNear) status = "Near Expiry";

      // Details
      const firstAidName = item.item?.fa_name || "Unknown First Aid";
      const firstAidDetails = `${firstAidName}${expired ? " (Expired)" : ""}`;

      // Expiry Date
      let expiryDateDisplay = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A";
      if (expired) expiryDateDisplay += " (Expired)";
      else if (isNear) expiryDateDisplay += " (Near Expiry)";

      return {
        Date: item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })
          : "N/A",
        ID: item.inv_id || "N/A",
        "First Aid Details": firstAidDetails,
        Category: item.category || "N/A",
        "Total Qty": totalQtyDisplay,
        "Available Stock": availableStockDisplay,
        "Qty Used": item.administered || 0,
        "Expiry Date": expiryDateDisplay,
        Status: status
      };
    });
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `firstaid_transactions_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `firstaid_transactions_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `firstaid_transactions_${new Date().toISOString().slice(0, 10)}`, "First Aid Transactions Report");
  };

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error loading first aid transactions:", error);
    }
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading first aid transactions</div>
      </div>
    )
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
              placeholder="Search first aid transactions..."
              className="pl-10 bg-white w-full"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
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
              onChange={handlePageSizeInputChange}
              min="1"
              max="50"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
            <div>
              <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200" />
            </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading first aid transactions...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading data. Please check console.</span>
            </div>
          ) : transactionData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No first aid transactions found</span>
            </div>
          ) : (
            <DataTable columns={columns} data={transactionData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
            {Math.min(currentPage * pageSize, totalCount)} of{" "}
            {totalCount} transactions
          </p>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  )
}