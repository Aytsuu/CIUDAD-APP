import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput, Minus, Edit } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import UsedFAModal from "../../addstocksModal/UsedFAModal";
import EditFirstAidStockForm from "../../editModal/EditFirstAidStockModal";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";

export type FirstAidStocksRecord = {
    finv_id: number;
    firstAidInfo: {
      fa_name: string;
    };
    expiryDate: string;
    category: string;
    qty: {
      finv_qty: number;
      finv_pcs: number;
    };
    finv_qty_unit: string;
    availQty: string;
    used: string;
    inv_id: number;
  };
  
export const getColumns = (
  handleArchiveInventory: (inv_id: number) => void,
  setIsDialog: (value: boolean) => void
): ColumnDef<FirstAidStocksRecord>[] => [
  // {
  //   accessorKey: "finv_id",
  //   header: "#.",
  //   cell: ({ row }) => <div className="text-center">{row.original.finv_id}</div>,
  // },
  {
    accessorKey: "firstAidInfo",
    header: "Item Name",
    cell: ({ row }) => {
      const firstAid = row.original.firstAidInfo;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{firstAid.fa_name}</span>
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
      const { finv_qty, finv_pcs } = row.original.qty;
      const unit = row.original.finv_qty_unit;
      return (
        <div className="text-center">
          {finv_pcs > 0 ? (
            <div className="flex flex-col">
              <span className="text-blue">{finv_qty} box/es</span>
              <span className="text-red-500"> ({finv_pcs} pcs per box)</span>
            </div>
          ) : (
            <span className="text-blue">
              {finv_qty} {unit}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "used",
    header: "Used",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-red-700">
          {row.original.used || 0}
        </span>
        <TooltipLayout
          trigger={
            <DialogLayout
              trigger={
                <button className="flex items-center justify-center w-7 h-5 text-red-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors">
                  <Minus size={15} />
                </button>
              }
              mainContent={<UsedFAModal 
                data={row.original}
                setIsDialog={setIsDialog}
                />}
            />
          }
          content="Used Items"
        />
      </div>
    ),
  },
  {
    accessorKey: "availQty",
    header: "Available",
    cell: ({ row }) => {
      const { finv_pcs } = row.original.qty;
      const unit = row.original.finv_qty_unit;
      const availQty = parseInt(row.original.availQty);
      
      if (unit.toLowerCase() === 'boxes' && finv_pcs > 0) {
        // Always count as at least 1 box if there are any pieces
        const boxCount = Math.ceil(availQty / finv_pcs);
        const remainingPieces = availQty;
        
        return (
          <div className="text-center text-green-700">
            {boxCount} box/es ({remainingPieces} pc/s)
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
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                    <Edit size={16} />
                  </div>
                }
                mainContent={
                  <EditFirstAidStockForm
                    initialData={row.original}
                    setIsDialog={setIsDialog}
                  />
                }
              />
            }
            content="Edit"
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