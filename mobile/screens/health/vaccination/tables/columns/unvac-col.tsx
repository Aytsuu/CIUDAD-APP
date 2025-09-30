// // src/components/unvaccinated-residents/columns.ts
// import { ColumnDef } from "@tanstack/react-table";
// import { ArrowUpDown } from "lucide-react";
// import { UnvaccinatedResident } from "./types";

// export const unvaccinatedColumns: ColumnDef<UnvaccinatedResident>[] = [
//   {
//     accessorKey: "vaccine_name",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Vaccine Not Received <ArrowUpDown size={15} />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="flex justify-center min-w-[160px] px-2">
//         <div className="text-center w-full text-red-600 font-medium">
//           {row.original.vaccine_name}
//         </div>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "patient",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Patient <ArrowUpDown size={15} />
//       </div>
//     ),
//     cell: ({ row }) => {
//       const fullName =
//         `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
//       return (
//         <div className="flex justify-start min-w-[200px] px-2">
//           <div className="flex flex-col w-full">
//             <div className="font-medium truncate">{fullName}</div>
//             <div className="text-sm text-darkGray">
//               {row.original.sex}, {row.original.age}
//             </div>
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "address",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Address <ArrowUpDown size={15} />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="flex justify-start min-w-[200px] px-2">
//         <div className="w-full truncate">{row.original.address}</div>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "sitio",
//     header: "Sitio",
//     cell: ({ row }) => (
//       <div className="flex justify-center min-w-[120px] px-2">
//         <div className="text-center w-full">{row.original.sitio}</div>
//       </div>
//     ),
//   },
//   {
//     accessorKey: "pat_type",
//     header: "Type",
//     cell: ({ row }) => (
//       <div className="flex justify-center min-w-[120px] px-2">
//         <div className="text-center w-full">{row.original.pat_type}</div>
//       </div>
//     ),
//   },
// ];