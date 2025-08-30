"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Package, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react"
import { StockBadge } from "@/components/ui/stock-badge"
import { Button } from "@/components/ui/button/button"
import { isNearExpiry, isLowStock } from "@/helpers/StocksAlert"
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI"

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
}

export const MedicineDisplay = ({
  medicines: propMedicines,
  initialSelectedMedicines,
  onSelectedMedicinesChange,
  itemsPerPage = 5,
  currentPage,
  onPageChange,
}: MedicineDisplayProps) => {
  const [internalSelectedMedicines, setInternalSelectedMedicines] = useState(initialSelectedMedicines)
  const [searchQuery, setSearchQuery] = useState("")

  // Move the medicine fetching logic inside the component
  const { data:medicineStocksOptions, isLoading } = fetchMedicinesWithStock()
  const medicines = propMedicines || medicineStocksOptions || []

  // Sync internal state with props
  useEffect(() => {
    setInternalSelectedMedicines(initialSelectedMedicines)
  }, [initialSelectedMedicines])

  // Filter medicines based on search query
  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return medicines
    const lowerQuery = searchQuery.toLowerCase()
    return medicines.filter(
      (medicine) =>
        medicine.name.toLowerCase().includes(lowerQuery) || medicine.dosage.toLowerCase().includes(lowerQuery),
    )
  }, [medicines, searchQuery])

  // Adjust pagination based on filtered medicines
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentMedicines = useMemo(
    () => filteredMedicines.slice(startIndex, startIndex + itemsPerPage),
    [filteredMedicines, startIndex, itemsPerPage],
  )

  // Reset to page 1 when search query changes
  useEffect(() => {
    onPageChange(1)
  }, [searchQuery, onPageChange])

  const updateSelectedMedicines = useCallback(
    (updater: (prev: typeof internalSelectedMedicines) => typeof internalSelectedMedicines) => {
      setInternalSelectedMedicines((prev) => {
        const updated = updater(prev)
        // Schedule the callback to avoid state updates during render
        setTimeout(() => onSelectedMedicinesChange(updated), 0)
        return updated
      })
    },
    [onSelectedMedicinesChange],
  )

  const handleMedicineSelection = useCallback(
    (minv_id: string, isChecked: boolean) => {
      updateSelectedMedicines((prev) => {
        if (isChecked) {
          const medicineExists = prev.some((med) => med.minv_id === minv_id)
          if (!medicineExists) {
            return [...prev, { minv_id, medrec_qty: 1, reason: "" }]
          }
          return prev
        }
        return prev.filter((med) => med.minv_id !== minv_id)
      })
    },
    [updateSelectedMedicines],
  )

  const handleQuantityChange = useCallback(
    (minv_id: string, value: number) => {
      updateSelectedMedicines((prev) =>
        prev.map((med) => (med.minv_id === minv_id ? { ...med, medrec_qty: Math.max(0, value) } : med)),
      )
    },
    [updateSelectedMedicines],
  )

  const handleReasonChange = useCallback(
    (minv_id: string, value: string) => {
      updateSelectedMedicines((prev) => prev.map((med) => (med.minv_id === minv_id ? { ...med, reason: value } : med)))
    },
    [updateSelectedMedicines],
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-3 ">
      <div className="text-sm text-gray-500">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredMedicines.length)} of{" "}
        {filteredMedicines.length} medicines
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
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
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-1"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Loading skeleton row component
  const LoadingRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 rounded"></div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex items-center gap-3 justify-center">
          <div>
            <div className="h-4 rounded w-32 mb-2"></div>
            <div className="h-3 rounded w-24"></div>
          </div>
        </div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-3 rounded w-20 mx-auto mb-1"></div>
        <div className="h-3 rounded w-16 mx-auto"></div>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <div className="h-6 rounded-full w-16 mx-auto"></div>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <div className="h-8 rounded w-20 mx-auto"></div>
      </td>
      <td className="px-6 py-4 text-center w-64">
        <div className="h-8 rounded w-full"></div>
      </td>
    </tr>
  )

  return (
    <div className="lg:block bg-white rounded-xl shadow-sm border border-gray-200 mx-3">
      <div className="px-6 py-4 border-b border-gray-200 ">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Available Medicines</h2>
            {isLoading && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 w-full"
                disabled={isLoading}
              />
            </div>
            <div className="text-sm text-gray-500">
              {isLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                `${filteredMedicines.length} medicines found`
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Show loading skeleton rows
              Array.from({ length: itemsPerPage }).map((_, index) => <LoadingRow key={`loading-${index}`} />)
            ) : currentMedicines.length === 0 ? (
              // Show no medicines found only when not loading
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {searchQuery.trim() ? "No medicines found" : "No medicines available"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery.trim()
                      ? "Try adjusting your search query."
                      : "There are currently no medicines in the inventory."}
                  </p>
                </td>
              </tr>
            ) : (
              // Show actual medicine data
              currentMedicines.map((medicine) => {
                const isSelected = internalSelectedMedicines.some((m) => m.minv_id === medicine.id)
                const selectedMedicine = internalSelectedMedicines.find((m) => m.minv_id === medicine.id)
                const nearExpiry = medicine.expiry ? isNearExpiry(medicine.expiry) : false
                const lowStock = isLowStock(medicine.avail, medicine.unit, medicine.pcs_per_box || 0)

                return (
                  <tr
                    key={medicine.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleMedicineSelection(medicine.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                          disabled={medicine.avail <= 0}
                        />
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
                        <Input
                          type="text"
                          className="border border-gray-300 rounded-lg px-3 py-1 w-[300px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter reason for prescription..."
                          value={selectedMedicine?.reason || ""}
                          onChange={(e) => handleReasonChange(medicine.id, e.target.value)}
                          disabled={medicine.avail <= 0}
                        />
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && filteredMedicines.length > itemsPerPage && <PaginationControls />}
    </div>
  )
}

export default MedicineDisplay;