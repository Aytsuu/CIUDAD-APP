// individual.tsx
import React, { useMemo } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { ChevronLeft, User, FileText, Archive, AlertCircle, Package } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { usePatientRecordsByPatId } from "../restful-api/animalbites/db-request/get-query"; // Correct import for individual patient records
import { format } from "date-fns";

// Type definition for individual patient records
type PatientRecordDetail = {
  bite_id: number;
  actions_taken: string;
  referredby: string;
  biting_animal: string;
  exposure_site: string;
  exposure_type: string;
  patient_fname: string;
  patient_lname: string;
  patient_sex: string;
  patient_age: number;
  patient_address: string; // This should come from the serializer now
  patient_id: string;
  patient_type: string;
  referral_id: number;
  referral_date: string; // This should come from the serializer now
};

export default function AnimalBiteIndividualScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>(); // Ensure patientId is typed as string

  // Use the correct hook to fetch records for a specific patient ID
  const { data: records, isLoading, isError, error } = usePatientRecordsByPatId(patientId);

  // Extract patient's general information from the first record (assuming all records for a patient have the same patient info)
  const patientInfo = useMemo(() => {
    if (records && records.length > 0) {
      const firstRecord = records[0];
      return {
        patient_fname: firstRecord.patient_fname,
        patient_lname: firstRecord.patient_lname,
        patient_sex: firstRecord.patient_sex,
        patient_age: firstRecord.patient_age,
        patient_address: firstRecord.patient_address,
        patient_id: firstRecord.patient_id,
        patient_type: firstRecord.patient_type,
      };
    }
    return null; // Return null if no records or data is not yet available
  }, [records]); // Recalculate patientInfo only when records change

  const formatDateSafely = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      // Ensure the date string is in a format Date can parse reliably, or parse manually
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
        <Text className="mt-4 text-gray-600">Loading patient records...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <Text className="text-red-500 text-lg font-bold mb-2">Error</Text>
        <Text className="text-gray-700 text-center">
          Failed to load patient records. {error?.message || "Please try again later."}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 px-6 py-3 bg-blue-500 rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle case where patientId is not found or no records for that ID
  if (!patientId || !patientInfo) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Package className="text-gray-400 mb-4" size={48} />
        <Text className="text-gray-600 text-lg font-bold mb-2">No Patient Records Found</Text>
        <Text className="text-gray-500 text-center">
          The patient ID '{patientId || "N/A"}' did not yield any records, or is invalid.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 px-6 py-3 bg-blue-500 rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          {patientInfo.patient_fname} {patientInfo.patient_lname}'s Records
        </Text>
      </View>

      <View className="p-4">
        <View className="bg-white rounded-lg shadow-md p-6 mb-6 flex-row items-center">
          {/* Patient Avatar/Icon */}
          <View className="w-16 h-16 bg-blue-100 rounded-full flex justify-center items-center mr-4">
            <User size={32} color="#3b82f6" />
          </View>

          {/* Patient Details */}
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              {patientInfo.patient_fname} {patientInfo.patient_lname}
            </Text>
            <Text className="text-sm text-gray-600">ID: {patientInfo.patient_id}</Text>
            <Text className="text-sm text-gray-600">Age: {patientInfo.patient_age}, Gender: {patientInfo.patient_sex}</Text>
            <Text className="text-sm text-gray-600">{patientInfo.patient_address || "Address N/A"}</Text>
            <Text className={`mt-2 px-2 py-1 text-xs rounded-full self-start ${patientInfo.patient_type === 'Transient' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {patientInfo.patient_type}
            </Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-gray-800 mb-4">Referral History</Text>
        {records && records.length > 0 ? (
          <View className="space-y-4">
            {records.map((record: { bite_id: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined; referral_date: string; biting_animal: any; exposure_type: any; exposure_site: any; actions_taken: any; referredby: any; }) => (
              <View key={record.bite_id} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-medium text-gray-900">Record #{record.bite_id}</Text>
                  <Text className="text-xs text-black">{formatDateSafely(record.referral_date)}</Text>
                </View>

                <View className="space-y-2">
                  <View className="flex-row">
                    <Text className="text-sm text-black">Animal: </Text>
                    <Text className="text-sm font-medium text-gray-600">{record.biting_animal || "N/A"}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-sm text-black">Exposure: </Text>
                    <Text className="text-sm font-medium text-gray-600">{record.exposure_type || "N/A"}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-sm text-black">Site: </Text>
                    <Text className="text-sm text-gray-600 font-medium">{record.exposure_site || "N/A"}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-sm text-black">Actions: </Text>
                    <Text className="text-sm font-medium text-gray-600">{record.actions_taken || "N/A"}</Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-sm text-black">Referred By: </Text>
                    <Text className="text-sm font-medium text-gray-600">{record.referredby || "N/A"}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="text-center py-16">
            <Text className="text-gray-500">No records found for this patient.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}