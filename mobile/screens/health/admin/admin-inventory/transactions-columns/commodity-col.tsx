// // src/columns/CommodityCol.tsx
// import React from 'react';
// import { View, Text } from 'react-native';
// import { CommodityRecords } from '../types'; // Adjust path

// interface ColumnDef<T> {
//   accessorKey: keyof T | string;
//   header: string;
//   cell?: ({ item }: { item: T }) => React.ReactNode;
// }

// export const CommodityColumns = (): ColumnDef<CommodityRecords>[] => [
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
//     accessorKey: "com_name",
//     header: "Commodity Name",
//     cell: ({ item }) => <Text>{item.com_name}</Text>,
//   },
//   {
//     accessorKey: "comt_qty",
//     header: "Qty",
//     cell: ({ item }) => <Text>{item.comt_qty}</Text>,
//   },
//   {
//     accessorKey: "comt_action",
//     header: "Action",
//     cell: ({ item }) => <Text>{item.comt_action}</Text>,
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
