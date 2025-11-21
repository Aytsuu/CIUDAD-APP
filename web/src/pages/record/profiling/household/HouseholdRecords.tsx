import React from "react"
import { Search, Plus, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { DataTable } from "@/components/ui/table/data-table"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { householdColumns } from "./HouseholdColumns"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { Link } from "react-router"
import { useHouseholdTable } from "../queries/profilingFetchQueries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Card } from "@/components/ui/card"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"
import { Spinner } from "@/components/ui/spinner"
import { SelectLayout } from "@/components/ui/select/select-layout"

export default function HouseholdRecords() {
  // ----------------- STATE INITIALIZATION --------------------
  const {showLoading, hideLoading} = useLoading();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [nhts, setNhts] = React.useState<string>("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)

  const { data: householdTable, isLoading } = useHouseholdTable(
    currentPage, 
    debouncedPageSize, 
    debouncedSearchQuery,
    nhts
  )

  const households = householdTable?.results || []
  const totalCount = householdTable?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if(isLoading) showLoading();
    else hideLoading();
  }, [isLoading])

  return (
    // ----------------- RENDER --------------------
    <MainLayoutComponent title="Household" description="View and manage household records">
      <div className="space-y-6">
        <Card>
          {/* Search and Actions Bar */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by household name, address, head of household..."
                  className="pl-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">         
                <SelectLayout
                  withReset={false}
                  value={nhts}
                  valueLabel="NHTS"
                  className="gap-4 focus:ring-0"
                  onChange={(val) => {
                    val !== nhts && setNhts(val)
                    setCurrentPage(1);
                  }}
                  placeholder=""
                  options={[
                    { id: "all", name: "All" },
                    { id: "yes", name: "Yes" },
                    { id: "No", name: "No" },
                  ]}
                />    
                <Link to="/profiling/household/form">
                  <Button className="px-4">
                    <Plus size={16} className="mr-2" />
                    Register Household
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
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
              <Spinner size="lg" />
              <span className="ml-4 text-gray-600">Loading households...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && households.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No households found" : "No households yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? `No households match "${searchQuery}". Try adjusting your search.`
                  : "Get started by registering a house."}
              </p>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && households.length > 0 && (
            <DataTable columns={householdColumns} data={households} isLoading={isLoading} />
          )}

          {!isLoading && households.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> households
                </p>

                {totalPages > 0 && (
                  <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayoutComponent>
  )
}
