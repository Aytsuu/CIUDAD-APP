import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash, ArrowUpDown } from "lucide-react";

export type MedicineRecords = {
  id: string;
  medicineName: string;
  cat_id: string;
  cat_name: string;
  med_type: string;
};

export const Medcolumns = (
  setMedToDelete: (id: string) => void,
  setIsDeleteConfirmationOpen: (isOpen: boolean) => void,
  setSelectedMedicine: (medicine: MedicineRecords) => void,
  setModalMode: (mode: 'add' | 'edit') => void,
  setShowMedicineModal: (show: boolean) => void
): ColumnDef<MedicineRecords>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Medicine ID <ArrowUpDown size={15} />
      </div>
    ),
  },
  {
    accessorKey: "medicineName",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Medicine Name <ArrowUpDown size={15} />
      </div>
    ),
  },
  { accessorKey: "med_type", header: "Medicine type" },
  { accessorKey: "cat_name", header: "Category" },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline"
          onClick={() => {
            setSelectedMedicine(row.original);
            setModalMode('edit');
            setShowMedicineModal(true);
          }}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setMedToDelete(row.original.id);
            setIsDeleteConfirmationOpen(true);
          }}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];