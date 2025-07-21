// CombinedTransactionColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { CombinedTransactionRecords } from "../../tables/type";

export const CombinedTransactionColumns = (): ColumnDef<CombinedTransactionRecords>[] => {
  return [
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   cell: ({ row }) => (
    //     <div className="text-center">
    //       {row.original.id}
    //     </div>
    //   ),
    // },
  
    {
      accessorKey: "name",
      header: "Item Name",
    },
    {
      accessorKey: "batch_number",
      header: "Batch Number",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.action}</div>
      ),
    },
    {
      accessorKey: "staff",
      header: "Staff ID",
    },
    {
      accessorKey: "created_at",
      header: "Date",
    },
  ];
};