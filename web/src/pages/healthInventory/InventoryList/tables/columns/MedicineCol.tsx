import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import MedicineListEdit from "../../editListModal/EditMedicineModal";



export type MedicineRecords = {
    id: number;
    medicineName: string;
  };
  
  export const Medcolumns = (
    setIsDialog: (isOpen: boolean) => void,
    setMedToDelete: (id: number) => void,
    setIsDeleteConfirmationOpen: (isOpen: boolean) => void
  ): ColumnDef<MedicineRecords>[] => [
    { accessorKey: "id", header: "Medicine ID" },
    { accessorKey: "medicineName", header: "Medicine Name" },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <DialogLayout
            trigger={
              <Button variant="outline">
                <Edit size={16} />
              </Button>
            }
            mainContent={
              <MedicineListEdit
                initialData={row.original}
                setIsDialog={setIsDialog}
              />
            }
          />
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
  
  