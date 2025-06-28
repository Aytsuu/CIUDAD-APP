// app/animalbites/[patientId].tsx (or screens/AnimalBiteIndividualScreen.tsx)
import React, { useState, useMemo } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { ChevronLeft, User, FileText, Archive, AlertCircle, Package } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { useUniqueAnimalbitePatients } from "../restful-api/animalbites/db-request/get-query";
import { format } from "date-fns";

// Re-using types from your original individual.tsx
type PatientRecordDetail = {
  bite_id: number;
  exposure_type: string;
  actions_taken: string;
  referredby: string;
  biting_animal: string;
  exposure_site: string;
  patient_fname: string;
  patient_lname: string;
  patient_gender: string;
  patient_age: number;
  patient_address: string;
  pat_id: string;
  pat_type: string; // 'Resident' or 'Transient'
  referral_id: number;
  referral_date: string;
};

export default function AnimalBiteIndividualScreen() {
  const { patientId } = useLocalSearchParams(); // Get patientId from URL parameters

  const { data: records, isLoading, isError, error } = useUniqueAnimalbitePatients();

  // Extract patient info from the first record (assuming it's consistent)
  const patientInfo = useMemo(() => {
    if (records && records.length > 0) {
      const firstRecord = records[0];
      return {
        id: firstRecord.pat_id,
        fname: firstRecord.patient_fname,
        lname: firstRecord.patient_lname,
        gender: firstRecord.patient_gender,
        age: firstRecord.patient_age,
        address: firstRecord.patient_address || "N/A", // Ensure address is handled
        patientType: firstRecord.pat_type,
      };
    }
    return null;
  }, [records]);

  // Aggregate record summary (similar to your web version's count)
  const recordSummary = useMemo(() => {
    if (!records) return { totalRecords: 0, distinctBitingAnimals: 0, distinctExposureTypes: 0 };
    const distinctAnimals = new Set(records.map((r: PatientRecordDetail) => r.biting_animal));
    const distinctExposureTypes = new Set(records.map((r: PatientRecordDetail) => r.exposure_type));
    return {
      totalRecords: records.length,
      distinctBitingAnimals: distinctAnimals.size,
      distinctExposureTypes: distinctExposureTypes.size,
    };
  }, [records]);

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
        <Text className="text-xl font-PoppinsSemiBold text-[#EF4444] mt-4">Error</Text>
        <Text className="text-gray-600 font-PoppinsRegular mt-2 text-center">
          {error?.message || "Failed to load patient details. Please try again."}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-[#263D67] px-8 py-3 rounded-xl shadow-sm">
          <Text className="text-white font-PoppinsMedium text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!patientInfo) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Package size={56} color="#D1D5DB" />
        <Text className="text-xl font-PoppinsSemiBold text-gray-600 mt-4">Patient Not Found</Text>
        <Text className="text-gray-500 font-PoppinsRegular mt-2 text-center px-4">
          No records found for patient ID: {patientId}.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-[#263D67] px-8 py-3 rounded-xl shadow-sm">
          <Text className="text-white font-PoppinsMedium text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center py-2">
          <ChevronLeft size={20} color="#263D67" />
          <Text className="text-[#263D67] text-base font-PoppinsMedium ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-PoppinsBold text-[#263D67] mt-2">Patient Details</Text>
        <Text className="text-base font-PoppinsRegular text-gray-500">Comprehensive view of {patientInfo.fname}'s records</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Patient Information Card */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <User size={24} color="#263D67" className="mr-3" />
            <Text className="text-xl font-PoppinsSemiBold text-[#263D67]">
              {patientInfo.fname} {patientInfo.lname}
            </Text>
          </View>
          <View className="space-y-2">
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Patient ID:</Text> {patientInfo.id}
            </Text>
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Type:</Text> {patientInfo.patientType}
            </Text>
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Age:</Text> {patientInfo.age}
            </Text>
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Gender:</Text> {patientInfo.gender}
            </Text>
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Address:</Text> {patientInfo.address}
            </Text>
          </View>
        </View>

        {/* Record Summary */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <FileText size={24} color="#263D67" className="mr-3" />
            <Text className="text-xl font-PoppinsSemiBold text-[#263D67]">Record Summary</Text>
          </View>
          <View className="space-y-2">
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Total Records:</Text> {recordSummary.totalRecords}
            </Text>
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Distinct Biting Animals:</Text> {recordSummary.distinctBitingAnimals}
            </Text>
            <Text className="text-base font-PoppinsRegular text-gray-700">
              <Text className="font-PoppinsMedium">Distinct Exposure Types:</Text> {recordSummary.distinctExposureTypes}
            </Text>
          </View>
        </View>

        {/* Referral History */}
        <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-200">
          <View className="flex-row items-center mb-4">
            <Archive size={24} color="#263D67" className="mr-3" />
            <Text className="text-xl font-PoppinsSemiBold text-[#263D67]">Referral History</Text>
          </View>
          {records.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No animal bite records for this patient.</Text>
          ) : (
            <View>
              {records.map((record: PatientRecordDetail, index: number) => (
                <View key={record.bite_id} className={`pb-4 ${index < records.length - 1 ? "border-b border-gray-100 mb-4" : ""}`}>
                  <Text className="text-lg font-PoppinsSemiBold text-gray-800 mb-1">
                    Record #{record.bite_id}
                  </Text>
                  <Text className="text-sm font-PoppinsRegular text-gray-600 mb-2">
                    Date: {record.referral_date ? format(new Date(record.referral_date), 'MMM dd, yyyy') : 'N/A'}
                  </Text>
                  <View className="space-y-1">
                    <Text className="text-sm font-PoppinsRegular text-gray-700">
                      <Text className="font-PoppinsMedium">Exposure Type:</Text> {record.exposure_type || "N/A"}
                    </Text>
                    <Text className="text-sm font-PoppinsRegular text-gray-700">
                      <Text className="font-PoppinsMedium">Biting Animal:</Text> {record.biting_animal || "N/A"}
                    </Text>
                    <Text className="text-sm font-PoppinsRegular text-gray-700">
                      <Text className="font-PoppinsMedium">Exposure Site:</Text> {record.exposure_site || "N/A"}
                    </Text>
                    <Text className="text-sm font-PoppinsRegular text-gray-700">
                      <Text className="font-PoppinsMedium">Actions Taken:</Text> {record.actions_taken || "N/A"}
                    </Text>
                    <Text className="text-sm font-PoppinsRegular text-gray-700">
                      <Text className="font-PoppinsMedium">Referred By:</Text> {record.referredby || "N/A"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}