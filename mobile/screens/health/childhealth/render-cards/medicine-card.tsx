import React from "react";
import { View, Text } from "react-native";
import { format, isValid } from "date-fns";
import { Pill } from "lucide-react-native";

export const MedicinesCard = ({ medicinesInfo, currentRecord }: any) => {
    if ((medicinesInfo as any).length === 0) {
        return (
            <View className="bg-white rounded-lg p-4 py-16 border border-gray-200">
                <Text className="text-gray-600 text-center">No medicines given yet</Text>
            </View>
        );
    }

    return (
        <View className="bg-white rounded-lg border border-gray-200">
            <View className="border-b border-gray-200 p-3">
                <View className="flex-row items-center justify-between">
                    <Text className="text-gray-900 font-semibold">Medicines Given</Text>
                    <View className="flex-row items-center space-x-2">
                        <Pill size={16} color="#6b7280" />
                        <Text className="text-gray-600 text-sm">{(medicinesInfo as any).length} records</Text>
                    </View>
                </View>
            </View>
            <View className="p-3">
                {(medicinesInfo as any).map(({ record, supplement }: any, index: any) => {
                    const isCurrentRecord = (record as any).chhist_id === (currentRecord as any)?.chhist_id;
                    
                    // New API structure: medreqitem_details is an array
                    const medreqItemDetails = (supplement as any).medreqitem_details?.[0];
                    const medicine = medreqItemDetails?.medicine;
                    const allocations = medreqItemDetails?.allocations || [];
                    const actionBy = medreqItemDetails?.action_by;

                    return (
                        <View key={(supplement as any).chsupplement_id} className={`p-4 rounded-lg border mb-3 ${isCurrentRecord ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                            {/* Header with Date and Status */}
                            <View className="flex-row justify-between items-start mb-3">
                                <Text className={`font-medium ${isCurrentRecord ? "text-blue-700" : "text-gray-700"}`}>{format(new Date((record as any).rawCreatedAt), "MMM dd, yyyy")}</Text>
                                {isCurrentRecord && (
                                    <View className="bg-blue-100 px-2 py-1 rounded-full">
                                        <Text className="text-blue-700 text-xs font-medium">Current Visit</Text>
                                    </View>
                                )}
                            </View>

                            {/* Medicine Details */}
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Medicine Name:</Text>
                                    <Text className="text-sm text-gray-900">{medicine?.med_name || "N/A"}</Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Dosage:</Text>
                                    <Text className="text-sm text-gray-900">
                                        {medicine?.med_dsg} {medicine?.med_dsg_unit}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Form:</Text>
                                    <Text className="text-sm text-gray-900 capitalize">{medicine?.med_form || "N/A"}</Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Quantity Given:</Text>
                                    <Text className="text-sm text-gray-900">
                                        {medreqItemDetails?.total_quantity} {medreqItemDetails?.unit}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Status:</Text>
                                    <Text className="text-sm text-gray-900 capitalize">{medreqItemDetails?.status || "N/A"}</Text>
                                </View>

                                {medreqItemDetails?.reason && (
                                    <View className="mt-2">
                                        <Text className="text-sm font-medium text-gray-700 mb-1">Reason:</Text>
                                        <Text className="text-sm text-gray-600">{medreqItemDetails.reason}</Text>
                                    </View>
                                )}

                                {/* Action By Info */}
                                {actionBy && (
                                    <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
                                        <Text className="text-xs text-gray-500">
                                            Given by: {actionBy.fname} {actionBy.lname}
                                        </Text>
                                    </View>
                                )}

                                {/* Created At Info */}
                                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
                                    <Text className="text-xs text-gray-500">
                                        Created: {medreqItemDetails?.created_at && isValid(new Date(medreqItemDetails.created_at)) ? format(new Date(medreqItemDetails.created_at), "MMM dd, yyyy") : "N/A"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};