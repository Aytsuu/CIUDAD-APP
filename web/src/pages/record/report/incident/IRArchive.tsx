import { DataTable } from "@/components/ui/table/data-table"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { IRColumns } from "../ReportColumns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useDebounce } from "@/hooks/use-debounce"
import { useGetIncidentReport } from "../queries/reportFetch"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"

export default function IRArchive() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);

  // Fetch archive reports
  const { data: IncidentReport, isLoading: isLoadingIR } = useGetIncidentReport(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery,
    true
  );

  const IRList = IncidentReport?.results || [];
  const totalCount = IncidentReport?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <LayoutWithBack
      title={<>
        Archive / <span className="text-gray-400">Incident Report</span>
      </>}
      description="View all archived incident reports in your system"
    >
      <div className="flex w-full h-full gap-4">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search reports...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div> 
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
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

            <div className="border-t overflow-hidden">
              <div className="overflow-x-auto">
                <DataTable columns={IRColumns()} data={IRList} isLoading={isLoadingIR} />
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
                    {isLoadingIR ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        Loading...
                      </div>
                    ) : (
                      `Showing ${totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0} -
                      ${Math.min(currentPage * pageSize, totalCount)} of ${totalCount} entries`
                    )}
                  </div>

                  <PaginationLayout
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </LayoutWithBack>
  )
}
