"use client"

import { useEffect, useState, useMemo } from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileInput, CircleCheck, Loader2, XCircle, Clock, CalendarOff } from "lucide-react" // Added XCircle, Clock, CalendarOff
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu" // Corrected import path for dropdown-menu
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal"
import { archiveInventory } from "../REQUEST/Archive/ArchivePutAPI"
import { getStockColumns } from "./columns/AntigenCol"
import { useNavigate } from "react-router-dom" // Assuming react-router-dom for Link
import type { StockRecords } from "./type"
import { useAntigenCombineStocks } from "../REQUEST/Antigen/queries/AntigenFetchQueries"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card" // Import Card components

export function isVaccine(record: StockRecords): record is StockRecords & { type: "vaccine" } {
  return record.type === "vaccine"
}

export function isSupply(record: StockRecords): record is StockRecords & { type: "supply" } {
  return record.type === "supply"
}

type StockFilter = "all" | "low_stock" | "out_of_stock" | "near_expiry" | "expired"

export default function CombinedStockTable() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false)
  const [inventoryToArchive, setInventoryToArchive] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: stockData, isLoading, error } = useAntigenCombineStocks()

  // Helper functions defined within the component
  const isLowStock = (availableQty: number, threshold = 10): boolean => {
    return availableQty <= threshold
  }
  const isNearExpiry = (expiryDate: string | null, days = 30): boolean => {
    if (!expiryDate) return false
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays > 0 && diffDays <= days
  }
  const isExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false
    const today = new Date()
    const expiry = new Date(expiryDate)
    return expiry < today
  }

  // Auto-archive expired vaccines and supplies after 10 days
  useEffect(() => {
    if (!stockData) return
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    stockData.forEach((record: StockRecords) => {
      if (!record.expiryDate) return
      const expiryDate = new Date(record.expiryDate)
      expiryDate.setHours(0, 0, 0, 0)
      const archiveDate = new Date(expiryDate)
      archiveDate.setDate(expiryDate.getDate() + 10)
      archiveDate.setHours(0, 0, 0, 0)
      console.log("Record ID:", record.inv_id)
      console.log("Expiry Date:", expiryDate)
      console.log("Archive Date:", archiveDate)
      console.log("is Archived:", record.isArchived)
      if (now >= archiveDate && !record.isArchived) {
        archiveInventory(record.inv_id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["combinedStocks"] })
          })
          .catch((error) => {
            console.error("Auto-archive failed:", error)
          })
      }
    })
  }, [stockData, queryClient])

  const counts = useMemo(() => {
    if (!stockData) return { outOfStockCount: 0, nearExpiryCount: 0, expiredCount: 0, lowStockCount: 0 }

    let outOfStockCount = 0
    let nearExpiryCount = 0
    let expiredCount = 0
    let lowStockCount = 0

    stockData.forEach((record: StockRecords) => {
      // Only count active (non-archived) items for these statuses
      if (record.isArchived) return

      const availableStock = record.availableStock
      const expiryDate = record.expiryDate
      const created_at=record.created_at

      const isItemExpired = isExpired(expiryDate)
      const isItemLowStock = isLowStock(availableStock) // Using the component's isLowStock
      const isItemOutOfStock = availableStock <= 0
      const isItemNearExpiry = isNearExpiry(expiryDate) // Using the component's isNearExpiry

      if (isItemOutOfStock) {
        outOfStockCount++
      }
      if (isItemNearExpiry) {
        nearExpiryCount++
      }
      if (isItemExpired) {
        expiredCount++
      }
      // Only count as low stock if it's not expired
      if (isItemLowStock && !isItemExpired) {
        lowStockCount++
      }
    })

    return { outOfStockCount, nearExpiryCount, expiredCount, lowStockCount }
  }, [stockData]) // Removed helper functions from dependency array
  const filteredStocks = useMemo(() => {
    if (!stockData) return []
    
    // First sort by created_at (newest first)
    const sortedData = [...stockData].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  
    // Then filter by search query
    const searchFiltered = sortedData.filter((record: StockRecords) => {
      const searchText = `${record.batchNumber} ${record.item.antigen}`.toLowerCase()
      return searchText.includes(searchQuery.toLowerCase())
    })
  
    // Then apply stock status filter if not 'all'
    if (stockFilter === "all") return searchFiltered
    
    return searchFiltered.filter((record: StockRecords) => {
      const availableStock = record.availableStock
      const expiryDate = record.expiryDate
      const isItemExpired = isExpired(expiryDate)
      const isItemLowStock = isLowStock(availableStock)
      
      switch (stockFilter) {
        case "low_stock":
          return isItemLowStock && !isItemExpired
        case "out_of_stock":
          return availableStock <= 0
        case "near_expiry":
          return expiryDate && isNearExpiry(expiryDate)
        case "expired":
          return expiryDate && isItemExpired
        default:
          return true
      }
    })
  }, [searchQuery, stockData, stockFilter])// Removed helper functions from dependency array

  const totalPages = Math.ceil(filteredStocks.length / pageSize)
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleArchiveInventory = (inv_id: string) => {
    setInventoryToArchive(inv_id)
    setIsArchiveConfirmationOpen(true)
  }

  const confirmArchiveInventory = async () => {
    if (inventoryToArchive !== null) {
      setIsArchiveConfirmationOpen(false)

      const toastId = toast.loading(
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Archiving inventory item...
        </div>,
        { duration: Number.POSITIVE_INFINITY },
      )
      try {
        await archiveInventory(inventoryToArchive)
        queryClient.invalidateQueries({ queryKey: ["combinedStocks"] })

        toast.success("Inventory item archived successfully", {
          id: toastId,
          icon: <CircleCheck size={20} className="fill-green-500 stroke-white" />,
          duration: 2000,
        })
      } catch (error) {
        console.error("Failed to archive inventory:", error)
        toast.error("Failed to archive inventory item", {
          id: toastId,
          duration: 5000,
        })
      } finally {
        setInventoryToArchive(null)
      }
    }
  }

  const columns = getStockColumns(handleArchiveInventory)

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading stock data</div>
      </div>
    )
  }
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.outOfStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Loader2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.nearExpiryCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <CalendarOff className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.expiredCount}</div>
          </CardContent>
        </Card>
        {/* Note: Counting "Archived" items requires a separate data source or a flag in your existing data. */}
        {/* The current `filteredStocks` and `counts` memos filter out archived items. */}
        {/* If you have an API endpoint for archived items, you would fetch and display that count here. */}
      </div>

      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
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
                const value = +e.target.value
                setPageSize(value >= 1 ? value : 1)
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-transparent">
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
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredStocks.length)}-
            {Math.min(currentPage * pageSize, filteredStocks.length)} of {filteredStocks.length} items
          </p>
          <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
  )
}
