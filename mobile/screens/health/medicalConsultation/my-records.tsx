"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, ScrollView } from "react-native";
import { Search, ChevronLeft, AlertCircle, HeartPulse, Users, Calendar, Syringe, RefreshCw } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { PaginationControls } from "../admin/components/pagination-layout";
import { PatientInfoCard } from "../admin/components/patientcards";
import NoRecordsCard from "../admin/components/no-records-card";
import { useConsultationHistory, useFamHistory, usePrenatalPatientMedHistory } from "./queries/fetch";
import { MedicalHistoryTab } from "./cards/medical-history-cards";
import { FamilyHistoryTab } from "./cards/family-history-cards";
import { MedicalConsultationCard } from "./cards/indiv-card";
import { serializePatientData } from "../vaccination/patientdata";

const TabButton = ({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) => (
  <TouchableOpacity onPress={onPress} className={`flex-1 py-4 items-center border-b-2 ${active ? "border-blue-600 bg-blue-50" : "border-transparent"}`}>
    <View className="flex-row items-center space-x-2">{children}</View>
  </TouchableOpacity>
);

export default function InvMedicalConRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [medHistorySearch, setMedHistorySearch] = useState("");
  const [famHistorySearch, setFamHistorySearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(2);
  const [activeTab, setActiveTab] = useState<"medical" | "family">("medical");
  const [patId, setPatientId] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const params = useLocalSearchParams();
  const { pat_id } = useAuth();

  const mode = typeof params.mode === "string" ? params.mode : null;

  // Handle patient ID setup
  useEffect(() => {
    console.log("MODE:", mode);
    console.log("Params patId:", params.patId);
    console.log("Auth pat_id:", pat_id);

    if (mode === "admin") {
      // Admin mode - get patient data from params
      const adminPatId = params.pat_id as string;

      console.log("Admin mode - Setting patId to:", adminPatId);
      setPatientId(adminPatId || "");

      // Store admin patient data in state if needed
      if (patId) {
        // adminPatientData is available for use if needed
        console.log("Admin patient data available:", patId);
      }
    } else {
      // Regular mode - use authenticated user's data
      console.log("Regular mode - Setting patId to:", pat_id);
      setPatientId(pat_id || "");
    }
  }, [mode, params.patId, params.patientData, pat_id]);

  // Use the consultation history hook with search
  const { data: medicalRecordsResponse, isLoading: isMedicalRecordsLoading, isError: isMedicalRecordsError, refetch: refetchMedicalRecords } = useConsultationHistory(patId, currentPage, pageSize, debouncedSearchQuery);

  // Use medical history hook with search
  const { data: medHistoryData, isLoading: isMedHistoryLoading, error: medHistoryError, isError: isMedHistoryError, refetch: refetchMedHistory } = usePrenatalPatientMedHistory(patId, medHistorySearch);

  // Use Family History hook with search
  const { data: famHistoryData, isLoading: isFamHistoryLoading, isError: isFamHistoryError, refetch: refetchFamHistory } = useFamHistory(patId || "", famHistorySearch);

  // Extract medical records from API response
  const medicalRecords = useMemo(() => {
    console.log("Raw API Response:", medicalRecordsResponse);

    if (medicalRecordsResponse?.results) {
      console.log("Using paginated results");
      return medicalRecordsResponse.results;
    } else if (Array.isArray(medicalRecordsResponse)) {
      console.log("Using direct array");
      return medicalRecordsResponse;
    } else {
      console.log("No records found, using empty array");
      return [];
    }
  }, [medicalRecordsResponse]);

  // Extract and serialize patient data from consultation records
  const patientData = useMemo(() => {
    if (!medicalRecords || medicalRecords.length === 0) {
      console.log("No consultation records found for patient data");
      return null;
    }

    // Get patient data from the first record
    const firstRecord = medicalRecords[0];
    console.log("First consultation record for patient data:", firstRecord?.patrec_details);

    // Extract the patient_details which matches what serializePatientData expects
    const patientDetails = firstRecord.patrec_details?.patient_details;

    if (!patientDetails) {
      console.log("No patient_details found in consultation record");
      return null;
    }

    const serialized = serializePatientData(patientDetails);
    console.log("Final patient data for display:", serialized);
    return serialized;
  }, [medicalRecords]);

  // Calculate pagination values
  const totalCount = medicalRecordsResponse?.count || medicalRecords.length || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startEntry = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  console.log("Processed - Total count:", totalCount, "Records:", medicalRecords.length);
  console.log("Patient Data Available:", !!patientData);

  // Handle consultation search
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  }, []);

  // Handle medical history search
  const handleMedHistorySearchChange = useCallback((text: string) => {
    setMedHistorySearch(text);
  }, []);

  // Clear medical history search
  const clearMedHistorySearch = useCallback(() => {
    setMedHistorySearch("");
  }, []);

  // Handle family history search
  const handleFamHistorySearchChange = useCallback((text: string) => {
    setFamHistorySearch(text);
  }, []);

  // Clear family history search
  const clearFamHistorySearch = useCallback(() => {
    setFamHistorySearch("");
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMedicalRecords(), refetchMedHistory(), refetchFamHistory()]);
      setCurrentPage(1);
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetchMedicalRecords, refetchMedHistory, refetchFamHistory]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRecordPress = useCallback(
    (record: any) => {
      router.push({
        pathname: "/medconsultation/current-history",
        params: {
          MedicalConsultation: JSON.stringify(record),
          patientData: JSON.stringify(patientData),
          mode: mode,
          patId: patId
        }
      });
    },
    [patientData, mode, patId]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Check if we have an API error (success: false)
  const hasApiError = medicalRecordsResponse?.success === false;
  const hasRecords = medicalRecords.length > 0;

  // No patient ID available or invalid patient
  if (!patId || patId.trim() === "") {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Medical Consultation</Text>}
      >
        <NoRecordsCard />
      </PageLayout>
    );
  }

  // Initial loading state - only check for medical records loading
  if ( !medicalRecordsResponse && isFamHistoryLoading && isMedHistoryLoading) {
    return <LoadingState />;
  }

  // React Query error state (network errors, etc.)
  if (isMedicalRecordsError && !medicalRecordsResponse) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Medical Consultation</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error loading records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">Failed to load consultation records. Please try again.</Text>
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
        headerTitle={<Text>Medical Consultation</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Error Loading Records</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">{medicalRecordsResponse?.error || "Unable to load consultation records at this time."}</Text>
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
      headerTitle={<Text className="text-slate-900 text-[13px]">Medical Consultation</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}>
        {/* Patient Info Card - Only show if we have patient data and records */}
        {patientData && hasRecords ? (
          <View className="px-4 pt-4 bg-white">
            <PatientInfoCard patient={patientData} />
          </View>
        ) : null}

        {/* History Section with Tabs */}
        <View className="mx-4 my-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tab Header */}
          <View className="flex-row border-b border-gray-200">
            <TabButton active={activeTab === "medical"} onPress={() => setActiveTab("medical")}>
              <HeartPulse size={18} color={activeTab === "medical" ? "#2563EB" : "#6B7280"} />
              <Text className={`text-sm font-medium ${activeTab === "medical" ? "text-blue-600" : "text-gray-500"}`}>Medical History</Text>
            </TabButton>
            <TabButton active={activeTab === "family"} onPress={() => setActiveTab("family")}>
              <Users size={18} color={activeTab === "family" ? "#2563EB" : "#6B7280"} />
              <Text className={`text-sm font-medium ${activeTab === "family" ? "text-blue-600" : "text-gray-500"}`}>Family History</Text>
            </TabButton>
          </View>

          {/* Tab Content */}
          <View className="p-4">
            {activeTab === "medical" ? (
              <MedicalHistoryTab
                pat_id={patId}
                searchValue={medHistorySearch}
                onSearchChange={handleMedHistorySearchChange}
                onClearSearch={clearMedHistorySearch}
                medHistoryData={medHistoryData}
                isMedHistoryLoading={isMedHistoryLoading}
                isMedHistoryError={isMedHistoryError}
                medHistoryError={medHistoryError}
              />
            ) : (
              <FamilyHistoryTab pat_id={patId} searchValue={famHistorySearch} onSearchChange={handleFamHistorySearchChange} onClearSearch={clearFamHistorySearch} famHistoryData={famHistoryData} isFamHistoryLoading={isFamHistoryLoading} isFamHistoryError={isFamHistoryError} />
            )}
          </View>
        </View>

        {/* Medical Consultations Section */}
        <View className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center space-x-3">
              <Syringe size={20} color="#2563EB" />
              <Text className="text-md font-semibold text-gray-900 ">Consultation Records</Text>
            </View>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-sm font-medium">{isMedicalRecordsLoading ? "..." : totalCount} records</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center space-x-2 mb-4">
            <View className="flex-1 p-2 flex-row items-center  border border-gray-300 bg-gray-50 rounded-lg">
              <Search size={20} color="#6B7280" />
              <TextInput className="flex-1 ml-3 text-gray-800 text-base" placeholder="Search..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={handleSearchChange} />
            </View>
          </View>

          {/* Results Header */}
          {(medicalRecords.length > 0 || isMedicalRecordsLoading) && (
            <View className="py-2 border-b border-gray-100 mb-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">{isMedicalRecordsLoading ? "Loading..." : `Showing ${startEntry} to ${endEntry} of ${totalCount} entries`}</Text>
                {!isMedicalRecordsLoading && (
                  <Text className="text-sm font-medium text-gray-800">
                    Page {currentPage} of {totalPages}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Records List - Horizontal Scroll */}
          {isMedicalRecordsLoading ? (
            <View className="py-8 items-center">
              <LoadingState />
            </View>
          ) : isMedicalRecordsError ? (
            <View className="py-8 items-center">
              <AlertCircle size={48} color="#EF4444" />
              <Text className="text-red-500 text-center mt-2">Failed to load consultation records</Text>
            </View>
          ) : medicalRecords.length === 0 ? (
            <View className="py-8 items-center">
              <Calendar size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-2">{searchQuery ? "No records match your search" : "No consultation records found"}</Text>
            </View>
          ) : (
            <>
              {/* Horizontal Scroll Container */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={{
                  paddingBottom: 16
                }}
                className="mb-4"
              >
                <View className="flex-row">
                  {medicalRecords.map((item: any, index: any) => (
                    <View key={`consultation-${item.medrec_id}-${index}`} className="mr-4 w-[300px]">
                      <MedicalConsultationCard record={item} onPress={() => handleRecordPress(item)} />
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Pagination Controls */}
              <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}
