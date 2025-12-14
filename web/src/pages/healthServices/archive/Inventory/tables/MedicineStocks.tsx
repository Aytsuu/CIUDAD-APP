"use client"
import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { getArchiveMedicineStocks } from "./columns/MedicineCol"
import { useArchivedMedicineStocks } from "../queries/fetch"
import { useDebounce } from "@/hooks/use-debounce"
import TableLoading from "@/components/ui/table-loading"

export default function MedicineArchiveTable() {
  // ------------- STATE INITIALIZATION ----------------
  const [searchInput, setSearchInput] = useState("")
  const [pageSize, setPageSize] = useState(10)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const debouncedSearchQuery = useDebounce(searchInput, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)
  const currentPage = parseInt(searchParams.get("page") || "1", 10)

  const { data: apiResponse, isLoading, error } = useArchivedMedicineStocks(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : undefined
  )

  // Extract data from API response
  const stockData = Array.isArray(apiResponse?.results) ? apiResponse.results : []
  const totalCount = apiResponse?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const columns = getArchiveMedicineStocks()

  // ------------- SIDE EFFECTS ----------------
  const isInitialMount = useRef(true)

  // Save page state to sessionStorage for this tab
  useEffect(() => {
    sessionStorage.setItem("page_medicine_archive", String(currentPage))
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
    const newPageSize = value >= 1 ? value : 1
    handlePageSizeChange(newPageSize)
  }

  // Prepare export data
  const prepareExportData = () => {
    return stockData.map((item: any) => ({
      Date: item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
      ID: item.inv_id || "N/A",
      "Medicine Name": item.medicine_name || item.item?.medicine_name || "N/A",
      Category: item.category || "N/A",
      "Total Qty": item.qty_number + " " + (item.qty_unit || ""),
      "Available Stock": item.availableStock + " " + (item.qty_unit || ""),
      "Qty Used": item.administered || 0,
      "Expiry Date": item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A",
      Status: item.status || "Normal"
    }));
  };

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `medicine_archive_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `medicine_archive_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `medicine_archive_${new Date().toISOString().slice(0, 10)}`, "Medicine Archive Report");
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading medicine archive data</div>
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
              placeholder="Search medicine archive..."
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
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onExportPDF={handleExportPDF}
              className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
            />
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <TableLoading/>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading medicine archive data.</span>
            </div>
          ) : stockData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No archived medicine items found</span>
            </div>
          ) : (
            <DataTable columns={columns} data={stockData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-
            {Math.min(currentPage * pageSize, totalCount)} of{" "}
            {totalCount} items
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