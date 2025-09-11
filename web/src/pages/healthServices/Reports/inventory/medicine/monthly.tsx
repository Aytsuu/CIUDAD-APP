// MonthlyMedicineRecords.tsx
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder, Filter } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { MedicineMonthItem } from "./types";
import { useMedicineMonths } from "./queries/fetch";
import { MonthInfoCard } from "../../month-folder-component";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";

export default function InventoryMonthlyMedicineRecords() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"month" | "items">("month");
  const [yearFilter] = useState<string>("all");

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useMedicineMonths(currentPage, pageSize, yearFilter, searchQuery);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch medicine months", {
        action: {
          label: "Retry",
          onClick: () => refetch(),
        },
      });
    }
  }, [error, refetch]);

  useEffect(() => {
    if (isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const monthlyData: MedicineMonthItem[] = apiResponse?.results?.data || [];
  const totalMonths: number = apiResponse?.results?.total_months || 0;
  const totalPages = Math.ceil(totalMonths / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, yearFilter]);

  // Memoized filtered and sorted data
  const filteredMonthlyData = useMemo(() => {
    const filtered = monthlyData.filter(monthItem =>
      monthItem.month_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      monthItem.month.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort data
    return filtered.sort((a, b) => {
      if (sortBy === "month") {
        return new Date(b.month).getTime() - new Date(a.month).getTime(); // Newest first
      } else {
        return b.total_items - a.total_items; // Most items first
      }
    });
  }, [monthlyData, searchQuery, sortBy]);

  // Calculate display range
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
    <div>
      <Card className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Inventory Stock Report</h2>
            <p className="text-sm text-gray-500">
              View medicine transactions grouped by month
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

          <div className="bg-white w-full ">
            {isLoading ? (
              <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <span>Loading monthly records...</span>
              </div>
            ) : filteredMonthlyData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredMonthlyData.map((monthItem) => (
                  <MonthInfoCard 
                    key={monthItem.month} 
                    monthItem={monthItem}
                    navigateTo={{
                      path: "/inventory-monthly-medicine-details",
                      state: {
                        month: monthItem.month,
                        monthName: new Date(monthItem.month + "-01").toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })
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
                  {searchQuery ? "Try adjusting your search criteria" : "No monthly records available"}
                </p>
              </div>
            )}
            
            {/* Footer with Pagination */}
            {filteredMonthlyData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full pt-3 gap-3 border-t mt-6">
                <p className="text-sm text-gray-600">
                  Showing {displayRange.start} to {displayRange.end} of {totalMonths} months
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