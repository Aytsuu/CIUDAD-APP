"use client"

import React from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { useQuery } from "@tanstack/react-query"
import { getAntigenTransactions } from "../restful-api/GetRequest"
import { ExportButton } from "@/components/ui/export"
import { columns, exportColumns } from "../tables/columns/AntigenCol"

export default function AntigenTransactionsTable() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["antigenTransactions", currentPage, pageSize, searchQuery],
    queryFn: () => getAntigenTransactions(currentPage, pageSize, searchQuery),
    staleTime: 1000 * 60 * 5,
  })

  const formattedAntigenData = React.useMemo(() => {
    if (!data?.results) return []

    return data.results.map((transaction: any) => {
      const staffFirstName = transaction.staff_detail?.rp?.per?.per_fname || ""
      const staffLastName = transaction.staff_detail?.rp?.per?.per_lname || ""
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim()

      return {
        ...transaction,
        staff: staffFullName || transaction.staff,
        itemName:
          transaction.vac_stock?.vaccinelist?.vac_name ||
          transaction.imz_stock?.imz_detail?.imz_name ||
          "N/A",
      }
    })
  }, [data])

  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div>
      {/* Search Input */}
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search by item name, action, or staff..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => {
                setCurrentPage(1)
                setSearchQuery(e.target.value)
              }}
            />
          </div>
        </div>
      </div>

      {/* Table + Top Controls */}
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
                setCurrentPage(1)
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <ExportButton
            data={formattedAntigenData}
            filename="antigen-transactions"
            columns={exportColumns}
          />
        </div>

        {/* Table Display */}
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="w-full h-[100px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">loading....</span>
            </div>
          ) : (
            <DataTable columns={columns} data={formattedAntigenData} />
          )}
        </div>

        {/* Pagination + Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          {formattedAntigenData.length > 0 ? (
            <>
              <p className="text-xs sm:text-sm text-darkGray">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
              </p>
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <p className="text-xs sm:text-sm text-darkGray">No results found</p>
          )}
        </div>
      </div>
    </div>
  )
}