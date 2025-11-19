// components/MonthlyConsultedSummaries.tsx
import { useState, useEffect } from "react";
import { Loader2, Folder, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { useMonthlySummaries } from "./queries/fetch";
import { MonthInfoCard } from "../../month-folder-component";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useAuth } from "@/context/AuthContext";

export default function MonthlyConsultedSummaries() {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id;

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Use searchQuery directly as the search parameter
  const { data: apiResponse, isLoading, error } = useMonthlySummaries(
    currentPage, 
    pageSize, 
    searchQuery,
    staff_id
  );

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch monthly summaries");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  // CORRECTED: Access the data properly based on the API response structure
  const monthlyData: any[] = apiResponse?.results?.data || [];
//   const totalCount = apiResponse?.results?.total_months || 0;
  const paginationCount = apiResponse?.count || 0;

  const totalPages = Math.ceil(paginationCount / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  return (
    <LayoutWithBack title="Monthly Consulted Patients" description="Review monthly summaries of consulted patients.">
      <div>
        <Card className="">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ">
            <div className="flex-1"></div>

            <div className="flex flex-col sm:flex-row gap-3 p-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <Input
                  placeholder="Search by month (e.g., November 2025...)"
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
                  <span>Loading monthly summaries...</span>
                </div>
              ) : monthlyData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {monthlyData.map((monthItem: any) => (
                    <MonthInfoCard
                      key={monthItem.month}
                      monthItem={{
                        month: monthItem.month,
                        total_items: monthItem.record_count,
                        month_name: monthItem.month_name,
                      }}
                      navigateTo={(month, monthName) =>
                        navigate("/reports/monthly-consulted-summaries/records", {
                          state: {
                            month,
                            monthName,
                          },
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500 p-8">
                  <Folder className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No months found</h3>
                  <p className="text-sm text-center text-gray-400">
                    {searchQuery ? "Try adjusting your search criteria" : "No monthly summaries available"}
                  </p>
                </div>
              )}

              {/* Footer with Pagination */}
              {monthlyData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-6 gap-3 border-t mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, paginationCount)} of {paginationCount} months
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
