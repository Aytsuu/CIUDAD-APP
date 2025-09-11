import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { api2 } from "@/api/api";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { MonthInfoCard } from "../month-folder-component";

export default function MonthlyFamilyPlanningReports() {
  const { showLoading, hideLoading } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        showLoading();
        const response = await api2.get("/familyplanning/monthly-list/");
        setMonthlyData(response.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch monthly family planning data");
      } finally {
        hideLoading();
      }
    };
    fetchMonths();
  }, []);
  const [summary, setSummary] = useState(null);

useEffect(() => {
    const fetchSummary = async () => {
        try {
            const response = await api2.get("/familyplanning/summary/");
            setSummary(response.data);
        } catch (err) {
            toast.error("Failed to fetch summary data");
        }
    };
    fetchSummary();
}, []);
  const filteredData = monthlyData.filter((monthData) => {
    const monthName = new Date(monthData.month + "-01").toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const searchText = `${monthData.month} ${monthName}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  
  return (
    <LayoutWithBack
      title="Monthly Family Planning Reports"
      description={`View family planning records grouped by month (${monthlyData.length} months found)`}>
      <div>
        <Card className="">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ">
            <div className="flex-1"></div>
            <div className="flex flex-col sm:flex-row gap-3 p-3 w-full sm:w-auto">
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
              {paginatedData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {paginatedData.map((record) => {
                    const monthName = new Date(record.month + "-01").toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    });

                    return (
                      <MonthInfoCard
                        key={record.month}
                        monthItem={{
                          month: record.month,
                          total_items: record.record_count,
                          month_name: monthName,
                        }}
                        navigateTo={{
                          path: "/familyplanning/monthlyreport",
                          state: {
                            month: record.month,
                            monthName: monthName,
                            records: record.records,
                            recordCount: record.record_count,
                          },
                        }}
                        className="[&_.icon-gradient]:from-purple-400 [&_.icon-gradient]:to-purple-600 
                                  [&_.item-count]:bg-purple-100 [&_.item-count]:text-purple-700 
                                  hover:scale-105 transition-transform duration-200"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500 p-8">
                  <Folder className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No months found</h3>
                  <p className="text-sm text-center text-gray-400">
                    {searchQuery ? "Try adjusting your search criteria" : "No family planning records available"}
                  </p>
                </div>
              )}

              {paginatedData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-6 gap-3 border-t mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} months
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
