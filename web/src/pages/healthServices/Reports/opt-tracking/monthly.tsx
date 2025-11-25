import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { OPTMonthItem } from "./types";
import { useOPTMonths } from "./queries/fetch";
import { MonthInfoCard } from "../month-folder-component";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export default function MonthlyOPTRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter] = useState<string>("all");

  const { data: apiResponse, isLoading, error } = useOPTMonths(currentPage, pageSize, yearFilter, searchQuery);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch OPT months");
      toast("Retrying to fetch OPT report...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  const monthlyData: OPTMonthItem[] = apiResponse?.results?.data || [];
  const totalMonths: number = apiResponse?.results?.total_months || 0;
  const totalPages = Math.ceil(totalMonths / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter]);

  return (
    <LayoutWithBack
      title="Monthly OPT Records"
      description={`View child health records grouped by month (${totalMonths} months found)`}>
      <div>
        <Card className="">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ">
            <div className="flex-1"></div>

            <div className="flex flex-col sm:flex-row gap-3 p-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
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
            {/* Table Header with Pagination Controls */}
            <div className="w-full h-auto sm:h-16 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center p-4 mb-4 gap-3">
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
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">entries per page</span>
              </div>

              {totalPages > 1 && (
                <PaginationLayout
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="justify-end"
                />
              )}
            </div>

            <div className="bg-white w-full px-4 pt-3">
              {isLoading ? (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <span>Loading OPT records...</span>
                </div>
              ) : monthlyData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {monthlyData.map((monthItem) => (
                    <MonthInfoCard
                      key={monthItem.month}
                      monthItem={{
                        month: monthItem.month,
                        total_items: monthItem.record_count,
                        month_name: monthItem.month_name
                      }}
                      navigateTo={{
                        path: "/monthly-opt-details",
                        state: {
                          month: monthItem.month,
                          monthName: monthItem.month_name
                        }
                      }}
                      className="[&_.icon-gradient]:from-yellow-400 [&_.icon-gradient]:to-orange-500 [&_.item-count]:bg-blue-100 [&_.item-count]:text-blue-700 hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500 p-8">
                  <Folder className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No months found</h3>
                  <p className="text-sm text-center text-gray-400">
                    {searchQuery ? "Try adjusting your search criteria" : "No OPT records available"}
                  </p>
                </div>
              )}

              {/* Footer with Pagination */}
              {monthlyData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-6 gap-3 border-t mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {monthlyData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalMonths)} of {totalMonths} months
                  </p>

                  {totalPages > 1 && (
                    <PaginationLayout
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </LayoutWithBack>
  );
}
