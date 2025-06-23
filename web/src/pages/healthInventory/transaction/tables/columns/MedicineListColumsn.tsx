import { ColumnDef } from "@tanstack/react-table";
import { MedicineRecords } from "../type";



export const Medcolumns = (): ColumnDef<MedicineRecords>[] => [
  { accessorKey: "mdt_id", header: "Medicine ID" },
  {
    accessorKey: "med_name",
    header: "Medicine Name",
    cell: ({ row }) => {
      const medicineDetail = row.original.med_detail;
      return (
        <div className="flex flex-col space-y-1">
          <div className="font-semibold">{medicineDetail.med_name}</div>
          <div className="text-sm text-gray-600">
            <span>{medicineDetail.minv_dsg}</span>
            <span>{medicineDetail.minv_dsg_unit} </span>
            <span>({medicineDetail.minv_form})</span>
          </div>
        </div>
      );
    },
  },

  { accessorKey: "mdt_qty", header: "qty" },
  { accessorKey: "mdt_action", header: "Action" },
  { accessorKey: "staff", header: "Staff" },
  { accessorKey: "created_at", header: "Created At" },
];

// // -------------------FIRSTAID

// export type FirstAidRecords = {
//   fat_id: number;
//   fa_name: string;
//   fdt_qty: string;
//   fat_action: string;
//   staff: string;
//   created_at: string;
// };

// export const FirstAidColumns = (): ColumnDef<FirstAidRecords>[] => [
//   {
//     accessorKey: "id",
//     header: "#",
//     cell: ({ row }) => (
//       <div className="flex justify-center">
//         <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
//           {row.original.fat_id}
//         </div>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "fa_name",
//     header: "First Aid Name",
//   },
//   {
//     accessorKey: "fat_qty",
//     header: "Qty",
//   },
//   {
//     accessorKey: "fat_action",
//     header: "Action",
//   },
//   {
//     accessorKey: "staff",
//     header: "Staff",
//   },
//   {
//     accessorKey: "created_at",
//     header: "Created At", 
//   },
// ];

// export type CommodityRecords = {
//   comt_id: number;
//   com_name: string;
//   comt_qty: string;
//   comt_action: string;
//   staff: string;
//   created_at: string;
// };

// export const CommodityColumns = (): ColumnDef<CommodityRecords>[] => [
//   {
//     accessorKey: "id",
//     header: "#",
//     cell: ({ row }) => (
//       <div className="flex justify-center">
//         <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
//           {row.original.comt_id}
//         </div>
//       </div>
//     ),
//   },
//    {
//     accessorKey: "com_name",
//     header: "Commodity Name",
//   },
//   {
//     accessorKey: "comt_qty",
//     header: "Qty",
//   },
//   {
//     accessorKey: "comt_action",
//     header: "Action",
//   },
//   {
//     accessorKey: "staff",
//     header: "Staff",
//   },
//   {
//     accessorKey: "created_at",
//     header: "Created At", 
//   },
// ];
