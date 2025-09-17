import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChildHealthHistoryRecord } from '../types';
import { format, isValid } from 'date-fns';

interface NutritionStatusTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const NutritionStatusTable: React.FC<NutritionStatusTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  const nutritionData = fullHistoryData
    .filter(record => {
      const recordDate = new Date(record.created_at).getTime();
      const currentRecordDate = new Date(
        fullHistoryData.find(r => String(r.chhist_id) === String(chhistId))?.created_at || 0
      ).getTime();
      return recordDate <= currentRecordDate;
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <View className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-10">
      <View className="p-3 border-b border-gray-100">
        <Text className="font-semibold text-lg text-gray-800">OPT Tracking</Text>
      </View>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View className="min-w-full">
          {/* Table Header */}
          <View className="flex-row bg-gray-50 px-3 py-2 border-b border-gray-200">
            <View className="min-w-[120px] flex-1">
              <Text className="text-xs font-medium text-gray-500">Date</Text>
            </View>
            <View className="min-w-[150px] flex-1">
              <Text className="text-xs font-medium text-gray-500">Age</Text>
            </View>
            <View className="min-w-[100px] flex-1">
              <Text className="text-xs font-medium text-gray-500">Weight (kg)</Text>
            </View>
            <View className="min-w-[100px] flex-1">
              <Text className="text-xs font-medium text-gray-500">Height (cm)</Text>
            </View>
            <View className="min-w-[80px] flex-1">
              <Text className="text-xs font-medium text-gray-500">WFA</Text>
            </View>
            <View className="min-w-[80px] flex-1">
              <Text className="text-xs font-medium text-gray-500">LHFA</Text>
            </View>
            <View className="min-w-[80px] flex-1">
              <Text className="text-xs font-medium text-gray-500">WFL</Text>
            </View>
            <View className="min-w-[80px] flex-1">
              <Text className="text-xs font-medium text-gray-500">MUAC</Text>
            </View>
            <View className="min-w-[120px] flex-1">
              <Text className="text-xs font-medium text-gray-500">MUAC Status</Text>
            </View>
          </View>
          
          {/* Table Body */}
          {nutritionData.length > 0 ? (
            nutritionData.map(record => {
              const isCurrentRecord = String(record.chhist_id) === String(chhistId);
              const vitalSigns = record.child_health_vital_signs?.[0] || {};
              const bmDetails = vitalSigns.bm_details || {};
              const nutritionStatus = record.nutrition_statuses?.[0] || {};
              const dataTextStyle = `text-sm text-gray-800`;

              return (
                <TouchableOpacity
                  key={record.chhist_id}
                  className={`flex-row px-3 py-2 border-b border-gray-100 ${isCurrentRecord ? 'bg-blue-50' : ''}`}
                  onPress={() => console.log('Nutrition Status:', { record })}
                >
                  <View className="min-w-[120px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>
                      {record.created_at && isValid(new Date(record.created_at))
                        ? format(new Date(record.created_at), 'MMM dd, yyyy')
                        : 'N/A'}
                    </Text>
                  </View>
                  <View className="min-w-[150px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{bmDetails.age || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[100px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{bmDetails.weight || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[100px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{bmDetails.height || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[80px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{nutritionStatus.wfa || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[80px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{nutritionStatus.lhfa || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[80px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{nutritionStatus.wfl || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[80px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{nutritionStatus.muac || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[120px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={1}>{nutritionStatus.muac_status || 'N/A'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="p-4 items-center">
              <Text className="text-gray-500">No vital signs records available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};