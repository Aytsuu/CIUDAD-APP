"use client"

import { DataTable } from "@/components/ui/table/data-table"
import { Search, FileDown, Filter, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { IRColumns } from "../ReportColumns"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import React from "react"
import { useGetIncidentReport } from "../queries/reportFetch"

export default function IRRecords() {
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const { data: incidentReports, isLoading } = useGetIncidentReport()

  const IRList = incidentReports?.results || []
  const totalCount = incidentReports?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-darkBlue2">Incident Reports</h1>
            <p className="text-xs sm:text-sm text-darkGray">Manage and view all incident reports in your system</p>
          </div>  
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalCount} Total Reports
            </Badge>
          </div>
        </div>

        {/* Filters and Search Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" className="gap-2 whitespace-nowrap">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <DropdownLayout
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <FileDown className="h-4 w-4" />
                      Export
                    </Button>
                  }
                  options={[
                    { id: "csv", name: "Export as CSV" },
                    { id: "excel", name: "Export as Excel" },
                    { id: "pdf", name: "Export as PDF" },
                  ]}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Data Table Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  className="w-16 h-8 text-center border-gray-200"
                  value={pageSize}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (value >= 1 && value <= 100) {
                      setPageSize(value)
                      setCurrentPage(1) // Reset to first page
                    }
                  }}
                />
                <span>entries</span>
              </div>

              <div className="text-sm text-gray-600">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    Loading...
                  </div>
                ) : (
                  `Showing ${totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} entries`
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border-t overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable columns={IRColumns()} data={IRList} isLoading={isLoading} />
              </div>
            </div>
          </CardContent>

          {/* Pagination Section */}
          {totalPages > 0 && (
            <>
              <Separator />
              <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Empty State */}
        {!isLoading && totalCount === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Search className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No reports found</h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  {searchQuery
                    ? `No incident reports match your search for "${searchQuery}"`
                    : "Get started by creating your first incident report"}
                </p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
