import { DataTable } from "@/components/ui/table/data-table"
import { Search, FileDown, Filter, Plus, Archive } from "lucide-react"
import { Input } from "@/components/ui/input"
import PaginationLayout from "@/components/ui/pagination/pagination-layout"
import { IRColumns } from "../ReportColumns"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react"
import { useGetActiveIR, useGetArchiveIR } from "../queries/reportFetch"

export default function IRRecords() {
  const [activeTab, setActiveTab] = React.useState<string>("active");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [archiveSearchQuery, setArchiveSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [archivePageSize, setArchivePageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [archiveCurrentPage, setArchiveCurrentPage] = React.useState<number>(1);

  // Fetch active reports
  const { data: activeIRs, isLoading: isLoadingActiveIR } = useGetActiveIR();
  const activeIRList = React.useMemo(() => activeIRs?.results || [], [activeIRs]);
  const activeTotalCount = React.useMemo(() => activeIRs?.count || 0, [activeIRs]);
  const activeTotalPages = React.useMemo(() => Math.ceil(activeTotalCount / pageSize), [activeTotalCount, pageSize]);

  // Fetch archived reports
  const { data: archiveIRs, isLoading: isLoadingArchiveIR } = useGetArchiveIR();
  const archiveIRList = archiveIRs?.results || [];
  const archiveTotalCount = archiveIRs?.count || 0;
  const archiveTotalPages = Math.ceil(archiveTotalCount / archivePageSize);

  const renderTableSection = (
    data: any[],
    isLoadingData: boolean,
    searchValue: string,
    setSearchValue: (value: string) => void,
    pageSizeValue: number,
    setPageSizeValue: (value: number) => void,
    currentPageValue: number,
    setCurrentPageValue: (value: number) => void,
    totalCountValue: number,
    totalPagesValue: number,
    isArchive = false,
  ) => (
    <>
      {/* Filters and Search Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={`Search ${isArchive ? "archived " : ""}reports...`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
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
                value={pageSizeValue}
                onChange={(e) => {
                  const value = Number.parseInt(e.target.value)
                  if (value >= 1 && value <= 100) {
                    setPageSizeValue(value)
                    setCurrentPageValue(1) // Reset to first page
                  }
                }}
              />
              <span>entries</span>
            </div>

            <div className="text-sm text-gray-600">
              {isLoadingData ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  Loading...
                </div>
              ) : (
                `Showing ${totalCountValue > 0 ? (currentPageValue - 1) * pageSizeValue + 1 : 0}-${Math.min(currentPageValue * pageSizeValue, totalCountValue)} of ${totalCountValue} entries`
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-t overflow-hidden">
            <div className="overflow-x-auto">
              <DataTable columns={IRColumns()} data={data} isLoading={isLoadingData} />
            </div>
          </div>
        </CardContent>

        {/* Pagination Section */}
        {totalPagesValue > 0 && (
          <>
            <Separator />
            <div className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPageValue} of {totalPagesValue}
                </div>
                <PaginationLayout
                  currentPage={currentPageValue}
                  totalPages={totalPagesValue}
                  onPageChange={setCurrentPageValue}
                />
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Empty State */}
      {!isLoadingData && totalCountValue === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 text-gray-400">
                {isArchive ? <Archive className="h-full w-full" /> : <Search className="h-full w-full" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900">No {isArchive ? "archived " : ""}reports found</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                {searchValue
                  ? `No ${isArchive ? "archived " : ""}incident reports match your search for "${searchValue}"`
                  : !isArchive && "Get started by creating your first incident report"}
              </p>
              {!isArchive && (
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

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
              {activeTotalCount} Active Reports
            </Badge>
            <Badge variant="outline" className="text-xs">
              {archiveTotalCount} Archived
            </Badge>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Active Reports
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeTotalCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archived
              <Badge variant="outline" className="ml-1 text-xs">
                {archiveTotalCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {renderTableSection(
              activeIRList,
              isLoadingActiveIR,
              searchQuery,
              setSearchQuery,
              pageSize,
              setPageSize,
              currentPage,
              setCurrentPage,
              activeTotalCount,
              activeTotalPages,
              false,
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            {renderTableSection(
              archiveIRList,
              isLoadingArchiveIR,
              archiveSearchQuery,
              setArchiveSearchQuery,
              archivePageSize,
              setArchivePageSize,
              archiveCurrentPage,
              setArchiveCurrentPage,
              archiveTotalCount,
              archiveTotalPages,
              true,
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
