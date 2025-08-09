"use client"

import React from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { CommodityColumns } from "./columns/CommodityCol"
import type { CommodityRecords } from "./type"
import { useCommodities } from "../queries/FetchQueries"
import { ExportButton } from "@/components/ui/export"

export default function CommodityList() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)
  const { data: commodities, isLoading: isLoadingCommodities } = useCommodities()

  const formatCommodityData = React.useCallback((): CommodityRecords[] => {
    if (!commodities) return []
    return commodities.map((commodity: any) => {
      const staffFirstName = commodity.staff_detail?.rp?.per?.per_fname || ""
      const staffLastName = commodity.staff_detail?.rp?.per?.per_lname || ""
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim()

      return {
        inv_id: commodity?.cinv_detail?.inv_detail?.inv_id,
        comt_id: commodity.comt_id,
        com_name: commodity.com_name,
        comt_qty: commodity.comt_qty,
        comt_action: commodity.comt_action,
        staff: staffFullName || commodity.staff, // Use full name, fallback to staff ID if names are not available
        created_at: new Date(commodity.created_at).toLocaleDateString(),
      }
    })
  }, [commodities])

  // Filter commodity data based on search query
  const filteredCommodities = React.useMemo(() => {
    return formatCommodityData().filter((record: CommodityRecords) =>
      Object.values(record).join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, formatCommodityData])

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredCommodities.length / pageSize)
  // Slice the data for the current page
  const paginatedCommodities = filteredCommodities.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Define export columns
  const exportColumns = [
    { key: "comt_id", header: "ID" },
    { key: "com_name", header: "Commodity Name" },
    {
      key: "comt_qty",
      header: "Quantity",
      format: (value: number) => value || 0,
    },
    { key: "comt_action", header: "Action" },
    { key: "staff", header: "Staff" }, // This will now use the formatted staff name
    { key: "created_at", header: "Date" },
  ]

  // Generate columns using CommodityColumns
  const columns = CommodityColumns()
  
  return (
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
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
                if (value >= 1) {
                  setPageSize(value)
                } else {
                  setPageSize(1) // Reset to 1 if invalid
                }
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <ExportButton data={paginatedCommodities} filename="commodity-transactions" columns={exportColumns} />
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedCommodities} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredCommodities.length)} of{" "}
            {filteredCommodities.length} rows
          </p>
          {paginatedCommodities.length > 0 && (
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>
    </div>
  )
}
