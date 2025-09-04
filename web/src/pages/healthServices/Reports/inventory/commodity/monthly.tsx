"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, ChevronLeft, Folder } from "lucide-react"
import { useNavigate } from "react-router-dom"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { toast } from "sonner"
import { useLoading } from "@/context/LoadingContext"
import type { CommodityMonthItem } from "./types"
import { useCommodityMonths } from "./queries/fetch"
import { MonthInfoCard } from "../../month-folder-component"

export default function InventoryMonthlyCommodityRecords() {
  const { showLoading, hideLoading } = useLoading()
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [yearFilter] = useState<string>("all")
  const navigate = useNavigate()

  const { data: apiResponse, isLoading, error } = useCommodityMonths(currentPage, pageSize, yearFilter, searchQuery)

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch commodity months")
      toast("Retrying...")
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  }, [error])

  useEffect(() => {
    if (isLoading) showLoading()
    else hideLoading()
  }, [isLoading, showLoading, hideLoading])

  const monthlyData: CommodityMonthItem[] = apiResponse?.results?.data || []
  const totalMonths: number = apiResponse?.results?.total_months || 0
  const totalPages = Math.ceil(totalMonths / pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, yearFilter])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Monthly Commodity Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View commodity transactions grouped by month ({totalMonths} months found)
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="w-full flex justify-end sm:flex-row gap-2">
        <div className="sm:flex-row w-[250px] gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={17} />
            <Input
              placeholder="Search by month (e.g. '2025-08')..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-3 justify-start items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-[70px] h-8"
              value={pageSize}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value)
                setPageSize(value > 0 ? value : 1)
                setCurrentPage(1)
              }}
              min={1}
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        <div className="bg-white w-full p-6">
          {isLoading ? (
            <div className="w-full h-[200px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : monthlyData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {monthlyData.map((monthItem) => {
                const monthName = new Date(monthItem.month + "-01").toLocaleString("default", {
                  month: "long",
                  year: "numeric"
                })
                
                return (
                  <MonthInfoCard 
                    key={monthItem.month}
                    monthItem={{
                      month: monthItem.month,
                      total_items: monthItem.total_items,
                      month_name: monthName
                    }}
                    navigateTo={{
                      path: "/inventory-monthly-commodity-details",
                      state: {
                        month: monthItem.month,
                        monthName: monthName
                      }
                    }}
                    className="[&_.icon-gradient]:from-yellow-400 [&_.icon-gradient]:to-orange-500 [&_.item-count]:bg-blue-100 [&_.item-count]:text-blue-700"

                  />
                )
              })}
            </div>
          ) : (
            <div className="w-full h-[200px] flex flex-col text-gray-500 items-center justify-center">
              <Folder className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-md font-medium">No months found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray">
            Showing {monthlyData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, totalMonths)} of {totalMonths} months
          </p>
          {totalPages > 1 && (
            <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>
    </div>
  )
}