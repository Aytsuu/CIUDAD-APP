import { ColumnDef } from "@tanstack/react-table";
import { CommodityRecords } from "../../tables/type";
export const CommodityColumns = (): ColumnDef<CommodityRecords>[] => [
  {
    accessorKey: "inv_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="text-center bg-snow p-2 rounded-md text-gray-700">
        {row.original.inv_id}{" "}
      </div>
    ),
  },
  {
    accessorKey: "com_name",
    header: "Commodity Name",
  },
  {
    accessorKey: "comt_qty",
    header: "Qty",
  },
  {
    accessorKey: "comt_action",
    header: "Action",
  },
  {
    accessorKey: "staff",
    header: "Staff",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
];
