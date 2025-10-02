import type React from "react"
import { View, TouchableOpacity } from "react-native"
import { User, Calendar, MapPin, Home } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { localDateFormatter } from "@/helpers/localDateFormatter"
import { calculateAge } from "@/helpers/ageCalculator"

interface PatientInfoCardProps {
  patient: any
  onPress?: () => void
}

export const PatientInfoCard: React.FC<PatientInfoCardProps> = ({ patient, onPress }) => {
  const fullName =
    `${patient.personal_info.per_lname}, ${patient.personal_info.per_fname} ${patient.personal_info.per_mname}`.trim()

  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case "resident":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        }
      case "transient":
        return {
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        }
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        }
    }
  }

  const typeConfig = getTypeConfig(patient.pat_type)

  const formatAddress = () => {
    if (patient.addressFull) return patient.addressFull

    const addressParts = [patient.address?.add_street, patient.address?.add_barangay, patient.address?.add_city].filter(
      Boolean,
    )

    return addressParts.length > 0 ? addressParts.join(", ") : "No address"
  }

  const CardContent = () => (
    <View className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Compact Header */}
      <View className="bg-blue-600 p-3">
        <View className="flex-row items-center">
          {/* Small Avatar */}
          <View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center mr-3 border border-white/30">
            <User color="white" size={20} />
          </View>

          {/* Name and Basic Info */}
          <View className="flex-1">
            <Text className="font-semibold text-white text-base" numberOfLines={1}>
              {fullName}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-blue-100 text-xs">ID: {patient.pat_id}</Text>
              <View className="w-1 h-1 bg-blue-200 rounded-full mx-2" />
              <Text className="text-blue-100 text-xs">
                {calculateAge(patient.personal_info.per_dob)}, {patient.personal_info.per_sex}
              </Text>
            </View>
          </View>

          {/* Compact Type Badge */}
          <View className={`${typeConfig.bgColor} rounded-full px-2 py-1`}>
            <Text className={`text-xs font-medium ${typeConfig.color}`}>{patient.pat_type}</Text>
          </View>
        </View>
      </View>

      {/* Compact Content */}
      <View className="p-3">
        {/* Essential Info Grid */}
        <View className="space-y-2">
          {/* Date of Birth */}
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-blue-50 rounded-md items-center justify-center mr-2">
              <Calendar size={12} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">DOB</Text>
              <Text className="text-sm font-medium text-gray-900">
                {localDateFormatter(patient.personal_info.per_dob)}
              </Text>
            </View>
          </View>

          {/* Address */}
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-green-50 rounded-md items-center justify-center mr-2 mt-0.5">
              <MapPin size={12} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Address</Text>
              <Text className="text-sm font-medium text-gray-900 leading-4" numberOfLines={2}>
                {formatAddress()}
              </Text>
            </View>
          </View>

          {/* Household ID (if available) */}
          {patient.households?.[0]?.hh_id && (
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-orange-50 rounded-md items-center justify-center mr-2">
                <Home size={12} color="#EA580C" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Household</Text>
                <Text className="text-sm font-medium text-gray-900">{patient.households[0].hh_id}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.95} className="mb-3">
        <CardContent />
      </TouchableOpacity>
    )
  }

  return (
    <View className="mb-3">
      <CardContent />
    </View>
  )
}
