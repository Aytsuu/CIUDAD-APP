import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Folder, FileText } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { usePopulationYearlyRecords } from "./queries/fetchQueries";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { MonthInfoCard } from "../../reports/month-folder-component";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router-dom";

interface YearRecord {
  year: string;
  total_population: number;
  total_families: number;
  total_households: number;
}

export default function YearlyPopulationRecords() {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const { data: apiResponse, isLoading, error } = usePopulationYearlyRecords();

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch reports");
    }
  }, [error]);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const yearlyData = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
  const totalYears = yearlyData.length;

  // Set default year to most recent when data loads
  useEffect(() => {
    if (yearlyData.length > 0 && !selectedYear) {
      setSelectedYear(yearlyData[0].year);
    }
  }, [yearlyData, selectedYear]);

  // Filter data based on search query
  const filteredData = yearlyData.filter((yearData: YearRecord) => {
    const searchText = `${yearData.year}`.toLowerCase();
    return searchText.includes(searchQuery.toLowerCase());
  });

  // Paginate the filtered data
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <LayoutWithBack 
      title="Population Structure Reports" 
      description={`View population structure reports by year (${totalYears} years found)`}
    >
      <div>
        <Card className="">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Select Year:</span>
                <Select
                  value={selectedYear}
                  onValueChange={(value) => setSelectedYear(value)}
                >
                  <SelectTrigger className="w-32 bg-white">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearlyData.map((record: YearRecord) => (
                      <SelectItem key={record.year} value={record.year}>
                        {record.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="default"
                onClick={() => {
                  if (selectedYear) {
                    navigate("/health-family-profiling/summary", {
                      state: { year: selectedYear }
                    });
                  } else {
                    toast.error("Please select a year first");
                  }
                }}
                disabled={!selectedYear}
                className="w-full sm:w-auto"
              >
                <FileText className="mr-2 h-4 w-4" />
                View Health Summary Report
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <Input 
                  placeholder="Search by year..." 
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
                  <span>Loading population reports...</span>
                </div>
              ) : paginatedData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {paginatedData.map((record: YearRecord) => (
                    <MonthInfoCard
                      key={record.year}
                      monthItem={{
                        month: record.year,
                        month_name: record.year,
                        total_items: record.total_population
                      }}
                      navigateTo={{
                        path: "/health-family-profiling/records",
                        state: {
                          year: record.year,
                          totalPopulation: record.total_population,
                          totalFamilies: record.total_families,
                          totalHouseholds: record.total_households,
                        }
                      }}
                      record_name="population"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-[300px] flex flex-col items-center justify-center text-gray-500 p-8">
                  <Folder className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No years found</h3>
                  <p className="text-sm text-center text-gray-400">
                    {searchQuery ? "Try adjusting your search criteria" : "No population records available"}
                  </p>
                </div>
              )}

              {/* Footer with Pagination */}
              {paginatedData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between w-full py-6 gap-3 border-t mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                    {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} years
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
