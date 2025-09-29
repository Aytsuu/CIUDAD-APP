// components/healthcomponents/HealthRecordCard.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, Weight, Ruler, Thermometer, Shield, Heart } from "lucide-react-native";

export const HealthRecordCard = ({ 
  record, 
  isExpanded, 
  onToggleExpand,
  getStatusColor 
}) => {
  const {
    chhist_id,
    id,
    status,
    age,
    updatedAt,
    temp,
    wt,
    ht,
    bmi,
    muac,
    edemaSeverity,
    wfa,
    lhfa,
    wfl,
    vaccineStat,
    latestNote,
    followUpDescription,
    followUpDate,
    followUpStatus,
    hasFindings
  } = record;

  return (
    <TouchableOpacity 
      className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm" 
      onPress={() => onToggleExpand(chhist_id)} 
      activeOpacity={0.7}
    >
      {/* Card Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className="text-gray-900 text-lg font-bold mr-3">Record {id}</Text>
            <View className={`${getStatusColor(status)} px-2 py-1 rounded-lg`}>
              <Text className="text-white text-xs font-medium">{status}</Text>
            </View>
          </View>
          <Text className="text-gray-500 text-sm">{updatedAt}</Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-700 text-sm font-medium">Age: {age}</Text>
        </View>
      </View>

      {/* Vital Signs - ALWAYS VISIBLE */}
      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <Text className="text-gray-800 text-sm font-semibold mb-2">Vital Signs & Measurements</Text>

        <View className="space-y-2">
          {/* Temperature */}
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center">
              <Thermometer size={16} color="#ef4444" />
              <Text className="text-gray-600 text-xs ml-2">Temperature:</Text>
            </View>
            <Text className="text-gray-900 text-sm font-medium">
              {temp ? `${temp}°C` : "Not recorded"}
            </Text>
          </View>

          {/* Weight */}
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center">
              <Weight size={16} color="#3b82f6" />
              <Text className="text-gray-600 text-xs ml-2">Weight:</Text>
            </View>
            <Text className="text-gray-900 text-sm font-medium">
              {wt ? `${wt} kg` : "Not recorded"}
            </Text>
          </View>

          {/* Height */}
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center">
              <Ruler size={16} color="#10b981" />
              <Text className="text-gray-600 text-xs ml-2">Height:</Text>
            </View>
            <Text className="text-gray-900 text-sm font-medium">
              {ht ? `${ht} cm` : "Not recorded"}
            </Text>
          </View>

          {/* BMI */}
          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center">
              <Heart size={16} color="#8b5cf6" />
              <Text className="text-gray-600 text-xs ml-2">BMI:</Text>
            </View>
            <Text className="text-gray-900 text-sm font-medium">
              {bmi !== "N/A" ? bmi : "Not calculated"}
            </Text>
          </View>

          {/* MUAC - only show if available */}
          {muac && muac !== "None" && (
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center">
                <Ruler size={16} color="#f59e0b" />
                <Text className="text-gray-600 text-xs ml-2">MUAC:</Text>
              </View>
              <Text className="text-gray-900 text-sm font-medium">{muac}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Vaccine Status */}
      <View className="flex-row items-center mb-3">
        <Shield size={16} color="#6b7280" />
        <Text className="text-gray-700 text-sm font-medium ml-1">
          Vaccine Status: {vaccineStat}
        </Text>
      </View>

      {/* Expandable Content */}
      {isExpanded && (
        <View className="mt-3 pt-3 border-t border-gray-100">
          {/* Detailed Measurements */}
          <View className="mb-4">
            <Text className="text-gray-900 text-base font-semibold mb-2">
              Detailed Measurements
            </Text>

            <View className="bg-blue-50 rounded-lg p-3">
              {/* Nutritional Status */}
              {(muac || edemaSeverity || wfa || lhfa || wfl) && (
                <View className="mb-3">
                  <Text className="text-gray-700 text-sm font-medium mb-2">
                    Nutritional Status
                  </Text>
                  <View className="space-y-1">
                    {muac && muac !== "None" && (
                      <Text className="text-gray-700 text-sm">
                        <Text className="font-medium">MUAC:</Text> {muac}
                      </Text>
                    )}
                    {edemaSeverity && edemaSeverity !== "None" && (
                      <Text className="text-gray-700 text-sm">
                        <Text className="font-medium">Edema:</Text> {edemaSeverity}
                      </Text>
                    )}
                    {wfa && (
                      <Text className="text-gray-700 text-sm">
                        <Text className="font-medium">WFA:</Text> {wfa}
                      </Text>
                    )}
                    {lhfa && (
                      <Text className="text-gray-700 text-sm">
                        <Text className="font-medium">LHFA:</Text> {lhfa}
                      </Text>
                    )}
                    {wfl && (
                      <Text className="text-gray-700 text-sm">
                        <Text className="font-medium">WFL:</Text> {wfl}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Notes */}
          {latestNote && (
            <View className="mb-4">
              <Text className="text-gray-900 text-base font-semibold mb-2">Notes</Text>
              <Text className="text-gray-700 text-sm leading-5">{latestNote}</Text>
            </View>
          )}

          {/* Follow-up Information */}
          {(followUpDescription || followUpDate) && (
            <View className="mb-4">
              <Text className="text-gray-900 text-base font-semibold mb-2">Follow-up</Text>
              {followUpDescription && (
                <Text className="text-gray-700 text-sm leading-5 mb-2">
                  {followUpDescription}
                </Text>
              )}
              {followUpDate && (
                <View className="flex-row items-center">
                  <Calendar size={14} color="#6b7280" />
                  <Text className="text-gray-500 text-sm ml-1 mr-2">{followUpDate}</Text>
                  {followUpStatus && (
                    <View className={`${getStatusColor(followUpStatus)} px-2 py-1 rounded-lg`}>
                      <Text className="text-white text-xs font-medium">{followUpStatus}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Expand/Collapse Indicator */}
      <View className="items-center pt-2 border-t border-gray-100">
        <Text className="text-blue-500 text-sm font-medium">
          {isExpanded ? "Show Less" : "Show More Details"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default HealthRecordCard;