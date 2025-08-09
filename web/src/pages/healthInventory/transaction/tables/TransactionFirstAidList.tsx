"use client"

import React from "react"
import { DataTable } from "@/components/ui/table/data-table"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Search, FileInput } from "lucide-react"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { Skeleton } from "@/components/ui/skeleton"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { FirstAidColumns } from "./columns/FirstAidCol"
import type { FirstAidRecords } from "./type"
import { useFirstaid } from "../queries/FetchQueries"

export default function FirstAidList() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pageSize, setPageSize] = React.useState(10)
  const [currentPage, setCurrentPage] = React.useState(1)
  const { data: firstAidData, isLoading: isLoadingFirstAid } = useFirstaid()
  const columns = FirstAidColumns()

  // Format first aid data
  const formatFirstAidData = React.useCallback(() => {
    if (!firstAidData) return []
    return firstAidData.map((firstAid: any) => {
      const staffFirstName = firstAid.staff_detail?.rp?.per?.per_fname || ""
      const staffLastName = firstAid.staff_detail?.rp?.per?.per_lname || ""
      const staffFullName = `${staffFirstName} ${staffLastName}`.trim()

      return {
        inv_id:firstAid.finv_detail?.inv_detail?.inv_id,
        fat_id: firstAid.fat_id,
        fa_name: firstAid.fa_name,
        fat_qty: firstAid.fat_qty,
        fat_action: firstAid.fat_action,
        staff: staffFullName || firstAid.staff, // Use full name, fallback to staff ID if names are not available
        created_at: new Date(firstAid.created_at).toLocaleDateString(),
      }
    })
  }, [firstAidData])

  const filteredFirstAid = React.useMemo(() => {
    return formatFirstAidData().filter((record: FirstAidRecords) =>
      Object.values(record).join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, formatFirstAidData])

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredFirstAid.length / pageSize)
  // Slice the data for the current page
  const paginatedFirstAid = filteredFirstAid.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  
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
          <DataTable columns={columns} data={paginatedFirstAid} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredFirstAid.length)} of{" "}
            {filteredFirstAid.length} rows
          </p>
          {paginatedFirstAid.length > 0 && (
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>
    </div>
  )
}
