import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Calendar, User, Heart, Thermometer, Activity, Scale, Stethoscope, ChevronRight, CheckCircle } from "lucide-react-native";
import { Text } from "@/components/ui/text";

// Medical Consultation Card Component - Vertical Card Layout
export const MedicalConsultationCard = ({ record, onPress }: { record: any; onPress: () => void }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Invalid date";
    }
  };

  const bhwName = `${record.staff_details?.rp?.per?.per_fname || "N/A"} ${record.staff_details?.rp?.per?.per_lname || "N/A"}`;

  // Check if consultation is completed (has diagnosis/treatment)
  const isCompleted = record.find_details?.assessment_summary || record.treatment_details?.treatment_plan;

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm" 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      {/* Header with Date and Status */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <Calendar size={18} color="#2563EB" />
          <Text className="text-sm font-semibold text-gray-900 ml-2">{formatDate(record.created_at)}</Text>
        </View>

        {/* Completed Status Badge */}
        {isCompleted && (
          <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full">
            <CheckCircle size={14} color="#10B981" />
            <Text className="text-xs font-medium text-green-700 ml-1">Completed</Text>
          </View>
        )}
      </View>

      {/* Chief Complaint */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <Activity size={16} color="#6366F1" />
          <Text className="text-xs font-semibold text-gray-600 ml-2 uppercase">Chief Complaint</Text>
        </View>
        <Text className="text-sm text-gray-900 leading-5">
          {record.medrec_chief_complaint || "No complaint recorded"}
        </Text>
      </View>

      {/* Vital Signs Grid */}
      <View className="bg-gray-50 rounded-lg p-3 mb-4">
        <Text className="text-sm font-semibold text-gray-800 mb-3">Vital Signs</Text>
        <View className="flex-row flex-wrap">
          <View className="w-1/2 mb-3 pr-2">
            <View className="flex-row items-center mb-1">
              <Activity size={14} color="#EF4444" />
              <Text className="text-xs text-gray-600 ml-1">Blood Pressure</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">
              {record.vital_signs?.vital_bp_systolic || "N/A"}/{record.vital_signs?.vital_bp_diastolic || "N/A"} mmHg
            </Text>
          </View>
          
          <View className="w-1/2 mb-3 pl-2">
            <View className="flex-row items-center mb-1">
              <Thermometer size={14} color="#F59E0B" />
              <Text className="text-xs text-gray-600 ml-1">Temperature</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{record.vital_signs?.vital_temp || "N/A"}°C</Text>
          </View>
          
          <View className="w-1/2 pr-2">
            <View className="flex-row items-center mb-1">
              <Heart size={14} color="#DC2626" />
              <Text className="text-xs text-gray-600 ml-1">Pulse Rate</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{record.vital_signs?.vital_pulse || "N/A"} bpm</Text>
          </View>
          
          <View className="w-1/2 pl-2">
            <View className="flex-row items-center mb-1">
              <Activity size={14} color="#10B981" />
              <Text className="text-xs text-gray-600 ml-1">Respiratory Rate</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{record.vital_signs?.vital_RR || "N/A"} cpm</Text>
          </View>
        </View>
      </View>

      {/* BMI Details */}
      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Scale size={14} color="#8B5CF6" />
            <Text className="text-xs text-gray-600 ml-1">Height</Text>
          </View>
          <Text className="text-sm font-medium text-gray-900">{record.bmi_details?.height || "N/A"} cm</Text>
        </View>
        
        <View className="flex-1 ml-2">
          <View className="flex-row items-center mb-1">
            <Scale size={14} color="#8B5CF6" />
            <Text className="text-xs text-gray-600 ml-1">Weight</Text>
          </View>
          <Text className="text-sm font-medium text-gray-900">{record.bmi_details?.weight || "N/A"} kg</Text>
        </View>
      </View>

      {/* Diagnosis Section */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <Stethoscope size={16} color="#059669" />
          <Text className="text-xs font-semibold text-gray-600 ml-2 uppercase">Diagnosis</Text>
        </View>
        <Text className="text-sm text-gray-900 leading-5">
          {record.find_details?.assessment_summary || "Pending assessment"}
        </Text>
      </View>

      {/* Footer - BHW and Arrow */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <User size={16} color="#6B7280" />
          <View className="ml-2">
            <Text className="text-xs text-gray-500">Attended by</Text>
            <Text className="text-sm font-medium text-gray-900">{bhwName}</Text>
          </View>
        </View>
        
        <View className="bg-gray-100 rounded-full p-2">
          <ChevronRight size={20} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
};