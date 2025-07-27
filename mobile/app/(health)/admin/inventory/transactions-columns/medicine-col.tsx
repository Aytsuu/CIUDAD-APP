// src/columns/MedicineCol.tsx
import { MedicineRecords } from '@/screens/health/admin/admin-inventory/types';
import React from 'react';
import { View, Text } from 'react-native';

interface ColumnDef<T> {
  accessorKey: keyof T | string;
  header: string;
  cell?: ({ item }: { item: T }) => React.ReactNode;
}

export const Medcolumns = (): ColumnDef<MedicineRecords>[] => [
  {
    accessorKey: "inv_id", // Added inv_id as per your type.tsx
    header: "ID",
    cell: ({ item }) => (
      <View className="text-center bg-gray-100 p-2 rounded-md">
        <Text className="text-gray-700">
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
          <Text className="font-semibold">{medicineDetail.med_name}</Text>
          <Text className="text-sm text-gray-600">
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
    header: "Qty",
    cell: ({ item }) => <Text>{item.mdt_qty}</Text>,
  },
  {
    accessorKey: "mdt_action",
    header: "Action",
    cell: ({ item }) => <Text>{item.mdt_action}</Text>,
  },
  {
    accessorKey: "staff",
    header: "Staff",
    cell: ({ item }) => <Text>{item.staff}</Text>,
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ item }) => (
      <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
    ),
  },
];
