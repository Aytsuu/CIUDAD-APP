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
                    const medrecDetails = (supplement as any).medrec_details;
                    const minvDetails = (medrecDetails as any)?.minv_details;
                    const medDetail = (minvDetails as any)?.med_detail;
                    const invDetail = (minvDetails as any)?.inv_detail;

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
                                    <Text className="text-sm text-gray-900">{(medDetail as any)?.med_name || "N/A"}</Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Category:</Text>
                                    <Text className="text-sm text-gray-900">{(medDetail as any)?.catlist || "N/A"}</Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Type:</Text>
                                    <Text className="text-sm text-gray-900">{(medDetail as any)?.med_type || "N/A"}</Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Dosage:</Text>
                                    <Text className="text-sm text-gray-900">
                                        {(minvDetails as any)?.minv_dsg} {(minvDetails as any)?.minv_dsg_unit}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Form:</Text>
                                    <Text className="text-sm text-gray-900 capitalize">{(minvDetails as any)?.minv_form || "N/A"}</Text>
                                </View>

                                <View className="flex-row justify-between">
                                    <Text className="text-sm font-medium text-gray-700">Quantity Given:</Text>
                                    <Text className="text-sm text-gray-900">
                                        {(medrecDetails as any)?.medrec_qty} {(minvDetails as any)?.minv_qty_unit}
                                    </Text>
                                </View>

                                {(invDetail as any)?.expiry_date && (
                                    <View className="flex-row justify-between">
                                        <Text className="text-sm font-medium text-gray-700">Expiry Date:</Text>
                                        <Text className="text-sm text-gray-900">{format(new Date((invDetail as any).expiry_date), "MMM dd, yyyy")}</Text>
                                    </View>
                                )}

                                {(medrecDetails as any)?.reason && (
                                    <View className="mt-2">
                                        <Text className="text-sm font-medium text-gray-700 mb-1">Reason:</Text>
                                        <Text className="text-sm text-gray-600">{(medrecDetails as any).reason}</Text>
                                    </View>
                                )}

                                {/* Fulfillment Info */}
                                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
                                    <Text className="text-xs text-gray-500">Fulfilled: {(medrecDetails as any)?.fulfilled_at && isValid(new Date((medrecDetails as any).fulfilled_at)) ? format(new Date((medrecDetails as any).fulfilled_at), "MMM dd, yyyy") : "N/A"}</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};