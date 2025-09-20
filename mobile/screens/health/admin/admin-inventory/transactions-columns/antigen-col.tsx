// // src/columns/AntigenCol.tsx
// import React from 'react';
// import { View, Text } from 'react-native';
// import type { AntigenTransaction } from '../types'; // Adjust path

// interface ColumnDef<T> {
//   accessorKey: keyof T | string;
//   header: string;
//   cell?: ({ item }: { item: T }) => React.ReactNode;
// }

// export const columns: ColumnDef<AntigenTransaction>[] = [
//   {
//     accessorKey: "inv_id",
//     header: "ID",
//     cell: ({ item }) => (
//       <View className="text-center bg-gray-100 p-2 rounded-md">
//         <Text className="text-gray-700">
//           {item.vac_stock?.inv_details?.inv_id || item.imz_stock?.inv_detail?.inv_id || "N/A"}
//         </Text>
//       </View>
//     )
//   },
//   {
//     accessorKey: "itemName", // This will be populated in the screen component
//     header: "Item Name",
//     cell: ({ item }) => (
//       <Text className="capitalize">
//         {item.vac_stock?.vaccinelist?.vac_name ||
//          item.imz_stock?.imz_detail?.imz_name || "N/A"}
//       </Text>
//     ),
//   },
//   {
//     accessorKey: "antt_qty",
//     header: "Quantity",
//     cell: ({ item }) => (
//       <Text className="text-center">{item.antt_qty}</Text>
//     ),
//   },
//   {
//     accessorKey: "antt_action",
//     header: "Action",
//     cell: ({ item }) => (
//       <Text className="capitalize">
//         {item.antt_action.toLowerCase()}
//       </Text>
//     ),
//   },
//   {
//     accessorKey: "staff",
//     header: "Staff Name",
//     cell: ({ item }) => (
//       <Text className="text-center">{item.staff}</Text>
//     ),
//   },
//   {
//     accessorKey: "created_at",
//     header: "Date",
//     cell: ({ item }) => (
//       <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
//     ),
//   },
// ];

// export const exportColumns = [
//   { key: "antt_id", header: "ID" },
//   { key: "itemName", header: "Item Name" },
//   {
//     key: "antt_qty",
//     header: "Quantity",
//     format: (value: number) => value || 0,
//   },
//   { key: "antt_action", header: "Action" },
//   { key: "staff", header: "Staff" },
//   { key: "created_at", header: "Date" },
// ];
