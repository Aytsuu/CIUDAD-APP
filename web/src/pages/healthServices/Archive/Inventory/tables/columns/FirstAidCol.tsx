import { ColumnDef } from "@tanstack/react-table"



export const getArchiveFirstAidStocks = (): ColumnDef<any>[] => {
  return [
    {
      accessorKey: "item.fa_name",
      header: "First Aid Item Name",
    },
    {
      accessorKey: "qty.finv_qty",
      header: "Quantity",
      cell: ({ row }) => {
        const data = row.original
        return `${data.qty.finv_qty} ${data.finv_qty_unit}`
      }
    },
    {
      accessorKey: "administered",
      header: "Used",
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
        const expiryDate = row.original.expiryDate
        return expiryDate === "N/A" ? "N/A" : new Date(expiryDate).toLocaleDateString()
      }
    },
    {
      accessorKey: "archivedDate",
      header: "Archived Date",
      cell: ({ row }) => {
        const archivedDate = row.original.archivedDate
        return archivedDate ? new Date(archivedDate).toLocaleDateString() : "N/A"
      }
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
  ]
}