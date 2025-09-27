import React from "react"
import { Search, Plus, Building2, FileDown  , ClockArrowUp, Paperclip } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Link, useNavigate } from "react-router"
import { DataTable } from "@/components/ui/table/data-table"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { activeColumns } from "./BusinessColumns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Card } from "@/components/ui/card"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"
import { useActiveBusinesses, useModificationRequests } from "../queries/profilingFetchQueries"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { Combobox } from "@/components/ui/combobox"
import { formatModificationRequests } from "../ProfilingFormats"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { Spinner } from "@/components/ui/spinner"

export default function BusinessRecords() {
  // ----------------- STATE INITIALIZATION --------------------
  const navigate = useNavigate();
  const {showLoading, hideLoading} = useLoading();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)
  const { data: modificationRequests, isLoading: isLoadingRequests } = useModificationRequests()
  const { data: activeBusinesses, isLoading: isLoadingBusinesses} = useActiveBusinesses(
    currentPage, 
    debouncedPageSize,
    debouncedSearchQuery,
  )
  

  const businessList = activeBusinesses?.results || [];
  const totalCount = activeBusinesses?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const formattedRequest = formatModificationRequests(modificationRequests);

  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if(isLoadingBusinesses || isLoadingRequests) showLoading();
    else hideLoading();
  }, [isLoadingBusinesses, isLoadingRequests])

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
      title="Business"
      description="View and manage registered businesses, including their details, location, and registration information."
    >
      <Card className="w-full">
        {/* Search and Actions Bar */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by business name, respondent, sitio, street, sales..."
                className="pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <DropdownLayout
                  trigger={
                    <Button variant="outline" className="gap-2 border">
                      <FileDown className="h-4 w-4" />
                      Export
                    </Button>
                  }
                  options={[
                    { id: "csv", name: "Export as CSV" },
                    { id: "excel", name: "Export as Excel" },
                    { id: "pdf", name: "Export as PDF" },
                  ]}
                  onSelect={(type: any) => handleExport(type)}
                />
              </div>  

              <Link to="pending" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ClockArrowUp className="h-4 w-4 mr-2" />
                  Pending
                </Button>
              </Link>

              <div>
                <Combobox 
                  options={formattedRequest}
                  value={""}
                  customTrigger={
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Paperclip className="cursor-pointer"/>
                      Modification Request
                    </Button>
                  }
                  onChange={(value) => {
                    navigate('form', {
                      state: {
                        params: {
                          type: "viewing",
                          busId: value?.split(' ')[0],
                        }
                      }
                    })
                  }}
                  staticVal={true}
                  variant="modal"
                  placeholder="Search request by business id, name..."
                  modalTitle="Business Modification Requests"
                  emptyMessage={"No modification requests."}
                />
              </div>

              <Link
                to="form"
                state={{
                  params: {
                    type: "create",
                  },
                }}
              >
                <Button className="px-4">
                  <Plus size={16} className="mr-2" />
                  Register Business
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
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
            <div>
              
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingBusinesses && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-2 text-gray-600">Loading businesses...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingBusinesses && businessList.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No businesses found" : "No businesses yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `No businesses match "${searchQuery}". Try adjusting your search.`
                : "Get started by registering your first business."}
            </p>
          </div>
        )}

        {/* Data Table */}
        {!isLoadingBusinesses && businessList.length > 0 && (
          <DataTable columns={activeColumns} data={businessList} />
        )}

        {/* Pagination */}
          {!isLoadingBusinesses && businessList.length > 0 && (
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
