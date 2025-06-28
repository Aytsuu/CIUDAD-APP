// overall.tsx
import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { Search, PlusCircle, ChevronLeft, AlertCircle, Package, User, Badge } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { format } from "date-fns";
import { useUniqueAnimalbitePatientsData } from "../restful-api/animalbites/db-request/get-query"; // Correct import

// Type definition for mobile display, adjusted to match AnimalBitePatientRecordCountSerializer
type PatientDisplay = {
  patient_id: string; // The ID to navigate by
  patient_fname: string;
  patient_lname: string;
  patient_sex: string;
  patient_age: number;
  patient_type: string; // 'Resident' or 'Transient'
  latest_record_date: string; // The latest referral date
};

export default function AnimalBiteOverallScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Use the correct hook to fetch unique/aggregated patient data
  const { data: patientData, isLoading, isError, error, refetch } = useUniqueAnimalbitePatientsData();

  // Memoize the patients data to prevent unnecessary re-renders
  const patients: PatientDisplay[] = useMemo(() => {
    if (!patientData) return [];

    // Map the incoming data to the PatientDisplay type
    return patientData.map((patient: any) => ({
      patient_id: patient.patient_id,
      patient_fname: patient.patient_fname,
      patient_lname: patient.patient_lname,
      patient_sex: patient.patient_sex,
      patient_age: patient.patient_age,
      patient_type: patient.patient_type,
      latest_record_date: patient.latest_record_date,
    }));
  }, [patientData]);

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery) {
      return patients;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.patient_fname.toLowerCase().includes(lowerCaseQuery) ||
        patient.patient_lname.toLowerCase().includes(lowerCaseQuery) ||
        patient.patient_id.toLowerCase().includes(lowerCaseQuery)
    );
  }, [patients, searchQuery]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch(); // Refetch the data
    setRefreshing(false);
  }, [refetch]);

  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Loading patient list...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <Text className="text-red-500 text-lg font-bold mb-2">Error</Text>
        <Text className="text-gray-700 text-center">
          Failed to load patient data. {error?.message || "Please try again later."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Animal Bite Records</Text>
      </View>

      <View className="p-4">
        <View className="flex-row items-center bg-white rounded-lg shadow-sm px-4 py-3 mb-4 border border-gray-200">
          <Search size={20} color="#888" className="mr-3" />
          <TextInput
            className="flex-1 text-base text-gray-800"
            placeholder="Search patient by name or ID"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {filteredPatients.length === 0 && !isLoading && !isError ? (
          <View className="flex-1 justify-center items-center py-16">
            <Package className="text-gray-400 mb-4" size={48} />
            <Text className="text-gray-600 text-lg font-bold mb-2">No Patients Found</Text>
            <Text className="text-gray-500 text-center">
              {searchQuery ? "No patients match your search criteria." : "There are no animal bite patients recorded yet."}
            </Text>
            <TouchableOpacity onPress={() => {/* Add navigation to create new record if applicable */}} className="mt-6 px-6 py-3 bg-blue-500 rounded-lg">
              <Text className="text-white font-semibold">Add New Record</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {filteredPatients.map((patient) => (
              <TouchableOpacity
                key={patient.patient_id}
                onPress={() => {
                  console.log("Navigating to patient ID:", patient.patient_id); // Log for debugging
                  router.push("/(health)/admin/animalbites/individual/[patientId]");
                }}
                className="bg-white rounded-lg shadow-sm p-5 border border-gray-100"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <User size={20} color="#3b82f6" className="mr-3" />
                    <View>
                      <Text className="font-bold text-lg text-gray-800">
                        {patient.patient_fname} {patient.patient_lname}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        ID: {patient.patient_id}
                      </Text>
                    </View>
                  </View>
                  <Text className={`px-2 py-1 text-sm rounded-full ${patient.patient_type === 'Transient'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-green-200 bg-green-50 text-green-700'
                      }`}
                  >
                    {patient.patient_type}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center border-t border-gray-100 pt-2 mt-2">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-semibold text-gray-500">
                      Age: <Text className="text-sm text-black font-normal">{patient.patient_age}</Text>
                    </Text>
                    <Text className="text-sm font-semibold text-gray-500 ml-4">
                      Gender: <Text className="text-sm text-black font-normal">{patient.patient_sex}</Text>
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold text-gray-500">
                    Last Record: <Text className="text-xs text-black font-normal">{formatDateSafely(patient.latest_record_date)}</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}