// columns/CommodityCol.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Archive } from "lucide-react";
import { Link } from "react-router-dom";

export const CommodityStocksColumns = (
  handleArchiveInventory: (commodity: any) => void  // Changed to accept the entire commodity object
): ColumnDef<any>[] => [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const dateString = row.original.created_at;
      
      if (!dateString) {
        return <div className="text-center text-gray-400">N/A</div>;
      }
  
      try {
        const date = new Date(dateString);
        return (
          <div className="text-center w-[90px]">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      } catch (error) {
        console.error("Invalid date format:", dateString);
        return <div className="text-center text-red-400">Invalid Date</div>;
      }
    }
  },
  {
    accessorKey: "inv_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="text-center bg-snow p-2 rounded-md text-gray-700">
        {row.original.inv_id || "N/A"}
      </div>
    )
  },
  
  {
    accessorKey: "item",
    header: "Commodity Details",
    cell: ({ row }) => {
      const item = row.original.item;
      const expired = row.original.isExpired;
      return (
        <div className={`flex flex-col ${expired ? "text-red-600" : ""}`}>
          <div
            className={`font-medium text-center ${
              expired ? "line-through" : ""
            }`}
          >
            {item?.com_name || "Unknown Commodity"}
            {expired && " (Expired)"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "recevFrom",
    header: "Received From",
    cell: ({ row }) => {
      const expired = row.original.isExpired;
      return (
        <div className={`text-center ${expired ? "text-red-600 line-through" : ""}`}>
          {row.original.recevFrom?.toUpperCase() || "OTHERS"}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const expired = row.original.isExpired;
      return (
        <div
          className={`flex justify-center min-w-[100px] px-2 ${
            expired ? "text-red-600" : ""
          }`}
        >
          <div
            className={`text-center w-full ${expired ? "line-through" : ""}`}
          >
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
      const expired = row.original.isExpired;
      const qty = row.original.qty_number;
      const unit = row.original.cinv_qty_unit;
      const pcs = row.original.qty?.cinv_pcs || 1;

      if (unit.toLowerCase() === "boxes" && pcs > 1) {
        return (
          <div
            className={`text-center ${
              expired ? "text-red-600 line-through" : ""
            }`}
          >
            {qty} boxes ({qty * pcs} pcs)
            {expired && " (Expired)"}
          </div>
        );
      }

      return (
        <div
          className={`text-center ${
            expired ? "text-red-600 line-through" : ""
          }`}
        >
          {qty} {unit}
          {expired && " (Expired)"}
        </div>
      );
    },
  },
  {
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: ({ row }) => {
      const record = row.original;
      const expired = record.isExpired;
      const isLow = record.isLowStock;
      const isOutOfStock = record.isOutOfStock;
      const unit = record.cinv_qty_unit;
      const pcs = record.qty?.cinv_pcs || 1;

      if (unit.toLowerCase() === "boxes" && pcs > 1) {
        const availablePcs = record.availableStock;
        const fullBoxes = Math.floor(availablePcs / pcs);
        const remainingPcs = availablePcs % pcs;

        return (
          <div
            className={`flex flex-col items-center ${
              expired ? "text-red-600" : ""
            }`}
          >
            <span
              className={
                expired
                  ? "line-through"
                  : isOutOfStock
                  ? "text-red-600 font-bold"
                  : isLow
                  ? "text-yellow-600"
                  : "text-black"
              }
            >
              {remainingPcs > 0 ? fullBoxes + 1 : fullBoxes} box{fullBoxes !== 1 ? "es" : ""}
              {expired && " (Expired)"}
              {isOutOfStock && !expired && " (Out of Stock)"}
              {isLow && " (Low Stock)"}
            </span>
            <span className={expired ? "text-red-500" : "text-blue-500"}>
              ({availablePcs} total pcs)
            </span>
          </div>
        );
      }

      return (
        <div
          className={`text-center ${
            expired
              ? "text-red-600 line-through"
              : isOutOfStock
              ? "text-red-600 font-bold"
              : isLow
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {record.availableStock} {unit}
          {expired && " (Expired)"}
          {isOutOfStock && !expired && " (Out of Stock)"}
          {isLow && " (Low Stock)"}
        </div>
      );
    },
  },
  {
    accessorKey: "administered",
    header: "Qty Dispensed",
    cell: ({ row }) => {
      const expired = row.original.isExpired;
      return (
        <div
          className={`text-center ${
            expired ? "text-red-600 line-through" : "text-red-600"
          }`}
        >
          {row.original.administered}
        </div>
      );
    },
  },
  {
    accessorKey: "wastedDose",
    header: "Wasted Units",
    cell: ({ row }) => {
      const expired = row.original.isExpired;
      return (
        <div className="flex items-center justify-center gap-2">
          <span
            className={`text-sm ${
              expired ? "text-red-600 line-through" : "text-gray-600"
            }`}
          >
            {row.original.wastedDose || 0}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate;
      const isNear = row.original.isNearExpiry;
      const expired = row.original.isExpired;

      return (
        <div
          className={`flex justify-center min-w-[120px] px-2 ${
            expired ? "text-red-600" : ""
          }`}
        >
          <div
            className={`text-center w-full ${
              expired
                ? "font-bold line-through"
                : isNear
                ? "text-orange-500 font-medium"
                : ""
            }`}
          >
            {expiryDate ? new Date(expiryDate).toLocaleDateString() : "N/A"}
            {expired ? " (Expired)" : isNear ? " (Near Expiry)" : ""}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const commodity = row.original;
      const expired = commodity.isExpired;
      const outOfStock = commodity.isOutOfStock;
      const hasAvailableStock = commodity.availableStock > 0; // Check if there's available stock

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={`${
              expired || outOfStock
                ? "bg-red-100 border border-red-300 pointer-events-none opacity-50"
                : "bg-red-100 border border-red-300 hover:bg-red-200"
            }`}
            asChild
          >
            <Link
              to="/dispenseCommodity"
              state={{ record: row.original }}
            >
              Dispense
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleArchiveInventory(commodity)} // Pass the entire commodity object
            disabled={hasAvailableStock && !expired} // Disable if has available stock and not expired
            title={
              hasAvailableStock && !expired 
                ? "Cannot archive commodity with available stock" 
                : "Archive commodity"
            }
          >
            <Archive />
          </Button>
        </div>
      );
    },
  },
];