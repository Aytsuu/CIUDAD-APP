// columns/CommodityCol.tsx
import { ColumnDef } from "@tanstack/react-table";

export const getArchiveCommodityStocks = (): ColumnDef<any>[] => [
  {
    accessorKey: "archivedDate",
    header: "Archived Date",
    cell: ({ row }) => {
      const archivedDate = row.original.archivedDate;
      return (
        <div className="text-center">
          {archivedDate ? new Date(archivedDate).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "item",
    header: "Commodity Details",
    cell: ({ row }) => {
      const item = row.original.item;
      return (
        <div className="flex flex-col">
          <div className="font-medium text-center">
            {item.com_name}
          </div>
          <div className="text-sm text-center text-gray-600">
            {row.original.category}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "qty",
    header: "Total Qty",
    cell: ({ row }) => {
      const qtyData = row.original.qty;
      const unit = row.original.cinv_qty_unit;
      
      // Check if qtyData is an object with the expected properties
      if (qtyData && typeof qtyData === 'object') {
        if (unit?.toLowerCase() === "boxes") {
          // For boxes, show boxes count and total pieces
          const boxes = qtyData?.cinv_qty || 0;
          const totalPcs = qtyData?.cinv_pcs || 0;
          
          return (
            <div className="text-center">
              {boxes} box{boxes !== 1 ? "es" : ""}
              <div className="text-sm text-blue-500">
                ({totalPcs} pcs total)
              </div>
            </div>
          );
        } else {
          // For other units, extract the quantity value from the object
          const quantity = qtyData?.cinv_qty || qtyData?.value || 0;
          return (
            <div className="text-center">
              {quantity} {unit}
            </div>
          );
        }
      }
      
      // If qtyData is not an object (shouldn't happen based on error, but safe guard)
      return (
        <div className="text-center">
          {typeof qtyData === 'object' ? JSON.stringify(qtyData) : qtyData} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: ({ row }) => {
      const record = row.original;
      const availableStock = record.availableStock;
      const unit = record.cinv_qty_unit;
      
      if (unit?.toLowerCase() === "boxes") {
        // Calculate boxes and remaining pieces for available stock
        const pcsPerBox = record.qty?.cinv_pcs || 1;
        const availablePcs = availableStock;
        const fullBoxes = Math.floor(availablePcs / pcsPerBox);
        const remainingPcs = availablePcs % pcsPerBox;
        
        if (remainingPcs > 0) {
          return (
            <div className="flex flex-col items-center">
              <span>
                {fullBoxes + 1} box{(fullBoxes + 1) !== 1 ? "es" : ""}
              </span>
              <span className="text-blue-500">
                ({availablePcs} total pc{availablePcs !== 1 ? "s" : ""})
              </span>
            </div>
          );
        } else {
          return (
            <div className="flex flex-col items-center">
              <span>
                {fullBoxes} box{fullBoxes !== 1 ? "es" : ""}
              </span>
              <span className="text-blue-500">
                ({availablePcs} total pc{availablePcs !== 1 ? "s" : ""})
              </span>
            </div>
          );
        }
      }
      
      return (
        <div className="text-center">
          {availableStock} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: "administered",
    header: "Qty Used",
    cell: ({ row }) => {
      const unit = row.original.cinv_qty_unit;
      const isBoxes = unit?.toLowerCase() === "boxes";
      const displayUnit = isBoxes ? "pcs" : unit;

      return (
        <div className="text-center text-red-600">
          {row.original.administered}  {displayUnit}
        </div>
      );
    },
  },

  {
    accessorKey: "waste",
    header: "Qty wasted",
    cell: ({ row }) => {
      const unit = row.original.cinv_qty_unit;
      const isBoxes = unit?.toLowerCase() === "boxes";
      const displayUnit = isBoxes ? "pcs" : unit;

      return (
        <div className="text-center text-red-600">
          {row.original.wasted}  {displayUnit}
        </div>
      );
    },
  },
  {
    accessorKey: "recevFrom",
    header: "Received From",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.recevFrom || "OTHERS"}
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate;
      return (
        <div className="text-center">
          {expiryDate ? new Date(expiryDate).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },

  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;
      return (
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            reason === "Expired" 
              ? "bg-red-100 text-red-800" 
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {reason}
          </span>
        </div>
      );
    },
  },
];