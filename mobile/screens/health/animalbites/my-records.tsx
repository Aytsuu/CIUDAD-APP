"use client"

import React, { useMemo, useState, useCallback } from "react" // MODIFIED: Added useState and useCallback
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native"
import { User, FileText, AlertCircle, Package, Clock, Shield, Activity, ArrowLeft, ChevronLeft } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router, useLocalSearchParams } from "expo-router"
import { format } from "date-fns"
import { useAnimalBitePatientHistory, useAnimalBitePatientSummary } from "./db-request/get-query"
import { getPatientByResidentId, getPatientRecordsByPatId } from "./api/get-api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import PageLayout from "@/screens/_PageLayout"
import { useAuth } from "@/contexts/AuthContext"
import { LoadingState } from "@/components/ui/loading-state"
import { getPatientById } from "../admin/admin-animalbites/api/get-api"
import { calculateAge } from "@/helpers/ageCalculator"
import { PaginationControls } from "../admin/components/pagination-layout"

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
  const params = useLocalSearchParams<{ pat_id?: string }>()
  const patIdFromParams = params.pat_id
  const { user } = useAuth()
  const rp_id = user?.rp

  // ... (Debug logs remain the same)
  console.log("[DEBUG] patIdFromParams:", patIdFromParams)
  console.log("[DEBUG] rp_id from auth:", rp_id)
  console.log("[DEBUG] user:", user)

  // ... (Data fetching queries remain the same)
  const { data: patientData, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patientDetails", patIdFromParams || rp_id],
    queryFn: async () => {
      if (patIdFromParams) {
        console.log("[DEBUG] Fetching patient with pat_id:", patIdFromParams)
        return await getPatientById(patIdFromParams)
      } else if (rp_id) {
        console.log("[DEBUG] Fetching patient with rp_id:", rp_id)
        return await getPatientByResidentId(rp_id)
      }
      return null
    },
    enabled: !!(patIdFromParams || rp_id),
  })

  const patient_id = patIdFromParams || patientData?.pat_id
  console.log("[DEBUG] patient_id used for records:", patient_id)

  const { data: records = [], isLoading: isLoadingRecords, refetch } = useQuery<PatientRecordDetail[], Error>({
    queryKey: ["myAnimalbiteRecord", patient_id],
    queryFn: () => getPatientRecordsByPatId(patient_id),
    enabled: !!patient_id,
  })

  const [refreshing, setRefreshing] = React.useState(false)
  // ADDED: State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 1 // Show one record card at a time

  // ... (patientInfo memo remains the same)
  const patientInfo = useMemo(() => {
    if (patientData) {
      return {
        patient_fname: patientData.personal_info?.per_fname,
        patient_lname: patientData.personal_info?.per_lname,
        patient_mname: patientData.personal_info?.per_mname,
        patient_sex: patientData.personal_info?.per_sex,
        patient_age: calculateAge(patientData.personal_info?.per_dob),
        patient_address:
          `${patientData.address?.add_street ?? ""} ${patientData.address?.add_barangay ?? ""} ${
            patientData.address?.add_city ?? ""
          } ${patientData.address?.add_province ?? ""}`.trim() || "N/A",
        patient_id: patientData.pat_id,
        patient_type: patientData.pat_type,
      }
    } else if (records.length > 0) {
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
  }, [patientData, records])

  // ADDED: Pagination logic
  const totalRecords = records?.length || 0
  const totalPages = Math.ceil(totalRecords / pageSize)

  const paginatedRecords = useMemo(() => {
    if (!records) return []
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return records.slice(startIndex, endIndex)
  }, [records, currentPage, pageSize])

  // MODIFIED: onRefresh to reset pagination
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    setCurrentPage(1) // Reset to first page
    await refetch()
    setRefreshing(false)
  }, [refetch])

  // ADDED: Page change handler
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // ... (formatDateSafely, formatTimeSafely, getPatientInitials, getExposureTypeColor remain the same)
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

  // ... (Loading/Error states remain the same)
  if (!patient_id && !user) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <Package size={48} color="#9CA3AF" />
          <Text className="text-gray-600 text-xl font-bold mb-2 mt-4">Authentication Required</Text>
          <Text className="text-gray-500 text-center leading-6">Please log in to view animal bite records.</Text>
        </View>
      </View>
    )
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-slate-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">My Animal Bite Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 ">
        <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {/* Patient Information Card */}
          {patientInfo && (
            <View className="p-4">
              {/* ... (Patient Info Card JSX remains the same) ... */}
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
                    <Text className="text-gray-800 font-bold text-sm">
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
            {/* ... (Records Summary JSX remains the same) ... */}
            <View className="p-6">
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-3xl font-bold text-blue-600">{records?.length || 0}</Text>
                  <Text className="text-gray-600 text-sm">Total Records</Text>
                </View>
                <View className="items-center">
                  <Text className="text-3xl font-bold text-red-600">
                    {records?.filter((r: { exposure_type: string }) => r.exposure_type?.toLowerCase() === "bite")
                      .length || 0}
                  </Text>
                  <Text className="text-gray-600 text-sm">Bite Incidents</Text>
                </View>
                <View className="items-center">
                  <Text className="text-3xl font-bold text-orange-600">
                    {records?.filter((r: { exposure_type: string }) => r.exposure_type?.toLowerCase() === "scratch")
                      .length || 0}
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
              <Text className="text-xl font-bold text-gray-800 ml-3">My Referrals History</Text>
            </View>

            {records && records.length > 0 ? (
              // MODIFIED: Replaced horizontal ScrollView with a View
              <View>
                {paginatedRecords.map(
                  (record: {
                    exposure_type: string
                    bite_id: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined
                    referral_date: string
                    record_created_at: string
                    biting_animal: any
                    exposure_site: any
                    actions_taken: any
                    referral_sender: any
                    referral_receiver: any
                    referredby: any
                  }) => {
                    const exposureColors = getExposureTypeColor(record.exposure_type)
                    return (
                      <TouchableOpacity
                        key={`record-${record.bite_id}-${record.referral_date}`}
                        // MODIFIED: Removed horizontal-scroll styles (mr-4, w-80) and made it full width
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full"
                        onPress={() => {
                          // Navigate to detailed view if needed
                          console.log("[v0] Record pressed:", record.bite_id)
                        }}
                      >
                        {/* Record Header */}
                        {/* ... (Card Header JSX remains the same) ... */}
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                          <View className="flex-row items-center">
                            <View className={`${exposureColors.bg} p-2 rounded-lg mr-3`}>
                              <FileText size={18} className={exposureColors.text} />
                            </View>
                            <View>
                              <Text className="font-bold text-gray-800">Record #{record.bite_id}</Text>
                              <Text className="text-gray-500 text-sm">
                                {formatDateSafely(record.referral_date)} •{" "}
                                {formatTimeSafely(record.record_created_at)}
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
                        {/* ... (Card Details JSX remains the same) ... */}
                        <View className="p-4">
                          <View className="flex-row justify-between mb-3">
                            <View className="flex-1 pr-2">
                              <Text className="text-gray-600 text-sm mb-1">Biting Animal</Text>
                              <Text className="text-gray-800 font-medium">
                                {record.biting_animal || "Not specified"}
                              </Text>
                            </View>
                            <View className="flex-1 pl-2">
                              <Text className="text-gray-600 text-sm mb-1">Exposure Site</Text>
                              <Text className="text-gray-800 font-medium">{record.exposure_site || "N/A"}</Text>
                            </View>
                          </View>

                          <View className="mb-3">
                            <Text className="text-gray-600 text-sm mb-1">Actions Taken</Text>
                            <Text className="text-gray-800 leading-5">
                              {record.actions_taken || "No actions recorded"}
                            </Text>
                          </View>

                          <View className="bg-blue-50 rounded-lg p-3">
                            <Text className="text-blue-700 font-semibold mb-2">Referral Details</Text>
                            <View>
                              <View>
                                <Text className="text-blue-600 text-sm">From</Text>
                                <Text className="text-blue-800 font-medium mb-2">
                                  {record.referral_sender || "N/A"}
                                </Text>
                              </View>
                              <View>
                                <Text className="text-blue-600 text-sm">To</Text>
                                <Text className="text-blue-800 font-medium mb-2">
                                  {record.referral_receiver || "N/A"}
                                </Text>
                              </View>
                              <View>
                                <Text className="text-blue-600 text-sm">Referred by</Text>
                                <Text className="text-blue-800 font-medium mb-2">
                                  {record.referredby || "N/A"}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  }
                )}

                {/* ADDED: Pagination Controls */}
                {totalPages > 1 && (
                  <View className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange}/></View>
                )}
              </View>
            ) : (
              <View className="bg-white p-6 items-center">
                <Clock size={48} color="#D1D5DB" />
                <Text className="text-gray-600 text-lg font-bold mb-2 mt-4">No Records Found</Text>
                <Text className="text-gray-500 text-center leading-6">You don't have any animal bite records yet.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </PageLayout>
  )
}