import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { BudgetLogTable } from "./budget-tracker-types";
import { useGADBudgetLogs } from "./queries/BTFetchQueries";
import { useParams } from "react-router-dom";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext"; 
import { useEffect } from "react";

function GADBudgetLogTable() {
  const { year } = useParams<{ year: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { showLoading, hideLoading } = useLoading();

  const { 
    data: logsData, 
    isLoading, 
    error,
    isFetching 
  } = useGADBudgetLogs(
    year || "", 
    currentPage, 
    pageSize, 
    debouncedSearchQuery
  );

  // Extract data from paginated response
  const logs = logsData?.results || [];
  const totalCount = logsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // =================== LOADING EFFECT ===================
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const columns: ColumnDef<BudgetLogTable>[] = [
    {
      accessorKey: "gbudl_project_name",
      header: "Project Name",
      cell: ({ row }) => {
        const projectName = row.original.gbud_exp_project || "N/A";
        return <div className="text-center">{projectName}</div>;
      },
    },
    {
      accessorKey: "gbudl_particulars",
      header: "Particulars",
      cell: ({ row }) => {
        const particulars = row.original.gbud_exp_particulars;
        return (
          <div className="text-center">
            {particulars && particulars.length > 0
              ? particulars.map((item) => item.name).join(", ")
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "gbudl_proposed_budget",
      header: "Proposed Budget",
      cell: ({ row }) => {
        const budget = row.original.gbud_proposed_budget;
        return (
          <div className="text-center">
            {budget !== null
              ? `₱${budget.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "gbudl_prev_amount",
      header: "Actual Expense",
      cell: ({ row }) => {
        const expense = row.original.gbudl_prev_amount;
        return (
          <div className="text-center">
            {expense !== null
              ? `₱${expense.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "gbudl_amount_returned",
      header: "Return/Excess",
      cell: ({ row }) => {
        const amount =
          typeof row.original.gbudl_amount_returned === "number"
            ? row.original.gbudl_amount_returned
            : null;

        const prevAmount = row.original.gbudl_prev_amount;

        if (amount === null || !prevAmount) {
          return <div className="text-center">-</div>;
        }

        const isNegative = amount < 0;
        const absoluteAmount = Math.abs(amount);

        return (
          <div
            className={`text-center font-medium ${
              isNegative ? "text-red-500" : "text-green-500"
            }`}
          >
            {`${isNegative ? "-" : ""}₱${absoluteAmount.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
          </div>
        );
      },
    },
    {
      accessorKey: "gbudl_created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.gbudl_created_at).toLocaleString();
        return <div className="text-center">{date}</div>;
      },
    },
  ];

  if (error) {
    return (
      <LayoutWithBack
        title={`Budget Logs${year ? ` for ${year}` : ""}`}
        description="View budget logs"
      >
        <div className="text-red-500 text-center py-8">
          Error loading budget logs: {error.message}
        </div>
      </LayoutWithBack>
    );
  }

  return (
    <LayoutWithBack
      title={`Budget Logs${year ? ` for ${year}` : ""}`}
      description="View budget logs"
    >
      <div className="w-full h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full flex gap-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search by project name or particulars..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
            />
            {isFetching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" />
              </div>
            )}
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
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px] relative">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                <DataTable 
                  columns={columns} 
                  data={logs} 
                />
                {isFetching && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <p className="text-xs sm:text-sm text-darkGray">
                  Showing {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalCount)} of{" "}
                  {totalCount} rows
                </p>
                {totalCount > 0 && totalPages > 1 && (
                  <PaginationLayout
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                    }}
                  />
                )}
              </>
            )}
          </div>

          {!isLoading && logs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No budget logs found matching your search" : "No budget logs found"}
            </div>
          )}
        </div>
      </div>
    </LayoutWithBack>
  );
}

export default GADBudgetLogTable;