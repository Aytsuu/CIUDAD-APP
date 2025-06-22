import { ColumnDef } from "@tanstack/react-table";
import { FirstAidStocksRecord } from "../type";
import { isNearExpiry, isExpired, isLowStock } from "./Alert";

export const getColumns = (
): ColumnDef<FirstAidStocksRecord>[] => [
  {
    accessorKey: "firstAidInfo",
    header: "Item Name",
    cell: ({ row }) => {
      const firstAid = row.original.firstAidInfo;
      const expired = isExpired(row.original.expiryDate);
      return (
        <div className={`flex flex-col ${expired ? "text-red-600" : ""}`}>
          <span className={`font-medium ${expired ? "line-through" : ""}`}>
            {firstAid.fa_name}
            {expired && " (Expired)"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
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
    header: "Stocks",
    cell: ({ row }) => {
      const { finv_qty, finv_pcs } = row.original.qty;
      const unit = row.original.finv_qty_unit;
      const expired = isExpired(row.original.expiryDate);

      return (
        <div className={`text-center ${expired ? "text-red-600" : ""}`}>
          {unit.toLowerCase() === "boxes" && finv_pcs > 0 ? (
            <div className="flex flex-col">
              <span className={`${expired ? "line-through" : ""}`}>
                {finv_qty} box/es
                {expired && " (Expired)"}
              </span>
              <span className={expired ? "text-red-500" : "text-blue-500"}>
                ({finv_qty * finv_pcs} total pc/s)
              </span>
            </div>
          ) : (
            <span className={`${expired ? "line-through" : ""}`}>
              {finv_qty} {unit}
              {expired && " (Expired)"}
            </span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "availQty",
    header: "Available",
    cell: ({ row }) => {
      const { finv_pcs } = row.original.qty;
      const unit = row.original.finv_qty_unit;
      const availQty = parseInt(row.original.availQty);
      const expired = isExpired(row.original.expiryDate);
      const isLow = !expired && isLowStock(availQty, unit, finv_pcs);
      const isOutOfStock = availQty <= 0;

      if (unit.toLowerCase() === "boxes" && finv_pcs > 0) {
        const boxCount = Math.ceil(availQty / finv_pcs);
        const remainingPieces = availQty;

        return (
          <div className={`flex flex-col ${expired ? "text-red-600" : ""}`}>
            <span
              className={`${
                expired
                  ? "line-through"
                  : isOutOfStock
                  ? "text-red-600 font-bold"
                  : isLow
                  ? "text-yellow-600 font-medium"
                  : "text-blue"
              }`}
            >
              {boxCount} box/es
              {expired && " (Expired)"}
              {isOutOfStock && !expired && " (Out of Stock)"}
              {isLow && " (Low Stock)"}
            </span>
            <span className={expired ? "text-red-500" : "text-blue-500"}>
              ({remainingPieces} total pc/s)
            </span>
          </div>
        );
      } else {
        return (
          <div
            className={`text-center ${
              expired
                ? "text-red-600 line-through"
                : isOutOfStock
                ? "text-red-600 font-bold"
                : isLow
                ? "text-yellow-600 font-medium"
                : "text-green-700"
            }`}
          >
            {availQty} {unit}
            {expired && " (Expired)"}
            {isOutOfStock && !expired && " (Out of Stock)"}
            {isLow && " (Low Stock)"}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "used",
    header: "Qty used",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
      return (
        <div
          className={`flex items-center justify-center gap-2 ${
            expired ? "text-red-600 line-through" : "text-red-700"
          }`}
        >
          <span className="text-sm">{row.original.used || 0}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate;
      const isNear = isNearExpiry(expiryDate);
      const expired = isExpired(expiryDate);

      return (
        <div
          className={`flex justify-center min-w-[100px] px-2 ${
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
            {expiryDate}
            {expired ? " (Expired)" : isNear ? " (Near Expiry)" : ""}
          </div>
        </div>
      );
    },
  },

];
