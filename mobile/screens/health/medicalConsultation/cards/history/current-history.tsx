// screens/consultation-details.tsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import { View, TouchableOpacity, ScrollView, RefreshControl, FlatList, Dimensions } from "react-native";
import { ChevronLeft, Calendar, User, Heart, Scale, Thermometer, Activity, ChevronRight, ChevronLeft as LeftIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { useConsultationHistory } from "../../queries/fetch";
import { PatientInfoCard } from "../../../admin/components/patientcards";

const { width: screenWidth } = Dimensions.get('window');

// Patient Data Serializer for Consultation Records
const serializeConsultationPatientData = (consultationRecord: any): any => {
  if (!consultationRecord?.patrec_details) {
    console.log("No patrec_details found in consultation record");
    return null;
  }

  const patientRecord = consultationRecord.patrec_details;

  // Create the structure that PatientInfoCard expects
  const serializedData = {
    pat_id: patientRecord.pat_id || "",
    personal_info: patientRecord.patient_details?.personal_info || {},
    address: patientRecord.patient_details?.address || {},
    households: patientRecord.patient_details?.households || [],
    pat_type: patientRecord.patient_details?.pat_type || "Resident",
    pat_status: patientRecord.patient_details?.pat_status || "Active",
    rp_id: patientRecord.rp_id || "",
    family: patientRecord.patient_details?.family || {},
    family_head_info: patientRecord.patient_details?.family_head_info || {},
    spouse_info: patientRecord.patient_details?.spouse_info || {},
    additional_info: patientRecord.patient_details?.additional_info || {},
    family_compositions: patientRecord.patient_details?.family_compositions || []
  };

  console.log("Serialized consultation patient data:", serializedData);
  return serializedData;
};

// Consultation Detail Card Component
const ConsultationDetailCard = ({ record, isCurrent = false }: { record: any; isCurrent?: boolean }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const bhwName = `${record.staff_details?.rp?.per?.per_fname || "N/A"} ${record.staff_details?.rp?.per?.per_lname || "N/A"}`;

  return (
    <View style={{ width: screenWidth - 32 }} className={`bg-white rounded-xl border-2 p-4 shadow-sm ${isCurrent ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className={`text-lg font-semibold mb-1 ${isCurrent ? "text-blue-700" : "text-gray-900"}`}>
            {isCurrent ? "Current Consultation" : "Previous Consultation"}
          </Text>
          <View className="flex-row items-center">
            <Calendar size={14} color="#6B7280" />
            <Text className="text-sm text-gray-500 ml-1">{formatDate(record.created_at)}</Text>
          </View>
        </View>
        {isCurrent && (
          <View className="bg-blue-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">Current</Text>
          </View>
        )}
      </View>

      {/* Vital Signs Grid */}
      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <Text className="text-sm font-semibold text-gray-800 mb-2">Vital Signs</Text>
        <View className="flex-row flex-wrap justify-between">
          <View className="w-1/2 mb-3">
            <View className="flex-row items-center mb-1">
              <Activity size={14} color="#EF4444" />
              <Text className="text-xs text-gray-600 ml-1">Blood Pressure</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">
              {record.vital_signs?.vital_bp_systolic || "N/A"}/{record.vital_signs?.vital_bp_diastolic || "N/A"} mmHg
            </Text>
          </View>
          <View className="w-1/2 mb-3">
            <View className="flex-row items-center mb-1">
              <Thermometer size={14} color="#F59E0B" />
              <Text className="text-xs text-gray-600 ml-1">Temperature</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{record.vital_signs?.vital_temp || "N/A"}°C</Text>
          </View>
          <View className="w-1/2">
            <View className="flex-row items-center mb-1">
              <Heart size={14} color="#DC2626" />
              <Text className="text-xs text-gray-600 ml-1">Pulse Rate</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{record.vital_signs?.vital_pulse || "N/A"} bpm</Text>
          </View>
          <View className="w-1/2">
            <View className="flex-row items-center mb-1">
              <Activity size={14} color="#10B981" />
              <Text className="text-xs text-gray-600 ml-1">Respiratory Rate</Text>
            </View>
            <Text className="text-sm font-medium text-gray-900">{record.vital_signs?.vital_RR || "N/A"} cpm</Text>
          </View>
        </View>
      </View>

      {/* Height and Weight */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center mb-1">
            <Scale size={14} color="#8B5CF6" />
            <Text className="text-xs text-gray-600 ml-1">Height</Text>
          </View>
          <Text className="text-sm font-medium text-gray-900">{record.bmi_details?.height || "N/A"} cm</Text>
        </View>
        <View className="flex-1 ml-2">
          <View className="flex-row items-center mb-1">
            <Scale size={14} color="#8B5CF6" />
            <Text className="text-xs text-gray-600 ml-1">Weight</Text>
          </View>
          <Text className="text-sm font-medium text-gray-900">{record.bmi_details?.weight || "N/A"} kg</Text>
        </View>
      </View>

      {/* Chief Complaint */}
      <View className="mb-3">
        <Text className="text-xs text-gray-600 mb-1">Chief Complaint</Text>
        <Text className="text-sm font-medium text-gray-900" numberOfLines={3}>
          {record.medrec_chief_complaint || "N/A"}
        </Text>
      </View>

      {record.find_details?.subj_summary && (
        <View className="mb-3">
          <Text className="text-xs text-blue-600 p-1 rounded-lg font-semibold text-center mb-1 bg-blue-200 mt-2">Subjective Summary</Text>
          <Text className="text-sm font-medium text-gray-900" numberOfLines={3}>
            {record.find_details.subj_summary}
          </Text>
        </View>
      )}

      {record.find_details?.obj_summary && (
        <View className="mb-3">
          <Text className="text-xs text-blue-600 p-1 rounded-lg font-semibold text-center mb-1 bg-blue-200">Objective Summary</Text>

          {/* Objectives */}
          {(() => {
            const lines = record?.find_details?.obj_summary?.split("-") || [];
            const grouped: { [key: string]: string[] } = {};

            // Group by keyword (part before colon)
            lines.forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed) {
                const colonIndex = trimmed.indexOf(":");
                if (colonIndex > -1) {
                  const keyword = trimmed.substring(0, colonIndex).trim();
                  const value = trimmed.substring(colonIndex + 1).trim();
                  if (!grouped[keyword]) {
                    grouped[keyword] = [];
                  }
                  grouped[keyword].push(value);
                } else {
                  // If no colon, treat as standalone item
                  if (!grouped["Other"]) {
                    grouped["Other"] = [];
                  }
                  grouped["Other"].push(trimmed);
                }
              }
            });

            // Render grouped items
            return Object.entries(grouped).map(([keyword, values], index) => (
              <View key={index} className="mb-3">
                <Text className="text-xs text-gray-600 mb-1">{keyword !== "Other" ? keyword : "Other"}</Text>
                <Text className="text-sm font-medium text-gray-900">{values.join(", ")}</Text>
              </View>
            ));
          })()}
        </View>
      )}

      {record.find_details?.assessment_summary && (
        <View className="mb-3">
          <Text className="text-xs text-blue-600 p-1 rounded-lg font-semibold text-center mb-1 bg-blue-200">Diagnosis</Text>
          <Text className="text-sm font-medium text-gray-900" numberOfLines={3}>
            {record.find_details.assessment_summary}
          </Text>
        </View>
      )}

      {/* BHW Assigned */}
      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <View>
          <Text className="text-xs text-gray-600">BHW Assigned</Text>
          <Text className="text-sm font-medium text-gray-900">{bhwName.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
};

// Navigation Dots Component
const NavigationDots = ({ currentIndex, totalItems }: { currentIndex: number; totalItems: number }) => {
  if (totalItems <= 1) return null;

  return (
    <View className="flex-row justify-center items-center mt-4 mb-2">
      {Array.from({ length: totalItems }).map((_, index) => (
        <View
          key={index}
          className={`w-2 h-2 rounded-full mx-1 ${index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
        />
      ))}
    </View>
  );
};

// Navigation Arrows Component
const NavigationArrows = ({ currentIndex, totalItems, onPrevious, onNext }: { 
  currentIndex: number; 
  totalItems: number; 
  onPrevious: () => void; 
  onNext: () => void; 
}) => {
  if (totalItems <= 1) return null;

  return (
    <View className="flex-row justify-between items-center absolute left-0 right-0 top-1/2 -translate-y-1/2 px-2">
      {/* Left Arrow */}
      {currentIndex > 0 && (
        <TouchableOpacity 
          onPress={onPrevious}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
        >
          <LeftIcon size={20} color="#374151" />
        </TouchableOpacity>
      )}
      
      {/* Right Arrow */}
      {currentIndex < totalItems - 1 && (
        <TouchableOpacity 
          onPress={onNext}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
        >
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function ConsultationDetailsScreen() {
  const params = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Get data from navigation params
  const currentRecord = params.MedicalConsultation ? JSON.parse(params.MedicalConsultation as string) : null;
  const patientData = params.patientData ? JSON.parse(params.patientData as string) : null;
  const patId = params.patId as string;
  const mode = params.mode as string;

  console.log("Consultation Details - Current Record:", currentRecord);
  console.log("Consultation Details - Patient ID:", patId);

  // Serialize patient data for PatientInfoCard
  const serializedPatientData = useMemo(() => {
    if (patientData) {
      return patientData;
    }
    if (currentRecord) {
      return serializeConsultationPatientData(currentRecord);
    }
    return null;
  }, [patientData, currentRecord]);

  // Fetch ALL consultation history for this patient
  const { data: allRecordsResponse, isLoading: isHistoryLoading, isError: isHistoryError, refetch: refetchHistory } = useConsultationHistory(patId, 1, 50);

  // Combine current record with previous records for horizontal scrolling
  const allConsultationRecords = useMemo(() => {
    if (!currentRecord) return [];

    const records = [currentRecord]; // Start with current record

    if (allRecordsResponse?.results) {
      const allRecords = allRecordsResponse.results;
      const currentRecordDate = new Date(currentRecord.created_at);

      // Filter and sort previous records (newest first)
      const previousRecords = allRecords
        .filter((record: any) => {
          const recordDate = new Date(record.created_at);
          return recordDate < currentRecordDate;
        })
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      records.push(...previousRecords);
    }

    console.log("Total consultation records for horizontal scroll:", records.length);
    return records;
  }, [allRecordsResponse, currentRecord]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchHistory();
    setRefreshing(false);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / (screenWidth - 32));
    setCurrentIndex(newIndex);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allConsultationRecords.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  if (!currentRecord || !serializedPatientData) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Consultation Details</Text>}
      >
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-600 text-center">No consultation data found.</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Consultation Details</Text>}
    >
      <ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}>
        {/* Patient Info Card */}
        {serializedPatientData && (
          <View className="px-4 pt-4">
            <PatientInfoCard patient={serializedPatientData} />
          </View>
        )}

        {/* Consultation Records Header */}
        <View className="mx-4 mt-6 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Calendar size={20} color="#6B7280" />
              <Text className="ml-2 text-lg font-semibold text-gray-900">Consultation Records</Text>
            </View>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-gray-700 text-sm font-medium">
                {currentIndex + 1} of {allConsultationRecords.length}
              </Text>
            </View>
          </View>
          <Text className="text-sm text-gray-500 mt-1">
            Swipe horizontally to navigate between consultations
          </Text>
        </View>

        {/* Horizontal Consultation Cards */}
        {isHistoryLoading ? (
          <View className="py-8">
            <LoadingState />
          </View>
        ) : isHistoryError ? (
          <View className="mx-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <Text className="text-yellow-800 text-center">Failed to load consultation history</Text>
          </View>
        ) : (
          <View className="relative">
            {/* Navigation Arrows */}
            <NavigationArrows
              currentIndex={currentIndex}
              totalItems={allConsultationRecords.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />

            {/* Horizontal FlatList */}
            <FlatList
              ref={flatListRef}
              data={allConsultationRecords}
              keyExtractor={(item, index) => `consultation-${item.medrec_id}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToAlignment="center"
              decelerationRate="fast"
              renderItem={({ item, index }) => (
                <View className="px-4">
                  <ConsultationDetailCard 
                    record={item} 
                    isCurrent={index === 0} 
                  />
                </View>
              )}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
            />

            {/* Navigation Dots */}
            <NavigationDots
              currentIndex={currentIndex}
              totalItems={allConsultationRecords.length}
            />
          </View>
        )}

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
    </PageLayout>
  );
}