"use client"

import { useState, useCallback, useEffect } from "react"
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, ScrollView } from "react-native"
import { Search, ChevronLeft, AlertCircle, Pill, RefreshCw, Package } from "lucide-react-native"
import { Text } from "@/components/ui/text"
import { router, useLocalSearchParams } from "expo-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useDebounce } from "@/hooks/use-debounce"
import PageLayout from "@/screens/_PageLayout"
import { LoadingState } from "@/components/ui/loading-state"
import { PaginationControls } from "../admin/components/pagination-layout"
import { useIndividualMedicineRecords } from "../admin/admin-medicinerecords/queries/fetch"
import { getPatientByResidentId } from "../animalbites/api/get-api"
// import { PatientInfoCard } from "../admin/components/patientcards"
import { MedicineRecordCard } from "../admin/admin-medicinerecords/medicine-record-cad"

export default function IndividualMedicineRecords() {
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  const { user } = useAuth()
  const rp_id = user?.rp

  const {
    data: patientData,
    isLoading: isPatientLoading,
    isError: isPatientError,
    error: patientError,
    refetch: refetchPatientData,
  } = useQuery({
    queryKey: ["patientByResidentId", rp_id],
    queryFn: () => {2
      if (!rp_id) throw new Error("Resident ID is undefined")
      return getPatientByResidentId(rp_id)
    },
    enabled: !!rp_id,
  })

  const {

    data: apiResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useIndividualMedicineRecords(patientData?.pat_id || "", currentPage, pageSize, debouncedSearchQuery)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
      setCurrentPage(1)
    } catch (e) {
      console.error("Refetch error:", e)
    }
    setRefreshing(false)
  }, [refetch])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  const medicineRecords = apiResponse?.results || []
  const totalCount = apiResponse?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const startEntry = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endEntry = Math.min(currentPage * pageSize, totalCount)

  if (!user && !rp_id) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <Package size={48} color="#9CA3AF" />
          <Text className="text-gray-600 text-xl font-bold mb-2 mt-4">Authentication Required</Text>
          <Text className="text-gray-500 text-center leading-6">Please log in to view your medicine records.</Text>
        </View>
      </View>
    )
  }

  if (isPatientLoading) {
    return <LoadingState />
  }

  // if (isPatientError || !patientData?.pat_id) {
  //   return (
  //     <PageLayout
  //       leftAction={
  //         <TouchableOpacity
  //           onPress={() => router.back()}
  //           className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
  //         >
  //           <ChevronLeft size={24} color="#374151" />
  //         </TouchableOpacity>
  //       }
  //       headerTitle={<Text>Medicine Records</Text>}
  //     >
  //       <View className="flex-1 justify-center items-center bg-gray-50 px-6">
  //         <AlertCircle size={64} color="#EF4444" />
  //         <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Patient Not Found</Text>
  //         <Text className="text-gray-600 text-center mt-2 mb-6">No patient data was found for your account.</Text>
  //         <TouchableOpacity onPress={() => refetchPatientData()} className="bg-blue-600 px-6 py-3 rounded-lg">
  //           <Text className="text-white font-medium">Retry</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </PageLayout>
  //   )
  // }

  if (isLoading && !medicineRecords.length) {
    return <LoadingState />
  }

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Medicine Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            Failed to load medicine records. Please try again.
          </Text>
          <TouchableOpacity onPress={onRefresh} className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg">
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1 "
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}
      >
        {/* <View className="px-4 pt-4">
          <PatientInfoCard patient={patientData} />
        </View> */}

        <View className=" p-4">
          <View className="">
            <View className="flex-row items-center space-x-3">
              <View className="flex-1 flex-row items-center p-3 border border-gray-300 bg-gray-50 rounded-lg shadow-sm">
                <Search size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholder="Search by medicine name, category..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 py-2 border-b border-gray-100 bg-white">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {totalCount} entries
            </Text>
            <Text className="text-sm font-medium text-gray-800">
              Page {currentPage} of {totalPages}
            </Text>
          </View>
        </View>

        <View className="px-4 pb-4">
          {medicineRecords.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
              <Pill size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No medicine records found</Text>
              <Text className="text-gray-600 text-center mt-2 mb-4">
                {debouncedSearchQuery
                  ? "No records match your search criteria."
                  : "This patient doesn't have any medicine records yet."}
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={medicineRecords}
                keyExtractor={(item) => `medicine-record-${item.id}`}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                renderItem={({ item }) => <MedicineRecordCard record={item} />}
                ListFooterComponent={
                  isFetching ? (
                    <View className="py-4 items-center">
                      <RefreshCw size={20} color="#3B82F6" className="animate-spin" />
                    </View>
                  ) : null
                }
              />

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  )
}