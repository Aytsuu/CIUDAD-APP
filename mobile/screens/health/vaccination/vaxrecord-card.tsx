import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Syringe, Calendar, FileText, CheckCircle, Clock, XCircle } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { format, parseISO, isValid } from "date-fns";

interface VaccinationRecordCardProps {
  record: any;
  onPress?: () => void;
}

export const VaccinationRecordCard: React.FC<VaccinationRecordCardProps> = ({ record, onPress }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "scheduled":
        return {
          icon: Clock,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "cancelled":
        return {
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig(record.vachist_status);
  const StatusIcon = statusConfig.icon;

  const CardContent = () => (
    <View className="mb-4">
    <View className="rounded-xl border bg-white border-gray-200 shadow-sm overflow-hidden mb- mx-4">
      {/* Header with Vaccine Name and Status */}
      <View className="flex-row items-center justify-between p-4 border-b  border-gray-100">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mr-3">
            <Syringe size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-base" numberOfLines={1}>
              {record.vaccine_name || "Unknown Vaccine"}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Dose {record.vachist_doseNo} of {record.vacrec_totaldose}
            </Text>
          </View>
        </View>
        <View className={`${statusConfig.bgColor} rounded-full px-3 py-1 flex-row items-center`}>
          <StatusIcon size={14} color={statusConfig.color.replace("text-", "#").replace("-600", "")} />
          <Text className={`text-xs font-medium ml-1 ${statusConfig.color}`}>
            {record.vachist_status || "Unknown"}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="p-4 ">
        <View className="flex-row justify-between items-start mb-3">

            <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Administered from </Text>
            <Text className="text-sm font-medium text-gray-900">
              {record.vac_id ? "Barangay" : ""}
            </Text>
            </View>
          <View className="flex-1 items-end">
            <Text className="text-xs text-gray-500 mb-1">Date Administered</Text>
            <Text className="text-sm font-medium text-gray-900">
              {formatDate(record.date_administered)}
            </Text>
          </View>
        </View>

        {/* Vital Signs if available */}
        {record.vital_signs && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500 mb-2">Vital Signs</Text>
            <View className="flex-row justify-between">
                {record.vital_signs.vital_bp_systolic && record.vital_signs.vital_bp_diastolic && (
                <View>
                  <Text className="text-xs text-gray-600">BP</Text>
                  <Text className="text-sm font-medium text-gray-900">
                  {record.vital_signs.vital_bp_systolic} / {record.vital_signs.vital_bp_diastolic}
                  </Text>
                </View>
                )}
                {record.vital_signs.vital_temp && (
                <View>
                  <Text className="text-xs text-gray-600">Temp</Text>
                  <Text className="text-sm font-medium text-gray-900">
                  {record.vital_signs.vital_temp}°C
                  </Text>
                </View>
                )}
                {record.vital_signs.vital_o2 && (
                <View>
                  <Text className="text-xs text-gray-600">O2</Text>
                  <Text className="text-sm font-medium text-gray-900">
                  {record.vital_signs.vital_o2}%
                  </Text>
                </View>
                )}
                {record.vital_signs.vital_pulse && (
                <View>
                  <Text className="text-xs text-gray-600">PR</Text>
                  <Text className="text-sm font-medium text-gray-900">
                  {record.vital_signs.vital_pulse} bpm
                  </Text>
                </View>
                )}
                {record.vital_signs.vital_RR && (
                <View>
                  <Text className="text-xs text-gray-600">RR</Text>
                  <Text className="text-sm font-medium text-gray-900">
                  {record.vital_signs.vital_RR} cpm
                  </Text>
                </View>
                )}
            </View>
          </View>
        )}

        {/* Follow-up information if available */}
        {record.follow_up_visit?.followv_date && record.follow_up_visit.followv_date !== "No Schedule" && (
          <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center">
            <Calendar size={14} color="#6B7280" />
            <Text className="text-xs text-gray-600 ml-2">
              Next follow-up: {formatDate(record.follow_up_visit.followv_date)}
            </Text>
          </View>
        )}
      </View>
    </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};