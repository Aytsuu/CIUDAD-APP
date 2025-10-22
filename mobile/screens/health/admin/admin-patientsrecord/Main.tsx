import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ChevronLeft, Edit, AlertCircle } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePatientDetails } from "../restful-api/patientsrecord/queries/fetch";
import { calculateAge } from "@/helpers/ageCalculator";

const TABS = [
  { key: "personal", label: "Personal Information" },
  { key: "medical", label: "Records" },
  { key: "visits", label: "Follow up Visits" },
];

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  ViewPatientRecord: { patientId: string };
  // ...other routes
};

type ViewPatientRecordProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ViewPatientRecord'>;
  route: RouteProp<RootStackParamList, 'ViewPatientRecord'>;
};

export default function ViewPatientRecord({ route, navigation }: ViewPatientRecordProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const patientId = route.params?.patientId;
  const { data: patientsData, isError, error } = usePatientDetails(patientId ?? "");

  const currentPatient = useMemo(() => {
    if (!patientsData || !patientId) return null;
    if ("pat_id" in patientsData && patientsData.pat_id === patientId) {
      return patientsData;
    }
    const patientArray = Array.isArray(patientsData) ? patientsData : (patientsData.results ?? []);
    return patientArray.find((patient:any) => patient.pat_id === patientId) ?? null;
  }, [patientsData, patientId]);

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-xl font-semibold text-red-800 mt-4">Patient Not Found</Text>
        <Text className="text-gray-600 mt-2">{error?.message ?? "The requested patient could not be found."}</Text>
        <Text className="text-sm text-gray-500 mt-2">Patient ID: {patientId}</Text>
        <Button onPress={() => navigation.goBack()} className="mt-4">Go Back</Button>
      </View>
    );
  }

  if (!currentPatient) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">No patient data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold flex-1">Patient Record</Text>
        {/* Edit button if transient and personal tab */}
        {currentPatient.pat_type?.toLowerCase() === "transient" && activeTab === "personal" && (
          <Button onPress={() => {/* handle edit */}} className="bg-blue-600">
            <Edit size={18} color="white" />
            <Text className="ml-2 text-white">Edit</Text>
          </Button>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 bg-gray-50">
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 items-center py-3 ${activeTab === tab.key ? 'border-b-2 border-blue-600' : ''}`}
          >
            <Text className={`text-base font-medium ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-600'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1 p-4">
        {activeTab === "personal" && (
          <View>
            {/* Personal Info Card */}
            <Text className="text-lg font-semibold mb-2">Personal Information</Text>
            <Text>ID: {currentPatient.pat_id}</Text>
            <Text>Name: {currentPatient.personal_info?.per_fname} {currentPatient.personal_info?.per_mname} {currentPatient.personal_info?.per_lname}</Text>
            <Text>Sex: {currentPatient.personal_info?.per_sex}</Text>
            <Text>Age: {calculateAge(currentPatient.personal_info?.per_dob)}</Text>
            <Badge>{currentPatient.pat_type}</Badge>
            {/* ...other personal info fields... */}
          </View>
        )}
        {activeTab === "medical" && (
          <View>
            <Text className="text-lg font-semibold mb-2">Records</Text>
            {/* Render medical records here */}
          </View>
        )}
        {activeTab === "visits" && (
          <View>
            <Text className="text-lg font-semibold mb-2">Follow up Visits</Text>
            {/* Render visits here */}
          </View>
        )}
      </ScrollView>
    </View>
  );
}