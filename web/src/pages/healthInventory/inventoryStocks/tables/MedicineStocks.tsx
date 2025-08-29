"use client"
import { useState, useMemo, useCallback, useEffect } from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, FileInput, CircleCheck, Loader2, XCircle, Clock, CalendarOff } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal"
import { useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { getColumns } from "./columns/MedicineCol"
import { toast, Toaster } from "sonner"
import { Link } from "react-router-dom" // Assuming react-router-dom for Link
import { useMedicineStocks } from "../REQUEST/Medicine/queries/MedicineFetchQueries"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { useArchiveInventory } from "../REQUEST/Archive/ArchivePutQueries"
import type { MedicineStocksRecord } from "./type"
import { isNearExpiry, isExpired, isLowStock } from "../../../../helpers/StocksAlert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card" // Import Card components

type StockFilter = "all" | "low_stock" | "out_of_stock" | "near_expiry" | "expired"

export default function MedicineStocks() {
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false)
  const [medicineToArchive, setMedicineToArchive] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const queryClient = useQueryClient()
  const { data: medicineStocks, isLoading: isLoadingMedicines } = useMedicineStocks()
  const { mutate: archiveInventoryMutation } = useArchiveInventory()

  const formatMedicineStocksData = useCallback((): MedicineStocksRecord[] => {
    if (!medicineStocks) return []

    return medicineStocks.map((medicineStock: any) => {
      const availQty = medicineStock.minv_qty_avail
      let unit = medicineStock.minv_qty_unit
      let qty = medicineStock.minv_qty
      let pcs = medicineStock.minv_pcs * medicineStock.minv_qty
      let qty_use = 0
      if (unit === "boxes") {
        pcs -= availQty
        unit = "pcs"
        qty_use = pcs
      } else {
        qty -= availQty
        qty_use = qty
      }
      const total_qty_used = `${qty_use} ${unit}`
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
      }
    })
  }, [medicineStocks])

  const counts = useMemo(() => {
    const data = formatMedicineStocksData()
    let outOfStockCount = 0
    let nearExpiryCount = 0
    let expiredCount = 0
    let lowStockCount = 0

    data.forEach((record) => {
      const { availQty, expiryDate, minv_qty_unit, qty } = record
      const availableQty = Number.parseInt(availQty)
      const pcs = qty.pcs

      const isItemExpired = isExpired(expiryDate)
      const isItemLowStock = isLowStock(availableQty, minv_qty_unit, pcs)
      const isItemOutOfStock = availableQty <= 0
      const isItemNearExpiry = isNearExpiry(expiryDate)

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
  }, [formatMedicineStocksData])

  const filteredData = useMemo(() => {
    const data = formatMedicineStocksData()
    // First filter by search query
    const searchFiltered = data.filter((record) =>
      Object.values(record.medicineInfo).join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
    )
    // Then apply stock status filter if not 'all'
    if (stockFilter === "all") return searchFiltered
    return searchFiltered.filter((record) => {
      const { availQty, expiryDate, minv_qty_unit, qty } = record
      const availableQty = Number.parseInt(availQty)
      const pcs = qty.pcs
      switch (stockFilter) {
        case "low_stock":
          return isLowStock(availableQty, minv_qty_unit, pcs)
        case "out_of_stock":
          return availableQty <= 0
        case "near_expiry":
          return isNearExpiry(expiryDate)
        case "expired":
          return isExpired(expiryDate)
        default:
          return true
      }
    })
  }, [searchQuery, formatMedicineStocksData, stockFilter])

  const handleArchiveInventory = (inv_id: string) => {
    setMedicineToArchive(inv_id)
    setIsArchiveConfirmationOpen(true)
  }

  const confirmArchiveInventory = () => {
    if (medicineToArchive !== null) {
      setIsArchiveConfirmationOpen(false)
      const toastId = toast.loading(
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Archiving medicine...
        </div>,
        { duration: Number.POSITIVE_INFINITY },
      )
      archiveInventoryMutation(medicineToArchive, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["medicineinventorylist"],
          }) // Update with your query key
          toast.success("Medicine item archived successfully", {
            id: toastId,
            icon: <CircleCheck size={20} className="fill-green-500 stroke-white" />,
            duration: 2000,
          })
        },
        onError: () => {
          toast.error("Failed to archive medicine item", {
            id: toastId,
            duration: 5000,
          })
        },
        onSettled: () => {
          setMedicineToArchive(null)
        },
      })
    }
  }

  // Auto-archive expired medicines after 10 days
  useEffect(() => {
    if (!medicineStocks) return
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    formatMedicineStocksData().forEach((medicine) => {
      if (!medicine.expiryDate) return
      const expiryDate = new Date(medicine.expiryDate)
      expiryDate.setHours(0, 0, 0, 0)
      const archiveDate = new Date(expiryDate)
      archiveDate.setDate(expiryDate.getDate() + 10)
      archiveDate.setHours(0, 0, 0, 0)
      if (now >= archiveDate) {
        archiveInventoryMutation(medicine.inv_id, {
          onError: (error) => {
            console.error("Auto-archive failed:", error)
          },
        })
      }
    })
  }, [medicineStocks, archiveInventoryMutation, formatMedicineStocksData])

  

  const columns = getColumns(handleArchiveInventory)
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div>
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
        {/* New Card for Low Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Loader2 className="h-4 w-4 text-orange-500" /> {/* Using Loader2 as a placeholder for a 'low' icon */}
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
        {/* If you have an API endpoint for archived items, you would fetch and display that count here. */}
      </div>

      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
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
          <Link to="/addMedicineStock" className="flex justify-center items-center gap-2 px-2">
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
                const value = +e.target.value
                setPageSize(value >= 1 ? value : 1)
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem] bg-transparent">
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
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
          </p>
          {paginatedData.length > 0 && (
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onOpenChange={setIsArchiveConfirmationOpen}
        onConfirm={confirmArchiveInventory}
        title="Archive Medicine Item"
        description="Are you sure you want to archive this item? It will be preserved in the system but removed from active inventory."
      />
    </div>
  )
}
