import React from "react";
import { View, Text } from "react-native";
import { format, isValid } from "date-fns";

export const SupplementStatusCard = ({ processedRecords, currentRecord }:any) => {
const hasSupplementRecords: boolean = processedRecords.some((record: any) => record.rawRecord.supplements_statuses && record.rawRecord.supplements_statuses.length > 0);

  if (!hasSupplementRecords) {
    return (
      <View className="bg-white rounded-lg p-4 py-16 border border-gray-200">
        <Text className="text-gray-600 text-center">No supplement given</Text>
      </View>
    );
  }

  const supplementRecords = processedRecords
    .flatMap(
      (record:any) =>
        record.rawRecord.supplements_statuses?.map((status:any) => ({
          record,
          status
        })) || []
    )
    .filter(({ record }: { record: any }) => {
      const recordDate = new Date(record.rawCreatedAt).getTime();
      const currentRecordDate = new Date(currentRecord?.rawCreatedAt || 0).getTime();
      return recordDate <= currentRecordDate;
    })
    .sort((a:any, b:any) => new Date(a.status.date_seen).getTime() - new Date(b.status.date_seen).getTime());

  return (
    <View className="bg-white rounded-lg border border-gray-200">
      <View className="border-b border-gray-200 p-3">
        <Text className="text-gray-900 font-semibold">Supplement Status</Text>
      </View>
      <View className="p-3">
        <View className="flex-row border-b border-gray-200 pb-2 mb-2">
          <Text className="flex-1 font-medium text-gray-700">Date Seen</Text>
          <Text className="flex-1 font-medium text-gray-700">Status</Text>
          <Text className="flex-1 font-medium text-gray-700">Iron Given</Text>
        </View>
        {supplementRecords.map(({ record, status }: { record: any; status: any }, index: number) => {
          const isCurrentRecord = record.chhist_id === currentRecord?.chhist_id;

          return (
            <View key={index} className={`flex-row py-2 ${index < supplementRecords.length - 1 ? "border-b border-gray-100" : ""}`}>
              <Text className={`flex-1 ${isCurrentRecord ? "font-medium text-blue-600" : "text-gray-600"}`}>{status.date_seen && isValid(new Date(status.date_seen)) ? format(new Date(status.date_seen), "MMM dd, yyyy") : "N/A"}</Text>
              <Text className={`flex-1 ${isCurrentRecord ? "font-medium text-blue-600" : "text-gray-600"}`}>{status.status_type || "N/A"}</Text>
              <Text className={`flex-1 ${isCurrentRecord ? "font-medium text-blue-600" : "text-gray-600"}`}>{status.date_given_iron && isValid(new Date(status.date_given_iron)) ? format(new Date(status.date_given_iron), "MMM dd, yyyy") : "Not given"}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};