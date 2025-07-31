import { useGetBudgetPlanHistory, type BudgetPlanHistory } from "./queries/budgetplanFetchQueries";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from 'lucide-react';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import React from "react";

function BudgetPlanHistory({ planId }: { planId: string }) {
  const { data: fetchedData = [], isLoading } = useGetBudgetPlanHistory(planId);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filterAndPaginate = (rows: BudgetPlanHistory[], search: string, page: number, pageSize: number) => {
    const filtered = rows.filter(row => {
      const text = `${row.bph_source_item} ${row.bph_to_item} ${row.bph_transfer_amount} ${formatTimestamp(row.bph_date_updated)}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    return { filtered, paginated, total };
  };

  const { filtered, paginated, total } = filterAndPaginate(fetchedData, searchTerm, currentPage, pageSize);

  const columns: ColumnDef<BudgetPlanHistory>[] = [
    { 
      accessorKey: "bph_date_updated", 
      header: "Date",
      cell: ({ row }) => formatTimestamp(row.getValue("bph_date_updated"))
    },
    { 
      accessorKey: "bph_source_item", 
      header: "From Item" 
    },
    { 
      accessorKey: "bph_from_prev_balance", 
      header: "From: Previous Balance",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {formatNumber(row.getValue("bph_from_prev_balance"))}
        </span>
      )
    },
    { 
      accessorKey: "bph_from_new_balance", 
      header: "From: New Balance",
      cell: ({ row }) => (
        <span className="text-red-600 font-medium">
          {formatNumber(row.getValue("bph_from_new_balance"))}
        </span>
      )
    },
    { 
      accessorKey: "bph_to_item", 
      header: "To Item" 
    },
    { 
      accessorKey: "bph_to_prev_balance", 
      header: "To: Previous Balance",
      cell: ({ row }) => (
        <span className="text-gray-700">
          {formatNumber(row.getValue("bph_to_prev_balance"))}
        </span>
      )
    },
    { 
      accessorKey: "bph_to_new_balance", 
      header: "To: New Balance",
      cell: ({ row }) => (
        <span className="text-green-600 font-medium">
          {formatNumber(row.getValue("bph_to_new_balance"))}
        </span>
      )
    },
    { 
      accessorKey: "bph_transfer_amount", 
      header: "Transferred Amount",
      cell: ({ row }) => (
        <span className="text-primary font-medium">
          {formatNumber(row.getValue("bph_transfer_amount"))}
        </span>
      )
    },
  ];

  if (isLoading) {
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <Input
            placeholder="Search transactions..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Show</span>
          <Select  value={pageSize.toString()} 
            onValueChange={(value) => {
              setPageSize(Number.parseInt(value));
              setCurrentPage(1);
            }}
          >
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
          <span className="text-sm">entries</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <DataTable columns={columns} data={paginated} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center text-sm px-1 gap-4">
        <p className="text-gray-600">
          Showing {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, total)} of {total} rows
        </p>
        {total > 0 && (
          <PaginationLayout currentPage={currentPage} totalPages={Math.ceil(total / pageSize)} onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

export default BudgetPlanHistory;