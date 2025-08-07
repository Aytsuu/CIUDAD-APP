import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChildHealthHistoryRecord } from '../types';
import { format, isValid } from 'date-fns';

interface SupplementStatusTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const SupplementStatusTable: React.FC<SupplementStatusTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  const hasSupplementRecords = fullHistoryData.some(
    record => record.supplements_statuses && record.supplements_statuses.length > 0
  );

  const supplementData = fullHistoryData
    .flatMap(
      record =>
        record.supplements_statuses?.map(status => ({
          record,
          status,
        })) || []
    )
    .filter(({ record }) => {
      const recordDate = new Date(record.created_at).getTime();
      const currentRecordDate = new Date(
        fullHistoryData.find(r => r.chhist_id === chhistId)?.created_at || 0
      ).getTime();
      return recordDate <= currentRecordDate;
    })
    .sort(
      (a, b) => new Date(a.status.date_seen).getTime() - new Date(b.status.date_seen).getTime()
    );

  return (
    <View className="flex-1 bg-gray-50 mb-6">
      <View className="bg-white shadow-sm p-4 border-b border-gray-100">
        <Text className="text-sm font-semibold text-gray-800">Health Monitoring</Text>
      </View>
      <View className="flex-row bg-white shadow-sm p-4 border-b border-gray-100">
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2">Date Seen</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2">Anemic/BirthWt</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2">Birth Weight</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2">Iron Given</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2">Date Completed</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-2">
        {hasSupplementRecords ? (
          supplementData.map(({ record, status }, index) => {
            const isCurrentRecord = record.chhist_id === chhistId;
            return (
              <TouchableOpacity
                key={`${status.chssupplementstat_id}-${index}`}
                className={`bg-white rounded-xl shadow-sm mb-3 p-4 border border-gray-100 ${
                  isCurrentRecord ? 'border-blue-200 bg-blue-50' : ''
                } active:opacity-80 transition-all duration-200`}
                onPress={() => console.log('Supplement Status:', { record, status })}
              >
                <View className="flex-row flex-wrap">
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">Date Seen:</Text>
                    <Text className="text-sm text-gray-600">
                      {status.date_seen && isValid(new Date(status.date_seen))
                        ? format(new Date(status.date_seen), 'MMM dd, yyyy')
                        : 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pl-2">
                    <Text className="text-xs text-gray-400 font-semibold">Anemic/BirthWt:</Text>
                    <Text
                      className={`text-xs px-2 py-1 rounded ${
                        status.status_type === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : status.status_type === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {status.status_type || 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">Birth Weight:</Text>
                    <Text className="text-sm text-gray-600">
                      {status.birthwt
                        ? status.birthwt.toString().endsWith('.00')
                          ? `${status.birthwt.toString().slice(0, -3)} kg`
                          : `${status.birthwt} kg`
                        : 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pl-2">
                    <Text className="text-xs text-gray-400 font-semibold">Iron Given:</Text>
                    <Text className="text-sm text-gray-600">
                      {status.date_given_iron && isValid(new Date(status.date_given_iron))
                        ? format(new Date(status.date_given_iron), 'MMM dd, yyyy')
                        : 'Not given'}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-[120px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">Date Completed:</Text>
                    <Text className="text-sm text-gray-600">
                      {status.date_completed && isValid(new Date(status.date_completed))
                        ? format(new Date(status.date_completed), 'MMM dd, yyyy')
                        : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500 text-base">No supplement given</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};