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
import { PaginationControls } from "../components/pagination-layout";
import { useIndivPatientVaccinationRecords, useFollowupVaccines, useUnvaccinatedVaccines, usePatientVaccinationDetails } from "./queries/fetch";
import { PatientInfoCard } from "../components/patientcards";
import { VaccinationStatusCards } from "../components/vaccination-status-cards";
import { FollowUpsCard } from "../components/followup-cards";
import { SignatureModal } from "../components/signature-modal";

// Helper function for ordinal suffixes
const getOrdinalSuffix = (num: number): string => {
  if (num === undefined || num === null) return "";

  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return num + "st";
  }
  if (j === 2 && k !== 12) {
    return num + "nd";
  }
  if (j === 3 && k !== 13) {
    return num + "rd";
  }
  return num + "th";
};

// Vaccination Record Card Component
const VaccinationRecordCard: React.FC<{
  record: any;
}> = ({ record }) => {
  const [sigModalVisible, setSigModalVisible] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

  const formattedDose = getOrdinalSuffix(record.vachist_doseNo ? parseInt(record.vachist_doseNo, 10) : 0);

  return (
    <View className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm">
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-50 border border-blue-500 rounded-full items-center justify-center mr-3 shadow-sm">
                <Syringe color="#2563EB" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">{record.vaccine_name}</Text>
                <Text className="text-gray-500 text-sm">Batch: {record.batch_number || "N/A"}</Text>
              </View>
            </View>
          </View>
          <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Text className="text-blue-800 text-sm font-medium">{formattedDose} Dose</Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View className="p-4">
        {/* Date Administered */}
        <View className="flex-row items-center mb-3">
          <Calendar size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Date Administered: <Text className="font-medium text-gray-900">{formatDate(record.date_administered)}</Text>
          </Text>
        </View>

        {/* Status */}
        <View className="flex-row items-center mb-3">
          <View className={`px-3 py-1 rounded-full ${record.vachist_status === "completed" ? "bg-green-100 border border-green-200" : record.vachist_status === "partially vaccinated" ? "bg-yellow-100 border border-yellow-200" : "bg-gray-100 border border-gray-200"}`}>
            <Text className={`text-sm font-medium ${record.vachist_status === "completed" ? "text-green-800" : record.vachist_status === "partially vaccinated" ? "text-yellow-800" : "text-gray-800"}`}>{record.vachist_status}</Text>
          </View>
        </View>

        {/* Vital Signs */}
        {record.vital_signs && (
          <View className="mb-3 pt-3 border-t border-gray-100">
            <Text className="text-sm font-medium text-gray-700 mb-2">Vital Signs:</Text>
            <View className="flex-row flex-wrap gap-2">
              {record.vital_signs.vital_bp_systolic && record.vital_signs.vital_bp_diastolic && (
                <View className="bg-gray-50 px-3 py-1 rounded border border-gray-200">
                  <Text className="text-xs text-gray-600">
                    BP: {record.vital_signs.vital_bp_systolic}/{record.vital_signs.vital_bp_diastolic} mmHg
                  </Text>
                </View>
              )}
              {record.vital_signs.vital_temp && (
                <View className="bg-gray-50 px-3 py-1 rounded border border-gray-200">
                  <Text className="text-xs text-gray-600">Temp: {record.vital_signs.vital_temp}°C</Text>
                </View>
              )}
              {record.vital_signs.vital_pulse && (
                <View className="bg-gray-50 px-3 py-1 rounded border border-gray-200">
                  <Text className="text-xs text-gray-600">PR: {record.vital_signs.vital_pulse}</Text>
                </View>
              )}
              {record.vital_signs.vital_o2 && (
                <View className="bg-gray-50 px-3 py-1 rounded border border-gray-200">
                  <Text className="text-xs text-gray-600">O2: {record.vital_signs.vital_o2}%</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Next Dose Schedule */}
        {record.follow_up_visit && (
          <View className="mb-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Calendar size={16} color="#6B7280" />
              <Text className="ml-2 text-gray-600 text-sm">
                Next Dose: <Text className="font-medium text-gray-900">{record.follow_up_visit.followv_status?.toLowerCase() === "completed" ? "Completed" : record.follow_up_visit.followv_date ? formatDate(record.follow_up_visit.followv_date) : "No Schedule"}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Signature Section */}
        {record.signature && (
          <View className="pt-3 border-t border-gray-100">
            <TouchableOpacity onPress={() => setSigModalVisible(true)} className="flex-row items-center">
              <FileText size={16} color="#6B7280" />
              <Text className="ml-2 text-blue-600 text-sm">View Signature</Text>
            </TouchableOpacity>
            <SignatureModal signature={record.signature} isVisible={sigModalVisible} onClose={() => setSigModalVisible(false)} />
          </View>
        )}
      </View>
    </View>
  );
};

export default function IndividualVaccinationRecords() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Fixed page size - no longer editable
  const [activeTab, setActiveTab] = useState("status");

  const queryClient = useQueryClient();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Parse patient data from params
  const patientData: any | null = useMemo(() => {
    try {
      if (params.patientData && typeof params.patientData === "string") {
        return JSON.parse(params.patientData);
      }
      return null;
    } catch (error) {
      console.error("Error parsing patient data:", error);
      return null;
    }
  }, [params.patientData]);

  // Use vaccination queries
  const { data: vaccinationRecords, isLoading: isVaccinationRecordsLoading, refetch: refetchVaccinationRecords, isFetching: isVaccinationFetching } = useIndivPatientVaccinationRecords(patientData?.pat_id || "");

  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(patientData?.pat_id, patientData?.personal_info?.per_dob);

  const { data: followupVaccines = [], isLoading: isFollowVaccineLoading } = useFollowupVaccines(patientData?.pat_id);

  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(patientData?.pat_id);

  const isLoading = isCompleteVaccineLoading || isUnvaccinatedLoading || isFollowVaccineLoading || isVaccinationRecordsLoading;

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

  // Get paginated records
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Calculate current entries being shown
  const startEntry = filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(currentPage * pageSize, totalCount);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchVaccinationRecords();
      setCurrentPage(1); // Reset to first page on refresh
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

  // Guard clause for missing patient data
  if (!patientData?.pat_id) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Vaccination Records</Text>}
      >
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
          <AlertCircle size={64} color="#EF4444" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">Patient Not Found</Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">No patient data was provided. Please select a patient first.</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  if (isLoading && !vaccinationRecords?.length) {
    return <LoadingState />;
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
      <ScrollView className="flex-1 " refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}>
        {/* Patient Info Card */}
        <View className="px-4 pt-4 bg-white">
          <PatientInfoCard patient={patientData} />
        </View>

        {/* Vaccination Status Cards */}
        {!isLoading && (
          <View className="px-4 mt-4">
            <View className="flex-row border-b border-gray-200">
              <TouchableOpacity onPress={() => handleSetActiveTab("status")} className={`flex-1 py-3 items-center ${activeTab === "status" ? "border-b-2 border-blue-600" : ""}`}>
                <Text className={`text-sm font-medium ${activeTab === "status" ? "text-blue-600" : "text-gray-600"}`}>Vaccination Status</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSetActiveTab("followups")} className={`flex-1 py-3 items-center ${activeTab === "followups" ? "border-b-2 border-blue-600" : ""}`}>
                <Text className={`text-sm font-medium ${activeTab === "followups" ? "text-blue-600" : "text-gray-600"}`}>Follow-ups</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-col gap-4 mt-4">
              {activeTab === "status" && <VaccinationStatusCards unvaccinatedVaccines={unvaccinatedVaccines} vaccinations={vaccinations} />}
              {activeTab === "followups" && <FollowUpsCard followupVaccines={followupVaccines} />}
            </View>
          </View>
        )}

        {/* Search and Summary */}
        <View className="p-4 mt-4">
          {/* Search */}
          <View className="flex-row items-center px-2 border p-2 border-gray-300 bg-gray-50 rounded-lg shadow-sm">
            <Search size={20} color="#6B7280" />
            <TextInput className="flex-1 ml-3 text-gray-800 text-base" placeholder="Search by vaccine name, batch number..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        </View>

        {/* Entries Summary */}
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

        {/* Records List */}
        <View className="px-4 pb-4">
          {filteredRecords.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
              <Syringe size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">{debouncedSearchQuery ? "No matching records found" : "No vaccination records found"}</Text>
              <Text className="text-gray-600 text-center mt-2 mb-4">{debouncedSearchQuery ? "Try adjusting your search terms." : "This patient doesn't have any vaccination records yet."}</Text>
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
                    </View>
                  ) : null
                }
              />

              {/* Pagination Controls */}
              <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalCount} pageSize={pageSize} onPageChange={handlePageChange} />
            </>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}
