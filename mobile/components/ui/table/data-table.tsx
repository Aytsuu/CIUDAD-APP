import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ColumnDef<T> {
  accessorKey: string;
  header: string;
  cell?: (props: { row: T; value: any }) => React.ReactNode;
  enableSorting?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  header?: boolean;
  loading?: boolean;
  onRowPress?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  header = true,
  loading = false,
  onRowPress
}: DataTableProps<T>) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="document-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 mt-2">No data available</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg border border-gray-200">
      {header && (
        <View className="bg-gray-50 border-b border-gray-200">
          <View className="flex-row px-4 py-3">
            {columns.map((column, index) => (
              <View key={column.accessorKey} className="flex-1">
                <Text className="text-sm font-semibold text-gray-700">
                  {column.header}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="min-w-full">
          {data.map((row, rowIndex) => (
            <TouchableOpacity
              key={rowIndex}
              onPress={() => onRowPress?.(row)}
              className={`border-b border-gray-100 ${
                onRowPress ? 'active:bg-gray-50' : ''
              }`}
            >
              <View className="flex-row px-4 py-3">
                {columns.map((column, colIndex) => (
                  <View key={column.accessorKey} className="flex-1">
                    {column.cell ? (
                      column.cell({ row, value: row[column.accessorKey] })
                    ) : (
                      <Text className="text-sm text-gray-900">
                        {row[column.accessorKey] || '-'}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
