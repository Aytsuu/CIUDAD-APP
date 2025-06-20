import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Trash, Plus } from "lucide-react";
import { Link } from "react-router";
import { MedicineStocksRecord } from "../type";
import { isNearExpiry, isExpired, isLowStock } from "./Alert";

export const getColumns = (
  handleArchiveInventory: (inv_id: string) => void
): ColumnDef<MedicineStocksRecord>[] => [
  {
    accessorKey: "medicineInfo",
    header: "Medicine",
    cell: ({ row }) => {
      const medicine = row.original.medicineInfo;
      const expired = isExpired(row.original.expiryDate);
      return (
        <div className={`flex flex-col ${expired ? "text-red-600" : ""}`}>
          <span className={`font-medium ${expired ? "line-through" : ""}`}>
            {medicine.medicineName}
            {expired && " (Expired)"}
          </span>
          <div
            className={`text-sm ${expired ? "text-red-500" : "text-gray-600"}`}
          >
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
      const { qty, pcs } = row.original.qty;
      const unit = row.original.minv_qty_unit;
      const expired = isExpired(row.original.expiryDate);

      return (
        <div className={`text-center ${expired ? "text-red-600" : ""}`}>
          {unit.toLowerCase() === "boxes" && pcs > 0 ? (
            <div className="flex flex-col">
              <span className={`${expired ? "line-through" : ""}`}>
                {qty} box/es
                {expired && " (Expired)"}
              </span>
              <span className={expired ? "text-red-500" : "text-blue-500"}>
                ({qty * pcs} total pc/s)
              </span>
            </div>
          ) : (
            <span className={`${expired ? "line-through" : ""}`}>
              {qty} {unit}
              {expired && " (Expired)"}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "distributed",
    header: "Distributed",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
      return (
        <div
          className={`${
            expired ? "text-red-600 line-through" : "text-red-700"
          }`}
        >
          {row.original.distributed}
        </div>
      );
    },
  },
  {
    accessorKey: "availQty",
    header: "Available",
    cell: ({ row }) => {
      const { pcs } = row.original.qty;
      const unit = row.original.minv_qty_unit;
      const availQty = parseInt(row.original.availQty);
      const expired = isExpired(row.original.expiryDate);
      const isLow = !expired && isLowStock(availQty, unit, pcs);
      const isOutOfStock = availQty <= 0;

      if (unit.toLowerCase() === "boxes" && pcs > 0) {
        const boxCount = Math.ceil(availQty / pcs);
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
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
      return (
        <div className="flex gap-2">
          <Button variant="outline" disabled={expired}>
            <Link
              to="/editMedicineStock"
              state={{
                params: {
                  initialData: row.original,
                },
              }}
            >
              <Plus size={16} />
            </Link>
          </Button>
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
