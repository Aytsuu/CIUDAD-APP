import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { DataTable } from "@/components/ui/table/data-table";
import React from "react";
import { useLoading } from "@/context/LoadingContext";
import { useDebounce } from "@/hooks/use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { voterColumns } from "./VoterColumns";
import { useVoterTable } from "../queries/profilingFetchQueries";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Spinner } from "@/components/ui/spinner";

export default function VoterRecords() {
  // ================== STATE INITIALIZATION ==================
  const {showLoading, hideLoading} = useLoading();
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [pageSize, setPageSize] = React.useState<number>(10)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)

  // ---- QUERIES ------
  const { data: voterTable, isLoading } = useVoterTable(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery
  ) 

  const voters = voterTable?.results || [];
  const totalCount = voterTable?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // ================== SIDE EFFECTS ==================
  React.useEffect(() => {
    if(isLoading) showLoading();
    else hideLoading();

  }, [isLoading])
  
  // ================== RENDER ==================
  return (
    <MainLayoutComponent
      title="Voters"
      description="List of registered voters"
    >
      <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by voter name..."
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
                <span className="ml-2 text-gray-600">Loading voters...</span>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && voters.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery && "No voters found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery && `No voters match "${searchQuery}". Try adjusting your search.`}
                </p>
              </div>
            )}

            {/* Data Table */}
            {!isLoading && voters.length > 0 && (
              <DataTable columns={voterColumns} data={voters} isLoading={isLoading} />
            )}

            {/* Pagination */}
            {!isLoading && voters.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t rounded-b-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> voters
                </p>

                {totalPages > 0 && (
                  <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
    </MainLayoutComponent>
  )
}