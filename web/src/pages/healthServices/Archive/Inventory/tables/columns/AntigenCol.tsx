import { ColumnDef } from "@tanstack/react-table";
import { StockRecords } from "../type";

import { isNearExpiry, isExpired, isLowStock } from "./Alert"; // Import the alert functions

export const getStockColumns = (
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
      const expired = isExpired(row.original.expiryDate);
      return (
        <div className={`flex flex-col ${expired ? "text-red-600" : ""}`}>
          <div
            className={`font-medium text-center ${
              expired ? "line-through" : ""
            }`}
          >
            {item.antigen}
            {expired && " (Expired)"}
          </div>
          {row.original.type === "vaccine" && (
            <div
              className={`text-sm text-center ${
                expired ? "text-red-500" : "text-gray-600"
              }`}
            >
              {item.dosage} {item.unit}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "qty",
    header: "Total Qty",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
      return (
        <div
          className={`text-center ${
            expired ? "text-red-600 line-through" : ""
          }`}
        >
          {row.original.qty}
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
      const expired = isExpired(record.expiryDate);
      const isLow =
        !expired &&
        isLowStock(
          record.availableStock,
          record.type === "vaccine" ? "vials" : record.imzStck_unit,
          record.dose_ml || record.imzStck_pcs
        );

      if (record.type === "vaccine") {
        if (record.solvent === "diluent") {
          return (
            <div
              className={`text-center ${
                expired
                  ? "text-red-600 line-through"
                  : isLow
                  ? "text-yellow-600"
                  : "text-black"
              }`}
            >
              {record.availableStock} containers
              {expired && " (Expired)"}
              {isLow && " (Low Stock)"}
            </div>
          );
        }

        const dosesPerVial = record.dose_ml;
        const availableDoses = record.availableStock;
        const fullVials = Math.ceil(availableDoses / dosesPerVial);
        const leftoverDoses = availableDoses % dosesPerVial;

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
                  : isLow
                  ? "text-yellow-600"
                  : "text-black"
              }
            >
              {fullVials} vial{fullVials !== 1 ? "s" : ""}
              {expired && " (Expired)"}
              {isLow && " (Low Stock)"}
            </span>
            <span className={expired ? "text-red-500" : "text-blue-500"}>
              ({availableDoses} dose/s)
            </span>
          </div>
        );
      }

      if (record.type === "supply") {
        const availablePcs = record.availableStock;
        const isOutOfStock = availablePcs <= 0;

        if (record.imzStck_unit === "boxes") {
          const pcsPerBox = record.imzStck_pcs;
          const fullBoxes = Math.floor(availablePcs / pcsPerBox);
          const remainingPcs = availablePcs % pcsPerBox;

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
                {remainingPcs > 0 ? fullBoxes + 1 : fullBoxes} box/es
                {expired && " (Expired)"}
                {isOutOfStock && !expired && " (Out of Stock)"}
                {isLow && " (Low Stock)"}
              </span>
              <span className={expired ? "text-red-500" : "text-blue-500"}>
                ({availablePcs} total pc/s)
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
            {availablePcs} pc/s
            {expired && " (Expired)"}
            {isOutOfStock && !expired && " (Out of Stock)"}
            {isLow && " (Low Stock)"}
          </div>
        );
      }

      return (
        <div
          className={`text-center ${
            expired
              ? "text-red-600 line-through"
              : isLow
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {record.availableStock}
          {expired && " (Expired)"}
          {isLow && " (Low Stock)"}
        </div>
      );
    },
  },

  {
    accessorKey: "administered",
    header: "Qty Used",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
      const record = row.original;
      let total_stocks = 0;
      let unit = "";
      let availQty = Number(record.availableStock) || 0;

      if (record.type === "vaccine") {
        if (record.solvent === "diluent") {
          total_stocks = Number(record.qty_number) - availQty;
          unit = "containers";
        } else {
          total_stocks =
            Number(record.qty_number) * Number(record.dose_ml) - availQty;
          unit = "doses";
        }
      } else if (record.type === "supply") {
        if (record.imzStck_unit === "boxes") {
          // Convert boxes to pieces by multiplying with pcs per box
          total_stocks =
            Number(record.qty_number) * Number(record.imzStck_pcs) - availQty;
          unit = "pcs";
        } else {
          total_stocks = Number(record.qty_number) - availQty;
          unit = "pcs";
        }
      }

      return (
        <div
          className={`text-center ${
            expired ? "text-red-600 line-through" : "text-red-600"
          }`}
        >
          {total_stocks} {unit}
        </div>
      );
    },
  },
  {
    accessorKey: "wastedDose",
    header: "Wasted Units",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
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
      const isNear = isNearExpiry(expiryDate);
      const expired = isExpired(expiryDate);

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
            {expiryDate}
            {expired ? " (Expired)" : isNear ? " (Near Expiry)" : ""}
          </div>
        </div>
      );
    },
  },

  
];
