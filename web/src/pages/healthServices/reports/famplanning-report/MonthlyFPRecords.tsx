// src/reports/familyplanning/MonthlyFPRecords.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { MonthInfoCard } from "../month-folder-component";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useFPRecords } from "./queries";

export default function MonthlyFPRecords() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [yearFilter] = useState<string>("all");

  const { data: apiResponse, isLoading, error } = useFPRecords(yearFilter);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch FP records");
      setTimeout(() => window.location.reload(), 2000);
    }
  }, [error]);

  useEffect(() => {
    isLoading ? showLoading() : hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  const monthlyData = apiResponse?.data || [];
  const totalMonths = monthlyData.length;

  const filteredData = monthlyData.filter((m: any) =>
    `${m.month} ${m.month_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => setCurrentPage(1), [searchQuery, yearFilter]);

  return (
    <LayoutWithBack
      title="Monthly Family Planning Records"
      description={`View FP records grouped by month (${totalMonths} months found)`}
    >
      <Card className="p-4">
        {/* Search */}
        <div className="flex justify-end mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <Input
              placeholder="Search by month..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Pagination header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={v => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          {totalPages > 1 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <span>Loading FP records...</span>
          </div>
        ) : paginatedData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {paginatedData.map((rec: any) => (
              <MonthInfoCard
                key={rec.month}
                monthItem={{
                  month: rec.month,
                  total_items: rec.record_count,
                  month_name: rec.month_name,
                }}
                navigateTo={{
                  path: "/familyplanning/report/details",
                  state: {
                    month: rec.month,
                    monthName: rec.month_name,
                    recordCount: rec.record_count,
                  },
                }}
                className="[&_.icon-gradient]:from-purple-400 [&_.icon-gradient]:to-pink-600 
                           [&_.item-count]:bg-purple-100 [&_.item-count]:text-purple-700 
                           hover:scale-105 transition-transform"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Folder className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium">No months found</h3>
            <p className="text-sm">
              {searchQuery ? "Try adjusting your search" : "No FP records yet"}
            </p>
          </div>
        )}

        {/* Footer pagination */}
        {paginatedData.length > 0 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
              {filteredData.length} months
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
      </Card>
    </LayoutWithBack>
  );
}