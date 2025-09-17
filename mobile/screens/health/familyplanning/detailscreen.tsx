// UserFpRecordDetailScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router"; // Or useRoute from react-navigation

import {
  User, Calendar, MapPin, Heart, Activity, Stethoscope, FileText,
  GraduationCap, CreditCard, Baby, TrendingUp, Scale, Ruler, Droplets,
  UserCheck, Clock, Loader2, AlertCircle, ArrowLeft
} from "lucide-react-native";
import { getFPCompleteRecord } from "../admin/admin-familyplanning/GetRequest";
import { FPRecordData } from "../admin/admin-familyplanning/FPRecordData";
// Assuming FPRecordData is defined similarly to FullFPRecordDetail or a processed version


export default function UserFpRecordDetailScreen() {
  // Use useLocalSearchParams for Expo Router, or useRoute for React Navigation
  const { fprecordId } = useLocalSearchParams(); // Or const { fprecordId } = route.params;
  const recordId = Number(fprecordId); // Ensure it's a number

  const { data: recordData, isLoading, isError, error } = useQuery<FPRecordData | null>({
    queryKey: ["userFpCompleteRecord", recordId],
    queryFn: () => getFPCompleteRecord(recordId),
    enabled: !!recordId,
  });

  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    "Client Info",
    "FP Details",
    "Obstetrical",
    "Medical History",
    "Risk STI",
    "Risk VAW",
    "Pelvic Exam",
    "Physical Exam",
    "Acknowledgement",
    "Service Provision",
    "Pregnancy Check",
  ];

  // Helper for InfoRow (reused from admin/individual.tsx)
  const InfoRow = ({ icon: Icon, label, value, iconColor = "#6B7280" }) => (
    <View className="flex-row items-center mb-2">
      <View className="w-5 h-5 mr-3">
        <Icon size={16} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-gray-600">{label}:</Text>
        <Text className="text-sm font-medium text-gray-900">{value}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Loader2 size={32} color="#3B82F6" />
        <Text className="text-lg text-gray-600 mt-4">Loading record details...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4 text-center">Failed to load record</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">{error?.message}</Text>
      </View>
    );
  }

  if (!recordData) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <FileText size={32} color="#6B7280" />
        <Text className="text-lg text-gray-600 mt-4">Record not found</Text>
        <Text className="text-sm text-gray-400 mt-1">ID: {fprecordId}</Text>
      </View>
    );
  }

  // Adapt data access based on your FPRecordData structure
  const fullName = `${recordData.client_name?.last_name ?? "N/A"}, ${recordData.givenName ?? "N/A"} ${recordData.client_name?.middle_initial ?? ""}`.trim();
  const isIUD = recordData.method_currently_used?.toLowerCase() === "iud"; // Assuming this is the field for method

  const renderTabContent = () => {
    // This switch case will be very similar to viewpage1.tsx's renderTabContent
    // You'll need to map the recordData fields to the InfoRow components for each tab.
    // I'll provide a simplified example for one tab.
    switch (selectedTab) {
      case 0: // Client Information
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-blue-100">
                <User size={20} color="#3B82F6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Client Information</Text>
            </View>
            <InfoRow icon={CreditCard} label="Client ID" value={recordData.client_id ?? "N/A"} />
            <InfoRow icon={User} label="Full Name" value={fullName} />
            <InfoRow icon={Calendar} label="Birth Date & Age" value={`${recordData.dateOfBirth ?? "N/A"} (${recordData.age ?? "N/A"} years old)`} />
            <InfoRow icon={GraduationCap} label="Education" value={recordData.educationalAttainment ?? "N/A"} />
            <InfoRow icon={GraduationCap} label="Occupation" value={recordData.occupation ?? "N/A"} />
            <InfoRow icon={CreditCard} label="Philhealth ID" value={recordData.philhealthNo ?? "Not provided"} />
            <InfoRow icon={MapPin} label="Complete Address" value={`${recordData.houseNumber ?? "N/A"} ${recordData.street ?? ""}, ${recordData.barangay ?? "N/A"}, ${recordData.municipality ?? "N/A"}, ${recordData.province ?? "N/A"}`.trim()} />
            <View className="flex-row items-center justify-between pt-2">
              <Text className="text-sm text-gray-500">NHTS Status:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.nhts_status === true ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.nhts_status ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-2">
              <Text className="text-sm text-gray-500">Pantawid Pamilya Pilipino:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.fourps === true ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.fourps ?? "N/A"}</Text>
              </View>
            </View>
          </View>
        );
      // ... other cases for FP Details, Obstetrical History, etc.
      // You will need to map the data from `recordData` to the `InfoRow` components
      // for each section, similar to how it's done in `viewpage1.tsx`.
      // For example, for Medical History, you'd iterate over `recordData.medical_history`.
      case 3: // Medical History
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100">
                <Stethoscope size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Medical History</Text>
            </View>
            {Object.entries(recordData.medicalHistory).map(([key, value]) => (
              <View key={key} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text className="text-sm text-gray-800 flex-1">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</Text>
                <View className={`px-3 py-1 rounded-full ${value === "yes" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                  <Text className="text-xs font-medium">{value === "yes" ? "Yes" : "No"}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      case 9: // Service Provision (Visits)
        return (
          <ScrollView className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-green-100">
                <Clock size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Service Provision (Visits)</Text>
            </View>
            {(recordData.visits ?? []).map((visit: any, index: number) => (
              <View key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <View className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    <Text className="text-xs font-medium">{`Visit ${index + 1}`}</Text>
                  </View>
                </View>
                {/* Assuming 'visits' array has 'medical_findings' and 'method_accepted' */}
                <InfoRow icon={FileText} label="Medical Findings" value={visit.medical_findings ?? "N/A"} />
                <InfoRow icon={Heart} label="Method Accepted" value={visit.method_accepted ?? "N/A"} />
                {/* Add other visit details if available in your data */}
              </View>
            ))}
            {/* {(!recordData.visits || recordData.visits.length === 0) && (
              <Text className="text-sm text-gray-500 text-center">No service provision records available</Text>
            )} */}
          </ScrollView>
        );
      default:
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Text className="text-sm text-gray-500 text-center">Content for this tab is not yet implemented or available.</Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-blue-600 px-6 pt-16 pb-8">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => console.log("Go back")} // Replace with actual navigation.goBack() or router.back()
            className="mr-4 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Record #{recordId}</Text>
            <Text className="text-blue-100 mt-1">Complete Medical Profile</Text>
          </View>
        </View>
      </View>

      {/* Horizontal Scrollable Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b mt-2 border-gray-200"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        style={{ maxHeight: 40 }}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedTab(index)}
            className={`px-3 py-2 mr-2 rounded-t-lg ${selectedTab === index
                ? "bg-blue-50 border-b-2 border-blue-600"
                : "bg-transparent"
              }`}
            style={{ minHeight: 40 }}
          >
            <Text className={`text-sm font-medium ${selectedTab === index ? "text-blue-600" : "text-gray-600"
              }`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView className="flex-1 px-4 pt-4">
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}
