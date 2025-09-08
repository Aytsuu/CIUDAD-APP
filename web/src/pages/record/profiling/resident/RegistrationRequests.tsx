import React from "react"
import { Search, FileText, Clock, Loader2, User, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { DataTable } from "@/components/ui/table/data-table"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { FamilyRequestColumns, IndividualRequestColumns } from "./RequestColumns"
import { useRequests } from "../queries/profilingFetchQueries"
import { useDebounce } from "@/hooks/use-debounce"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLoading } from "@/context/LoadingContext"
import { CardSidebar } from "@/components/ui/card-sidebar"

export default function RegistrationRequests() {
  // ----------------- STATE INITIALIZATION --------------------
  const currentPath = location.pathname.split("/").pop() || ""
  const { showLoading, hideLoading } = useLoading()
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [selectedRequestType, setSelectedRequestType] = React.useState<string>(currentPath)

  const debouncedPageSize = useDebounce(pageSize, 100)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const { data: requests, isLoading: isLoadingRequests } = useRequests(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery,
    selectedRequestType,
  )

  const requestList = requests?.results || []
  const totalCount = requests?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  console.log(requestList)

  const sidebarItems = [
    {
      id: "individual",
      label: "Individual",
      icon: User,
      description: "Personal registrations",
      route: "individual",
    },
    {
      id: "family",
      label: "Family",
      icon: Users,
      description: "Family registrations",
      route: "family",
    },
  ]

  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if (isLoadingRequests) showLoading()
    else hideLoading()
  }, [isLoadingRequests])

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedRequestType])

  // ----------------- HANDLERS --------------------
  const formatRequestList = React.useCallback(() => {
    const formatted = requestList.map((request: any) => {
      if(selectedRequestType === "individual") {
        const personal = request.compositions[0] 
        return {
          req_id: request.req_id,
          req_date: request.req_date,
          acc: personal.acc,
          per_id: personal.per_id,
          per_lname: personal.per_lname,
          per_fname: personal.per_fname,
          per_mname: personal.per_mname,
          per_suffix: personal.per_suffix,
          per_dob: personal.per_dob,
          per_sex: personal.per_sex,
          per_status: personal.per_status,
          per_edAttainment: personal.per_edAttainment,
          per_religion: personal.per_religion,
          per_contact: personal.per_contact,
          per_addresses: personal.per_addresses
        }
      } else {
        const respondent = request.compositions.filter((comp: any) => comp.acc !== null)[0]
        if(respondent) {
          return {
            req_id: request.req_id,
            req_date: request.req_date,
            respondent: respondent,
            compositions: request.compositions
          }
        }
      }
    });

    return formatted
  }, [requestList])

  return (
    // ----------------- RENDER --------------------
    <LayoutWithBack title="Awaiting Approval" description="Submissions under review and pending authorization">
      <div className="space-y-4">
        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pending Requests</CardTitle>
                  <p className="text-sm text-gray-600">Registration requests awaiting review</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {totalCount} Pending
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="w-full flex gap-4">
          <div className="w-64 flex-shrink-0">
            <CardSidebar 
              header={<div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Request Types</h3>
                <p className="text-xs text-gray-600 mt-1">Select registration type</p>
              </div>}
              sidebarItems={sidebarItems}
              selectedItem={selectedRequestType}
              setSelectedItem={setSelectedRequestType}
            />
          </div>

          {/* Main Content Card */}
          <Card className="flex-1">
            {/* Search Bar */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search by name, submission date..."
                    className="pl-11"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Controls Bar */}
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
            {isLoadingRequests && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading requests...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingRequests && requestList.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No requests found" : "No pending requests"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? `No requests match "${searchQuery}". Try adjusting your search.`
                    : `No ${selectedRequestType} requests found. Try selecting a different category.`}
                </p>
              </div>
            )}

            {/* Data Table */}
            {!isLoadingRequests && requestList.length > 0 && <DataTable 
              columns={
                selectedRequestType == "individual" ? 
                IndividualRequestColumns : FamilyRequestColumns as any
              } 
              data={formatRequestList()} 
            />}

            {/* Pagination */}
            {!isLoadingRequests && requestList.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
                    <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                    <span className="font-medium">{totalCount}</span> requests
                  </p>
                  {totalPages > 0 && (
                    <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </LayoutWithBack>
  )
}
