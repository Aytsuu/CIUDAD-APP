import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, Alert, ScrollView, Image } from "react-native";
import { Search, ChevronLeft, AlertCircle, Syringe, RefreshCw, Plus, FileText, Calendar } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { format, parseISO, isValid } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { useIndivPatientVaccinationRecords, useFollowupVaccines, useUnvaccinatedVaccines, usePatientVaccinationDetails } from "./queries/fetch";
import { PatientInfoCard } from "../admin/components/patientcards";
import { VaccinationStatusCards } from "../admin/components/vaccination-status-cards";
import { FollowUpsCard } from "../admin/components/followup-cards";
import { SignatureModal } from "../admin/components/signature-modal";
import { PaginationControls } from "../admin/components/pagination-layout";
import { useAuth } from "@/contexts/AuthContext";
import { serializePatientData, SerializedPatientData } from "./patientdata";
import { VaccinationRecordCard } from "./vaxrecord-card";
import NoRecordsCard from "../admin/components/no-records-card";

export default function IndividualVaccinationRecords() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [activeTab, setActiveTab] = useState("status");
  const { pat_id } = useAuth();
  const [patId, setPatientId] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const mode = typeof params.mode === "string" ? params.mode : null;

  useEffect(() => {
    console.log("MODE:", mode);
    if (mode == "admin") {
      const adminPatId = params.patId as string;
      if (adminPatId) {
        setPatientId(adminPatId);
      }
    } else {
      setPatientId(pat_id || "");
    }
  }, [mode, params.patId, pat_id]);

  // Use vaccination queries
  const { data: vaccinationRecords, isLoading: isVaccinationRecordsLoading, refetch: refetchVaccinationRecords, isFetching: isVaccinationFetching, isError: isVacrecError } = useIndivPatientVaccinationRecords(patId || "");

  // Extract and serialize patient data from vaccination records
  const patientData = useMemo((): SerializedPatientData | null => {
    if (!vaccinationRecords || vaccinationRecords.length === 0) {
      console.log("No vaccination records found");
      return null;
    }

    // Get patient data from the first record (all records should have the same patient)
    const firstRecord = vaccinationRecords[0];
    console.log("First record patient data:", firstRecord?.patient);

    if (!firstRecord?.patient) {
      console.log("No patient data in first record");
      return null;
    }

    const serialized = serializePatientData(firstRecord.patient) || null;
    console.log("Serialized patient data:", serialized);
    return serialized;
  }, [vaccinationRecords]);

  // Safe DOB extraction for unvaccinated vaccines hook
  const patientDOB = useMemo(() => {
    return patientData?.personal_info?.per_dob || "";
  }, [patientData]);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!vaccinationRecords) return [];
    return vaccinationRecords.filter((record: any) => {
      const searchText = `${record.vachist_id} ${record.vaccine_name} ${record.batch_number} ${record.vachist_doseNo} ${record.vachist_status}`.toLowerCase();
      return searchText.includes(debouncedSearchQuery.toLowerCase());
    });
  }, [vaccinationRecords, debouncedSearchQuery]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Calculate current entries being shown
  const startEntry = filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  // Use hooks with safe data
  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading, isError: isUnVacError } = useUnvaccinatedVaccines(patId, patientDOB);
  const { data: followupVaccines = [], isLoading: isFollowVaccineLoading, isError: isVacError } = useFollowupVaccines(patId);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading, isError: isCompleteVacError } = usePatientVaccinationDetails(patId);

  const isLoading = isCompleteVaccineLoading || isUnvaccinatedLoading || isFollowVaccineLoading;
  const isError = isVacError || isUnVacError || isCompleteVacError || isVacrecError;

  // Search loading state - show when search query changes and records are being filtered
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (debouncedSearchQuery && vaccinationRecords) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, vaccinationRecords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchVaccinationRecords();
      setCurrentPage(1);
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetchVaccinationRecords]);

  const handleSetActiveTab = useCallback((tab: string) => {
    if (tab === "status" || tab === "followups") {
      setActiveTab(tab);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Debug logging
  useEffect(() => {
    console.log("Patient Data:", patientData);
    console.log("Patient DOB:", patientDOB);
    console.log("Vaccination Records Count:", vaccinationRecords?.length);

    // Additional debug: log the structure of the first record
    if (vaccinationRecords && vaccinationRecords.length > 0) {
      console.log("First record structure:", {
        hasPatient: !!vaccinationRecords[0].patient,
        patientKeys: vaccinationRecords[0].patient ? Object.keys(vaccinationRecords[0].patient) : "No patient"
      });
    }
  }, [patientData, patientDOB, vaccinationRecords]);

  if (isError) {
    return (
      <>
        <PageLayout
          leftAction={
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
          }
          headerTitle={<Text className="text-slate-900 text-[13px]">Records</Text>}
          rightAction={<View className="w-10 h-10" />}
        >
          {" "}
          <NoRecordsCard />;
        </PageLayout>
      </>
    );
  }

  if (isLoading){
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <LoadingState />
    </PageLayout>
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}>
        {/* Patient Info Card - Only show if we have patient data */}
        {patientData && (
          <View className="px-4 pt-4 bg-white">
            <PatientInfoCard patient={patientData} />
          </View>
        )}

        {/* Vaccination Status Cards */}
      
     =
            <View className="px-4 mt-4">
              <View className="flex-row border-b border-gray-200">
                <TouchableOpacity
                  onPress={() => handleSetActiveTab("status")}
                  className={`flex-1 py-3 items-center ${
                    activeTab === "status" ? "border-b-2 border-blue-600" : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeTab === "status" ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Vaccination Status
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSetActiveTab("followups")}
                  className={`flex-1 py-3 items-center ${
                    activeTab === "followups" ? "border-b-2 border-blue-600" : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeTab === "followups" ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    Follow-ups
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-col gap-4 mt-4">
                {activeTab === "status" && (
                  <VaccinationStatusCards
                    unvaccinatedVaccines={unvaccinatedVaccines}
                    vaccinations={vaccinations}
                  />
                )}
                {activeTab === "followups" && (
                  <FollowUpsCard followupVaccines={followupVaccines} />
                )}
              </View>
            </View>
        

        <View className="p-4 mt-4">
          <View className="flex-row items-center px-2 border border-gray-300 bg-gray-50 rounded-lg shadow-sm">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search by vaccine name, batch number..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isSearching && (
              <View className="ml-2">
                <RefreshCw size={16} color="#3B82F6" className="animate-spin" />
              </View>
            )}
          </View>
        </View>
        <View className="px-4 flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-600">
              Showing {startEntry} to {endEntry} of {totalCount} records
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-gray-800">
              Page {currentPage} of {totalPages}
            </Text>
          </View>
        </View>

        {isVaccinationRecordsLoading || isSearching ? (
          <View className="flex-1 items-center justify-center py-8">
            <View className="items-center justify-center">
              <RefreshCw size={32} color="#3B82F6" className="animate-spin" />
              <Text className="text-gray-600 mt-2">{isSearching ? "Searching records..." : "Loading vaccination records..."}</Text>
            </View>
          </View>
        ) : (
          <>
            <FlatList
              data={paginatedRecords}
              keyExtractor={(item) => `vaccination-record-${item.vachist_id}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              renderItem={({ item }) => <VaccinationRecordCard record={item} />}
              ListFooterComponent={
                isVaccinationFetching ? (
                  <View className="py-4 items-center">
                    <RefreshCw size={20} color="#3B82F6" className="animate-spin" />
                    <Text className="text-gray-600 text-sm mt-1">Loading more records...</Text>
                  </View>
                ) : null
              }
            />
            <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalCount} pageSize={pageSize} onPageChange={handlePageChange} />
          </>
        )}
      </ScrollView>
    </PageLayout>
  );
}
