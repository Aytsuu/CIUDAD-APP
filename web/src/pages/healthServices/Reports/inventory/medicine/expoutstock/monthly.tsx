// MedicineExpiredOutOfStockSummary.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { useMedicineExpiredOutOfStockSummary } from "./queries/fetch";
import { MonthInfoCard } from "../../../month-folder-component";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";

export default function MedicineExpiredOutOfStockSummary() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: apiResponse, isLoading, error } = useMedicineExpiredOutOfStockSummary(currentPage, pageSize);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch medicine problem summary");
      toast("Retrying...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const monthlyData = apiResponse?.results?.data || [];
  const totalMonths = apiResponse?.results?.total_months || 0;
  const totalPages = Math.ceil(totalMonths / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter months based on search query - KEEPING ORIGINAL LOGIC
  const filteredMonthlyData = monthlyData.filter((monthItem) => 
    monthItem.month_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    monthItem.month.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Card className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Medicine Problem Summary</h2>
            <p className="text-sm text-gray-500">
              View expired and out-of-stock medicines grouped by month
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
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

          <div className="bg-white w-full">
            {isLoading ? (
              <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <span>Loading problem records...</span>
              </div>
            ) : filteredMonthlyData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMonthlyData.map((monthItem) => (
                  <div key={monthItem.month} className="relative">
                    <MonthInfoCard
                      monthItem={{
                        month: monthItem.month,
                        month_name: monthItem.month_name,
                        total_items: monthItem.total_problems
                      }}
                      navigateTo={{
                        path: "/medicine-expired-out-of-stock-summary/details",
                        state: {
                          month: monthItem.month,
                          monthName: monthItem.month_name
                        }
                      }}
                      className="[&_.icon-gradient]:from-red-400 [&_.icon-gradient]:to-orange-500 [&_.item-count]:bg-red-100 [&_.item-count]:text-red-700 hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500 p-8">
                <Folder className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No problem months found</h3>
                <p className="text-sm text-center text-gray-400">
                  {searchQuery ? "Try adjusting your search criteria" : "No problem records available"}
                </p>
              </div>
            )}
            
            {/* Footer with Pagination */}
            {filteredMonthlyData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-3 gap-3 border-t mt-6">
                <p className="text-sm text-gray-600">
                  Showing {filteredMonthlyData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalMonths)} of {totalMonths} months
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
  );
}