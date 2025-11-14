import { ColumnDef } from "@tanstack/react-table";
import { Minus, Archive } from "lucide-react";
import { Button } from "@/components/ui/button/button";

export const getStockColumns = (
  handleArchiveInventory: (antigen: any) => void ,
  onOpenWastedModal?: (record: any) => void 
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
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
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
    accessorKey: "batchNumber",
    header: "Batch Number",
    cell: ({ row }) => <div className="text-center">{row.original.batchNumber || "N/A"}</div>
  },
  {
    accessorKey: "item",
    header: "Item Details",
    cell: ({ row }) => {
      const item = row.original.item;
      const expired = row.original.isExpired;
      return (
        <div className={`flex flex-col ${expired ? "text-red-600" : ""}`}>
          <div className={`font-medium text-center ${expired ? "line-through" : ""}`}>
            {item?.antigen || "Unknown Item"}
            {expired && " (Expired)"}
          </div>
          {row.original.type === "vaccine" && (
            <div className={`text-sm text-center ${expired ? "text-red-500" : "text-gray-600"}`}>
              {item?.dosage || 0} {item?.unit || ""}
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "qty",
    header: "Total Qty",
    cell: ({ row }) => {
      const expired = row.original.isExpired;
      return (
        <div className={`text-center ${expired ? "text-red-600 line-through" : ""}`}>
          {row.original.qty || "0"}
          {expired && " (Expired)"}
        </div>
      );
    }
  },
  {
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: ({ row }) => {
      const record = row.original;
      const expired = record.isExpired;
      const isLow = record.isLowStock;
      const isOutOfStock = record.isOutOfStock;
  
      if (record.type === "vaccine") {
        if (record.solvent?.toLowerCase() === "diluent") {
          return (
            <div className={`text-center ${expired ? "text-red-600 line-through" : isLow ? "text-yellow-600" : "text-black"}`}>
              {record.availableStock} containers
              {expired && " (Expired)"}
              {!isOutOfStock && isLow && record.availableStock > 0 && " (Low Stock)"}
              {isOutOfStock && !expired && " (Out of Stock)"}
            </div>
          );
        }
  
        const dosesPerVial = record.dose_ml || 1;
        const availableDoses = record.availableStock;
        const fullVials = Math.ceil(availableDoses / dosesPerVial);
  
        return (
          <div className={`flex flex-col items-center ${expired ? "text-red-600" : ""}`}>
            <span className={expired ? "line-through" : isLow ? "text-yellow-600" : "text-black"}>
              {fullVials} vial{fullVials !== 1 ? "s" : ""}
              {expired && " (Expired)"}
              {!isOutOfStock && isLow && availableDoses > 0 && " (Low Stock)"}
              {isOutOfStock && !expired && " (Out of Stock)"}
            </span>
            <span className={expired ? "text-red-500" : "text-blue-500"}>
              ({availableDoses} dose{availableDoses !== 1 ? "s" : ""})
            </span>
          </div>
        );
      }
  
      if (record.type === "supply") {
        if (record.imzStck_unit === "boxes") {
          const pcsPerBox = record.imzStck_pcs || 1;
          const availablePcs = record.availableStock;
          const fullBoxes = Math.floor(availablePcs / pcsPerBox);
          const remainingPcs = availablePcs % pcsPerBox;
  
          return (
            <div className={`flex flex-col items-center ${expired ? "text-red-600" : ""}`}>
              <span className={expired ? "line-through" : isOutOfStock ? "text-red-600 font-bold" : isLow ? "text-yellow-600" : "text-black"}>
                {remainingPcs > 0 ? fullBoxes + 1 : fullBoxes} box{fullBoxes !== 1 ? "es" : ""}
                {expired && " (Expired)"}
                {isOutOfStock && !expired && " (Out of Stock)"}
                {isLow && " (Low Stock)"}
              </span>
              <span className={expired ? "text-red-500" : "text-blue-500"}>
                ({availablePcs} total pc{availablePcs !== 1 ? "s" : ""})
              </span>
            </div>
          );
        }
  
        return (
          <div className={`text-center ${expired ? "text-red-600 line-through" : isOutOfStock ? "text-red-600 font-bold" : isLow ? "text-yellow-600" : "text-green-600"}`}>
            {record.availableStock} pc{record.availableStock !== 1 ? "s" : ""}
            {expired && " (Expired)"}
            {isOutOfStock && !expired && " (Out of Stock)"}
            {isLow && " (Low Stock)"}
          </div>
        );
      }
  
      return (
        <div className={`text-center ${expired ? "text-red-600 line-through" : isLow ? "text-yellow-600" : "text-green-600"}`}>
          {record.availableStock}
          {expired && " (Expired)"}
          {isLow && " (Low Stock)"}
          {isOutOfStock && !expired && " (Out of Stock)"}
        </div>
      );
    }
  },
    {
      accessorKey: "administered",
      header: "Qty Used",
      cell: ({ row }) => {
        const expired = row.original.isExpired;
    

        return (
        <div className={`text-center ${expired ? "text-red-600 line-through" : "text-red-600"}`}>
          {row.original.administered || 0}
        </div>
        );
    }
  },
  {
    accessorKey: "wastedDose",
    header: "Wasted Units",
    cell: ({ row }) => {
      const expired = row.original.isExpired;
      return (
        <div className="flex items-center justify-center gap-2">
          <span className={`text-sm ${expired ? "text-red-600 line-through" : "text-gray-600"}`}>{row.original.wastedDose || 0}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate;
      const isNear = row.original.isNearExpiry;
      const expired = row.original.isExpired;

      return (
        <div className={`flex justify-center min-w-[120px] px-2 ${expired ? "text-red-600" : ""}`}>
          <div className={`text-center w-full ${expired ? "font-bold line-through" : isNear ? "text-orange-500 font-medium" : ""}`}>
            {expiryDate}
            {expired ? " (Expired)" : isNear ? " (Near Expiry)" : ""}
          </div>
        </div>
      );
    }
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const vaccine = row.original;
      const expired = vaccine.isExpired;
      const outOfStock = vaccine.isOutOfStock;
      const hasAvailableStock = vaccine.availableStock > 0;

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className={`${expired || outOfStock ? "bg-red-100 border border-red-300 pointer-events-none opacity-50" : "bg-red-100 border border-red-300 hover:bg-red-200"}`}
            onClick={() => onOpenWastedModal?.(row.original)} // Use the modal handler
            disabled={expired || outOfStock}
          >
            <Minus size={15} />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleArchiveInventory(vaccine)} disabled={hasAvailableStock && !expired} title={hasAvailableStock && !expired ? "Cannot archive item with available stock" : "Archive item"}>
            <Archive />
          </Button>
        </div>
      );
    }
  }
];
