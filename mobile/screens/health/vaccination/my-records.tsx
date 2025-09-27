import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getPatientById, getPatientByResidentId } from "../animalbites/api/get-api";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, ScrollView, Image, Platform, Modal } from "react-native";
import { Search, ChevronLeft, AlertCircle, Syringe, RefreshCw, FileText, Calendar, X } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { format, parseISO, isValid } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { PaginationControls } from "../admin/components/pagination-layout";
import { useIndivPatientVaccinationRecords, useUnvaccinatedVaccines, useFollowupVaccines, usePatientVaccinationDetails } from "./queries/fetch";
import { PatientInfoCard } from "../admin/components/patientcards";
import { VaccinationStatusCards } from "../admin/components/vaccination-status-cards";
import { FollowUpsCard } from "../admin/components/followup-cards";
import { getOrdinalSuffix } from "@/helpers/getOrdinalSuffix";

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

  const renderSignature = () => {
    // Only render signature on mobile platforms (iOS/Android)
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return null; // Do not show signature on web
    }

    if (!record.signature) {
      return (
        <Text className="text-gray-500 text-sm italic">No signature</Text>
      );
    }

    // Construct data URL for base64-encoded signature
    const signatureUri = `data:image/png;base64,${record.signature}`;
    return (
      <TouchableOpacity onPress={() => setSigModalVisible(true)}>
        <Image
          source={{ uri: signatureUri }}
          style={{ width: 100, height: 50, resizeMode: "contain" }}
          className="mt-2"
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
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
                  <Text className="font-semibold text-lg text-gray-900 truncate">{record.vaccine_name}</Text>
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
          {/* Two-Column Row: Vaccine Name and Batch Number */}
          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-gray-600 text-sm">Vaccine</Text>
              <Text className="text-gray-800 font-medium truncate">{record.vaccine_name || "N/A"}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm">Batch Number</Text>
              <Text className="text-gray-800 font-medium">{record.batch_number || "N/A"}</Text>
            </View>
          </View>

          {/* Two-Column Row: Date Administered and Status */}
          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center">
                <Calendar size={16} color="#6B7280" />
                <Text className="ml-2 text-gray-600 text-sm">
                  {formatDate(record.date_administered)}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <View className={`px-3 py-1 rounded-full ${record.vachist_status === "completed" ? "bg-green-100 border border-green-200" : record.vachist_status === "partially vaccinated" ? "bg-yellow-100 border border-yellow-200" : "bg-gray-100 border border-gray-200"}`}>
                <Text className={`text-sm font-medium ${record.vachist_status === "completed" ? "text-green-800" : record.vachist_status === "partially vaccinated" ? "text-yellow-800" : "text-gray-800"}`}>{record.vachist_status}</Text>
              </View>
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

          {/* Signature Section (Mobile Only) */}
          {(Platform.OS === "ios" || Platform.OS === "android") && (
            <View className="pt-3 border-t border-gray-100">
              <Text className="text-gray-600 text-sm font-medium">Signature:</Text>
              {renderSignature()}
            </View>
          )}
        </View>
      </View>

      {/* Signature Modal */}
      <Modal
        visible={sigModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSigModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-white rounded-xl p-4 w-[90%] max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Signature</Text>
              <TouchableOpacity onPress={() => setSigModalVisible(false)}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: `data:image/png;base64,${record.signature}` }}
              style={{ width: "100%", height: 200, resizeMode: "contain" }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function MyVaccinationRecordsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("status");
  const pageSize = 10;
  const queryClient = useQueryClient();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const params = useLocalSearchParams<{ pat_id?: string }>();
  const patIdFromParams = params.pat_id;
  const { user } = useAuth();
  const rp_id = user?.rp;

  console.log("[DEBUG] patIdFromParams:", patIdFromParams);
  console.log("[DEBUG] rp_id from auth:", rp_id);
  console.log("[DEBUG] user:", user);

  // Fetch patient data
  const { data: patientData, isLoading: isPatientLoading, isError: isPatientError, refetch: refetchPatientData } = useQuery({
    queryKey: ["patient_Details", patIdFromParams || rp_id],
    queryFn: async () => {
      if (patIdFromParams) {
        console.log(`🔍 Fetching patient with ID: ${patIdFromParams}`);
        return await getPatientById(patIdFromParams);
      } else if (rp_id) {
        console.log(`🔍 Fetching patient with resident ID: ${rp_id}`);
        return await getPatientByResidentId(rp_id);
      }
      return null;
    },
    enabled: !!(patIdFromParams || rp_id),
  });

  // Invalidate queries when pat_id changes to prevent stale data
  useEffect(() => {
    if (patIdFromParams) {
      queryClient.invalidateQueries({ queryKey: ["patient_Details", patIdFromParams] });
      queryClient.invalidateQueries({ queryKey: ["indivPatientVaccinationRecords", patIdFromParams] });
    }
  }, [patIdFromParams, queryClient]);

  // Use vaccination queries for the patient
  const { data: vaccinationRecords, isLoading: isVaccinationRecordsLoading, refetch: refetchVaccinationRecords, isFetching: isVaccinationFetching } = useIndivPatientVaccinationRecords(patIdFromParams || patientData?.pat_id || "");
  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } = useUnvaccinatedVaccines(patIdFromParams || patientData?.pat_id, patientData?.personal_info?.per_dob);
  const { data: followupVaccines = [], isLoading: isFollowVaccineLoading } = useFollowupVaccines(patIdFromParams || patientData?.pat_id);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } = usePatientVaccinationDetails(patIdFromParams || patientData?.pat_id);

  const isLoading = isPatientLoading || isCompleteVaccineLoading || isUnvaccinatedLoading || isFollowVaccineLoading || isVaccinationRecordsLoading;

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
      await Promise.all([refetchPatientData(), refetchVaccinationRecords()]);
      setCurrentPage(1);
    } catch (e) {
      console.error("Refetch error:", e);
    }
    setRefreshing(false);
  }, [refetchPatientData, refetchVaccinationRecords]);

  const handleSetActiveTab = useCallback((tab: string) => {
    if (tab === "status" || tab === "followups") {
      setActiveTab(tab);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  if (!user && !patIdFromParams) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center max-w-sm">
          <Syringe size={48} color="#9CA3AF" />
          <Text className="text-gray-600 text-xl font-bold mb-2 mt-4">Authentication Required</Text>
          <Text className="text-gray-500 text-center leading-6">Please log in to view your vaccination records.</Text>
        </View>
      </View>
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
      headerTitle={<Text className="text-slate-900 text-[13px]">Vaccination Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}>
        {/* Patient Info Card */}
        {patientData && (
          <View className="px-4 pt-4">
            <PatientInfoCard patient={patientData} />
          </View>
        )}

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
        <View className="p-4">
          <View className="flex-row items-center px-2 border border-gray-300 bg-gray-50 rounded-lg shadow-sm">
            <Search size={20} color="#6B7280" />
            <TextInput className="flex-1 p-2 ml-3 text-gray-800 text-base" placeholder="Search by vaccine name, batch number..." placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        </View>

        {/* Entries Summary */}
        <View className="px-4 flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-600">
            Showing {startEntry} to {endEntry} of {totalCount} records
          </Text>
          <Text className="text-sm font-medium text-gray-800">
            Page {currentPage} of {totalPages}
          </Text>
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
              <PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={totalCount} pageSize={pageSize} onPageChange={handlePageChange} />
            </>
          )}
        </View>
      </ScrollView>
    </PageLayout>
  );
}