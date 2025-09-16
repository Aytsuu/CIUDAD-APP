import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronLeft, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { useOPTSummaries } from "./queries/fetch";
import { MonthInfoCard } from "../month-folder-component";

export default function MonthlyOPTSummaries() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { data: apiResponse, isLoading, error } = useOPTSummaries(currentPage, pageSize, searchQuery);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch OPT summaries");
      toast("Retrying to fetch data...");
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

  const monthlyData = apiResponse?.data || [];
  const totalMonths = apiResponse?.total_months || 0;
  const totalPages = Math.ceil(totalMonths / pageSize);
  const overallTotals = apiResponse?.overall_totals || { Male: 0, Female: 0 };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Monthly OPT Tracking</h1>
          <p className="text-xs sm:text-sm text-darkGray">View OPT tracking records grouped by month ({totalMonths} months found)</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="w-full flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={17} />
          <Input placeholder="Search by month (e.g. 'July 2025')..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-md overflow-hidden">
        <div className="p-4 flex justify-between items-center bg-gray-50">
          <div className="text-sm font-medium">
            Overall Totals: Male {overallTotals.Male} | Female {overallTotals.Female}
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
                  setCurrentPage(1);
                }}
                min="1"
              />
              <p className="text-xs sm:text-sm">Entries</p>
            </div>
          </div>

          <div className="bg-white w-full p-6">
            {isLoading ? (
              <div className="w-full h-[200px] flex text-gray-500 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : monthlyData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {monthlyData.map((record) => (
                  <MonthInfoCard
                    key={record.month}
                    monthItem={{
                      month: record.month,
                      total_items: record.record_count,
                      month_name: record.month_name
                    }}
                    navigateTo={{
                      path: "/opt-summry-details",
                      state: {
                        month: record.month,
                        monthName: record.month_name
                      }
                    }}
                    record_name="children"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-[200px] flex flex-col text-gray-500 items-center justify-center">
                <Folder className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-md font-medium">No months found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray">
          Showing {monthlyData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalMonths)} of {totalMonths} months
        </p>
        {totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>
    </div>
  );
}
