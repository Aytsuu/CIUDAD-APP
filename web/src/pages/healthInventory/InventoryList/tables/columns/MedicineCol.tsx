import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";



export const Medcolumns = (
  setMedToDelete: (id: string) => void,
  setIsDeleteConfirmationOpen: (isOpen: boolean) => void,
  setSelectedMedicine: (medicine: any) => void,
  setModalMode: (mode: 'add' | 'edit') => void,
  setShowMedicineModal: (show: boolean) => void
): ColumnDef<any>[] => [

  {
    accessorKey: "med_name",
    header:"medicine",
    cell: ({ row }) => (
      <div className="flex flex-col justify-center px-2">
        <div className="font-medium">
            {row.original.med_name?.toUpperCase()}
        </div>
        <div className="text-sm text-gray-500 flex justify-center items-center gap-1">
          <span>{row.original.med_dsg || ""}</span>
          <span>{(row.original.med_dsg_unit || "").toLowerCase()}</span>
          {row.original.med_form && (
            <>
              <span className="mx-1">·</span>
              <span>{row.original.med_form}</span>
            </>
          )}
        </div>
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