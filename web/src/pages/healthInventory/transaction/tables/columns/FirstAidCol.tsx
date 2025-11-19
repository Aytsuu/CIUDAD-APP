import { ColumnDef } from "@tanstack/react-table";
import { toTitleCase } from "@/helpers/ToTitleCase";

export const FirstAidColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
          {row.original.fat_id}
        </div>
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