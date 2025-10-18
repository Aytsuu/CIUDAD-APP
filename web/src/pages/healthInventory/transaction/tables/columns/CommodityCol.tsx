import { ColumnDef } from "@tanstack/react-table";

export const CommodityTransactionColumns = (): ColumnDef<any>[] => [
  // {
  //   accessorKey: "id",
  //   header: "#",
  //   cell: ({ row }) => (
  //     <div className="flex justify-center">
  //       <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
  //         {row.original.comt_id}
  //       </div>
  //     </div>
  //   ),
  // },
  {
    accessorKey: "com_name",
    header: "Commodity Name",
  },
  {
    accessorKey: "comt_qty",
    header: "Quantity",
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
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      return createdAt ? new Date(createdAt).toLocaleString() : "N/A";
    }
  },
];