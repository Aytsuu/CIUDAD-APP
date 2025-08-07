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
        fullHistoryData.find(r => r.chhist_id === chhistId)?.created_at || 0
      ).getTime();
      return recordDate <= currentRecordDate;
    })
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row bg-white shadow-sm p-4 border-b border-gray-100 flex-wrap">
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Date</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Age</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Weight (kg)</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Height (cm)</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Temp (°C)</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Findings</Text>
        <Text className="flex-1 text-sm font-semibold text-gray-800 px-2 min-w-[120px]">Notes</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-2">
        {vitalSignsData.length > 0 ? (
          vitalSignsData.map(record => {
            const isCurrentRecord = record.chhist_id === chhistId;
            const vitalSigns = record.child_health_vital_signs?.[0] || {};
            const bmDetails = vitalSigns.bm_details || {};
            let latestNoteContent: string | null = null;
            let followUpDescription = '';
            let followUpDate = '';
            let followUpStatus = '';

            if (record.child_health_notes && record.child_health_notes.length > 0) {
              const sortedNotes = [...record.child_health_notes].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              latestNoteContent = sortedNotes[0].chn_notes || null;
              if (sortedNotes[0].followv_details) {
                followUpDescription = sortedNotes[0].followv_details.followv_description || '';
                followUpDate = sortedNotes[0].followv_details.followv_date || '';
                followUpStatus = sortedNotes[0].followv_details.followv_status || '';
              }
            }

            return (
              <TouchableOpacity
                key={record.chhist_id}
                className={`${'bg-white rounded-xl shadow-sm mb-3 p-4 border border-gray-100'}
                  ${isCurrentRecord ? 'border-blue-200 bg-blue-50' : ''}
                  ${'active:opacity-80 transition-all duration-200'}
                `}
                onPress={() => console.log('Vital Signs:', { record })}
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
                    <Text className="text-xs text-gray-400 font-semibold">Temp (°C):</Text>
                    <Text className="text-sm text-gray-600">{vitalSigns.temp || 'N/A'}</Text>
                  </View>
                  <View className="flex-1 min-w-[160px] py-1 pl-2">
                    <Text className="text-xs text-gray-400 font-semibold">Findings:</Text>
                    {vitalSigns.find_details ? (
                      <View className="flex flex-col gap-1">
                        {vitalSigns.find_details.subj_summary && (
                          <View className="flex-col">
                            <Text className="text-xs text-gray-600">Subjective:</Text>
                            <Text className="text-xs text-gray-600 pl-4">• {vitalSigns.find_details.subj_summary}</Text>
                          </View>
                        )}
                        {vitalSigns.find_details.assessment_summary && (
                          <View className="flex-col pt-2">
                            <Text className="text-xs text-gray-600">Assessment/Diagnoses:</Text>
                            {vitalSigns.find_details.assessment_summary.split(',').map((item: string, index: number) => (
                              <Text key={index} className="text-xs text-gray-600 pl-4">
                                • {item.trim()}
                              </Text>
                            ))}
                          </View>
                        )}
                        {vitalSigns.find_details.obj_summary && (
                          <View className="pt-3">
                            <Text className="text-xs text-gray-600 font-medium">Objective</Text>
                            {vitalSigns.find_details.obj_summary
                              .split('-')
                              .filter((item: string) => item.trim())
                              .map((item: string, index: number) => (
                                <Text key={index} className="text-xs text-gray-600 pl-4">
                                  • {item.trim()}
                                </Text>
                              ))}
                          </View>
                        )}
                        {vitalSigns.find_details.plantreatment_summary && (
                          <View className="pt-3">
                            <Text className="text-xs text-gray-600 font-medium">Plan Treatment</Text>
                            {vitalSigns.find_details.plantreatment_summary
                              .split(/[-,]/)
                              .filter((item: string) => item.trim())
                              .map((item: string, index: number) => (
                                <Text key={index} className="text-xs text-gray-600 pl-4">
                                  • {item.trim()}
                                </Text>
                              ))}
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text className="text-xs text-gray-600">N/A</Text>
                    )}
                  </View>
                  <View className="flex-1 min-w-[160px] py-1 pr-2">
                    <Text className="text-xs text-gray-400 font-semibold">Notes:</Text>
                    {latestNoteContent ? (
                      <Text className="text-sm text-gray-600 mb-2">{latestNoteContent}</Text>
                    ) : (
                      <Text className="text-sm text-gray-400 mb-2">No notes</Text>
                    )}
                    {(followUpDescription || followUpDate) && (
                      <View className="border-t border-gray-100 pt-2 mt-2">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-xs font-medium text-gray-600">Follow-up:</Text>
                          <Text
                            className={
                              `text-xs px-2 py-1 rounded ${
                                followUpStatus === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : followUpStatus === 'missed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`
                            }
                          >
                            {followUpStatus || 'pending'}
                          </Text>
                        </View>
                        {followUpDescription && (
                          <Text className="text-xs text-gray-600">
                            {followUpDescription.split('|').map((part: string, i: number) => (
                              <Text key={i}>
                                {part.trim()}
                                {i < followUpDescription.split('|').length - 1 && '\n'}
                              </Text>
                            ))}
                          </Text>
                        )}
                        {followUpDate && (
                          <Text className="text-xs text-gray-600 mt-1">
                            <Text className="font-medium">Date:</Text> {followUpDate}
                          </Text>
                        )}
                      </View>
                    )}
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