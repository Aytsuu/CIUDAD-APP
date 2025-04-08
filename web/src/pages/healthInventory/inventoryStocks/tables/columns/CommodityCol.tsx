// columns/commodityStocksCol.ts
import { ColumnDef } from "@tanstack/react-table";
import { CommodityStocksRecord } from "../CommodityStocks";
import { Trash, Edit } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import EditCommodityStockForm from "../../editModal/EditComStockModal";

export const CommodityStocksColumns = (
  setIsDialog: (value: boolean) => void,
  setCommodityToArchive: (id: number | null) => void,
  setIsArchiveConfirmationOpen: (value: boolean) => void
): ColumnDef<CommodityStocksRecord>[] => [
  {
    accessorKey: "commodityInfo",
    header: "Commodity",
    cell: ({ row }) => {
      const commodity = row.original.commodityInfo;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{commodity.com_name}</span>
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
    accessorKey: "recevFrom",
    header: "Received From",
    cell: ({ row }) => (
      <div className="text-center">{row.original.recevFrom}</div>
    ),
  },
  {
    accessorKey: "qty",
    header: "Stocks",
    cell: ({ row }) => {
      const { cinv_qty, cinv_pcs } = row.original.qty;
      const unit = row.original.cinv_qty_unit;
      return (
        <div className="text-center">
          {cinv_pcs > 0 ? (
            <span className="text-blue">
             {cinv_qty} box/es - {cinv_qty * cinv_pcs} pcs 
            </span>
          ) : (
            <span className="text-blue">
              {cinv_qty} {unit}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dispensed",
    header: "Dispensed",
    cell: ({ row }) => (
      <div className="text-red-700">{row.original.dispensed}</div>
    ),
  },{
    accessorKey: "availQty",
    header: "Available",
    cell: ({ row }) => {
      const { cinv_pcs } = row.original.qty;
      const availQty = Number(row.original.availQty);
      
      if (cinv_pcs > 0) {
        // Calculate full boxes and remaining pieces
        const fullBoxes = Math.floor(availQty / cinv_pcs);
        const remainingPieces = availQty % cinv_pcs;
        
        return (
          <div className="text-green-700 flex flex-row justify-center">
            {/* First line: Total pieces */}
            
            {/* Second line: Box breakdown (only show if there are boxes or pieces) */}
            {(fullBoxes > 0 || remainingPieces > 0) && (
              <span>
                {fullBoxes > 0 && `${fullBoxes} box/es`}
                {fullBoxes > 0 && remainingPieces > 0 && ' + '}
                {remainingPieces > 0 && `${remainingPieces} pcs`}
              </span>
            )}
                        <span> - {availQty} pcs</span>

          </div>
        );
      } else {
        return (
          <div className="text-green-700">
            {`${row.original.availQty} ${row.original.cinv_qty_unit}`}
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
                  <EditCommodityStockForm
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
            onClick={() => {
              setCommodityToArchive(row.original.inv_id);
              setIsArchiveConfirmationOpen(true);
            }}
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];