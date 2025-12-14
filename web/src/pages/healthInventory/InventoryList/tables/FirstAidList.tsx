import React, { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useSearchParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useFirstAid } from "../queries/firstAid/fetch-queries";
import { useDeleteFirstAid } from "../queries/firstAid/delete-queries";
import { FirstAidColumns, FirstAidRecords } from "./columns/FirstAidCol";
import { FirstAidModal } from "../Modal/FirstAidModal";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";

export default function FirstAidList() {
  // ------------- STATE INITIALIZATION ----------------
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [faToDelete, setFaToDelete] = useState<string | null>(null);
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedFirstAid, setSelectedFirstAid] = useState<FirstAidRecords | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const columns = FirstAidColumns({
    onEdit: (firstAid: FirstAidRecords) => {
      setSelectedFirstAid(firstAid);
      setModalMode("edit");
      setShowFirstAidModal(true);
    },
    onDelete: (id: string) => {
      setFaToDelete(id);
      setIsDeleteConfirmationOpen(true);
    }
  });

  const { data: firstAidData, isLoading: isLoadingFirstAid } = useFirstAid(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : undefined
  );

  const deleteFirstAidMutation = useDeleteFirstAid();

  // ------------- SIDE EFFECTS ----------------
  // Track if this is the initial mount
  const isInitialMount = React.useRef(true);

  // Save page state to sessionStorage for this tab
  React.useEffect(() => {
    sessionStorage.setItem("page_firstaid", String(currentPage));
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

  const formatFirstAidData = useCallback((): FirstAidRecords[] => {
    // Handle different response formats
    let firstAidResults = [];

    if (firstAidData?.results) {
      // Standard Django REST framework format
      firstAidResults = firstAidData.results;
    } else if (Array.isArray(firstAidData)) {
      // Old array format (fallback)
      firstAidResults = firstAidData;
    } else if (firstAidData?.results?.results) {
      // Handle nested format if needed
      firstAidResults = firstAidData.results.results;
    } else if (firstAidData?.data) {
      // If API returns data property
      firstAidResults = firstAidData.data;
    }

    return firstAidResults.map((firstAid: any) => ({
      id: firstAid.fa_id,
      fa_name: firstAid.fa_name,
      cat_id: firstAid.cat,
      cat_name: firstAid.catlist || "N/A"
    }));
  }, [firstAidData]);

  const displayData = useMemo(() => formatFirstAidData(), [formatFirstAidData]);

  // Export functionality
  const prepareExportData = () => {
    return displayData.map((firstAid) => ({
      "First Aid ID": firstAid.id,
      "First Aid Name": firstAid.fa_name,
      "Category": firstAid.cat_name
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `first_aid_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `first_aid_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `first_aid_list_${new Date().toISOString().slice(0, 10)}`, "First Aid List");
  };

  const handleDelete = () => {
    if (faToDelete === null) return;
    deleteFirstAidMutation.mutate(faToDelete);
    setIsDeleteConfirmationOpen(false);
    setFaToDelete(null);
  };

  // Get pagination info from API response
  const paginationInfo = useMemo(() => {
    if (firstAidData) {
      // Handle nested format if needed
      if (firstAidData.results?.count) {
        return {
          totalCount: firstAidData.results.count,
          totalPages: firstAidData.results.total_pages || Math.ceil(firstAidData.results.count / pageSize),
          currentPage: firstAidData.results.current_page || currentPage
        };
      }

      // Standard Django REST framework format
      if (firstAidData.count !== undefined) {
        return {
          totalCount: firstAidData.count || 0,
          totalPages: Math.ceil((firstAidData.count || 0) / pageSize),
          currentPage: currentPage
        };
      }

      // Fallback for array response
      if (Array.isArray(firstAidData)) {
        return {
          totalCount: firstAidData.length,
          totalPages: Math.ceil(firstAidData.length / pageSize),
          currentPage: currentPage
        };
      }
    }
    return {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    };
  }, [firstAidData, pageSize, currentPage]);

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedFirstAid(null);
    setShowFirstAidModal(true);
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
              placeholder="Search first aid name..."
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
            New First Aid
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
        {isLoadingFirstAid && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-2 text-gray-600">Loading first aid items...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingFirstAid && displayData.length === 0 && (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchInput ? "No first aid items found" : "No first aid items yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchInput ? `No first aid items match "${searchInput}". Try adjusting your search.` : "Get started by adding a new first aid item."}
            </p>
            {!searchInput && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!isLoadingFirstAid && displayData.length > 0 && <DataTable columns={columns} data={displayData} />}

        {/* Pagination */}
        {!isLoadingFirstAid && displayData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t rounded-b-lg bg-gray-50">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
              <span className="font-medium">{Math.min(currentPage * pageSize, paginationInfo.totalCount)}</span> of{" "}
              <span className="font-medium">{paginationInfo.totalCount}</span> items
            </p>

            {paginationInfo.totalPages > 1 && (
              <PaginationLayout currentPage={currentPage} totalPages={paginationInfo.totalPages} onPageChange={handlePageChange} />
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog 
        isOpen={isDeleteConfirmationOpen} 
        onOpenChange={setIsDeleteConfirmationOpen} 
        onConfirm={handleDelete} 
        title="Delete First Aid Item" 
        description="Are you sure you want to delete this first aid item? This action cannot be undone." 
      />

      {showFirstAidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <FirstAidModal 
              mode={modalMode} 
              initialData={selectedFirstAid ?? undefined} 
              onClose={() => setShowFirstAidModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}