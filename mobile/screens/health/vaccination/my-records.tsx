// screens/vaccination/my-records.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getPatientById, getPatientByResidentId } from "../animalbites/api/get-api";
import { View, TouchableOpacity, TextInput, RefreshControl, FlatList, Image } from "react-native";
import { Search, ChevronLeft, AlertCircle, Syringe, RefreshCw, FileText, Calendar, Package } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { format, parseISO, isValid } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { PaginationControls } from "../admin/components/pagination-layout";
import { useIndivPatientVaccinationRecords, useFollowupVaccines, useUnvaccinatedVaccines, usePatientVaccinationDetails } from "./queries/fetch";
import { PatientInfoCard } from "../admin/components/patientcards";
import { VaccinationStatusCards } from "../admin/components/vaccination-status-cards";
import { FollowUpsCard } from "../admin/components/followup-cards";
import { SignatureModal } from "../admin/components/signature-modal";
import { Card, CardContent } from "@/components/ui/card";

// Helper function for ordinal suffixes
const getOrdinalSuffix = (num: number): string => {
  if (num === undefined || num === null) return "";
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return num + "st";
  if (j === 2 && k !== 12) return num + "nd";
  if (j === 3 && k !== 13) return num + "rd";
  return num + "th";
};

// Define VaccinationRecord type to match API response
interface VaccinationRecord {
  vachist_id: string | number;
  vachist_date: string;
  date_administered: string;
  dose_number: number;
  vachist_doseNo: number;
  vachist_dosage: string;
  vachist_remarks?: string;
  vachist_signature?: string;
  vachist_status: string;
  signature?: string;
  vaccine_detail?: {
    vac_name?: string;
  };
  vaccine_stock?: {
    vaccinelist?: {
      vac_name?: string;
    };
  };
}

// Vaccination Record Card Component - FIXED
const VaccinationRecordCard: React.FC<{ record: VaccinationRecord }> = ({ record }) => {
  const [sigModalVisible, setSigModalVisible] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM dd, yyyy") : "Invalid date";
    } catch {
      return "Invalid date";
    }
  };

  // Get vaccine name from different possible locations in the API response
  const getVaccineName = () => {
    return record.vaccine_stock?.vaccinelist?.vac_name || 
           record.vaccine_detail?.vac_name || 
           "Unknown Vaccine";
  };

  // Get dose number
  const getDoseNumber = () => {
    return record.vachist_doseNo || record.dose_number || 1;
  };

  return (
    <Card className="mb-3 bg-white border border-gray-200">
      <CardContent className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center">
            <Calendar size={16} color="#64748B" />
            <Text className="ml-2 text-slate-600 text-sm">
              {formatDate(record.date_administered || record.vachist_date || "")}
            </Text>
          </View>
        </View>

        <View className="mb-3">
          <Text className="font-semibold text-lg text-slate-900 mb-1">
            {getVaccineName()}
          </Text>
          <Text className="text-slate-600 text-sm">
            {getOrdinalSuffix(getDoseNumber())} Dose •{" "}
            <Text className={`font-medium ${
              record.vachist_status === "completed" ? "text-green-600" : 
              record.vachist_status === "pending" ? "text-yellow-600" : "text-gray-600"
            }`}>
              {record.vachist_status || "Unknown"}
            </Text>
          </Text>
        </View>

        {record.vachist_dosage && (
          <View className="flex-row items-center mb-3">
            <Package size={16} color="#64748B" />
            <Text className="ml-2 text-slate-600 text-sm">
              Dosage: <Text className="text-slate-900 font-medium">{record.vachist_dosage}</Text>
            </Text>
          </View>
        )}

        {record.vachist_remarks && (
          <View className="mb-3">
            <Text className="text-slate-600 text-sm mb-1">Remarks:</Text>
            <Text className="text-slate-900">{record.vachist_remarks}</Text>
          </View>
        )}

        {(record.vachist_signature || record.signature) && (
          <View className="mt-3 pt-3 border-t border-slate-200">
            <Text className="text-slate-600 text-sm mb-2">Patient Signature:</Text>
            <TouchableOpacity onPress={() => setSigModalVisible(true)}>
              <Image 
                source={{ uri: `data:image/png;base64,${record.vachist_signature || record.signature}` }}
                className="h-16 w-40 border border-slate-200 rounded-md"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <SignatureModal
              isVisible={sigModalVisible}
              onClose={() => setSigModalVisible(false)}
              signature={record.vachist_signature || record.signature}
            />
          </View>
        )}
      </CardContent>
    </Card>
  );
};

export default function MyVaccinationRecordsScreen() {
  const params = useLocalSearchParams<{ pat_id?: string }>();
  const patIdFromParams = params.pat_id;
  const { user } = useAuth();
  const rp_id = user?.resident?.rp_id;

  console.log("[DEBUG] my-records patIdFromParams:", patIdFromParams);
  console.log("[DEBUG] rp_id from auth:", rp_id);

  // Fetch patient data
  const { data: patientData, isLoading: isLoadingPatient, isError: isErrorPatient, error: errorPatient, refetch: refetchPatient } = useQuery({
    queryKey: ["patientDetails", patIdFromParams || rp_id],
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
    staleTime: 5 * 60 * 1000,
  });

  const patient_id = patIdFromParams || user.pat_id;
  console.log("[DEBUG] patient_id used for Vaccination records:", patient_id);

  // Fetch vaccination records - FIXED: Remove .results access
  const { data: vaccinationRecords, isLoading: isLoadingRecords, isError: isErrorRecords, error: errorRecords, refetch: refetchRecords } = useIndivPatientVaccinationRecords(patient_id);

  // Debug vaccinationRecords - FIXED
  console.log("[DEBUG] vaccinationRecords:", vaccinationRecords);
  console.log("[DEBUG] vaccinationRecords type:", typeof vaccinationRecords);
  console.log("[DEBUG] vaccinationRecords is array?:", Array.isArray(vaccinationRecords));

  // Fetch followup and unvaccinated vaccines
  const { data: followupVaccines } = useFollowupVaccines(patient_id);
  const { data: unvaccinatedVaccines } = useUnvaccinatedVaccines(patient_id);
  const { data: vaccinationDetails } = usePatientVaccinationDetails(patient_id);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // FIXED: Handle both array and object with results property
  const filteredRecords = useMemo(() => {
    console.log("[DEBUG] Processing filteredRecords, debouncedSearchQuery:", debouncedSearchQuery);
    
    let recordsArray: VaccinationRecord[] = [];
    
    // Handle different possible response structures
    if (Array.isArray(vaccinationRecords)) {
      recordsArray = vaccinationRecords;
    } else if (vaccinationRecords && Array.isArray(vaccinationRecords.results)) {
      recordsArray = vaccinationRecords.results;
    } else if (vaccinationRecords && typeof vaccinationRecords === 'object') {
      // If it's an object but not array, try to convert it to array
      recordsArray = Object.values(vaccinationRecords).filter(item => 
        item && typeof item === 'object' && 'vachist_id' in item
      ) as VaccinationRecord[];
    }
    
    console.log("[DEBUG] recordsArray length:", recordsArray.length);
    console.log("[DEBUG] recordsArray:", recordsArray);

    if (recordsArray.length === 0) {
      return [];
    }

    const lowerQuery = debouncedSearchQuery.toLowerCase();
    const filtered = recordsArray.filter((record: VaccinationRecord) => {
      const vaccineName = record.vaccine_stock?.vaccinelist?.vac_name || 
                         record.vaccine_detail?.vac_name || 
                         "";
      const nameMatch = vaccineName.toLowerCase().includes(lowerQuery);
      const remarksMatch = record.vachist_remarks?.toLowerCase()?.includes(lowerQuery) || false;
      console.log("[DEBUG] Record:", record.vachist_id, "Vaccine:", vaccineName, "Matches:", { nameMatch, remarksMatch });
      return nameMatch || remarksMatch;
    });
    
    console.log("[DEBUG] filteredRecords length:", filtered.length);
    return filtered;
  }, [vaccinationRecords, debouncedSearchQuery]);

  const totalCount = filteredRecords.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchRecords();
    await refetchPatient();
    setRefreshing(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (isLoadingPatient || isLoadingRecords) {
    return <LoadingState />;
  }

  if (isErrorPatient || (isErrorRecords && (!errorRecords.response || errorRecords.response.status !== 404))) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-red-50">
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-xl font-semibold text-red-800 mt-4">
          {isErrorPatient ? "Patient Not Found" : "Error Loading Records"}
        </Text>
        <Text className="text-gray-600 mt-2 text-center">
          {(errorPatient || errorRecords)?.message ?? "Please try again later."}
        </Text>
        <View className="flex-row mt-4 space-x-4">
          <TouchableOpacity onPress={onRefresh} className="bg-blue-600 px-4 py-2 rounded-lg">
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} className="bg-gray-600 px-4 py-2 rounded-lg">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!patient_id && !user) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <AlertCircle size={48} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">Authentication Required</Text>
        <Text className="text-gray-500 mt-2 text-center">Please log in to view your vaccination records.</Text>
      </View>
    );
  }

  if (!patientData) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-gray-50">
        <AlertCircle size={48} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-800 mt-4">Patient Not Found</Text>
        <Text className="text-gray-500 mt-2 text-center">No patient data available for this ID.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      headerTitle={<Text className="text-slate-900 text-lg font-semibold">{patIdFromParams ? 'Vaccination Records' : 'My Vaccination Records'}</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Uncomment if you have PatientInfoCard component */}
        {/* <PatientInfoCard patientData={patientData} /> */}
        
        <VaccinationStatusCards
          followupVaccines={followupVaccines}
          unvaccinatedVaccines={unvaccinatedVaccines}
          vaccinationDetails={vaccinationDetails}
        />

        <FollowUpsCard followupVaccines={followupVaccines} />

        <View className="mx-4 mb-4">
          <View className="flex-row items-center p-3 border border-gray-200 bg-white rounded-xl">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search records..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <FlatList
          data={paginatedRecords}
          renderItem={({ item }) => <VaccinationRecordCard record={item} />}
          keyExtractor={(item) => `vaccination-record-${item.vachist_id}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="px-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Records ({filteredRecords.length})
              </Text>
            </View>
          }
          ListEmptyComponent={() => (
            <View className="justify-center items-center py-20">
              <FileText size={48} color="#D1D5DB" />
              <Text className="text-gray-600 text-lg font-semibold mb-2 mt-4">
                No records found
              </Text>
              <Text className="text-gray-500 text-center">
                {searchQuery
                  ? "No records match your search criteria."
                  : "No vaccination records available for this patient."}
              </Text>
            </View>
          )}
        />

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </View>
    </PageLayout>
  );
}