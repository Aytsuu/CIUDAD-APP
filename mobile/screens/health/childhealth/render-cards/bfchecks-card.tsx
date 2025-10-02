import React from "react";
import { View, Text } from "react-native";
import { format, isValid, isBefore, isSameDay } from "date-fns";

export const BFCheckCard = ({ processedRecords, currentRecord }: any) => {
    if (!currentRecord) return null;

    const currentRecordDate: any = new Date(currentRecord.rawCreatedAt);

    // Extract and filter BF checks - only from current and previous records
    const filteredBfChecks: any = processedRecords
        .filter((record: any) => {
            const recordDate: any = new Date(record.rawCreatedAt);
            return isBefore(recordDate, currentRecordDate) || isSameDay(recordDate, currentRecordDate);
        })
        .flatMap(
            (record: any) =>
                record.rawRecord.exclusive_bf_checks?.map((bfCheck: any) => ({
                    recordDate: new Date(record.rawCreatedAt),
                    bfCheck,
                    bfDate: bfCheck.ebf_date && isValid(new Date(bfCheck.ebf_date)) ? format(new Date(bfCheck.ebf_date), "MMM dd, yyyy") : "Not recorded",
                    createdAt: isValid(new Date(bfCheck.created_at)) ? format(new Date(bfCheck.created_at), "MMM dd, yyyy") : "N/A",
                    isCurrentRecord: record.chhist_id === currentRecord?.chhist_id
                })) || []
        )
        .sort((a: any, b: any) => a.recordDate.getTime() - b.recordDate.getTime());

    if (filteredBfChecks.length === 0) {
        return (
            <View className="bg-white rounded-lg p-4 py-16 border border-gray-200">
                <Text className="text-gray-600 text-center">No BF checks available</Text>
            </View>
        );
    }

    return (
        <View className="bg-white rounded-lg border border-gray-200">
            <View className="border-b border-gray-200 p-3">
                <Text className="text-gray-900 font-semibold">Exclusive BF Check</Text>
            </View>
            <View className="p-3">
                <View className="flex-row border-b border-gray-200 pb-2 mb-2">
                    <Text className="flex-1 font-medium text-gray-700">Created At</Text>
                    <Text className="flex-1 font-medium text-gray-700">BF Dates</Text>
                </View>
                {filteredBfChecks.map((check: any, index: any) => (
                    <View key={index} className={`flex-row py-2 ${index < filteredBfChecks.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <Text className={`flex-1 ${check.isCurrentRecord ? "font-medium text-blue-600" : "text-gray-600"}`}>{check.createdAt}</Text>
                        <Text className={`flex-1 ${check.isCurrentRecord ? "font-medium text-blue-600" : "text-gray-600"}`}>{check.bfDate}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};