import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MobileCardField {
  label: string;
  value: string | React.ReactNode;
  isStatus?: boolean;
}

interface MobileDataCardsProps {
  data: Array<{
    id: string;
    fields: MobileCardField[];
    onPress?: () => void;
  }>;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
}

export function MobileDataCards({
  data,
  loading = false,
  emptyMessage = "No data available",
  emptyIcon = "document-outline"
}: MobileDataCardsProps) {
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
        <Ionicons name={emptyIcon as any} size={48} color="#9CA3AF" />
        <Text className="text-gray-500 mt-2">{emptyMessage}</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className="space-y-3">
      {data.map((item, index) => (
        <TouchableOpacity
          key={item.id || index}
          onPress={item.onPress}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          activeOpacity={0.7}
        >
          <View className="space-y-3">
            {item.fields.map((field, fieldIndex) => (
              <View key={fieldIndex} className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-600 flex-1">
                  {field.label}
                </Text>
                <View className="flex-2 ml-2">
                  {field.isStatus ? (
                    <View className={`px-2 py-1 rounded-full self-end ${getStatusColor(field.value as string)}`}>
                      <Text className="text-xs font-medium">{field.value}</Text>
                    </View>
                  ) : (
                    <Text className="text-sm text-gray-900 text-right">
                      {field.value}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
