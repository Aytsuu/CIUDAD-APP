import { ColumnDef } from "@tanstack/react-table";
import { StockRecords } from "../type";
import { Minus, Plus } from "lucide-react";
import WastedDoseForm from "../../addstocksModal/WastedDoseModal";
import { Button } from "@/components/ui/button/button";
import { Trash } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { isNearExpiry, isExpired, isLowStock } from "./Alert"; // Import the alert functions

export const getStockColumns = (
  handleArchiveInventory: (inv_id: number) => void
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
    header: "Stock Quantity",
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
    header: "Units Used",
    cell: ({ row }) => {
      const expired = isExpired(row.original.expiryDate);
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const vaccine = row.original;
      const category = String(vaccine.category).toLowerCase().trim();
      const isVaccine = category === "vaccine";
      const expired = isExpired(vaccine.expiryDate);

      return (
        <div className="flex gap-2">
            <Button
            variant="outline"
            className={`${
              expired || row.original.availableStock <= 0 ? " bg-red-100  border border-red-300 pointer-events-none opacity-50" : "bg-red-100 border border-red-300 hover:bg-red-200"
            }`}
            asChild
            >
            <Link
              to="/wastedAntigen"
              state={{ wasted: row.original.id, record: row.original }}
            >
              <Minus size={15} />
            </Link>
            </Button>

          <Button variant="outline" disabled={expired}   asChild>
            <Link
              to={isVaccine ? "/editVaccineStock" : "/editImzSupplyStock"}
              state={{ initialData: vaccine }}
            >
              <Plus size={16} />
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleArchiveInventory(vaccine.inv_id)}
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];
