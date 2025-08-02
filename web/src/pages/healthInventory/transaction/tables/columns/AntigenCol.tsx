// src/app/antigen-transactions/columns.ts
import { ColumnDef } from "@tanstack/react-table"
import type { AntigenTransaction } from "../type"
import { format } from "path";

export const columns: ColumnDef<AntigenTransaction>[] = [
  {
    accessorKey: "inv_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="text-center bg-snow p-2 rounded-md text-gray-700">
{row.original.vac_stock?.inv_details?.inv_id || row.original.imz_stock?.inv_detail?.inv_id || "N/A"}    </div>
    )
  },
  {
    accessorKey: "item",
    header: "Item Name",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.vac_stock?.vaccinelist?.vac_name || 
         row.original.imz_stock?.imz_detail?.imz_name || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "antt_qty",
    header: "Quantity",
    cell: ({ row }) => (
      <div className="text-center">{row.original.antt_qty}</div>
    ),
  },
  {
    accessorKey: "antt_action",
    header: "Action",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.antt_action.toLowerCase()}
      </div>
    ),
  },
  {
    accessorKey: "staff",
    header: "Staff Name",
    cell: ({ row }) => (
      <div className="text-center">{row.original.staff}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => (
      <div>{new Date(row.original.created_at).toLocaleDateString()}</div>
    ),
  },
]

export const exportColumns = [
  {
    key: "inv_id",
    header: "ID",
    format: (row: any) =>
      row.vac_stock?.inv_details?.inv_id ||
      row.imz_stock?.inv_detail?.inv_id ||
      "N/A",
  },
  {
    key: "item",
    header: "Item Name",
    format: (row: any) =>
      row.vac_stock?.vaccinelist?.vac_name ||
      row.imz_stock?.imz_detail?.imz_name ||
      "N/A",
  },
  {
    key: "antt_qty",
    header: "Quantity",
    format: (row: any) => row.antt_qty || 0,
  },
  {
    key: "antt_action",
    header: "Action",
    format: (row: any) => row.antt_action.toLowerCase(),
  },
  {
    key: "staff",
    header: "Staff Name",
    format: (row: any) => row.staff || "N/A",
  },
  {
    key: "created_at",
    header: "Date",
    format: (row: any) =>
      row.created_at ? new Date(row.created_at).toLocaleDateString() : "N/A",
  },
];