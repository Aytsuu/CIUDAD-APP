import React from "react"
import { Search, Download, Building2, FileDown, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { respondentColumns } from "./BusinessColumns"
import { useBusinessRespondent } from "../queries/profilingFetchQueries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"

export default function RespondentRecords() {
  // ----------------- STATE INITIALIZATION --------------------
  const {showLoading, hideLoading} = useLoading();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)
  const { data: businesses, isLoading} = useBusinessRespondent(
    currentPage, 
    debouncedPageSize,
    debouncedSearchQuery,
  )

  const businessList = businesses?.results || [];
  const totalCount = businesses?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if(isLoading) showLoading();
    else hideLoading();
  }, [isLoading])

  // ----------------- HANDLERS --------------------
  const handleExport = (type: "csv" | "excel" | "pdf") => {
    switch (type) {
      case "csv":
        // exportToCSV(filteredBusinesses)
        break
      case "excel":
        // exportToExcel(filteredBusinesses)
        break
      case "pdf":
        // exportToPDF(filteredBusinesses)
        break
    }
  }

  return (
    // ----------------- RENDER --------------------
    <MainLayoutComponent
      title="Business Respondents"
      description="View and manage registered businesses, including their details, location, and registration information."
    >
      <Card className="w-full">
        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name..."
                className="pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Show</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
                <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading respondent records...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && businessList.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No respondent record found" : "No respondents yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `No respondents match "${searchQuery}". Try adjusting your search.`
                : "Get started by registering your first business."}
            </p>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && businessList.length > 0 && (
          <DataTable columns={respondentColumns} data={businessList} />
        )}

        {/* Pagination */}
          {!isLoading && businessList.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                Showing <span className="font-medium">{totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> -{" "}
                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                <span className="font-medium">{totalCount}</span> residents
              </p>

              {totalPages > 0 && (
                <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          )}
      </Card>
    </MainLayoutComponent>
  )
}
