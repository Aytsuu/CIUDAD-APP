import React from "react"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ClockArrowUp, FileDown, Search, Users, Loader2, Download, CircleUserRound, House, UsersRound, Building } from "lucide-react"
import { Link } from "react-router"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { DataTable } from "@/components/ui/table/data-table"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { exportToCSV, exportToExcel, exportToPDF } from "./ExportFunctions"
import { residentColumns } from "./ResidentColumns"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { useRequestCount, useResidentsTable } from "../queries/profilingFetchQueries"
import { useDebounce } from "@/hooks/use-debounce"
import { useLoading } from "@/context/LoadingContext"
import { Skeleton } from "@/components/ui/skeleton"
import { capitalize } from "@/helpers/capitalize"

const profiles = [
  {
    id: 'account', 
    icon: CircleUserRound,
  },
  {
    id: 'household', 
    icon: House
  },
  {
    id: 'family', 
    icon: UsersRound
  },
  {
    id: 'business', 
    icon: Building
  },
]

export default function ResidentRecords() {
  // ----------------- STATE INITIALIZATION --------------------
  const {showLoading, hideLoading} = useLoading();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)

  const { data: requestCount, isLoading: isLoadingRequestCount } = useRequestCount(); 
  const { data: residentsTableData, isLoading } = useResidentsTable(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery,
  )

  const residents = residentsTableData?.results || [];
  const totalCount = residentsTableData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // ----------------- SIDE EFFECTS --------------------
  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  React.useEffect(() => {
    if(isLoading) showLoading();
    else hideLoading();
  }, [isLoading])

  // ----------------- HANDLERS --------------------
  const handleExport = (type: "csv" | "excel" | "pdf") => {
    switch (type) {
      case "csv":
        exportToCSV(residents)
        break
      case "excel":
        exportToExcel(residents)
        break
      case "pdf":
        exportToPDF(residents)
        break
    }
  }

  return (
    // ----------------- RENDER --------------------
    <MainLayoutComponent title="Resident" description="Manage and view all residents in your community">
      <div className="space-y-6">
        {/* Search and Actions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search residents by name, ID, or sitio..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
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

                <Link to="/request/pending/individual" className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ClockArrowUp className="h-4 w-4 mr-2" />
                    Pending
                    {isLoadingRequestCount ? <Skeleton className="w-7 h-6"/> : (requestCount > 0 ?
                      (<Badge variant="secondary" 
                        className="ml-2 bg-orange-500/20 text-orange-600 hover:bg-orange-500/20"
                      >
                        {requestCount}
                      </Badge>) : (<></>)
                    )}
                  </Button>
                </Link>

                <Link
                  to="/resident/registration"
                  state={{
                    params: {
                      origin: "create",
                      title: "Resident Registration",
                      description: "Provide the necessary details, and complete the registration.",
                    },
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Register Resident
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
                  <SelectTrigger className="w-20 h-8">
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
                <span>entries</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex item-center justify-between gap-12">
                  {profiles.map((profile: any) => (
                    <div className="flex gap-2">
                      <profile.icon size={18} 
                        className=""
                      />
                      <p>-</p>
                      <p>{capitalize(profile.id)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading residents...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && residents.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No residents found" : "No residents yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `No residents match "${searchQuery}". Try adjusting your search.`
                    : "Get started by registering your first resident."}
                </p>
                {!searchQuery && (
                  <Link
                    to="/resident/form"
                    state={{
                      params: {
                        origin: "create",
                        title: "Resident Registration",
                        description: "Provide the necessary details, and complete the registration.",
                      },
                    }}
                  >
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Register First Resident
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Data Table */}
            {!isLoading && residents.length > 0 && (
              <DataTable columns={residentColumns} data={residents} isLoading={isLoading} />
            )}

            {/* Pagination */}
            {!isLoading && residents.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> residents
                </p>

                {totalPages > 0 && (
                  <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayoutComponent>
  )
}