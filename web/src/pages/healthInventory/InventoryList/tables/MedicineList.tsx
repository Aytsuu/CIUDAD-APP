import React from "react";
import { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, CircleCheck, CircleX } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import MedicineModal from "../addListModal/MedicineModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { handleDeleteMedicineList } from "../restful-api/medicine/MedicineDeleteAPI";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { MedicineRecords } from "../tables/columns/MedicineCol";
import { Medcolumns } from "../tables/columns/MedicineCol";
import { useMedicines } from "../queries/medicine/MedicineFetchQueries";
import { toast } from "sonner";
import { Link } from "react-router";
import { useDeleteMedicine } from "../queries/medicine/MedicineDeleteQueries";
export default function MedicineList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [medToDelete, setMedToDelete] = useState<string | null>(null);
  const [isDialog, setIsDialog] = useState(false);
  const queryClient = useQueryClient();
  const columns = Medcolumns(
    setMedToDelete,
    setIsDeleteConfirmationOpen
  );
  // 
  const { data: medicines, isLoading: isLoadingMedicines } = useMedicines();

  const formatMedicineData = useCallback((): MedicineRecords[] => {
    if (!medicines) return [];
    return medicines.map((medicine: any) => ({
      id: medicine.med_id,
      medicineName: medicine.med_name,
      cat_id: medicine.cat,
      cat_name: medicine.catlist,
      med_type: medicine.med_type || "N/A",
    }));
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return formatMedicineData().filter((record) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatMedicineData]);

  const deleteMutation = useDeleteMedicine();

  const handleDelete = () => {
    if (medToDelete === null) return;
    
    deleteMutation.mutate(medToDelete);
    setIsDeleteConfirmationOpen(false);
    setMedToDelete(null);
  };

  if (isLoadingMedicines) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredMedicines.length / pageSize);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button>
          <Link
            to="/addMedicineList"
            className="flex justify-center items-center gap-2 px-2"
          >
            <Plus size={15} /> New
          </Link>
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
                if (value >= 1) {
                  setPageSize(value);
                } else {
                  setPageSize(1); // Reset to 1 if invalid
                }
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
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedMedicines} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredMedicines.length)} of{" "}
            {filteredMedicines.length} rows
          </p>
          {paginatedMedicines.length > 0 && (
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
        title="Delete Medicine"
        description="Are you sure you want to delete this medicine? This action cannot be undone."
      />
    </div>
  );
}
