import React from "react";
import { View, Text } from "react-native";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";

export const VitalSignsCard= ({ processedRecords, currentRecord, extractDOBFromRecord }:any) => {
  const vitalRecords = processedRecords
    .filter((record:any) => {
      const recordDate = new Date(record.rawCreatedAt).getTime();
      const currentRecordDate = new Date(currentRecord?.rawCreatedAt || 0).getTime();
      return recordDate <= currentRecordDate;
    })
    .sort((a:any, b:any) => new Date(a.rawCreatedAt).getTime() - new Date(b.rawCreatedAt).getTime());

  return (
    <View className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <View className="border-b border-gray-200 p-4">
        <Text className="text-gray-900 font-semibold text-lg">Vital Signs History</Text>
      </View>
      <View className="p-4">
        {vitalRecords.map((record:any) => {
          const isCurrentRecord = record.chhist_id === currentRecord?.chhist_id;
          const vitalSigns = record.rawRecord.child_health_vital_signs?.[0] || {};
          const bmDetails = vitalSigns.bm_details || {};
          const childDOB = extractDOBFromRecord(record.rawRecord);

          return (
            <View key={record.chhist_id} className={`p-4 rounded-lg ${isCurrentRecord ? "bg-blue-50 border border-blue-200 mb-2" : "bg-gray-50 mb-2 border border-gray-200"}`}>
              <View className="flex flex-col mb-4">
                <Text className={`font-medium text-base ${isCurrentRecord ? "text-blue-700" : "text-gray-700"}`}>{record.updatedAt}</Text>
                <Text className={`text-sm ${isCurrentRecord ? "text-blue-600" : "text-gray-500"}`}>Age: {childDOB && record.rawCreatedAt ? calculateAgeFromDOB(childDOB, record.rawCreatedAt).ageString : "N/A"}</Text>
              </View>

              <View className="flex-row justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Weight</Text>
                  <Text className="text-sm font-medium text-gray-800">{bmDetails.weight || "N/A"} kg</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Height</Text>
                  <Text className="text-sm font-medium text-gray-800">{bmDetails.height || "N/A"} cm</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500">Temp</Text>
                  <Text className="text-sm font-medium text-gray-800">{vitalSigns.temp || "N/A"}°C</Text>
                </View>
              </View>

              {/* Findings Summary */}
              {vitalSigns.find_details && (
                <View className="mt-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Findings</Text>
                  {vitalSigns.find_details.subj_summary && <Text className="text-sm text-gray-600 mb-1">• Subjective: {vitalSigns.find_details.subj_summary}</Text>}
                  {vitalSigns.find_details.assessment_summary && <Text className="text-sm text-gray-600">• Assessment: {vitalSigns.find_details.assessment_summary}</Text>}
                </View>
              )}

              {/* Notes */}
              {record.latestNote && (
                <View className="mt-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Notes</Text>
                  <Text className="text-sm text-gray-600">{record.latestNote}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};