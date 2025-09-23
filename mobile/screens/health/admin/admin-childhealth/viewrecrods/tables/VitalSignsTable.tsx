import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChildHealthHistoryRecord } from '../types';
import { format, isValid } from 'date-fns';

interface VitalSignsTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const VitalSignsTable: React.FC<VitalSignsTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  const vitalSignsData = fullHistoryData
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
        <Text className="font-semibold text-lg text-gray-800">Vital Signs</Text>
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
              <Text className="text-xs font-medium text-gray-500">Temp (°C)</Text>
            </View>
            <View className="min-w-[150px] flex-1">
              <Text className="text-xs font-medium text-gray-500">Findings</Text>
            </View>
            <View className="min-w-[250px] flex-1">
              <Text className="text-xs font-medium text-gray-500">Notes</Text>
            </View>
          </View>
          
          {/* Table Body */}
          {vitalSignsData.length > 0 ? (
            vitalSignsData.map(record => {
              const isCurrentRecord = String(record.chhist_id) === String(chhistId);
              const vitalSigns = record.child_health_vital_signs?.[0] || {};
              const bmDetails = vitalSigns.bm_details || {};
              const latestNote = record.child_health_notes && record.child_health_notes.length > 0
                ? [...record.child_health_notes].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  )[0]
                : null;
              
              const latestNoteContent = latestNote?.chn_notes || null;
              const followUpDetails = latestNote?.followv_details || null;
              const dataTextStyle = `text-sm text-gray-800`;
              
              const followUpStatus = followUpDetails?.followv_status || 'pending';
              const statusColors = {
                completed: 'bg-green-100 text-green-800',
                missed: 'bg-red-100 text-red-800',
                pending: 'bg-blue-100 text-blue-800',
              };

              // Safely extract and combine findings data
              const findings = vitalSigns.find_details
                ? [
                    vitalSigns.find_details.subj_summary,
                    vitalSigns.find_details.obj_summary,
                    vitalSigns.find_details.assessment_summary,
                  ].filter(Boolean).join('\n')
                : null;

              return (
                <TouchableOpacity
                  key={record.chhist_id}
                  className={`flex-row px-3 py-2 border-b border-gray-100 ${isCurrentRecord ? 'bg-blue-50' : ''}`}
                  onPress={() => console.log('Vital Signs:', { record })}
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
                    <Text className={dataTextStyle} numberOfLines={1}>{vitalSigns.temp || 'N/A'}</Text>
                  </View>
                  <View className="min-w-[150px] flex-1">
                    <Text className={dataTextStyle} numberOfLines={10}>
                      {findings || 'N/A'}
                    </Text>
                  </View>
                  
                  {/* Notes and Follow-up Section */}
                  <View className="min-w-[250px] flex-1 pr-2">
                    {latestNoteContent ? (
                      <Text className={dataTextStyle} numberOfLines={2}>
                        {latestNoteContent}
                      </Text>
                    ) : (
                      <Text className={dataTextStyle}>No notes</Text>
                    )}
                    {followUpDetails && (
                      <View className="mt-2 pt-2 border-t border-gray-200">
                        <View className="flex-row items-center">
                          <Text className="text-xs font-medium text-gray-500">Follow-up: </Text>
                          <Text className={`text-xs px-2 py-1 rounded ${statusColors[followUpStatus]}`}>
                            {followUpStatus}
                          </Text>
                        </View>
                        {followUpDetails.followv_description && (
                          <Text className="text-xs text-gray-600 mt-1">
                            {followUpDetails.followv_description.split('|').join('\n')}
                          </Text>
                        )}
                        {followUpDetails.followv_date && (
                          <Text className="text-xs text-gray-600 mt-1">
                            <Text className="font-medium">Date:</Text> {followUpDetails.followv_date}
                          </Text>
                        )}
                      </View>
                    )}
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