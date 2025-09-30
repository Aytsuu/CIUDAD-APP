// import type { ColumnDef } from "@tanstack/react-table";
// import { Text, View } from "react-native";
// import { ArrowUpDown } from "lucide-react-native";
// import { ChildHealthRecord } from "../../forms/muti-step-form/types";

// export const childColumns: ColumnDef<ChildHealthRecord>[] = [
//   {
//     accessorKey: "child",
//     header: ({ column }) => (
//       <View
//         className="flex-row w-full justify-center items-center gap-2"
//         onTouchEnd={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         <Text>Child</Text>
//         <ArrowUpDown size={15} />
//       </View>
//     ),
//     cell: ({ row }) => {
//       const fullName = `${row.original.lname}, ${row.original.fname} ${row.original.mname}`.trim();
//       return (
//         <View className="flex justify-start min-w-[200px] px-2">
//           <View className="flex-col w-full">
//             <Text className="font-medium truncate">{fullName}</Text>
//             <Text className="text-sm text-gray-600">
//               {row.original.sex}, {row.original.age} old
//             </Text>
//           </View>
//         </View>
//       );
//     },
//   },
//   {
//     accessorKey: "mother",
//     header: ({ column }) => (
//       <View
//         className="flex-row w-full justify-center items-center gap-2"
//         onTouchEnd={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         <Text>Mother</Text>
//         <ArrowUpDown size={15} />
//       </View>
//     ),
//     cell: ({ row }) => {
//       const fullName = `${row.original.mother_lname}, ${row.original.mother_fname} ${row.original.mother_mname}`.trim();
//       return (
//         <View className="flex justify-start min-w-[200px] px-2">
//           <View className="flex-col w-full">
//             <Text className="font-medium truncate">{fullName}</Text>
//           </View>
//         </View>
//       );
//     },
//   },
//   {
//     accessorKey: "address",
//     header: ({ column }) => (
//       <View
//         className="flex-row w-full justify-center items-center gap-2"
//         onTouchEnd={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         <Text>Address</Text>
//         <ArrowUpDown size={15} />
//       </View>
//     ),
//     cell: ({ row }) => (
//       <View className="flex justify-start px-2">
//         <Text className="w-[250px] break-words">{row.original.address}</Text>
//       </View>
//     ),
//   },
//   {
//     accessorKey: "family_no",
//     header: "Family No.",
//     cell: ({ row }) => (
//       <View className="flex justify-center min-w-[100px] px-2">
//         <Text className="text-center w-full">{row.original.family_no}</Text>
//       </View>
//     ),
//   },
//   {
//     accessorKey: "sitio",
//     header: ({ column }) => (
//       <View
//         className="flex-row w-full justify-center items-center gap-2"
//         onTouchEnd={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         <Text>Sitio</Text>
//         <ArrowUpDown size={15} />
//       </View>
//     ),
//     cell: ({ row }) => (
//       <View className="flex justify-center min-w-[100px] px-2">
//         <Text className="text-center w-full">{row.original.sitio}</Text>
//       </View>
//     ),
//   },
//   {
//     accessorKey: "pat_type",
//     header: "Patient Type",
//     cell: ({ row }) => (
//       <View className="flex justify-center min-w-[100px] px-2">
//         <Text className="text-center w-full capitalize">{row.original.pat_type.toLowerCase()}</Text>
//       </View>
//     ),
//   },
//   {
//     accessorKey: "action",
//     header: "Action",
//     cell: () => (
//       <View className="flex-row justify-center gap-2">
//         <View className="bg-white border text-black px-3 py-1.5 rounded">
//           <Text>View</Text>
//         </View>
//       </View>
//     ),
//   },
// ];