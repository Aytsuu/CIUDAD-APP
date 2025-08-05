// MonthlyFirstAidRecords.tsx
import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, Search, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { MonthlyRecord } from "./types";
import { useFirstAidRecords } from "./queries/fetchQueries";

export default function MonthlyFirstAidRecords() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter] = useState<string>("all");
  const navigate = useNavigate();

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useFirstAidRecords(currentPage, pageSize, searchQuery, yearFilter);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch report");
      toast("Retrying to fetch report...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  // Corrected data access
  const monthlyData = apiResponse?.results?.data || [];
  const totalMonths = apiResponse?.results?.total_months || 0;
  const totalPages = Math.ceil(totalMonths / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter]);

  const columns: ColumnDef<MonthlyRecord>[] = [
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => (
        <div className="text-center">
          {new Date(row.original.month + "-01").toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      accessorKey: "record_count",
      header: "Records",
      cell: ({ row }) => (
        <div className="text-center">{row.original.record_count}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          onClick={() =>
            navigate("/monthly-firstaid-details", {
              state: {
                month: row.original.month,
                monthName: new Date(row.original.month + "-01").toLocaleString(
                  "default",
                  {
                    month: "long",
                    year: "numeric",
                  }
                ),
                year: row.original.month.split("-")[0],
                records: row.original.records,
                recordCount: row.original.record_count,
                monthlyrcplist_id: row.original.monthlyrcplist_id,
                report: row.original.report,
              },
            })
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Button
            className="text-black p-2 mb-2 self-start"
            variant={"outline"}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <div className="flex-col items-center ">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Monthly First Aid Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View first aid records grouped by month ({totalMonths} months
              found)
            </p>
          </div>
        </div>
        <hr className="border-gray mb-5 sm:mb-8" />

        <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={17}
              />
              <Input
                placeholder="Search by month (e.g. 'July 2025')..."
                className="pl-10 bg-white w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
            <div className="flex gap-x-3 justify-start items-center">
              <p className="text-xs sm:text-sm">Show</p>
              <Input
                type="number"
                className="w-[70px] h-8"
                value={pageSize}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setPageSize(value > 0 ? value : 1);
                  setCurrentPage(1); // Reset to first page when page size changes
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="bg-white w-full overflow-x-auto">
            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">loading....</span>
              </div>
            ) : (
              <DataTable columns={columns} data={monthlyData} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray">
              Showing{" "}
              {monthlyData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, totalMonths)} of {totalMonths}{" "}
              months
            </p>
            {totalPages > 1 && (
              <PaginationLayout
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}