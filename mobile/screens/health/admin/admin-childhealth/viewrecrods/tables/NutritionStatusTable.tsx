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
        fullHistoryData.find(r => r.chhist_id === chhistId)?.created_at || 0
      ).getTime();
      return recordDate <= currentRecordDate;
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <View className="flex-1 bg-gray-50 mb-6">
      <View className="bg-white shadow-sm p-4 border-b border-gray-100">
        <Text className="text-sm font-semibold text-gray-800">OPT Tracking</Text>
      </View>
      <View className="flex-row bg-white shadow-sm p-4 border-b border-gray-100 flex-wrap">
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Date</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Age</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Weight (kg)</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Height (cm)</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">WFA</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">LHFA</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">WFL</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">MUAC</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">MUAC Status</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-2">
        {nutritionData.length > 0 ? (
          nutritionData.map(record => {
            const isCurrentRecord = record.chhist_id === chhistId;
            const vitalSigns = record.child_health_vital_signs?.[0] || {};
            const bmDetails = vitalSigns.bm_details || {};
            const nutritionStatus = record.nutrition_statuses?.[0] || {};

            return (
              <TouchableOpacity
                key={record.chhist_id}
                className={`bg-white rounded-xl shadow-sm mb-3 p-4 border border-gray-100 ${
                  isCurrentRecord ? 'border-blue-200 bg-blue-50' : ''
                } active:opacity-80 transition-all duration-200`}
                onPress={() => console.log('Nutrition Status:', { record })}
              >
                <View className="flex-row flex-wrap">
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">Date:</Text>
                    <Text className="text-sm text-gray-600">
                      {record.created_at && isValid(new Date(record.created_at))
                        ? format(new Date(record.created_at), 'MMM dd, yyyy')
                        : 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pl-2">
                    <Text className="text-xs text-gray-400 font-semibold">Age:</Text>
                    <Text className="text-sm text-gray-600">{bmDetails.age || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">Weight (kg):</Text>
                    <Text className="text-sm text-gray-600">{bmDetails.weight || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pl-2">
                    <Text className="text-xs text-gray-400 font-semibold">Height (cm):</Text>
                    <Text className="text-sm text-gray-600">{bmDetails.height || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">WFA:</Text>
                    <Text className="text-sm text-gray-600">{nutritionStatus.wfa || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pl-2">
                    <Text className="text-xs text-gray-400 font-semibold">LHFA:</Text>
                    <Text className="text-sm text-gray-600">{nutritionStatus.lhfa || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">WFL:</Text>
                    <Text className="text-sm text-gray-600">{nutritionStatus.wfl || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pl-2">
                    <Text className="text-xs text-gray-400 font-semibold">MUAC:</Text>
                    <Text className="text-sm text-gray-600">{nutritionStatus.muac || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">MUAC Status:</Text>
                    <Text className="text-sm text-gray-600">{nutritionStatus.muac_status || 'N/A'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500 text-base">No vital signs records available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};