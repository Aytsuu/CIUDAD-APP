// src/app/antigen-transactions/page.tsx
"use client"

import React from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { getAntigenTransactions } from "../restful-api/GetRequest"
import { ExportButton } from "@/components/ui/export"
import { columns, exportColumns } from "../tables/columns/AntigenCol" // Import from new file

export default function AntigenTransactionsTable() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)

  const { data: antigenData, isLoading } = useQuery({
    queryKey: ["antigenTransactions"],
    queryFn: getAntigenTransactions,
  })

  const formatAntigenData = React.useCallback(() => {
    if (!antigenData) return []
    return antigenData.map((transaction:any) => {
      const staffFirstName = transaction.staff_detail?.rp?.per?.per_fname || ""
      const staffLastName = transaction.staff_detail?.rp?.per?.per_lname || ""
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim()

      return {
        ...transaction,
        staff: staffFullName || transaction.staff,
        itemName: transaction.vac_stock?.vaccinelist?.vac_name || 
                 transaction.imz_stock?.imz_detail?.imz_name || "N/A",
      }
    })
  }, [antigenData])

  const filteredAntigen = React.useMemo(() => {
    const formattedData = formatAntigenData()
    return formattedData.filter((record:any) => {
      const searchText = `
        ${record.itemName || ""}
        ${record.antt_action}
        ${record.staff}
      `.toLowerCase()
      return searchText.includes(searchQuery.toLowerCase())
    })
  }, [searchQuery, formatAntigenData])

  const totalPages = Math.ceil(filteredAntigen.length / pageSize)
  const paginatedAntigen = filteredAntigen.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  )

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

  return (
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search by item name, action, or staff..."
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
                setPageSize(value >= 1 ? value : 1)
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <ExportButton 
            data={filteredAntigen} 
            filename="antigen-transactions" 
            columns={exportColumns} 
          />
        </div>
        
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedAntigen} />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          {filteredAntigen.length > 0 ? (
            <>
              <p className="text-xs sm:text-sm text-darkGray">
                Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAntigen.length)} of{" "}
                {filteredAntigen.length} rows
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