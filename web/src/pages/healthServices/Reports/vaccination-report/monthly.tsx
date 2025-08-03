// MonthlyMedicineRecords.tsx
import { useState, useMemo, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useVaccineRecords } from "./queries/fetchQueries";
import { MonthlyVaccineRecord } from "./types";
import { useLoading } from "@/context/LoadingContext";
import {toast} from "sonner";

export default function MonthlyVaccineRecords() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { data: apiResponse, isLoading,error } = useVaccineRecords(yearFilter);
  const monthlyData = apiResponse?.data || [];

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch report");
      toast("Retrying to fetch  report...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  const filteredData = useMemo(() => {
    return monthlyData.filter((monthData) => {
      const monthName = new Date(monthData.month + "-01").toLocaleString(
        "default",
        {
          month: "long",
          year: "numeric",
        }
      );
      const searchText = `${monthData.month} ${monthName}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, monthlyData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter]);

  const columns: ColumnDef<MonthlyVaccineRecord>[] = [
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
            navigate("/monthly-vaccination-details", {
              state: {
                month: row.original.month,
                monthName: new Date(row.original.month + "-01").toLocaleString(
                  "default",
                  {
                    month: "long",
                    year: "numeric",
                  }
                ),
                records: row.original.records,
                recordCount: row.original.record_count,
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
              Monthly Vaccination Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              View vaccination records grouped by month ({monthlyData.length}{" "}
              months found)
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
                placeholder="Search by month..."
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
                onChange={(e) => setPageSize(Math.max(1, +e.target.value))}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="bg-white w-full overflow-x-auto">
            {isLoading ? (
              <div className="w-full h-[100px] flex text-gray-500  items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">loading....</span>
              </div>
            ) : (
              <DataTable columns={columns} data={paginatedData} />
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
            <p className="text-xs sm:text-sm font-normal text-darkGray">
              Showing{" "}
              {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} months
            </p>
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}
