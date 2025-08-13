import { DataTable } from "@/components/ui/table/data-table"
import { Search, FileDown, Archive } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { useDebounce } from "@/hooks/use-debounce"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"

export default function IRRecords() {
  const [activeTab, setActiveTab] = React.useState<string>("active");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [archiveSearchQuery, setArchiveSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [archivePageSize, setArchivePageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [archiveCurrentPage, setArchiveCurrentPage] = React.useState<number>(1);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);

  // Fetch active reports
  const { data: activeIRs, isLoading: isLoadingActiveIR } = useGetActiveIR(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery
  );
  const activeIRList = React.useMemo(() => activeIRs?.results || [], [activeIRs]);
  const activeTotalCount = React.useMemo(() => activeIRs?.count || 0, [activeIRs]);
  const activeTotalPages = React.useMemo(() => Math.ceil(activeTotalCount / pageSize), [activeTotalCount, pageSize]);

  // Fetch archived reports
  const { data: archiveIRs, isLoading: isLoadingArchiveIR } = useGetArchiveIR(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery
  );
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
      {/* Data Table Section */}
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
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {activeTotalCount} Active Reports
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {archiveTotalCount} Archived
                </Badge>
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
                  {isLoadingData ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                      Loading...
                    </div>
                  ) : (
                    `Showing ${totalCountValue > 0 ? (currentPageValue - 1) * pageSizeValue + 1 : 0} -
                    ${Math.min(currentPageValue * pageSizeValue, totalCountValue)} of ${totalCountValue} entries`
                  )}
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
    </>
  )

  return (
    <MainLayoutComponent
      title="Incident Reports"
      description="Manage and view all incident reports in your system"
    >
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
    </MainLayoutComponent>
  )
}
