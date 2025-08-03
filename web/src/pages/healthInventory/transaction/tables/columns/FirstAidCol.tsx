import { ColumnDef } from "@tanstack/react-table";
import { FirstAidRecords } from "../../tables/type";


  export const FirstAidColumns = (): ColumnDef<FirstAidRecords>[] => [
    {
      accessorKey: "inv_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="text-center bg-snow p-2 rounded-md text-gray-700">
          {row.original.inv_id}{" "}
        </div>
      ),},
    {
      accessorKey: "fa_name",
      header: "First Aid Name",
    },
    {
      accessorKey: "fat_qty",
      header: "Qty",
    },
    {
      accessorKey: "fat_action",
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