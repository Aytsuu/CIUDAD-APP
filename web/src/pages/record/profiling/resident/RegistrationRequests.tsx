import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { requestColumns } from "./RequestColumns";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequests } from "../queries/profilingFetchQueries";
import { useDebounce } from "@/hooks/use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

export default function RegistrationRequests() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const debouncedPageSize = useDebounce(pageSize, 100);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: requests, isLoading: isLoadingRequests } = useRequests(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery
  );

  const requestList = requests?.results || [];
  const totalCount = requests?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoadingRequests) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  return (
    <LayoutWithBack
      title="Awaiting Approval"
      description="Submissions under review and pending authorization"
    >
      <div className="relative w-full flex gap-2 mr-2 mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
          size={17}
        />
        <Input
          placeholder="Search..."
          className="pl-10 bg-white w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-md">
        <div className="flex items-center gap-2 p-3">
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

        <div className="overflow-x-auto">
          <DataTable columns={requestColumns(requests)} data={requestList} />
        </div>
          
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing <span className="font-medium">{(currentPage - 1) * (pageSize + 1)}</span> -{" "}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
              <span className="font-medium">{totalCount}</span> requests
            </p>

            {totalPages > 0 && (
              <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>
      </div>
    </LayoutWithBack>
  );
}
