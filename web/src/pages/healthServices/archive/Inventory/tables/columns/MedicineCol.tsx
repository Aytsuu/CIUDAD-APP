import { ColumnDef } from "@tanstack/react-table"


export const getArchiveMedicineStocks = (): ColumnDef<any>[] => {
  return [
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
      accessorKey: "qty.minv_qty",
      header: "Quantity",
      cell: ({ row }) => {
        const data = row.original;
        return `${data.qty.minv_qty} ${data.minv_qty_unit}`;
      },
    },
    {
      accessorKey: "administered",
      header: "Administered",
    },
    {
      accessorKey: "wasted",
      header: "Wasted",
    },
    {
      accessorKey: "availableStock",
      header: "Available Stock",
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
      accessorKey: "archivedDate",
      header: "Archived Date",
      cell: ({ row }) => {
        const archivedDate = row.original.archivedDate;
        return archivedDate ? new Date(archivedDate).toLocaleDateString() : "N/A";
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