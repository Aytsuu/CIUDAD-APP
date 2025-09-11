import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { BudgetLogTable } from "./budget-tracker-types";
import { useGADBudgetLogs } from "./queries/BTFetchQueries";
import { useParams } from "react-router-dom";

function GADBudgetLogTable() {
  const { year } = useParams<{ year: string }>();
  if (!year) {
    return;
  }
  const { data: logs = [], isLoading, error } = useGADBudgetLogs(year);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const typeOptions = [
    { id: "all", name: "All" },
    { id: "Income", name: "Income" },
    { id: "Expense", name: "Expense" },
  ];

  const sortedData = useMemo(() => {
    return [...logs].sort((a, b) => {
      // Sort by gbudl_created_at, newest first
      return (
        new Date(b.gbudl_created_at).getTime() -
        new Date(a.gbudl_created_at).getTime()
      );
    });
  }, [logs]);

  const filteredData = sortedData.filter((log) => {
    const matchesYear =
      !year || new Date(log.gbudl_created_at).getFullYear().toString() === year;
    const searchString = `${log.gbudl_id} ${log.gbud_exp_project || ""} ${
      log.gbud_exp_particulars?.map((item) => item.name).join(" ") || ""
    }`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    return matchesSearch && matchesYear;
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

        // Show "-" if amount is null OR if prevAmount is 0 or null/undefined
        if (amount === null || !prevAmount) {
          // This covers 0, null, undefined
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

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3 opacity-30" />
        <Skeleton className="h-7 w-1/4 mb-6 opacity-30" />
        <Skeleton className="h-10 w-full mb-4 opacity-30" />
        <Skeleton className="h-4/5 w-full mb-4 opacity-30" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading budget logs</div>;
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
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SelectLayout
              className="bg-white"
              label=""
              placeholder="Filter by Type"
              options={typeOptions}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
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
                  setPageSize(value >= 1 ? value : 1);
                  setCurrentPage(1);
                }}
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable columns={columns} data={paginatedData} />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
            <p className="text-xs sm:text-sm text-darkGray">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} rows
            </p>
            {filteredData.length > 0 && (
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}

export default GADBudgetLogTable;
