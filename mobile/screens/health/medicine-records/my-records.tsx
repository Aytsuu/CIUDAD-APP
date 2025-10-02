"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, ScrollView } from "react-native";
import { Search, ChevronLeft, AlertCircle, Pill, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { PaginationControls } from "../admin/components/pagination-layout";
import { MedicineRecordCard } from "../medicine-records/medicine-record-cad";
import { PatientInfoCard } from "../admin/components/patientcards";
import NoRecordsCard from "../admin/components/no-records-card";
import { serializePatientData, SerializedPatientData } from "../vaccination/patientdata";
import { useIndividualMedicineRecords } from "./queries/fetch";

// Medicine-specific patient data serializer
const serializeMedicinePatientData = (medicineRecord: any): SerializedPatientData | null => {
  if (!medicineRecord?.patient_record) return null;

  const patientRecord = medicineRecord.patient_record;

  // Create the structure that your existing serializer expects
  const dataForSerializer = {
    pat_id: patientRecord.pat_id || "",
    personal_info: patientRecord.pat_details?.personal_info || {},
    address: patientRecord.pat_details?.address || {},
    households: patientRecord.pat_details?.households || [],
    pat_type: patientRecord.pat_details?.pat_type || "Resident",
    pat_status: patientRecord.pat_details?.pat_status || "Active"
  };

  console.log("Data for serializer:", dataForSerializer);
  const serializedData = serializePatientData(dataForSerializer);
  return serializedData === "" ? null : serializedData;
};

export default function IndividualMedicineRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const params = useLocalSearchParams();
  const { pat_id } = useAuth();
  const [patId, setPatientId] = useState("");

  const mode = typeof params.mode === "string" ? params.mode : null;

  useEffect(() => {
    console.log("MODE:", mode);
    if (mode === "admin") {
      const adminPatId = params.pat_id as string;
      if (adminPatId) {
        setPatientId(adminPatId);
      }
    } else {
      setPatientId(pat_id || "");
    }
  }, [mode, params.patId, pat_id]);

  const { data: apiResponse, isLoading: isLoadingRecords, isError: isErrorRecords, error: recordsError, refetch: refetchPatient } = useIndividualMedicineRecords(patId, currentPage, pageSize, debouncedSearchQuery);

  // Extract and serialize patient data from medicine records
  const patientData = useMemo((): SerializedPatientData | null => {
    if (!apiResponse?.results || apiResponse.results.length === 0) {
      console.log("No medicine records found");
      return null;
    }

    // Get patient data from the first record
    const firstRecord = apiResponse.results[0];
    console.log("First record patient data:", firstRecord?.patient_record);

    const serialized = serializeMedicinePatientData(firstRecord);
    console.log("Serialized patient data:", serialized);
    return serialized;
  }, [apiResponse?.results]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchPatient();
      setCurrentPage(1);
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetchPatient]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Use the correct data structure from the API response
  const medicineRecords = apiResponse?.results || apiResponse?.data || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startEntry = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  // Check if we have an API error (success: false)
  const hasApiError = apiResponse?.success === false;
  const hasRecords = medicineRecords.length > 0;

  // No patient ID available or invalid patient
  if (!patId || patId.trim() === "") {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Medicine Records</Text>}
      >
        <NoRecordsCard />
      </PageLayout>
    );
  }

  // Initial loading state
  if (isLoadingRecords && !apiResponse) {
    return <LoadingState />;
  }

  // React Query error state (network errors, etc.)
  if (isErrorRecords && !apiResponse) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Medicine Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">{recordsError?.message || "Failed to load medicine records. Please try again."}</Text>
          <TouchableOpacity onPress={onRefresh} className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg">
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  // API error state (success: false from backend)
  if (hasApiError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Medicine Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error Loading Records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">{apiResponse?.error || "Unable to load medicine records at this time."}</Text>
          <TouchableOpacity onPress={onRefresh} className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg">
            <RefreshCw size={18} color="white" />
            <Text className="ml-2 text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Medicine Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}>
        {/* Patient Info Card - Only show if we have patient data */}
        {patientData ? (
          <View className="px-4 pt-4 bg-white">
            <PatientInfoCard patient={patientData} />
          </View>
        ) : (
            <View className="px-4 pt-4">
            <View className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <View className="h-4 bg-gray-300 rounded w-3/4 self-center mb-2" />
              <View className="h-4 bg-gray-300 rounded w-1/2 self-center" />
            </View>
            </View>
        )}

        <View className="p-4 border-b border-gray-200 mb-2">
          <View className="flex-row items-center space-x-3">
            <View className="flex-1 flex-row items-center px-1 border border-gray-300 bg-gray-50 rounded-lg shadow-sm">
              <Search size={20} color="#6B7280" />
              <TextInput className="flex-1 ml-3 text-gray-800 text-base" placeholder="Search by medicine name, category..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
            </View>
          </View>
        </View>

        {/* Results Header - Only show if we have records or are loading */}
        {(hasRecords || isLoadingRecords) && (
          <View className="px-4 py-2 border-b border-gray-100 bg-white">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">{isLoadingRecords ? "Loading..." : `Showing ${startEntry} to ${endEntry} of ${totalCount} entries`}</Text>
              {!isLoadingRecords && (
                <Text className="text-sm font-medium text-gray-800">
                  Page {currentPage} of {totalPages}
                </Text>
              )}
            </View>
          </View>
        )}

        <View className="px-4 pb-4">
          {isLoadingRecords ? (
            <View className="py-8 items-center">
              <LoadingState />
            </View>
          ) : medicineRecords.length === 0 ? (
            <View className="bg-white rounded-xl p-8 mt-16 items-center">
              <Pill size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">No medicine records found</Text>
              <Text className="text-gray-600 text-center mt-2 mb-4">{debouncedSearchQuery ? "No records match your search criteria." : "This patient doesn't have any medicine records yet."}</Text>
              <TouchableOpacity onPress={onRefresh} className="bg-blue-600 px-6 py-3 rounded-lg mt-4">
                <Text className="text-white font-medium">Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList data={medicineRecords} keyExtractor={(item) => `medicine-record-${item.medrec_id}`} showsVerticalScrollIndicator={false} scrollEnabled={false} renderItem={({ item }) => <MedicineRecordCard record={item} />} ListFooterComponent={<View className="h-4" />} />
              {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalItems={0} pageSize={0} />}
            </>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}
