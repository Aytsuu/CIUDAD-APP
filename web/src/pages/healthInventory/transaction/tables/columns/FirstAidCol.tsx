import { ColumnDef } from "@tanstack/react-table";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const FirstAidColumns = (): ColumnDef<any>[] => [
 {
    accessorKey: "fat_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="text-center bg-snow p-2 rounded-md text-gray-700">
        {row.original.fat_id}
      </div>
    ),
  },
  {
    accessorKey: "fa_name",
    header: "First Aid Name",
  },
  {
    accessorKey: "fat_qty",
    header: "Quantity",
  },
 {
     accessorKey: "staff", 
     header: "Staff",
     cell: ({ row }) => {
       const staffName = row.original.staff;
       return toTitleCase(staffName) || "N/A";
     }
   },

  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      return createdAt ? new Date(createdAt).toLocaleString() : "N/A";
    }
  },
];