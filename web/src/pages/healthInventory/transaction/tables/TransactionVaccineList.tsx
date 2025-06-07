// CombinedTransactionList.tsx
import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, FileInput } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery } from "@tanstack/react-query";
import {
  getVaccineTransactions,
  getImmunizationTransactions,
} from "../requests/GetRequest";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import {
  CombinedTransactionColumns,
  CombinedTransactionRecords,
} from "./columns/AntigenCol";
import { SelectLayout } from "@/components/ui/select/select-layout";

export default function CombinedTransactionList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [transactionType, setTransactionType] = React.useState<
    "all" | "vaccine" | "immunization"
  >("all");

  // Fetch both types of transactions
  const { data: vaccineData, isLoading: isLoadingVaccine } = useQuery({
    queryKey: ["vaccineTransactions"],
    queryFn: getVaccineTransactions,
    staleTime: 0,
  });

  const { data: immunizationData, isLoading: isLoadingImmunization } = useQuery(
    {
      queryKey: ["immunizationTransactions"],
      queryFn: getImmunizationTransactions,
      staleTime: 0,
    }
  );

  const formatCombinedData = React.useCallback(() => {
    const vaccineTransactions =
      vaccineData?.map((transaction: any) => {
        // Debug log for each transaction
        console.log("Vaccine Transaction:", transaction);

        return {
          id: transaction.antt_id || 0,
          type: "Vaccine" as const,
          name: transaction?.vacStck_id?.vaccinelist?.vac_name,
          batch_number: String(transaction?.vacStck_id?.batch_number),
          quantity: String(transaction.antt_qty),
          action: String(transaction.antt_action),
          staff: transaction.staff,
          created_at: transaction.created_at
            ? new Date(transaction.created_at).toLocaleDateString()
            : "N/A",
        };
      }) || [];

    const immunizationTransactions =
      immunizationData?.map((transaction: any) => {
        console.log("Immunization Transaction:", transaction);

        return {
          id: transaction.imzt_id || 0,
          type: "Immunization" as const,
          name:
            transaction?.imzstock_detail?.immunization_supplies?.imz_name ||
            "N/A",
          batch_number: String(
            transaction?.imzstock_detail?.batch_number || "N/A"
          ),
          quantity: String(transaction.imzt_qty || 0),
          action: String(transaction.imzt_action || "Unknown"),
          staff: transaction.staff,
          created_at: transaction.created_at
            ? new Date(transaction.created_at).toLocaleDateString()
            : "N/A",
        };
      }) || [];

    return [...vaccineTransactions, ...immunizationTransactions];
  }, [vaccineData, immunizationData]);

  console.log("Combined Data:", formatCombinedData());
  // Filter data based on search and type
  const filteredTransactions = React.useMemo(() => {
    let combined = formatCombinedData();

    // Filter by type
    if (transactionType !== "all") {
      combined = combined.filter((record) =>
        transactionType === "vaccine"
          ? record.type === "Vaccine"
          : record.type === "Immunization"
      );
    }

    // Filter by search query
    return combined.filter((record: CombinedTransactionRecords) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatCombinedData, transactionType]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = CombinedTransactionColumns();

  if (isLoadingVaccine || isLoadingImmunization) {
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
          <div className="relative flex-1">
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
          <SelectLayout
            placeholder="Filter by type"
            label=""
            className="bg-white w-48"
            options={[
              { id: "all", name: "All Types" },
              { id: "vaccine", name: "Vaccine Only" },
              { id: "immunization", name: "Immunization Only" },
            ]}
            value={transactionType}
            onChange={(value) => setTransactionType(value as any)}
          />
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
                if (value >= 1) {
                  setPageSize(value);
                } else {
                  setPageSize(1);
                }
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
          <DataTable columns={columns} data={paginatedTransactions} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredTransactions.length)} of{" "}
            {filteredTransactions.length} rows
          </p>
          {paginatedTransactions.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
