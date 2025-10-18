import React from 'react';
import { View, Text } from 'react-native';
import { ChildHealthHistoryRecord } from '../types';
import { format, isValid, parse, parseISO } from 'date-fns';

interface BFCheckTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const BFCheckTable: React.FC<BFCheckTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  const bfChecks = fullHistoryData
    .flatMap(record => {
      return record.exclusive_bf_checks?.map(bfCheck => {
        // Use parseISO for the ISO 8601 created_at date string for robust parsing
        const createdAtDate = bfCheck.created_at ? parseISO(bfCheck.created_at) : null;
        
        // FIX: The ebf_date is "Month YYYY", so we must use the correct format string 'MMMM yyyy'
        const bfDate = bfCheck.ebf_date
          ? parse(bfCheck.ebf_date, 'MMMM yyyy', new Date())
          : null;

        return {
          id: `${record.chhist_id}-${bfCheck.ebf_id}`,
          isCurrentRecord: String(record.chhist_id) === String(chhistId),
          createdAt: createdAtDate && isValid(createdAtDate)
            ? format(createdAtDate, 'MMM dd, yyyy')
            : 'N/A',
          bfDate: bfDate && isValid(bfDate)
            ? format(bfDate, 'MMM dd, yyyy')
            : (bfCheck.ebf_date ? 'Invalid date' : 'Not recorded')
        };
      }) || [];
    })
    .sort((a, b) => {
      const dateA = a.createdAt === 'N/A' ? 0 : new Date(a.createdAt).getTime();
      const dateB = b.createdAt === 'N/A' ? 0 : new Date(b.createdAt).getTime();
      return dateA - dateB;
    });

  return (
    <View className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <View className="p-3 border-b border-gray-100">
        <Text className="font-semibold text-gray-800">BF Checks</Text>
      </View>
      
      {bfChecks.length > 0 ? (
        <View className="divide-y divide-gray-100">
          <View className="flex-row bg-gray-50 px-3 py-2">
            <Text className="flex-1 text-xs font-medium text-gray-500">Created At</Text>
            <Text className="flex-1 text-xs font-medium text-gray-500">BF Date</Text>
          </View>
          
          {bfChecks.map((check) => (
            <View 
              key={check.id} 
              className={`flex-row px-3 py-2 ${check.isCurrentRecord ? 'bg-blue-50' : ''}`}
            >
              <Text className="flex-1 text-sm text-gray-800">{check.createdAt}</Text>
              <Text className="flex-1 text-sm text-gray-800">{check.bfDate}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="p-4 items-center">
          <Text className="text-gray-500">No BF checks available</Text>
        </View>
      )}
    </View>
  );
};