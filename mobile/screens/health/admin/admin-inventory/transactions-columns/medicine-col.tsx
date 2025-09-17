// src/columns/MedicineCol.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { MedicineRecords } from '../types'; // Adjust path

interface ColumnDef<T> {
  accessorKey: keyof T | string;
  header: string;
  cell?: ({ item }: { item: T }) => React.ReactNode;
}

export const Medcolumns = (): ColumnDef<MedicineRecords>[] => [
  {
    accessorKey: "inv_id",
    header: "ID",
    cell: ({ item }) => (
      <View className="text-center bg-gray-100 p-2 rounded-md">
        <Text className="text-red text-xs">
          {item.inv_id}
        </Text>
      </View>
    ),
  },
  {
    accessorKey: "med_detail.med_name", // Accessing nested property
    header: "Medicine Name",
    cell: ({ item }) => {
      const medicineDetail = item.med_detail;
      return (
        <View className="flex-col">
          <Text className="font-semibold text-sm">{medicineDetail.med_name}</Text> {/* Added text-sm */}
          <Text className="text-xs text-gray-600"> {/* Changed to text-xs for smaller detail */}
            <Text>{medicineDetail.minv_dsg}</Text>
            <Text>{medicineDetail.minv_dsg_unit} </Text>
            <Text>({medicineDetail.minv_form})</Text>
          </Text>
        </View>
      );
    },
  },
  {
    accessorKey: "mdt_qty",
    header: "Quantity",
    cell: ({ item }) => <Text className="text-sm">{item.mdt_qty}</Text>, // Added text-sm
  },
  {
    accessorKey: "mdt_action",
    header: "Action",
    cell: ({ item }) => <Text className="text-sm">{item.mdt_action}</Text>, // Added text-sm
  },
  {
    accessorKey: "staff",
    header: "Staff",
    cell: ({ item }) => <Text className="text-sm">{item.staff}</Text>, // Added text-sm
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ item }) => (
      <Text className="text-sm">{new Date(item.created_at).toLocaleDateString()}</Text> // Added text-sm
    ),
  },
];
