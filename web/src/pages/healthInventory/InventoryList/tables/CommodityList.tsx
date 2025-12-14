import React, { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useSearchParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { CommodityRecords, CommodityColumns } from "./columns/commodityCol";
import { useCommodities } from "../queries/commodity/CommodityFetchQueries";
import { useDeleteCommodity } from "../queries/commodity/CommodityDeleteQueries";
import { CommodityModal } from "../Modal/CommodityModal";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";

export default function CommodityList() {
  // ------------- STATE INITIALIZATION ----------------
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [comToDelete, setComToDelete] = useState<string | null>(null);
  const [showCommodityModal, setShowCommodityModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityRecords | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const columns = CommodityColumns(setComToDelete, setIsDeleteConfirmationOpen, setSelectedCommodity, setModalMode, setShowCommodityModal);

  const { data: commoditiesData, isLoading: isLoadingCommodities } = useCommodities(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : undefined
  );

  const deleteMutation = useDeleteCommodity();

  // ------------- SIDE EFFECTS ----------------
  // Track if this is the initial mount
  const isInitialMount = React.useRef(true);

  // Save page state to sessionStorage for this tab
  React.useEffect(() => {
    sessionStorage.setItem("page_commodity", String(currentPage));
  }, [currentPage]);

  // Reset to page 1 when search changes (but not on initial mount)
  React.useEffect(() => {
    if(isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if(debouncedSearchQuery === "") return;
    handlePageChange(1);
  }, [debouncedSearchQuery]);

  const formatCommodityData = useCallback((): CommodityRecords[] => {
    // Handle different response formats
    let commodityResults = [];

    if (commoditiesData?.results) {
      // Standard Django REST framework format
      commodityResults = commoditiesData.results;
    } else if (Array.isArray(commoditiesData)) {
      // Old array format (fallback)
      commodityResults = commoditiesData;
    } else if (commoditiesData?.results?.results) {
      // Handle nested format if needed
      commodityResults = commoditiesData.results.results;
    } else if (commoditiesData?.data) {
      // If API returns data property
      commodityResults = commoditiesData.data;
    }

    return commodityResults.map((commodity: any) => ({
      id: commodity.com_id,
      com_name: commodity.com_name,
      user_type: commodity.user_type || "N/A",
      gender_type: commodity.gender_type || "N/A"
    }));
  }, [commoditiesData]);

  const displayData = useMemo(() => formatCommodityData(), [formatCommodityData]);

  // Export functionality
  const prepareExportData = () => {
    return displayData.map((commodity) => ({
      "Commodity ID": commodity.id,
      "Commodity Name": commodity.com_name,
      "User Type": commodity.user_type,
      "Gender Type": commodity.gender_type
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `commodity_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `commodity_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `commodity_list_${new Date().toISOString().slice(0, 10)}`, "Commodity List");
  };

  const handleDelete = () => {
    if (comToDelete === null) return;
    deleteMutation.mutate(comToDelete);
    setIsDeleteConfirmationOpen(false);
    setComToDelete(null);
  };

  // Get pagination info from API response
  const paginationInfo = useMemo(() => {
    if (commoditiesData) {
      // Handle nested format if needed
      if (commoditiesData.results?.count) {
        return {
          totalCount: commoditiesData.results.count,
          totalPages: commoditiesData.results.total_pages || Math.ceil(commoditiesData.results.count / pageSize),
          currentPage: commoditiesData.results.current_page || currentPage
        };
      }

      // Standard Django REST framework format
      if (commoditiesData.count !== undefined) {
        return {
          totalCount: commoditiesData.count || 0,
          totalPages: Math.ceil((commoditiesData.count || 0) / pageSize),
          currentPage: currentPage
        };
      }

      // Fallback for array response
      if (Array.isArray(commoditiesData)) {
        return {
          totalCount: commoditiesData.length,
          totalPages: Math.ceil(commoditiesData.length / pageSize),
          currentPage: currentPage
        };
      }
    }
    return {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    };
  }, [commoditiesData, pageSize, currentPage]);

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedCommodity(null);
    setShowCommodityModal(true);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    handlePageChange(1);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search commodity name..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <ExportDropdown
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
          />
          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Commodity
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border rounded-lg bg-white overflow-hidden">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number.parseInt(value))}>
              <SelectTrigger className="w-20 h-8">
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
            <span>entries</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingCommodities && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-2 text-gray-600">Loading commodities...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingCommodities && displayData.length === 0 && (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchInput ? "No commodities found" : "No commodities yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchInput ? `No commodities match "${searchInput}". Try adjusting your search.` : "Get started by adding a new commodity."}
            </p>
            {!searchInput && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Commodity
              </Button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!isLoadingCommodities && displayData.length > 0 && <DataTable columns={columns} data={displayData} />}

        {/* Pagination */}
        {!isLoadingCommodities && displayData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t rounded-b-lg bg-gray-50">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
              <span className="font-medium">{Math.min(currentPage * pageSize, paginationInfo.totalCount)}</span> of{" "}
              <span className="font-medium">{paginationInfo.totalCount}</span> commodities
            </p>

            {paginationInfo.totalPages > 1 && (
              <PaginationLayout currentPage={currentPage} totalPages={paginationInfo.totalPages} onPageChange={handlePageChange} />
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog isOpen={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={handleDelete} title="Delete Commodity" description="Are you sure you want to delete this commodity? This action cannot be undone." />

      {showCommodityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <CommodityModal mode={modalMode} initialData={selectedCommodity ?? undefined} onClose={() => setShowCommodityModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}