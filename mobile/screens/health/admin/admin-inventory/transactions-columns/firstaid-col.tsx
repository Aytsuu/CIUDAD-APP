// // src/columns/FirstAidCol.tsx
// import React from 'react';
// import { View, Text } from 'react-native';
// import { FirstAidRecords } from '../types'; // Adjust path

// interface ColumnDef<T> {
//   accessorKey: keyof T | string;
//   header: string;
//   cell?: ({ item }: { item: T }) => React.ReactNode;
// }

// export const FirstAidColumns = (): ColumnDef<FirstAidRecords>[] => [
//   {
//     accessorKey: "inv_id",
//     header: "ID",
//     cell: ({ item }) => (
//       <View className="text-center bg-gray-100 p-2 rounded-md">
//         <Text className="text-gray-700">
//           {item.inv_id}
//         </Text>
//       </View>
//     ),
//   },
//   {
//     accessorKey: "fa_name",
//     header: "First Aid Name",
//     cell: ({ item }) => <Text>{item.fa_name}</Text>,
//   },
//   {
//     accessorKey: "fat_qty", // Using fat_qty as per your web code
//     header: "Qty",
//     cell: ({ item }) => <Text>{item.fdt_qty}</Text>,
//   },
//   {
//     accessorKey: "fat_action",
//     header: "Action",
//     cell: ({ item }) => <Text>{item.fat_action}</Text>,
//   },
//   {
//     accessorKey: "staff",
//     header: "Staff",
//     cell: ({ item }) => <Text>{item.staff}</Text>,
//   },
//   {
//     accessorKey: "created_at",
//     header: "Created At",
//     cell: ({ item }) => (
//       <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
//     ),
//   },
// ];
