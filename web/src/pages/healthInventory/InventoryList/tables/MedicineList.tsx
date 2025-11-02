import { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Medcolumns } from "../tables/columns/MedicineCol";
import { useMedicines } from "../queries/medicine/MedicineFetchQueries";
import { useDeleteMedicine } from "../queries/medicine/MedicineDeleteQueries";
import MedicineModal from "../Modal/MedicineModal";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";

export default function MedicineList() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState<string | null>(null);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const columns = Medcolumns(setMedToDelete, setIsDeleteConfirmationOpen, setSelectedMedicine, setModalMode, setShowMedicineModal);

  const { data: medicineData, isLoading: isLoadingMedicines, error } = useMedicines(currentPage, pageSize, searchQuery.trim() ? searchQuery.trim() : undefined);

  // Debug: Log API response
  useEffect(() => {
    console.log("Medicine Data Response:", medicineData);
    console.log("API Error:", error);
  }, [medicineData, error]);

  const deleteMutation = useDeleteMedicine();

  const formatMedicineData = useCallback((): any[] => {
    console.log("Formatting medicine data:", medicineData);

    // Handle different response formats
    let medicineResults = [];

    if (medicineData?.results) {
      // Standard Django REST framework format
      medicineResults = medicineData.results;
    } else if (Array.isArray(medicineData)) {
      // Old array format (fallback)
      medicineResults = medicineData;
    } else if (medicineData?.results?.results) {
      // Handle the nested format you're currently getting
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
      med_type: medicine.med_type || "N/A"
    }));
  }, [medicineData]);

  const displayData = useMemo(() => formatMedicineData(), [formatMedicineData]);

  // Export functionality
  const prepareExportData = () => {
    return displayData.map((medicine) => ({
      "Medicine ID": medicine.id,
      "Medicine Name": medicine.medicineName,
      Category: medicine.cat_name,
      "Medicine Type": medicine.med_type
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

  const handleDelete = () => {
    if (medToDelete === null) return;
    deleteMutation.mutate(medToDelete);
    setIsDeleteConfirmationOpen(false);
    setMedToDelete(null);
  };

  // Get pagination info from API response
  const paginationInfo = useMemo(() => {
    if (medicineData) {
      // Handle the nested format you're currently getting
      if (medicineData.results?.count) {
        return {
          totalCount: medicineData.results.count,
          totalPages: medicineData.results.total_pages || Math.ceil(medicineData.results.count / pageSize),
          currentPage: medicineData.results.current_page || currentPage
        };
      }

      // Standard Django REST framework format
      return {
        totalCount: medicineData.count || 0,
        totalPages: Math.ceil((medicineData.count || 0) / pageSize),
        currentPage: currentPage
      };
    }
    return {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    };
  }, [medicineData, pageSize, currentPage]);

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedMedicine(null);
    setShowMedicineModal(true);
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
            <Input placeholder="Search medicine name..." className="pl-10 bg-white w-full" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <div className="flex justify-center items-center gap-2 px-2">
            <Plus size={15} /> New
          </div>
        </Button>
      </div>

      <div>
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
          {isLoadingMedicines ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading medicines...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading medicines. Please check console.</span>
            </div>
          ) : displayData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No medicines found</span>
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
