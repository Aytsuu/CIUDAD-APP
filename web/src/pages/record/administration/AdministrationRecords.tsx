import React from "react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { Search, UserRoundCog, Plus, Download, Users, FileDown, Loader2, CircleAlert } from "lucide-react";
import { administrationColumns } from "./AdministrationColumns";
import { useFeatures, useStaffs } from "./queries/administrationFetchQueries";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { Card } from "@/components/ui/card/card";
import { useDebounce } from "@/hooks/use-debounce";
import { useLoading } from "@/context/LoadingContext";

export default function AdministrationRecords() {
  // ----------------- STATE INITIALIZATION --------------------
  const {showLoading, hideLoading} = useLoading();
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedPageSize = useDebounce(pageSize, 100)

  const { data: staffs, isLoading: isLoadingStaffs } = useStaffs(
    currentPage, 
    debouncedPageSize, 
    debouncedSearchQuery
  );
  const { data: features } = useFeatures();

  const staffList = staffs?.results || [];
  const totalCount = staffs?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if(isLoadingStaffs) showLoading();
    else hideLoading();
  }, [isLoadingStaffs])
  
  // ----------------- HANDLERS --------------------
  const handleExport = (type: "csv" | "excel" | "pdf") => {
    switch (type) {
      case "csv":
        // exportToCSV(residents)
        break
      case "excel":
        // exportToExcel(residents)
        break
      case "pdf":
        // exportToPDF(residents)
        break
    }
  }

  return (
    // ----------------- RENDER --------------------
    <MainLayoutComponent
      title="Administrative Records"
      description="Manage and view staff information"
    >
      <div className="space-y-6">
      
        <Card>
          {/* Search and Actions Bar */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search by name, position, contact..."
                  className="pl-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("excel")}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link 
                  to="role"
                  state={{
                    params: {
                      features: features,
                    },
                  }}
                >
                  <Button 
                    variant="outline" 
                    className="px-4 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <UserRoundCog size={16} className="mr-2" />
                    Manage Roles
                  </Button>
                </Link>

                <Link
                  to="/resident/form"
                  state={{
                    params: {
                      origin: "administration",
                      title: "Staff Registration",
                      description:
                        "Ensure that all required fields are filled out correctly before submission."
                    },
                  }}
                >
                  <Button className="px-4">
                    <Plus size={16} className="mr-2" />
                    Add New Staff
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Show</span>
                <Select 
                  value={pageSize.toString()} 
                  onValueChange={(value) => setPageSize(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingStaffs && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading staffs...</span>
            </div>
          )}


          {/* Empty State */}
          {!isLoadingStaffs && staffList.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No staffs found" : "No staffs yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? `No staffs match "${searchQuery}". Try adjusting your search.`
                  : "Get started by registering your first staff."}
              </p>
              {!searchQuery && (
                <Link
                  to="/resident/form"
                  state={{
                    params: {
                      origin: "create",
                      title: "Resident Registration",
                      Description: "Provide the necessary details, and complete the registration.",
                    },
                  }}
                >
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Register First Staff
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Data Table */}
          {!isLoadingStaffs && staffList.length > 0 && <DataTable 
            columns={administrationColumns} 
            data={staffList} 
            isLoading={isLoadingStaffs}
          />}
          
          {!isLoadingStaffs && staffList.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                  <span className="font-medium">{totalCount}</span> staffs
                </p>

                {totalPages > 0 && (
                  <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
              </div>
            </div>
          )}
        </Card>
        <div className="flex items-center gap-2">
        <CircleAlert size={18}/>
        <p className="text-sm">
          Staff with admin position cannot be modified.
        </p>
      </div>
      </div>
    </MainLayoutComponent>
  );
}