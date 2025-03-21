import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Edit, Plus } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import MedicineModal from "../addListModal/MedicineModal";
import MedicineListEdit from "../editListModal/EditMedicineModal";
import { usePagination } from "../../../../components/ui/PaginationFunction.tsx/PaginationFunction";
import { getMedicines } from "../requests/GetRequest";
import { handleDeleteMedicineList } from "../requests/DeleteRequest";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";

type MedicineRecords = {
  id: number;
  medicineName: string; 
};

export default function MedicineList() {
  const [data, setData] = useState<MedicineRecords[]>([]);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =useState(false);
  const [medToDelete, setMedToDelete] = useState<number | null>(null);
  const [isDialog, setIsDialog] = useState(false);
  // Use custom pagination hook
  const {searchQuery,pageSize,currentPage, 
    currentData,totalPages,handleSearchChange,handlePageSizeChange,handlePageChange,} = usePagination<MedicineRecords>(data, 10);

  const fetchData = async () => {
    const medicines = await getMedicines();
    if (medicines) {
      const transformedData = medicines.map((medicine: any) => ({
        id: medicine.med_id,
        medicineName: medicine.med_name,
      }));
      setData(transformedData);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open delete confirmation dialog
  const handleDeleteMed = (med_id: number) => {
    setMedToDelete(med_id);
    setIsDeleteConfirmationOpen(true);
  };

  // Confirm deletion
  const confirmDeleteMed = async () => {
    if (medToDelete !== null) {
      await handleDeleteMedicineList(medToDelete, setData);
      setIsDeleteConfirmationOpen(false);
      setMedToDelete(null);
    }
  };

  const columns: ColumnDef<MedicineRecords>[] = [
    {
      accessorKey: "id",
      header: "Medicine ID",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "medicineName",
      header: "Medicine Name",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <DialogLayout
            trigger={
              <div className="border px-3 py-2 rounded cursor-pointer">
                <Edit size={16} />
              </div>
            }
            mainContent={
              <MedicineListEdit
                initialData={row.original}
                fetchData={fetchData}
                setIsDialog={setIsDialog} // Pass setIsDialog to MedicineListEdit
              />
            }
          />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteMed(row.original.id)}
          >
            <Trash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
        {/* Add New Medicine Button */}
        <DialogLayout
          trigger={
            <div className="w-auto flex justify-end items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
              <Plus size={15} /> New
            </div>
          }
          title="Add New Medicine"
          mainContent={
            <MedicineModal fetchData={fetchData} setIsDialog={setIsDialog} />
          }
          isOpen={isDialog}
          onOpenChange={setIsDialog}
        />
      </div>

      {/* Table and Pagination */}
      <div className="h-full w-full rounded-md">
        {/* Entries per Page */}
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={handlePageSizeChange}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white w-full overflow-x-auto">
          <DataTable columns={columns} data={currentData} />
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{" "}
            {Math.min(currentPage * pageSize, data.length)} of {data.length}{" "}
            rows
          </p>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={confirmDeleteMed}
        title="Delete Medicine"
        description="Are you sure you want to delete this medicine? This action cannot be undone."
      />
    </>
  );
}
