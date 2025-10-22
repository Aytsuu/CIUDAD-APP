import { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useAntigen } from "../queries/Antigen/fetch-queries";
import { useDeleteAntigen } from "../queries/Antigen/delete-queries";
import { VaccineModal } from "../Modal/VaccineModal";
import { VaccineColumns } from "./columns/VaccineCol";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";

export default function VaccineList() {
  // Pagination and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // For controlled input
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal and confirmation state
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<number | null>(null);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedVaccine, setSelectedVaccine] = useState<any | null>(null);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Vaccine query with pagination and search
  const { data: vaccineData, isLoading: isLoadingVaccines } = useAntigen(currentPage, pageSize, searchQuery.trim() ? searchQuery.trim() : undefined);

  const deleteVaccineMutation = useDeleteAntigen();

  // Format vaccine data based on API structure
  const formatVaccineData = useCallback(() => {
    if (!vaccineData?.results?.vaccines || !Array.isArray(vaccineData.results.vaccines)) return [];
    return vaccineData.results.vaccines
      .map((item: any) => {
        const ageGroupDisplay = item.age_group ? `${item.age_group.agegroup_name} (${item.age_group.min_age}-${item.age_group.max_age} ${item.age_group.time_unit})` : "N/A";
        const ageGroupId = item.ageGroup || (item.age_group ? item.age_group.agegrp_id : "N/A");
        const baseData: any = {
          id: item.vac_id,
          vaccineName: item.vac_name,
          vaccineType: item.vac_type_choices === "routine" ? "Routine" : item.vac_type_choices === "primary" ? "Primary Series" : "Conditional",
          ageGroup: ageGroupDisplay,
          agegrp_id: ageGroupId,
          doses: item.no_of_doses || 0,
          category: "vaccine",
          noOfDoses: item.no_of_doses || 0,
          schedule: item.schedule || "N/A",
          doseDetails: []
        };

        // Handle routine frequency
        if (item.vac_type_choices === "routine" && item.routine_frequency) {
          baseData.doseDetails.push({
            doseNumber: 1,
            interval: item.routine_frequency.interval,
            unit: item.routine_frequency.time_unit
          });
        }
        // Handle primary series intervals
        else if (item.vac_type_choices === "primary" && item.intervals?.length) {
          const sortedIntervals = [...item.intervals].sort((a, b) => a.dose_number - b.dose_number);
          sortedIntervals.forEach((interval) => {
            baseData.doseDetails.push({
              doseNumber: interval.dose_number,
              interval: interval.interval,
              unit: interval.time_unit
            });
          });
        }
        return baseData;
      })
      .filter(Boolean);
  }, [vaccineData]);

  const displayData = useMemo(() => formatVaccineData(), [formatVaccineData]);

  // Export functionality
  const prepareExportData = () => {
    return displayData.map((vaccine: any) => ({
      "Vaccine Name": vaccine.vaccineName,
      "Vaccine Type": vaccine.vaccineType,
      "Age Group": vaccine.ageGroup,
      "Number of Doses": vaccine.noOfDoses,
      "Dose Schedule":
      vaccine.doseDetails.length === 0
        ? "N/A"
        : vaccine.vaccineType === "Routine"
        ? `Every ${vaccine.doseDetails[0]?.interval} ${vaccine.doseDetails[0]?.unit}`
        : [
          `Dose 1: Starts at ${vaccine.ageGroup}`,
          ...vaccine.doseDetails
          .filter((dose: any) => dose.doseNumber > 1)
          .map(
            (dose: any) =>
            `Dose ${dose.doseNumber}: After ${dose.interval} ${dose.unit}`
          ),
        ].join("; "),
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `vaccine_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `vaccine_list_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `vaccine_list_${new Date().toISOString().slice(0, 10)}`, "Vaccine List");
  };

  // Get pagination info
  const paginationInfo = useMemo(() => {
    if (vaccineData?.results?.pagination) {
      return {
        totalCount: vaccineData.results.pagination.total_count,
        totalPages: vaccineData.results.pagination.total_pages,
        currentPage: vaccineData.results.pagination.current_page
      };
    }
    return {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    };
  }, [vaccineData]);

  const handleDelete = () => {
    if (vaccineToDelete === null) return;
    const recordToDelete = displayData.find((record: any) => record.id === vaccineToDelete);
    if (recordToDelete) {
      deleteVaccineMutation.mutate({
        vaccineId: vaccineToDelete,
        category: "vaccine"
      });
    }
    setIsDeleteConfirmationOpen(false);
    setVaccineToDelete(null);
  };

  const handleAddVaccine = () => {
    setModalMode("add");
    setSelectedVaccine(null);
    setShowVaccineModal(true);
  };

  // Handle edit vaccine
  const handleEditVaccine = (vaccine: any) => {
    setModalMode("edit");
    setSelectedVaccine(vaccine);
    setShowVaccineModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (id: number) => {
    setVaccineToDelete(id);
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

  // Get columns - fixed to match the new signature
  const columns = VaccineColumns(handleEditVaccine, handleDeleteConfirmation);

  return (
    <div className="space-y-4">
      {/* Search and Add Button */}
      <div className="hidden lg:flex justify-between items-center">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search vaccines by name..." className="pl-10 bg-white w-full" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="hover:bg-buttonBlue/90 group" onClick={handleAddVaccine}>
            <Plus size={15} /> Add Vaccine
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
          {isLoadingVaccines ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading vaccines...</span>
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
      <ConfirmationDialog isOpen={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={handleDelete} title="Delete Vaccine" description="Are you sure you want to delete this vaccine? This action cannot be undone." />

      {/* Vaccine Modal */}
      {showVaccineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-[50%] h-[600px] flex justify-center ">
            <VaccineModal mode={modalMode} initialData={selectedVaccine ?? undefined} onClose={() => setShowVaccineModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
