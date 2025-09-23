import { ColumnDef } from "@tanstack/react-table";

export const AntigenTransactionColumns = (): ColumnDef<any>[] => [
  // {
  //   accessorKey: "id",
  //   header: "#",
  //   cell: ({ row }) => (
  //     <div className="flex justify-center">
  //       <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md  text-center font-semibold">
  //         {row.original.antt_id}
  //       </div>
  //     </div>
  //   ),
  // },
  {
    accessorKey: "item_name",
    header: "Item Name",
  },
  // {
  //   accessorKey: "item_type",
  //   header: "Item Type",
  //   cell: ({ row }) => {
  //     const itemType = row.original.item_type;
  //     let bgColor = "bg-gray-100";
  //     let textColor = "text-gray-800";
      
  //     if (itemType === "Vaccine") {
  //       bgColor = "bg-blue-100";
  //       textColor = "text-blue-800";
  //     } else if (itemType === "Immunization Supply") {
  //       bgColor = "bg-green-100";
  //       textColor = "text-green-800";
  //     }
      
  //     return (
  //       <div className={`px-2 py-1 rounded-md text-center ${bgColor} ${textColor}`}>
  //         {itemType}
  //       </div>
  //     );
  //   },
  // },
 
  {
    accessorKey: "antt_qty",
    header: "Quantity",
  },
  {
    accessorKey: "antt_action",
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