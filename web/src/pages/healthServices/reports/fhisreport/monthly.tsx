// MonthlyRecords.tsx
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useMonthlyData } from "./queries/fetch";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Button } from "@/components/ui/button/button";
import { MonthInfoCard } from "../month-folder-component";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

// Main Component
export default function FHSISMonthlyRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: apiResponse, isLoading, error, refetch } = useMonthlyData(currentPage, pageSize, searchQuery);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch monthly data", {
        action: {
          label: "Retry",
          onClick: () => refetch()
        }
      });
    }
  }, [error, refetch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Extract data from API response
  // In your FHSISMonthlyRecords component, change these lines:

  // Extract data from API response
  const monthlyData: any[] = apiResponse?.results?.data || apiResponse?.data || [];
  const totalMonths: number = apiResponse?.results?.total_months || apiResponse?.total_months || 0;
  const totalPages = Math.ceil(totalMonths / pageSize);

  // Filter and sort data
  const filteredMonthlyData = useMemo(() => {
    let filtered = monthlyData;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) => item.month_name.toLowerCase().includes(searchQuery.toLowerCase()) || item.year.toString().includes(searchQuery) || item.year_month.includes(searchQuery));
    }

    // Sort by most recent first
    return filtered.sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1);
      const dateB = new Date(b.year, b.month - 1);
      return dateB.getTime() - dateA.getTime();
    });
  }, [monthlyData, searchQuery]);

  // Calculate display range for pagination info
  const displayRange = useMemo(() => {
    if (filteredMonthlyData.length === 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalMonths);
    return { start, end };
  }, [currentPage, pageSize, totalMonths, filteredMonthlyData.length]);

  if (error) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center p-6">
        <div className="text-center">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Failed to load data</h3>
          <p className="text-gray-500 mb-4">Please try again later</p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
  <LayoutWithBack title="FHSIS Monthly Reports" description="View and manage Family Health Survey Information System monthly reports">
      <div className="w-full">
      <Card className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end items-start sm:items-center mb-6">
       
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          

            {/* Search Input */}
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <Input placeholder="Search months..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="h-full w-full rounded-md">
          {/* Table Header with Pagination Controls */}
          <div className="w-full h-auto sm:h-16 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center p-4 mb-4 gap-3 rounded-lg">
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
                  <SelectItem value="25">20</SelectItem>
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
            ) : filteredMonthlyData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMonthlyData.map((monthItem) => {
                  // Use year_month as the month identifier since that's what your API returns
                  const monthIdentifier = monthItem.year_month;

                  // Create the full month name with year
                  const monthName = `${monthItem.year}`;

                  return (
                    <MonthInfoCard
                      key={monthIdentifier}
                      monthItem={{
                        month: monthIdentifier, // Use year_month here
                      }}
                      navigateTo={{
                        path: "/reports/fhis-monthly-records/details",
                        state: {
                          month: monthIdentifier,
                          monthName: monthName
                        }
                      }}
                      className="[&_.icon-gradient]:from-yellow-400 [&_.icon-gradient]:to-orange-500 [&_.item-count]:bg-blue-100 [&_.item-count]:text-blue-700 hover:scale-105 transition-transform duration-200"
                    />
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500 p-8">
                <Folder className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No months found</h3>
                <p className="text-sm text-center text-gray-400">{searchQuery ? "Try adjusting your search criteria" : "No monthly records available"}</p>
              </div>
            )}

            {/* Footer with Pagination */}
            {filteredMonthlyData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-6 gap-3 border-t mt-6">
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
  </LayoutWithBack>
  );
}
