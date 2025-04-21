import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Trash, Edit } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EditMedicineForm from "../../editModal/EditMedStockModal";

export type MedicineStocksRecord = {
  id: number;
  minv_id: number;
  medicineInfo: {
    medicineName: string;
    dosage: number;
    dsgUnit: string;
    form: string;
  };
  expiryDate: string;
  category: string;
  qty: {
    qty: number;
    pcs: number;
  };
  minv_qty_unit: string;
  availQty: string;
  distributed: string;
  inv_id: number;
};

export const getColumns = (
  handleArchiveInventory: (inv_id: number) => void,
  setIsEditDialogOpen: (id: number | null, isOpen: boolean) => void,
  editDialogState: Record<number, boolean>
): ColumnDef<MedicineStocksRecord>[] => [
  {
    accessorKey: "medicineInfo",
    header: "Medicine",
    cell: ({ row }) => {
      const medicine = row.original.medicineInfo;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{medicine.medicineName}</span>
          <div className="text-sm text-gray-600">
            {medicine.dosage} {medicine.dsgUnit},
            <span className="capitalize italic text-darkGray">
              {" "}
              {medicine.form}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full">{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: "qty",
    header: "Stocks",
    cell: ({ row }) => {
      const { qty, pcs } = row.original.qty;
      const unit = row.original.minv_qty_unit;
      
      return (
        <div className="text-center">
          {unit.toLowerCase() === 'boxes' && pcs > 0 ? (
            <div className="flex flex-col">
              <span className="text-blue">{qty} box/es</span>
              <span className="text-blue-500">({qty * pcs} total pc/s)</span>
            </div>
          ) : (
            <span className="text-blue">
              {qty} {unit}
            </span>
          )}
        </div>
      );
    },
  },


  {
    accessorKey: "distributed",
    header: "Distributed",
    cell: ({ row }) => (
      <div className="text-red-700">{row.original.distributed}</div>
    ),
  },
  {
    accessorKey: "availQty",
    header: "Available",
    cell: ({ row }) => {
      const { pcs } = row.original.qty;
      const unit = row.original.minv_qty_unit;
      const availQty = parseInt(row.original.availQty);
      
      if (unit.toLowerCase() === 'boxes' && pcs > 0) {
        // Always count as at least 1 box if there are any pieces
        const boxCount = Math.ceil(availQty / pcs);
        const remainingPieces = availQty;
        
        return (
          <div className="flex flex-col">
               <span className="text-blue">{boxCount} box/es</span>
               <span className="text-blue-500">({remainingPieces} total pc/s)</span>
          </div>
        );
      } else {
        // For other units, just show the quantity with unit
        return (
          <div className="text-center text-green-700">
            {availQty} {unit}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full">{row.original.expiryDate}</div>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <DialogLayout
            trigger={
              <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                <Edit size={16} />
              </div>
            }
            mainContent={
              <EditMedicineForm
                initialData={row.original}
                setIsDialog={(isOpen) => setIsEditDialogOpen(row.original.id, isOpen)}
              />
            }
            isOpen={editDialogState[row.original.id] || false}
            onOpenChange={(isOpen) => setIsEditDialogOpen(row.original.id, isOpen)}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleArchiveInventory(row.original.inv_id)}
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];