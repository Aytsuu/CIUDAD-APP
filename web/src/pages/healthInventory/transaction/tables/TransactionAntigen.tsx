import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, FileInput } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { getAntigenTransactions } from "../restful-api/GetRequest";
import { AntigenTransaction } from "./type";

export default function AntigenTransactionsTable() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  // Fetch data using React Query
  const { data: antigenData, isLoading: isLoadingAntigen } = useQuery({
    queryKey: ["antigenTransactions"],
    queryFn: getAntigenTransactions,
  });

  const columns = [
    // {
    //   accessorKey: "antt_id",
    //   header: "#",
    //   cell: ({ row }: { row: { original: AntigenTransaction } }) => (
    //     <div className="flex justify-center">
    //       <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
    //         {row.original.antt_id}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      accessorKey: "item",
      header: "Item Name",
      cell: ({ row }: { row: { original: AntigenTransaction } }) => (
        <div className="capitalize">
          {row.original.vac_stock?.vaccinelist?.vac_name ||
           row.original.imz_stock?.imz_detail?.imz_name ||
           "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "antt_qty",
      header: "Quantity",
      cell: ({ row }: { row: { original: AntigenTransaction } }) => (
        <div className="text-center">{row.original.antt_qty}</div>
      ),
    },
    {
      accessorKey: "antt_action",
      header: "Action",
      cell: ({ row }: { row: { original: AntigenTransaction } }) => (
        <div className="capitalize">
          {row.original.antt_action.toLowerCase()}
        </div>
      ),
    },
    {
      accessorKey: "staff",
      header: "Staff ID",
      cell: ({ row }: { row: { original: AntigenTransaction } }) => (
        <div className="text-center">{row.original.staff}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }: { row: { original: AntigenTransaction } }) => (
        <div>{new Date(row.original.created_at).toLocaleDateString()}</div>
      ),
    },
  ];

  // Format antigen data
  const formatAntigenData = React.useCallback(() => {
    if (!antigenData) return [];
    return antigenData;
  }, [antigenData]);

  // Filter data based on search query
  const filteredAntigen = React.useMemo(() => {
    return formatAntigenData().filter((record: AntigenTransaction) => {
      const searchText = `
        ${record.vac_stock?.vaccinelist?.vac_name || ""}
        ${record.imz_stock?.imz_detail?.imz_name || ""}
        ${record.antt_action}
        ${record.staff}
      `.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatAntigenData]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredAntigen.length / pageSize);

  // Slice the data for the current page
  const paginatedAntigen = filteredAntigen.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Loading state
  if (isLoadingAntigen) {
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
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search by item name, action, or staff..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <DataTable 
            columns={columns} 
            data={paginatedAntigen} 
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          {filteredAntigen.length > 0 ? (
            <>
              <p className="text-xs sm:text-sm text-darkGray">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, filteredAntigen.length)} of{" "}
                {filteredAntigen.length} rows
              </p>
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <p className="text-xs sm:text-sm text-darkGray">
              No results found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}