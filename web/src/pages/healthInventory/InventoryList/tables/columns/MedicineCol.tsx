import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash, ArrowUpDown } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import MedicineListEdit from "../../editListModal/EditMedicineModal";
import { Link } from "react-router";
export type MedicineRecords = {
  id: string;
  medicineName: string;
  cat_id: string;
  cat_name: string; // Add this
  med_type: string;
};

export const Medcolumns = (
  // setIsDialog: (isOpen: boolean) => void,
  setMedToDelete: (id: string) => void,
  setIsDeleteConfirmationOpen: (isOpen: boolean) => void
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
       

        <Button variant="outline">
          <Link
            to="/editMedicineList"
            state={{
              params: {
                initialData: row.original, // Pass entire row data
              },
            }}
          >
     
            <Edit size={16} />
          </Link>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setMedToDelete(row.original.id); // Set the medicine ID to delete
            setIsDeleteConfirmationOpen(true); // Open the confirmation dialog
          }}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];
