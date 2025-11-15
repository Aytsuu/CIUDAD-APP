import { ColumnDef } from "@tanstack/react-table"


export const getArchiveMedicineStocks = (): ColumnDef<any>[] => {
  return [
   {
      accessorKey: "archivedDate",
      header: "Archived Date",
      cell: ({ row }) => {
        const archivedDate = row.original.archivedDate;
        return archivedDate ? new Date(archivedDate).toLocaleDateString() : "N/A";
      },
    },
    {
    accessorKey: "inv_id",
    header: "ID",
    cell: ({ row }) => <div className="text-center bg-snow p-2 rounded-md text-gray-700">{row.original.inv_id || "N/A"}</div>
  },
    {
      accessorKey: "item",
      header: "Medicine Details",
      cell: ({ row }) => {
        const item = row.original.item;
        return (
          <div className="flex flex-col">
            <div className="font-medium text-center">
              {item?.med_name || "Unknown Medicine"}
            </div>
            <div className="text-sm text-center text-gray-600">
              {item?.dosage || 0} {item?.dsgUnit || ""}, {item?.form || ""}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "qty",
      header: "Total Qty",
      cell: ({ row }) => {
        const qty = row.original.qty_number;
        const unit = row.original.minv_qty_unit;
        const pcs = row.original.qty?.pcs || 1;

        if (unit.toLowerCase() === "boxes" && pcs > 1) {
          return (
            <div className="text-center">
              {qty} boxes ({qty * pcs} pcs)
            </div>
          );
        }

        return (
          <div className="text-center">
            {qty} {unit}
          </div>
        );
      }
    },
   
     {
      accessorKey: "qty_used",
      header: "Qty Given",
      cell: ({ row }) => {
        const data = row.original;
        return `${data.qty_used} ${data.minv_qty_unit}`;
      },
    },
    {
      accessorKey: "wasted",
      header: "Wasted",
    },
    {
      accessorKey: "availableStock",
      header: "Available Stock",
      cell: ({ row }) => {
        const record = row.original;
        const unit = record.minv_qty_unit;
        const pcs = record.qty?.pcs || 1;

        if (unit.toLowerCase() === "boxes" && pcs > 1) {
          const availablePcs = record.availableStock;
          const fullBoxes = Math.floor(availablePcs / pcs);
          const remainingPcs = availablePcs % pcs;

          return (
            <div className="flex flex-col items-center">
              <span className="text-black">
                {remainingPcs > 0 ? fullBoxes + 1 : fullBoxes} box{fullBoxes !== 1 ? "es" : ""}
              </span>
              <span className="text-blue-500">({availablePcs} total pcs)</span>
            </div>
          );
        }

        return (
          <div className="text-center">
            {record.availableStock} {unit}
          </div>
        );
      }
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => {
        const expiryDate = row.original.expiryDate;
        return expiryDate === "N/A" ? "N/A" : new Date(expiryDate).toLocaleDateString();
      },
    },
 
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => {
        const reason = row.original.reason;
        return (
          <div className="text-center">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {reason}
            </span>
          </div>
        );
      },
    },
  ];
}