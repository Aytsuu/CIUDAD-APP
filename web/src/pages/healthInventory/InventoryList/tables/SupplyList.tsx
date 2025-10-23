import { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useDeleteAntigen } from "../queries/Antigen/delete-queries";
import AddImmunizationSupplies from "../Modal/ImmunizationSupplies";
import { SupplyColumns } from "./columns/SupplyCol";
import { useImzSupTable } from "../queries/Antigen/fetch-queries";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";

export default function SupplyList() {
  // Pagination and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // For controlled input
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal and confirmation state
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [supplyToDelete, setSupplyToDelete] = useState<number | null>(null);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedSupply, setSelectedSupply] = useState<any | null>(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Supply query with pagination and search
  const { data: suppliesData, isLoading: isLoadingSupplies } = useImzSupTable(currentPage, pageSize, searchQuery.trim() ? searchQuery.trim() : undefined);

  const deleteSupplyMutation = useDeleteAntigen();

  // Format supplies data based on API structure
  const formatSuppliesData = useCallback(() => {
    if (!suppliesData?.results || !Array.isArray(suppliesData.results)) return [];
    return suppliesData.results
      .map((item: any) => {
        return {
          id: item.imz_id,
          supplyName: item.imz_name,

          doseDetails: []
        };
      })
      .filter(Boolean);
  }, [suppliesData]);

  const displayData = useMemo(() => formatSuppliesData(), [formatSuppliesData]);

  // Export functionality
  const prepareExportData = () => {
    return displayData.map((supply: any) => ({
      "Supply Name": supply.supplyName
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `immunization_supplies_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `immunization_supplies_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `immunization_supplies_${new Date().toISOString().slice(0, 10)}`, "Immunization Supplies List");
  };

  // Get pagination info
  const paginationInfo = useMemo(() => {
    if (suppliesData?.pagination) {
      return {
        totalCount: suppliesData.pagination.total_count,
        totalPages: suppliesData.pagination.total_pages,
        currentPage: suppliesData.pagination.current_page
      };
    }
    return {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    };
  }, [suppliesData]);

  const handleDelete = () => {
    if (supplyToDelete === null) return;
    const recordToDelete = displayData.find((record: any) => record.id === supplyToDelete);
    if (recordToDelete) {
      deleteSupplyMutation.mutate({
        vaccineId: supplyToDelete,
        category: recordToDelete.category
      });
    }
    setIsDeleteConfirmationOpen(false);
    setSupplyToDelete(null);
  };

  const handleAddSupply = () => {
    setModalMode("add");
    setSelectedSupply(null);
    setShowSupplyModal(true);
  };

  // Handle edit supply
  const handleEditSupply = (supply: any) => {
    setModalMode("edit");
    setSelectedSupply(supply);
    setShowSupplyModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (id: number) => {
    setSupplyToDelete(id);
    setIsDeleteConfirmationOpen(true);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get columns
  const columns = SupplyColumns(handleEditSupply, handleDeleteConfirmation);

  return (
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="hidden lg:flex justify-between items-center">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search supplies by name..." className="pl-10 bg-white w-full" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="hover:bg-buttonBlue/90 group" onClick={handleAddSupply}>
            <Plus size={15} /> Add Supply
          </Button>
        </div>
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
          {isLoadingSupplies ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading supplies...</span>
            </div>
          ) : (
            <DataTable columns={columns} data={displayData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            {paginationInfo.totalCount > 0 ? (
              <>
                Showing {(paginationInfo.currentPage - 1) * pageSize + 1}-{Math.min(paginationInfo.currentPage * pageSize, paginationInfo.totalCount)} of {paginationInfo.totalCount} entries
              </>
            ) : (
              "No entries found"
            )}
          </p>
          {paginationInfo.totalPages > 1 && <PaginationLayout currentPage={paginationInfo.currentPage} totalPages={paginationInfo.totalPages} onPageChange={handlePageChange} />}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog isOpen={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={handleDelete} title="Delete Immunization Supply" description="Are you sure you want to delete this immunization supply? This action cannot be undone." />

      {/* Supply Modal */}
      {showSupplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <AddImmunizationSupplies mode={modalMode} initialData={selectedSupply ?? undefined} onClose={() => setShowSupplyModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
