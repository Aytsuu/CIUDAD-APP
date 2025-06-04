import { ColumnDef } from "@tanstack/react-table";
import { StockRecords } from "../VaccineStocks";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Minus, Edit } from "lucide-react";
import WastedDoseForm from "../../addstocksModal/WastedDoseModal";
import { Button } from "@/components/ui/button/button";
import { Trash } from "lucide-react";
import EditVacStockForm from "../../editModal/EditVacStockModal";
import EditImmunizationForm from "../../editModal/EditImzSupply";
import { isVaccine, isSupply } from "../VaccineStocks";

export const getStockColumns = (
  handleArchiveInventory: (inv_id: number) => void,
  setIsDialog: (isOpen: boolean) => void
): ColumnDef<StockRecords>[] => [
  {
    accessorKey: "batchNumber",
    header: "Batch Number",
  },
  {
    accessorKey: "item",
    header: "Item Details",
    cell: ({ row }) => {
      const item = row.original.item;
      return (
        <div className="flex flex-col">
          <div className="font-medium text-center">{item.antigen}</div>
          {row.original.type === "vaccine" && (
            <div className="text-sm text-gray-600 text-center">
              {item.dosage} {item.unit}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "qty",
    header: "Stock Quantity",
    cell: ({ row }) => <div className="text-center">{row.original.qty}</div>,
  },
  {
    accessorKey: "administered",
    header: "Units Used",
    cell: ({ row }) => (
      <div className="text-center text-red-600">
        {row.original.administered}
      </div>
    ),
  },
  {
    accessorKey: "wastedDose",
    header: "Wasted Units",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-gray-600">
          {row.original.wastedDose || 0}
        </span>
        <TooltipLayout
          trigger={
            <DialogLayout
              trigger={
                <button className="flex items-center justify-center w-7 h-5 text-red-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors">
                  <Minus size={15} />
                </button>
              }
              title={
                row.original.category === "medsupplies"
                  ? "Wasted Items"
                  : "Wasted Dose"
              }
              mainContent={<WastedDoseForm wasted={row.original.id} record={row.original} />}
            />
          }
          content={
            row.original.category === "medsupplies"
              ? "Record Wasted Items"
              : "Record Wasted Dose"
          }
        />
      </div>
    ),
  },
  {
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: ({ row }) => {
      const record = row.original;
      
      if (record.type === "vaccine") {
        if (record.solvent === "diluent") {
          return (
            <div className="text-center text-green-600">
              {record.availableStock} containers
            </div>
          );
        }
        
        const dosesPerVial = record.dose_ml;
        const availableDoses = record.availableStock;
        const fullVials = Math.floor(availableDoses / dosesPerVial);
        const remainingDoses = record.availableStock;

        return (
          <div className="flex flex-col items-center">
            <span className="text-green-600">{fullVials} vial/s</span>
            {remainingDoses > 0 && (
              <span> {remainingDoses} dose/s</span>
            )}
          </div>
        );
      }
      
      if (record.type === "supply") {
        const availablePcs = record.availableStock;
        
        if (record.imzStck_unit === "boxes") {
          const pcsPerBox = record.imzStck_per_pcs || 1;
          const fullBoxes = Math.floor(availablePcs / pcsPerBox);

          return (
            <div className="flex flex-col items-center">
              <span className="text-green-600">{fullBoxes} box/es</span>
              <span className="text-blue-500">({availablePcs} total pc/s)</span>
            </div>
          );
        }
        
        return (
          <div className="text-center text-green-600">
            {availablePcs} pc/s
          </div>
        );
      }

      return (
        <div className="text-center text-green-600">
          {record.availableStock}
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[120px] px-2">
        <div className="text-center w-full">{row.original.expiryDate}</div>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex gap-2">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                    <Edit size={16} />
                  </div>
                }
                title={
                  record.type === "vaccine"
                    ? "Edit Vaccine Stock"
                    : "Edit Supply Stock"
                }
                mainContent={
                  isVaccine(record) ? (
                    <EditVacStockForm vaccine={record} setIsDialog={setIsDialog} />
                  ) : isSupply(record) ? (
                    <EditImmunizationForm supply={record} />
                  ) : null
                }
              />
            }
            content="Edit"
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleArchiveInventory(record.inv_id)}
          >
            <Trash />
          </Button>
        </div>
      );
    },
  }
];