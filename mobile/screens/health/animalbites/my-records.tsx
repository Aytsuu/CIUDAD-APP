"use client"

import React, { useMemo } from "react"
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { User, FileText, AlertCircle, Package, Clock, Shield, Activity, ArrowLeft } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router } from "expo-router"
import { format } from "date-fns"
import { useAuth } from "../familyplanning/useAuth"
import { useAnimalBitePatientHistory, useAnimalBitePatientSummary } from "./db-request/get-query"

// Remove the mock API function and use your actual API call
type PatientRecordDetail = {
  bite_id: number
  actions_taken: string
  referredby: string
  biting_animal: string
  exposure_site: string
  exposure_type: string
  patient_fname: string
  patient_lname: string
  patient_mname?: string
  patient_sex: string
  patient_age: number
  patient_address: string
  patient_id: string
  patient_type: string
  referral_id: number
  referral_date: string
  referral_receiver: string
  referral_sender: string
  record_created_at: string
}

export default function MyAnimalBiteRecordsScreen() {
  const { user } = useAuth()
  
  // Use your actual API hook for the logged-in user
  const { 
    data: records = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useAnimalBitePatientHistory(user?.id)

  const [refreshing, setRefreshing] = React.useState(false)

  const patientInfo = useMemo(() => {
    if (records && records.length > 0) {
      const firstRecord = records[0]
      return {
        patient_fname: firstRecord.patient_fname,
        patient_lname: firstRecord.patient_lname,
        patient_mname: firstRecord.patient_mname,
        patient_sex: firstRecord.patient_sex,
        patient_age: firstRecord.patient_age,
        patient_address: firstRecord.patient_address,
        patient_id: firstRecord.patient_id,
        patient_type: firstRecord.patient_type,
      }
    }
    
    return null
  }, [records, user])

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (e) {
      console.error("Error formatting date:", dateString, e)
      return "Invalid Date"
    }
  }

  const formatTimeSafely = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "h:mm a")
    } catch (e) {
      return "N/A"
    }
  }

  const getPatientInitials = (fname: string, lname: string) => {
    return `${fname?.charAt(0) || ""}${lname?.charAt(0) || ""}`.toUpperCase()
  }

  const getExposureTypeColor = (exposureType: string) => {
    switch (exposureType?.toLowerCase()) {
      case "bite":
        return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" }
      case "scratch":
        return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" }
      case "lick":
        return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" }
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" }
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-50">
        <View className="bg-white p-8 rounded-2xl items-center shadow-sm">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600 font-medium">Loading your animal bite records...</Text>
        </View>
      </View>
    )
  }
  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-red-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-red-500 text-xl font-bold mb-2 mt-4">Error</Text>
          <Text className="text-gray-700 text-center leading-6">
            Failed to load your records. {error?.message || "Please try again later."}
          </Text>
          <TouchableOpacity className="mt-6 px-6 py-3 bg-red-500 rounded-xl" onPress={() => refetch()}>
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!user?.id) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <Package size={48} color="#9CA3AF" />
          <Text className="text-gray-600 text-xl font-bold mb-2 mt-4">Authentication Required</Text>
          <Text className="text-gray-500 text-center leading-6">Please log in to view your animal bite records.</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center p-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">My Animal Bite Records</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Patient Information Card */}
        {patientInfo && (
          <View className="p-4">
            <View className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Patient Header */}
              <View className="bg-blue-600 p-6">
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mr-4">
                    <Text className="text-white font-bold text-xl">
                      {getPatientInitials(patientInfo.patient_fname, patientInfo.patient_lname)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-bold mb-1">
                      {patientInfo.patient_fname} {patientInfo.patient_mname} {patientInfo.patient_lname}
                    </Text>
                    <Text className="text-blue-100 text-sm">ID: {patientInfo.patient_id}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-4">
                {/* Age & Gender */}
                <View className="flex-1 bg-white rounded-lg m-4">
                  <View className="flex-row items-center mb-2">
                    <User size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2 font-medium">Age & Gender</Text>
                  </View>
                  <Text className="text-gray-800 font-bold text-lg">
                    {patientInfo.patient_age} years old, {patientInfo.patient_sex}
                  </Text>
                </View>

                {/* Patient Type */}
                <View className="flex-1 bg-white rounded-lg m-4">
                  <View className="flex-row items-center mb-2">
                    <Shield size={18} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2 font-medium">Patient Type</Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full self-start ${
                      patientInfo.patient_type === "Transient"
                        ? "bg-orange-100 border border-orange-200"
                        : "bg-green-100 border border-green-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        patientInfo.patient_type === "Transient" ? "text-orange-700" : "text-green-700"
                      }`}
                    >
                      {patientInfo.patient_type}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Records Summary */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <View className="flex-row items-center mb-4">
              <Activity size={24} color="#3B82F6" />
              <Text className="text-xl font-bold text-gray-800 ml-3">My Records Summary</Text>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-3xl font-bold text-blue-600">{records?.length || 0}</Text>
                <Text className="text-gray-600 text-sm">Total Records</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-red-600">
                  {records?.filter((r: { exposure_type: string }) => r.exposure_type?.toLowerCase() === "bite").length || 0}
                </Text>
                <Text className="text-gray-600 text-sm">Bite Incidents</Text>
              </View>
              <View className="items-center">
                <Text className="text-3xl font-bold text-orange-600">
                  {records?.filter((r: { exposure_type: string }) => r.exposure_type?.toLowerCase() === "scratch").length || 0}
                </Text>
                <Text className="text-gray-600 text-sm">Scratch Incidents</Text>
              </View>
            </View>
          </View>
        </View>

        {/* My Records History */}
        <View className="px-4 pb-6">
          <View className="flex-row items-center mb-4 mt-5">
            <FileText size={24} color="#374151" />
            <Text className="text-xl font-bold text-gray-800 ml-3">My Records History</Text>
          </View>

          {records && records.length > 0 ? (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              className="flex-row"
              contentContainerStyle={{ paddingHorizontal: 8 }}
            >
              {records.map((record: { exposure_type: string; bite_id: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; referral_date: string; record_created_at: string; biting_animal: any; exposure_site: any; actions_taken: any; referral_sender: any; referral_receiver: any; referredby: any }) => {
                const exposureColors = getExposureTypeColor(record.exposure_type)
                return (
                  <TouchableOpacity
                    key={`record-${record.bite_id}-${record.referral_date}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mr-4 w-80"
                    onPress={() => {
                      // Navigate to detailed view if needed
                      console.log("[v0] Record pressed:", record.bite_id)
                    }}
                  >
                    {/* Record Header */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                      <View className="flex-row items-center">
                        <View className={`${exposureColors.bg} p-2 rounded-lg mr-3`}>
                          <FileText size={18} className={exposureColors.text} />
                        </View>
                        <View>
                          <Text className="font-bold text-gray-800">Record #{record.bite_id}</Text>
                          <Text className="text-gray-500 text-sm">
                            {formatDateSafely(record.referral_date)} • {formatTimeSafely(record.record_created_at)}
                          </Text>
                        </View>
                      </View>
                      <View className={`px-2 py-1 rounded-full ${exposureColors.bg} ${exposureColors.border}`}>
                        <Text className={`text-md font-semibold ${exposureColors.text}`}>
                          {record.exposure_type || "N/A"}
                        </Text>
                      </View>
                    </View>

                    {/* Record Details */}
                    <View className="p-4">
                      <View className="flex-row justify-between mb-3">
                        <View className="flex-1 pr-2">
                          <Text className="text-gray-600 text-sm mb-1">Biting Animal</Text>
                          <Text className="text-gray-800 font-medium">{record.biting_animal || "Not specified"}</Text>
                        </View>
                        <View className="flex-1 pl-2">
                          <Text className="text-gray-600 text-sm mb-1">Exposure Site</Text>
                          <Text className="text-gray-800 font-medium">{record.exposure_site || "N/A"}</Text>
                        </View>
                      </View>

                      <View className="mb-3">
                        <Text className="text-gray-600 text-sm mb-1">Actions Taken</Text>
                        <Text className="text-gray-800 leading-5">{record.actions_taken || "No actions recorded"}</Text>
                      </View>

                      <View className="bg-blue-50 rounded-lg p-3">
                        <Text className="text-blue-700 font-semibold mb-2">Referral Details</Text>
                        <View>
                          <View>
                            <Text className="text-blue-600 text-sm">From</Text>
                            <Text className="text-blue-800 font-medium mb-2">{record.referral_sender || "N/A"}</Text>
                          </View>
                          <View>
                            <Text className="text-blue-600 text-sm">To</Text>
                            <Text className="text-blue-800 font-medium mb-2">{record.referral_receiver || "N/A"}</Text>
                          </View>
                          <View>
                            <Text className="text-blue-600 text-sm">Referred by</Text>
                            <Text className="text-blue-800 font-medium mb-2">{record.referredby || "N/A"}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          ) : (
            <View className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 items-center">
              <Clock size={48} color="#D1D5DB" />
              <Text className="text-gray-600 text-lg font-bold mb-2 mt-4">No Records Found</Text>
              <Text className="text-gray-500 text-center leading-6">You don't have any animal bite records yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}