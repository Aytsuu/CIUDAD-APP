import React from "react";
import { TouchableOpacity, View, ScrollView } from "react-native";
import { Calendar, User, Heart, Thermometer, Activity, Scale, Stethoscope, FileText, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";

// Medical Consultation Card Component - Horizontal Scrollable Content
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

  return (
    <TouchableOpacity 
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm w-[350px]" 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      {/* Horizontal Scrollable Content */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-row items-center">
          {/* Date Section */}
          <View className="mr-6 items-center">
            <Calendar size={20} color="#2563EB" />
            <Text className="text-sm font-semibold text-gray-900 mt-1">
              {formatDate(record.created_at)}
            </Text>
          </View>

          {/* Vital Signs Section */}
          <View className="mr-6">
            <View className="flex-row items-center mb-1">
              <Activity size={16} color="#EF4444" />
              <Text className="text-xs text-gray-600 ml-1">BP</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">
              {record.vital_signs?.vital_bp_systolic || "N/A"}/{record.vital_signs?.vital_bp_diastolic || "N/A"}
            </Text>
            
            <View className="flex-row items-center mt-2 mb-1">
              <Thermometer size={16} color="#F59E0B" />
              <Text className="text-xs text-gray-600 ml-1">Temp</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">
              {record.vital_signs?.vital_temp || "N/A"}°C
            </Text>
          </View>

          {/* Height & Weight Section */}
          <View className="mr-6">
            <View className="flex-row items-center mb-1">
              <Scale size={16} color="#8B5CF6" />
              <Text className="text-xs text-gray-600 ml-1">Height</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">
              {record.bmi_details?.height || "N/A"} cm
            </Text>
            
            <View className="flex-row items-center mt-2 mb-1">
              <Scale size={16} color="#8B5CF6" />
              <Text className="text-xs text-gray-600 ml-1">Weight</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">
              {record.bmi_details?.weight || "N/A"} kg
            </Text>
          </View>

          {/* Chief Complaint Section */}
          <View className="mr-6 max-w-[120px]">
            <View className="flex-row items-center mb-1">
              <Activity size={16} color="#6366F1" />
              <Text className="text-xs text-gray-600 ml-1">Complaint</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
              {record.medrec_chief_complaint || "N/A"}
            </Text>
          </View>

          {/* Diagnosis Section */}
          <View className="mr-6 max-w-[120px]">
            <View className="flex-row items-center mb-1">
              <Stethoscope size={16} color="#059669" />
              <Text className="text-xs text-gray-600 ml-1">Diagnosis</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
              {record.find_details?.assessment_summary || "N/A"}
            </Text>
          </View>

          {/* BHW Section */}
          <View className="mr-4">
            <View className="flex-row items-center mb-1">
              <User size={16} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">BHW</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
              {bhwName.split(' ')[0] || "N/A"}
            </Text>
          </View>

          {/* Arrow */}
          <View className="items-center justify-center">
            <ChevronRight size={20} color="#6B7280" />
          </View>
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
};