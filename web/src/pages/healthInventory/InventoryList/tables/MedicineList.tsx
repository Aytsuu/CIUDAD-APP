import React, { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useSearchParams } from "react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Medcolumns } from "../tables/columns/MedicineCol";
import { useMedicines } from "../queries/medicine/MedicineFetchQueries";
import { useDeleteMedicine } from "../queries/medicine/MedicineDeleteQueries";
import MedicineModal from "../Modal/MedicineModal";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";
import { useDebounce } from "@/hooks/use-debounce";
import { Spinner } from "@/components/ui/spinner";

export default function MedicineList() {
  // ------------- STATE INITIALIZATION ----------------
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState<string | null>(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const columns = Medcolumns(setMedToDelete, setIsDeleteConfirmationOpen, setSelectedMedicine, setModalMode, setShowMedicineModal);

  const { data: medicineData, isLoading: isLoadingMedicines } = useMedicines(
    currentPage,
    debouncedPageSize,
    debouncedSearchQuery.trim() ? debouncedSearchQuery.trim() : undefined
  );

  const deleteMutation = useDeleteMedicine();

  // ------------- SIDE EFFECTS ----------------
  // Track if this is the initial mount
  const isInitialMount = React.useRef(true);

  // Save page state to sessionStorage for this tab
  React.useEffect(() => {
    sessionStorage.setItem("page_medicine", String(currentPage));
  }, [currentPage]);

  // Reset to page 1 when search changes (but not on initial mount)
  React.useEffect(() => {
    if(isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debouncedSearchQuery === "") return;
    handlePageChange(1);
  }, [debouncedSearchQuery]);

  const formatMedicineData = useCallback((): any[] => {
    // Handle different response formats
    let medicineResults = [];

    if (medicineData?.results) {
      // Standard Django REST framework format
      medicineResults = medicineData.results;
    } else if (Array.isArray(medicineData)) {
      // Old array format (fallback)
      medicineResults = medicineData;
    } else if (medicineData?.results?.results) {
      // Handle the nested format
      medicineResults = medicineData.results.results;
    }

    return medicineResults.map((medicine: any) => ({
      id: medicine.med_id,
      med_name: medicine.med_name,
      cat_id: medicine.cat,
      med_dsg: medicine.med_dsg,
      med_dsg_unit: medicine.med_dsg_unit,
      med_form: medicine.med_form,
      cat_name: medicine.catlist || "N/A",
      med_type: medicine.med_type || "N/A",
    }));
  }, [medicineData]);

  const displayData = useMemo(() => formatMedicineData(), [formatMedicineData]);

  // Get pagination info from API response
  const paginationInfo = useMemo(() => {
    if (medicineData) {
      // Handle the nested format
      if (medicineData.results?.count) {
        return {
          totalCount: medicineData.results.count,
          totalPages: medicineData.results.total_pages || Math.ceil(medicineData.results.count / pageSize),
          currentPage: currentPage,
        };
      }

      // Standard Django REST framework format
      return {
        totalCount: medicineData.count || 0,
        totalPages: Math.ceil((medicineData.count || 0) / pageSize),
        currentPage: currentPage,
      };
    }
    return {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }, [medicineData, pageSize, currentPage]);

  // ------------- HANDLERS ----------------
  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    handlePageChange(1);
  };

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedMedicine(null);
    setShowMedicineModal(true);
  };

  const handleDelete = () => {
    if (medToDelete === null) return;
    deleteMutation.mutate(medToDelete);
    setIsDeleteConfirmationOpen(false);
    setMedToDelete(null);
  };

  // Export functionality
  const prepareExportData = () => {
    return displayData.map((medicine) => ({
      "Medicine ID": medicine.id,
      "Medicine Name": medicine.med_name,
      Category: medicine.cat_name,
      "Medicine Type": medicine.med_type,
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `medicine_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `medicine_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `medicine_list_${new Date().toISOString().slice(0, 10)}`, "Medicine List");
  };

  // ------------- RENDER ----------------
  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search medicine name..."
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
            New Medicine
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
        {isLoadingMedicines && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-2 text-gray-600">Loading medicines...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingMedicines && displayData.length === 0 && (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchInput ? "No medicines found" : "No medicines yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchInput ? `No medicines match "${searchInput}". Try adjusting your search.` : "Get started by adding a new medicine."}
            </p>
            {!searchInput && (
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Medicine
              </Button>
            )}
          </div>
        )}

        {/* Data Table */}
        {!isLoadingMedicines && displayData.length > 0 && <DataTable columns={columns} data={displayData} />}

        {/* Pagination */}
        {!isLoadingMedicines && displayData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t rounded-b-lg bg-gray-50">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -{" "}
              <span className="font-medium">{Math.min(currentPage * pageSize, paginationInfo.totalCount)}</span> of{" "}
              <span className="font-medium">{paginationInfo.totalCount}</span> medicines
            </p>

            {paginationInfo.totalPages > 1 && (
              <PaginationLayout currentPage={currentPage} totalPages={paginationInfo.totalPages} onPageChange={handlePageChange} />
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog isOpen={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={handleDelete} title="Delete Medicine" description="Are you sure you want to delete this medicine? This action cannot be undone." />

      {showMedicineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <MedicineModal mode={modalMode} initialData={selectedMedicine ?? undefined} onClose={() => setShowMedicineModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}