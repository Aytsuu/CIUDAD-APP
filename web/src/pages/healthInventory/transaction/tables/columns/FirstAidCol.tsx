import { ColumnDef } from "@tanstack/react-table";
import { FirstAidRecords } from "../../tables/type";


  export const FirstAidColumns = (): ColumnDef<FirstAidRecords>[] => [
    // {
    //   accessorKey: "id",
    //   header: "#",
    //   cell: ({ row }) => (
    //     <div className="flex justify-center">
    //       <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
    //         {row.original.fat_id}
    //       </div>
    //     </div>
    //   ),
    // },
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