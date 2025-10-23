import { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { CommodityRecords, CommodityColumns } from "./columns/commodityCol";
import { useCommodities } from "../queries/commodity/CommodityFetchQueries";
import { useDeleteCommodity } from "../queries/commodity/CommodityDeleteQueries";
import { CommodityModal } from "../Modal/CommodityModal";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";

export default function CommodityList() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [comToDelete, setComToDelete] = useState<string | null>(null);
  const [showCommodityModal, setShowCommodityModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityRecords | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const columns = CommodityColumns(setComToDelete, setIsDeleteConfirmationOpen, setSelectedCommodity, setModalMode, setShowCommodityModal);

  const { data: commoditiesData, isLoading: isLoadingCommodities, error } = useCommodities(currentPage, pageSize, searchQuery.trim() ? searchQuery.trim() : undefined);

  // Debug: Log API response
  useEffect(() => {
    console.log("Commodity Data Response:", commoditiesData);
    console.log("API Error:", error);
  }, [commoditiesData, error]);

  const deleteMutation = useDeleteCommodity();

  const formatCommodityData = useCallback((): CommodityRecords[] => {
    console.log("Formatting commodity data:", commoditiesData);

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
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="relative">
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search commodity name..." className="pl-10 bg-white w-full" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <div className="flex justify-center items-center gap-2 px-2">
            <Plus size={15} /> New
          </div>
        </Button>
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                handlePageSizeChange(value >= 1 ? value : 1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200" />
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoadingCommodities ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading commodities...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading commodities. Please check console.</span>
            </div>
          ) : displayData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No commodities found</span>
            </div>
          ) : (
            <DataTable columns={columns} data={displayData} />
          )}
        </div>

        {displayData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
            <p className="text-xs sm:text-sm text-darkGray">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, paginationInfo.totalCount)} of {paginationInfo.totalCount} rows
            </p>
            {paginationInfo.totalPages > 1 && <PaginationLayout currentPage={currentPage} totalPages={paginationInfo.totalPages} onPageChange={handlePageChange} />}
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
