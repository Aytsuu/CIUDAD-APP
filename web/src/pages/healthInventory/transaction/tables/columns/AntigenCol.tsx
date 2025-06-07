// CombinedTransactionColumns.tsx
import { ColumnDef } from "@tanstack/react-table";

export type CombinedTransactionRecords = {
  id: number;
  type: 'Vaccine' | 'Immunization';
  name: string;
  batch_number: string;
  quantity: string;
  action: string;
  staff: number;
  created_at: string;
};

export const CombinedTransactionColumns = (): ColumnDef<CombinedTransactionRecords>[] => {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.id}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.type}
          {row.original.type === 'Vaccine' && ' 💉'}
          {row.original.type === 'Immunization' && ' 🏥'}
        </div>
      ),
    },
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