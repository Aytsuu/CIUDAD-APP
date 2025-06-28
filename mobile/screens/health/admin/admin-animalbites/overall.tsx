import React, { useState, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { Search, PlusCircle, ChevronLeft, AlertCircle, Package } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { format } from "date-fns";
import { useUniqueAnimalbitePatientsData } from "../restful-api/animalbites/db-request/get-query";

// Type definition for mobile display, adjusted to match AnimalBitePatientRecordCountSerializer
type PatientDisplay = {
  patient_id: string; // The ID to navigate by
  patient_fname: string;
  patient_lname: string;
  patient_sex: string;
  patient_age: number;
  patient_type: string; // 'Resident' or 'Transient'
  record_count: number; // The count of records for this unique patient
  latest_record_date: string; // The latest referral date
};


export default function AnimalBiteOverallScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data: patientData, isLoading, isError, error, refetch } = useUniqueAnimalbitePatientsData();

  const patients: PatientDisplay[] = useMemo(() => {
    if (!patientData) return [];

    return patientData.map((patient: any) => ({
      patient_id: patient.patient_id,
      patient_fname: patient.patient_fname,
      patient_lname: patient.patient_lname,
      patient_gender: patient.patient_gender,
      patient_age: patient.patient_age,
      referral_date: patient.latest_record_date, // Using latest referral date as main date
      patient_type: patient.pat_type,
      record_count: patient.record_count,
    }));
  }, [patientData]);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return patients;
    return patients.filter(patient =>
      patient.patient_fname.toLowerCase().includes(query) ||
      patient.patient_lname.toLowerCase().includes(query) ||
      patient.patient_id.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#263D67" />
        <Text className="text-gray-600 font-PoppinsRegular mt-4">Loading patient records...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-xl font-PoppinsSemiBold text-[#EF4444] mt-4">Error Loading Data</Text>
        <Text className="text-gray-600 font-PoppinsRegular mt-2 text-center">
          {error?.message || "Failed to fetch patient records. Please try again."}
        </Text>
        <TouchableOpacity onPress={() => refetch()} className="mt-6 bg-[#263D67] px-8 py-3 rounded-xl shadow-sm">
          <Text className="text-white font-PoppinsMedium text-base">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDateSafely = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) { // getTime() returns NaN for Invalid Date objects
      return 'Invalid Date'; // Or 'N/A' or an error message as preferred
    }
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header Section */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center py-2">
          <ChevronLeft size={20} color="#263D67" />
          <Text className="text-[#263D67] text-base font-PoppinsMedium ml-1">Back</Text>
        </TouchableOpacity>

        <View className="pt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-PoppinsBold text-[#263D67]">Animal Bite Records</Text>
            <Text className="text-base font-PoppinsRegular text-gray-500">Manage patient referrals</Text>
          </View>

        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-4 border border-gray-200">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-800 font-PoppinsRegular"
            placeholder="Search patients..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-2"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#263D67"]} tintColor="#263D67" />}
        showsVerticalScrollIndicator={false}
      >
        {filteredPatients.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Package size={56} color="#D1D5DB" />
            <Text className="text-xl font-PoppinsSemiBold text-gray-600 mt-4">No patients found</Text>
            <Text className="text-gray-500 font-PoppinsRegular mt-2 text-center px-4">
              Try adjusting your search query.
            </Text>
          </View>
        ) : (
          <View className="pb-8">
            {filteredPatients.map((patient) => (
              <TouchableOpacity
                key={patient.patient_id}
                onPress={() => router.push({
                  pathname: "/(health)/admin/animalbites/individual",
                  params: { pat_id: patient.patient_id }
                })}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-PoppinsSemiBold text-[#263D67]">
                      {patient.patient_fname} {patient.patient_lname}
                    </Text>
                    <Text className="text-sm font-PoppinsRegular text-gray-600">
                      ID: {patient.patient_id}
                    </Text>
                  </View>
                  <View className="px-2 py-1 rounded-full bg-blue-100">
                    <Text className="text-xs font-PoppinsMedium text-blue-700">
                      {patient.patient_type}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center border-t border-gray-100 pt-2 mt-2">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-PoppinsRegular text-gray-500">
                      Age: <Text className="font-PoppinsMedium">{patient.patient_age}</Text>
                    </Text>
                    <Text className="text-sm font-PoppinsRegular text-gray-500 ml-4">
                      Gender: <Text className="font-PoppinsMedium">{patient.patient_sex}</Text>
                    </Text>
                  </View>
                   <Text className="text-sm font-PoppinsRegular text-gray-500">
                    Records: <Text className="font-PoppinsMedium">{patient.record_count}</Text>
                  </Text>
                </View>
                <Text className="text-xs font-PoppinsRegular text-gray-500 mt-1">
                  Last Record: {formatDateSafely(patient.latest_record_date)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}