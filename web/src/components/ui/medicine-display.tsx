"use client"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Package, ChevronLeft, ChevronRight, Search, Loader2, Info, Eye } from "lucide-react"
import { StockBadge } from "@/components/ui/stock-badge"
import { Button } from "@/components/ui/button/button"
import { isNearExpiry, isLowStock } from "@/helpers/StocksAlert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface Medicine {
  id: string
  name: string
  dosage: string
  form: string
  avail: number
  unit: string
  med_type: string
  expiry?: string | null
  pcs_per_box?: number
  inv_id?: string
  preFilledReason?: string
}

interface MedicineDisplayProps {
  medicines: Medicine[]
  initialSelectedMedicines: {
    minv_id: string
    medrec_qty: number
    reason: string
  }[]
  onSelectedMedicinesChange: (selectedMedicines: { minv_id: string; medrec_qty: number; reason: string }[]) => void
  itemsPerPage?: number
  currentPage: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  autoFillReasons?: boolean
  readOnlyReasons?: boolean
  readonly?: boolean
  // New props for backend pagination and search
  totalPages?: number
  totalItems?: number
  onSearch?: (searchTerm: string) => void
  searchQuery?: string
  isSearching?: boolean
}

export const MedicineDisplay = ({
  medicines: propMedicines,
  initialSelectedMedicines,
  onSelectedMedicinesChange,
  itemsPerPage = 10,
  currentPage,
  onPageChange,
  isLoading = false,
  autoFillReasons = true,
  readOnlyReasons = false,
  readonly = false,
  // New props for backend pagination
  totalPages = 1,
  totalItems = 0,
  onSearch,
  searchQuery = "",
  isSearching = false,
}: MedicineDisplayProps) => {
  const [internalSelectedMedicines, setInternalSelectedMedicines] = useState(initialSelectedMedicines)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const medicines = propMedicines || []

  useEffect(() => {
    setInternalSelectedMedicines(initialSelectedMedicines)
  }, [initialSelectedMedicines])

  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    
    // Debounce search to avoid too many API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    const newTimeout = setTimeout(() => {
      onSearch?.(value)
    }, 500) // 500ms debounce
    
    setSearchTimeout(newTimeout)
  }

  const filteredMedicines = useMemo(() => {
    // If we're using backend search, just return all medicines
    // The filtering is done on the backend
    return medicines
  }, [medicines])

  const startIndex = (currentPage - 1) * itemsPerPage
  const currentMedicines = useMemo(
    () => filteredMedicines,
    [filteredMedicines],
  )

  const updateSelectedMedicines = useCallback(
    (updater: (prev: typeof internalSelectedMedicines) => typeof internalSelectedMedicines) => {
      if (readonly) return // Prevent updates in readonly mode
      
      setInternalSelectedMedicines((prev) => {
        const updated = updater(prev)
        setTimeout(() => onSelectedMedicinesChange(updated), 0)
        return updated
      })
    },
    [onSelectedMedicinesChange, readonly],
  )

  const handleMedicineSelection = useCallback(
    (minv_id: string, isChecked: boolean, preFilledReason?: string) => {
      if (readonly) return // Prevent selection in readonly mode
      
      updateSelectedMedicines((prev) => {
        if (isChecked) {
          const medicineExists = prev.some((med) => med.minv_id === minv_id)
          if (!medicineExists) {
            const reason = autoFillReasons && preFilledReason ? preFilledReason : ""
            return [...prev, { minv_id, medrec_qty: 1, reason }]
          }
          return prev
        }
        return prev.filter((med) => med.minv_id !== minv_id)
      })
    },
    [updateSelectedMedicines, autoFillReasons, readonly]
  )

  const handleQuantityChange = useCallback(
    (minv_id: string, value: number) => {
      if (readonly) return // Prevent quantity changes in readonly mode
      
      updateSelectedMedicines((prev) =>
        prev.map((med) => (med.minv_id === minv_id ? { ...med, medrec_qty: Math.max(0, value) } : med)),
      )
    },
    [updateSelectedMedicines, readonly],
  )

  const handleReasonChange = useCallback(
    (minv_id: string, value: string) => {
      if (readonly) return // Prevent reason changes in readonly mode
      
      updateSelectedMedicines((prev) => prev.map((med) => (med.minv_id === minv_id ? { ...med, reason: value } : med)))
    },
    [updateSelectedMedicines, readonly],
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="text-sm text-gray-500">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of{" "}
        {totalItems} medicines
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading || isSearching}
          className="px-3 py-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading || isSearching}
          className="px-3 py-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const LoadingRow = () => (
    <tr className="animate-pulse">
      {!readonly && (
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <div className="flex items-center justify-center">
            <div className="h-4 w-4 rounded bg-gray-200"></div>
          </div>
        </td>
      )}
      <td className="px-6 py-4 text-center">
        <div className="h-4 rounded w-20 mx-auto bg-gray-200"></div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center gap-3 justify-center">
          <div>
            <div className="h-4 rounded w-32 mb-2 bg-gray-200"></div>
            <div className="h-3 rounded w-24 bg-gray-200"></div>
          </div>
        </div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-3 rounded w-20 mx-auto mb-1 bg-gray-200"></div>
        <div className="h-3 rounded w-16 mx-auto bg-gray-200"></div>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <div className="h-6 rounded-full w-16 mx-auto bg-gray-200"></div>
      </td>
      {!readonly && (
        <>
          <td className="px-6 py-4 text-center whitespace-nowrap">
            <div className="h-8 rounded w-20 mx-auto bg-gray-200"></div>
          </td>
          <td className="px-6 py-4 text-center w-64">
            <div className="h-8 rounded w-full bg-gray-200"></div>
          </td>
        </>
      )}
    </tr>
  )

  // Calculate column span for empty state based on readonly mode
  const emptyStateColSpan = readonly ? 5 : 8

  return (
    <div className="lg:block bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {readonly ? (
              <Eye className="h-5 w-5 text-gray-600" />
            ) : (
              <Package className="h-5 w-5 text-gray-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {readonly ? "Medicine Inventory View" : "Available Medicines"}
            </h2>
            {readonly && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                View Only
              </span>
            )}
            {(isLoading || isSearching) && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search medicines..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                disabled={isLoading}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              ) : isSearching ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching...
                </span>
              ) : (
                `${totalItems} medicines found`
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {!readonly && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
              )}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inventory ID
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medicine Details
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Status
              </th>
              {!readonly && (
                <>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                    {autoFillReasons && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 ml-1 inline-block text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Reasons are automatically filled from the request</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <LoadingRow key={`loading-${index}`} />)
            ) : currentMedicines.length === 0 ? (
              <tr>
                <td colSpan={emptyStateColSpan} className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {searchQuery ? "No medicines found" : "No medicines available"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? "Try adjusting your search query."
                      : "There are currently no medicines in the inventory."}
                  </p>
                </td>
              </tr>
            ) : (
              currentMedicines.map((medicine) => {
                const isSelected = internalSelectedMedicines.some((m) => m.minv_id === medicine.id)
                const selectedMedicine = internalSelectedMedicines.find((m) => m.minv_id === medicine.id)
                const nearExpiry = medicine.expiry ? isNearExpiry(medicine.expiry) : false
                const lowStock = isLowStock(medicine.avail, medicine.unit, medicine.pcs_per_box || 0)
                const hasPreFilledReason = autoFillReasons && !!medicine.preFilledReason
                const isReasonReadOnly = readOnlyReasons && hasPreFilledReason
                
                return (
                  <tr
                    key={medicine.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !readonly && isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    {!readonly && (
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleMedicineSelection(medicine.id, e.target.checked, medicine.preFilledReason)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            disabled={medicine.avail <= 0}
                          />
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {medicine.inv_id || medicine.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center gap-3 justify-center">
                        <div>
                          <div className="font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">
                            {medicine.dosage} • {medicine.form}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="text-sm text-gray-600">{medicine.med_type}</div>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600">Expiry Date: {medicine.expiry || "N/A"}</div>
                        {nearExpiry && <div className="text-sm text-red-500 font-semibold">Near Expiry</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <StockBadge
                        quantity={Number(medicine.avail)}
                        unit={medicine.unit}
                        lowStock={lowStock}
                        outOfStock={medicine.avail <= 0}
                      />
                    </td>
                    {!readonly && (
                      <>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {isSelected && (
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-transparent"
                                  onClick={() => {
                                    const currentQty = selectedMedicine?.medrec_qty || 0
                                    if (currentQty > 0) {
                                      handleQuantityChange(medicine.id, currentQty - 1)
                                    }
                                  }}
                                  disabled={(selectedMedicine?.medrec_qty || 0) <= 0}
                                >
                                  <span className="text-lg">-</span>
                                </Button>
                                <Input
                                  type="number"
                                  min="0"
                                  max={medicine.avail}
                                  className="border rounded-lg px-3 py-1 w-20 text-center focus:ring-2"
                                  value={selectedMedicine?.medrec_qty || 0}
                                  onChange={(e) => {
                                    const value = Number.parseInt(e.target.value) || 0
                                    handleQuantityChange(medicine.id, value)
                                  }}
                                  disabled={medicine.avail <= 0}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 bg-transparent"
                                  onClick={() => {
                                    const currentQty = selectedMedicine?.medrec_qty || 0
                                    if (currentQty < medicine.avail) {
                                      handleQuantityChange(medicine.id, currentQty + 1)
                                    }
                                  }}
                                  disabled={(selectedMedicine?.medrec_qty || 0) >= medicine.avail || medicine.avail <= 0}
                                >
                                  <span className="text-lg">+</span>
                                </Button>
                              </div>
                              {(selectedMedicine?.medrec_qty ?? 0) < 1 && (
                                <span className="text-red-500 text-xs">Quantity must be more than zero</span>
                              )}
                              {(selectedMedicine?.medrec_qty ?? 0) > medicine.avail && (
                                <span className="text-red-500 text-xs">
                                  Quantity exceeds available stock ({medicine.avail} {medicine.unit})
                                </span>
                              )}
                              {medicine.avail <= 0 && <span className="text-red-500 text-xs">Out of stock</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center w-64">
                          {isSelected && (
                            <div className="flex flex-col items-center">
                              <Input
                                type="text"
                                className={`border border-gray-300 rounded-lg px-3 py-1 w-[300px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  isReasonReadOnly ? "bg-gray-100" : ""
                                }`}
                                placeholder="Enter reason for prescription..."
                                value={selectedMedicine?.reason || ""}
                                onChange={(e) => handleReasonChange(medicine.id, e.target.value)}
                                disabled={medicine.avail <= 0 || isReasonReadOnly}
                                readOnly={isReasonReadOnly}
                              />
                              {hasPreFilledReason && (
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                  <Info className="h-3 w-3" />
                                  Reason pre-filled from request
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && totalItems > itemsPerPage && <PaginationControls />}
    </div>
  )
}

export default MedicineDisplay