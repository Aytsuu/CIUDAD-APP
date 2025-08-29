import React, { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAntigen } from "../queries/Antigen/VaccineFetchQueries";
import { useDeleteAntigen } from "../queries/Antigen/AntigenDeleteQueries";
import { VaccineModal } from "../Modal/VaccineModal";
import { VaccineColumns } from "./columns/AntigenCol";
import AddImmunizationSupplies from "../Modal/ImmunizationSupplies";
import { VaccineRecords } from "../Modal/types";

export default function AntigenList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState<number | null>(null);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedVaccine, setSelectedVaccine] = useState<VaccineRecords | null>(null);
  const [selectedSupply, setSelectedSupply] = useState<VaccineRecords | null>(null);

  const { data: vaccineData, isLoading: isLoadingVaccines } = useAntigen();
  const deleteVaccineMutation = useDeleteAntigen();

  const formatVaccineData = useCallback(() => {
    if (!Array.isArray(vaccineData)) return [];

    return vaccineData
      .map((item: any) => {
        if (item.vac_name) {
          const ageGroupDisplay = item.age_group
            ? `${item.age_group.agegroup_name} (${item.age_group.min_age}-${item.age_group.max_age} ${item.age_group.time_unit})`
            : "N/A";

          const ageGroupId =
            item.ageGroup ||
            (item.age_group ? item.age_group.agegrp_id : "N/A");

          const baseData: VaccineRecords = {
            id: item.vac_id,
            vaccineName: item.vac_name,
            vaccineType:
              item.vac_type_choices === "routine"
                ? "Routine"
                : item.vac_type_choices === "primary"
                ? "Primary Series"
                : "Conditional",
            ageGroup: ageGroupDisplay || "N/A",
            agegrp_id: ageGroupId || "N/A",
            doses: item.no_of_doses || "N/A",
            category: "vaccine", // Explicitly set to "vaccine"
            noOfDoses: item.no_of_doses || "N/A",
            schedule: item.schedule || "N/A",
            doseDetails: [],
          };

          if (item.vac_type_choices === "routine" && item.routine_frequency) {
            baseData.doseDetails.push({
              doseNumber: 1,
              interval: item.routine_frequency.interval,
              unit: item.routine_frequency.time_unit,
            });
          } else if (
            item.vac_type_choices === "primary" &&
            item.intervals?.length
          ) {
            const sortedIntervals = [...item.intervals].sort(
              (a, b) => a.dose_number - b.dose_number
            );
            sortedIntervals.forEach((interval) => {
              baseData.doseDetails.push({
                doseNumber: interval.dose_number,
                interval: interval.interval,
                unit: interval.time_unit,
              });
            });
          }
          return baseData;
        } else if (item.imz_name) {
          return {
            id: item.imz_id,
            vaccineName: item.imz_name,
            vaccineType: "N/A",
            ageGroup: "N/A",
            doses: "N/A",
            category: "supply", // Explicitly set to "supply"
            noOfDoses: "N/A",
            schedule: "N/A",
            doseDetails: [],
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [vaccineData]);

  const filteredVaccines = useMemo(() => {
    return formatVaccineData()
      .filter((record: any): record is VaccineRecords => record !== null)
      .filter((record: VaccineRecords) =>
        Object.values(record)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
  }, [searchQuery, formatVaccineData]);

  const handleDelete = () => {
    if (vaccineToDelete === null) return;

    const recordToDelete = filteredVaccines.find(
      (record: VaccineRecords) => record.id === vaccineToDelete
    );

    if (recordToDelete) {
      deleteVaccineMutation.mutate({
        vaccineId: vaccineToDelete,
        category: recordToDelete.category,
      });
    }

    setIsDeleteConfirmationOpen(false);
    setVaccineToDelete(null);
  };

  const totalPages = Math.ceil(filteredVaccines.length / pageSize);
  const paginatedVaccines = filteredVaccines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddVaccine = () => {
    setModalMode("add");
    setSelectedVaccine(null);
    setShowVaccineModal(true);
    setShowSupplyModal(false);
  };

  const handleAddSupply = () => {
    setModalMode("add");
    setSelectedSupply(null);
    setShowSupplyModal(true);
    setShowVaccineModal(false);
  };

  const columns = VaccineColumns(
    setVaccineToDelete,
    setIsDeleteConfirmationOpen,
    setSelectedVaccine,
    setModalMode,
    setShowVaccineModal,
    setSelectedSupply,
    setShowSupplyModal
  );

  return (
    <div className="relative">
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search vaccines..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="hover:bg-buttonBlue/90 group">
                <Plus size={15} /> New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[200px]" align="end">
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                onClick={handleAddVaccine}
              >
                Vaccine
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                onClick={handleAddSupply}
              >
                Immunization Supplies
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                setPageSize(value >= 1 ? value : 1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoadingVaccines ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">loading....</span>
            </div>
          ) : (
            <DataTable columns={columns} data={paginatedVaccines} />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredVaccines.length)} of{" "}
            {filteredVaccines.length} entries
          </p>
          {paginatedVaccines.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={handleDelete}
        title={
          vaccineToDelete &&
          filteredVaccines.find((v) => v.id === vaccineToDelete)?.category ===
            "vaccine"
            ? "Delete Vaccine"
            : "Delete Immunization Supply"
        }
        description={
          vaccineToDelete &&
          filteredVaccines.find((v) => v.id === vaccineToDelete)?.category ===
            "vaccine"
            ? "Are you sure you want to delete this vaccine? This action cannot be undone."
            : "Are you sure you want to delete this immunization supply? This action cannot be undone."
        }
      />

      {showVaccineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-[50%] h-[600px] flex justify-center ">
            <VaccineModal
              mode={modalMode}
              initialData={selectedVaccine ?? undefined}
              onClose={() => setShowVaccineModal(false)}
            />
          </div>
        </div>
      )}

      {showSupplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <AddImmunizationSupplies
              mode={modalMode}
              initialData={selectedSupply ?? undefined}
              onClose={() => setShowSupplyModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}