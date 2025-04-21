import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { requestColumns } from "./RequestColumns";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequests } from "../queries/profilingFetchQueries";

export default function RegistrationRequests() {

  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const { data: requests, isLoading: isLoadingRequests} = useRequests();

  const formatRequestData = React.useCallback(() => {
    if(!requests) return[];

    return requests.map((request: any) => {
      const personal = request.per
      return ({
        id: request.req_id || '',
        address: personal.per_address || '',
        lname: personal.per_lname || '',
        fname: personal.per_fname || '',
        mname: personal.per_mname || '',
        suffix: personal.per_suffix || '',
        requestDate: request.req_date || ''
      });
    });
  }, [requests])

  const filteredRequests = React.useMemo(() => {
    const formattedData = formatRequestData()
    if(!formattedData.length) return [];

    return formattedData.filter((request: any) => 
      Object.values(request).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, requests])

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  if(isLoadingRequests) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    )
  }

  return (
    <LayoutWithBack
      title="Awaiting Approval"
      description="Submissions under review and pending authorization"
    >

      <div className="relative w-full flex gap-2 mr-2 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
        <Input
          placeholder="Search..."
          className="pl-10 bg-white w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-md">
        <div className="flex items-center gap-2 p-3">
          <p className="text-xs sm:text-sm">Show</p>
          <Input
            type="number"
            className="w-14 h-6"
            value={pageSize}
            onChange={(e) => {
              const value = +e.target.value;
              if (value >= 1) {
                setPageSize(value);
              } else {
                setPageSize(1); // Reset to 1 if invalid
              }
            }}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={requestColumns(requests)} data={paginatedRequests} />
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredRequests.length)} of {filteredRequests.length} rows
          </p>
          {paginatedRequests.length > 0 && <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
          />}
        </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
