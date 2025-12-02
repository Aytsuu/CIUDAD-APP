import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { useOPTSummaries } from "./queries/fetch";
import { MonthInfoCard } from "../month-folder-component";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button/button";

export default function MonthlyOPTSummaries() {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiResponse, isLoading, error } = useOPTSummaries(currentPage, pageSize, searchQuery);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch OPT summaries", {
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
      });
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const monthlyData = useMemo(() => apiResponse?.data || [], [apiResponse]);
  const totalMonths = apiResponse?.total_months || 0;
  const totalPages = Math.ceil(totalMonths / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate display range
  const displayRange = useMemo(() => {
    if (monthlyData.length === 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalMonths);
    return { start, end };
  }, [currentPage, pageSize, totalMonths, monthlyData.length]);

  if (error) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center p-6">
        <div className="text-center">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load data</h3>
          <p className="text-gray-500 mb-4">Please try again later</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
        <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Monthly OPT Tracking</h1>
          <p className="text-xs sm:text-sm text-darkGray">View OPT tracking records grouped by month ({totalMonths} months found)</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <Card className="p-6">
        {/* Header Section with Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end items-start sm:items-center mb-6">

          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input placeholder="Search by month..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="h-full w-full">
          {/* Table Header with Pagination Controls */}
          <div className="w-full h-auto sm:h-16 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center p-4 mb-4 gap-3 rounded-t">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number.parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">entries per page</span>
            </div>

            {totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="justify-end" />}
          </div>

          <div className="bg-white w-full">
            {isLoading ? (
              <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <span>Loading monthly records...</span>
              </div>
            ) : monthlyData.length > 0 ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {monthlyData.map((record) => (
                  <MonthInfoCard
                    key={record.month}
                    monthItem={{
                      month: record.month,
                      total_items: record.record_count,
                      month_name: record.month_name,
                    }}
                    navigateTo={{
                      path: "/opt-summry-details",
                      state: {
                        month: record.month,
                        monthName: record.month_name,
                      },
                    }}
                    className="[&_.icon-gradient]:from-cyan-400 [&_.icon-gradient]:to-blue-500 [&_.item-count]:bg-green-100 [&_.item-count]:text-green-700 hover:scale-105 transition-transform duration-200"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500 p-8">
                <Folder className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No months found</h3>
                <p className="text-sm text-center text-gray-400">{searchQuery ? "Try adjusting your search criteria" : "No monthly records available"}</p>
              </div>
            )}

            {/* Footer with Pagination */}
            {monthlyData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full p-4 gap-3 border-t">
                <p className="text-sm text-gray-600">
                  Showing {displayRange.start} to {displayRange.end} of {totalMonths} months
                </p>
                {totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
