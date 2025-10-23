// Modified viewpage1.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { getFPCompleteRecord } from "./GetRequest";
import { User,Calendar,MapPin,Heart,Activity,Stethoscope,FileText,GraduationCap,CreditCard,Baby,TrendingUp,Scale,Ruler,Droplets,UserCheck,Clock,AlertCircle, ChevronLeft,} from "lucide-react-native";
import { FPRecordData } from "./FPRecordData";
import { LoadingState } from "@/components/ui/loading-state";
import PageLayout from "@/screens/_PageLayout";

export default function FpRecordViewPage1() {
  const { fprecordId } = useLocalSearchParams();

  const { data: recordData, isLoading, isError, error } = useQuery<FPRecordData | null>({
    queryKey: ["fpCompleteRecordView", fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId,
  });

  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    "Client Information",
    "FP Details",
    "Obstetrical History",
    "Medical History",
    "Risk STI",
    "Risk VAW",
    "Pelvic Exam",
    "Physical Exam",
    "Acknowledgement",
    "Service Provision",
    "Pregnancy Check",
  ];

  if (isLoading) {
    return <LoadingState/> }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <AlertCircle size={32} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4">Failed to load record</Text>
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

  const fullName = `${recordData.lastName ?? "N/A"}, ${recordData.givenName ?? "N/A"} ${recordData.middleInitial ?? ""}`.trim();
  const isIUD = recordData.acknowledgement?.selectedMethod?.toLowerCase() === "iud";

  const renderTabContent = () => {
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
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <CreditCard size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Client ID</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.client_id ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Full Name</Text>
                <Text className="text-sm font-medium text-gray-900">{fullName}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Calendar size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Birth Date & Age</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {`${recordData.dateOfBirth ?? "N/A"} (${recordData.age ?? "N/A"} years old)`}
                </Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <GraduationCap size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Education</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.educationalAttainment ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <GraduationCap size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Occupation</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.occupation ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <CreditCard size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Philhealth ID</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.philhealthNo ?? "Not provided"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <MapPin size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Complete Address</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {`${recordData.address?.houseNumber ?? "N/A"} ${recordData.address?.street ?? ""}, ${recordData.address?.barangay ?? "N/A"}, ${recordData.address?.municipality ?? "N/A"}, ${recordData.address?.province ?? "N/A"}`.trim()}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-2">
              <Text className="text-sm text-gray-500">NHTS:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.nhts_status ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.nhts_status ? "Yes" : "No"}</Text>
              </View>
            </View>
          </View>
        );
      case 1: // Family Planning Details
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-red-100">
                <Heart size={20} color="#EF4444" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Family Planning Details</Text>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Client Type</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.typeOfClient ?? "N/A"}</Text>
              </View>
            </View>
            
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Heart size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Reason for Family Planning</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.reasonForFP ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Activity size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Current Method Used</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.methodCurrentlyUsed ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <TrendingUp size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Average Monthly Income</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {recordData.avg_monthly_income_display?.toLocaleString() ?? "Not specified"}
                </Text>
              </View>
            </View>
             <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Living Children</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.num_of_children ?? "0"}</Text>
              </View>
            </View>
            
            <View className="border-t border-gray-100 pt-4 mt-2">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-gray-500">Plans to have more children:</Text>
                <View className={`px-3 py-1 rounded-full ${recordData.plan_more_children ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                  <Text className="text-xs font-medium">{recordData.plan_more_children ? "Yes" : "No"}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">4Ps Beneficiary:</Text>
                <View className={`px-3 py-1 rounded-full ${recordData.fourps ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                  <Text className="text-xs font-medium">{recordData.fourps ? "Yes" : "No"}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 2: // Obstetrical History
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-green-100">
                <Baby size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Obstetrical History</Text>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Droplets size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Menstrual Flow</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.obstetricalHistory?.menstrualFlow ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Droplets size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Last Delivery Date</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.obstetricalHistory?.lastDeliveryDate ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Droplets size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Type of Last Delivery</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.obstetricalHistory?.typeOfLastDelivery ?? "N/A"}</Text>
              </View>
            </View>
             <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Droplets size={18} color="#6B7280" />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Last Menstrual Period</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.obstetricalHistory?.lastMenstrualPeriod ?? "N/A"}</Text>
              </View>
            </View>

            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Droplets size={18} color="#6B7280" />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Previous Menstrual Period</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.obstetricalHistory?.previousMenstrualPeriod ?? "N/A"}</Text>
              </View>
            </View>

            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Droplets size={18} color="#6B7280" />
              </View>
              
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Menstrual Flow</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.obstetricalHistory?.menstrualFlow ?? "N/A"}</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Dysmenorrhea:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.obstetricalHistory?.dysmenorrhea ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.obstetricalHistory?.dysmenorrhea ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Hydatidiform Mole:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.obstetricalHistory?.hydatidiformMole ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.obstetricalHistory?.hydatidiformMole ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Ectopic Pregnancy History:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.obstetricalHistory?.ectopicPregnancyHistory ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.obstetricalHistory?.ectopicPregnancyHistory ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="border-t border-gray-100 pt-4">
              <Text className="text-sm font-medium text-gray-800 mb-3">Pregnancy Statistics</Text>
              <View className="flex-row mb-3">
                <View className="bg-gray-50 rounded-lg p-4 items-center flex-1 mx-1">
                  <Baby size={20} color="#3B82F6" />
                  <Text className="text-sm font-bold mt-2 text-blue-600">{recordData.obstetricalHistory?.g_pregnancies ?? "0"}</Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">Gravida</Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-4 items-center flex-1 mx-1">
                  <Baby size={20} color="#3B82F6" />
                  <Text className="text-sm font-bold mt-2 text-blue-600">{recordData.obstetricalHistory?.p_pregnancies ?? "0"}</Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">Para</Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-4 items-center flex-1 mx-1">
                  <Heart size={20} color="#3B82F6" />
                  <Text className="text-sm font-bold mt-2 text-blue-600">{recordData.obstetricalHistory?.numOfLivingChildren ?? "0"}</Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">Living Children</Text>
                </View>
              </View>
              <View className="flex-row">
                <View className="bg-gray-50 rounded-lg p-4 items-center flex-1 mx-1">
                  <Calendar size={20} color="#3B82F6" />
                  <Text className="text-sm font-bold mt-2 text-blue-600">{recordData.obstetricalHistory?.fullTerm ?? "0"}</Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">Full Term</Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-4 items-center flex-1 mx-1">
                  <Clock size={20} color="#3B82F6" />
                  <Text className="text-sm font-bold mt-2 text-blue-600">{recordData.obstetricalHistory?.premature ?? "0"}</Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">Premature</Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-4 items-center flex-1 mx-1">
                  <AlertCircle size={20} color="#3B82F6" />
                  <Text className="text-sm font-bold mt-2 text-blue-600">{recordData.obstetricalHistory?.abortion ?? "0"}</Text>
                  <Text className="text-sm text-gray-500 text-center mt-1">Abortion</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 3: // Medical History
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100">
                <Stethoscope size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Medical History</Text>
            </View>
            {(recordData.medical_history_records ?? []).map((record) => (
              <View key={record.medhist_id} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text className="text-sm text-gray-800 flex-1">{record.illname ?? "N/A"}</Text>
                <View className={`px-3 py-1 rounded-full ${recordData.selectedIllnessIds?.includes(record.ill_id) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                  <Text className="text-xs font-medium">{recordData.selectedIllnessIds?.includes(record.ill_id) ? "Yes" : "No"}</Text>
                </View>
              </View>
            ))}
            {(!recordData.medical_history_records || recordData.medical_history_records.length === 0) && (
              <Text className="text-sm text-gray-500 text-center">No medical history available</Text>
            )}
          </View>
        );
      case 4: // Risk STI
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100">
                <Stethoscope size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Risk STI</Text>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Abnormal Discharge:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.sexuallyTransmittedInfections?.abnormalDischarge ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.sexuallyTransmittedInfections?.abnormalDischarge ? "Yes" : "No"}</Text>
              </View>
            </View>
            {recordData.sexuallyTransmittedInfections?.abnormalDischarge && (
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm text-gray-500">Discharge from:</Text>
                <View className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  <Text className="text-xs font-medium">{recordData.sexuallyTransmittedInfections?.dischargeFrom ?? "N/A"}</Text>
                </View>
              </View>
            )}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Sores:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.sexuallyTransmittedInfections?.sores ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.sexuallyTransmittedInfections?.sores ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Pain:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.sexuallyTransmittedInfections?.pain ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.sexuallyTransmittedInfections?.pain ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">History:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.sexuallyTransmittedInfections?.history ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.sexuallyTransmittedInfections?.history ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">HIV:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.sexuallyTransmittedInfections?.hiv ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.sexuallyTransmittedInfections ?.hiv ? "Yes" : "No"}</Text>
              </View>
            </View>
          </View>
        );
      case 5: // Risk VAW
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100">
                <Stethoscope size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Risk VAW</Text>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Unpleasant Relationship:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.risk_vaw?.vaw_unpleasant_rs ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.risk_vaw?.vaw_unpleasant_rs ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Partner Disapproval:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.risk_vaw?.vaw_partner_disapproval ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.risk_vaw?.vaw_partner_disapproval ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Domestic Violence:</Text>
              <View className={`px-3 py-1 rounded-full ${recordData.risk_vaw?.vaw_domestic_violence ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                <Text className="text-xs font-medium">{recordData.risk_vaw?.vaw_domestic_violence ? "Yes" : "No"}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm text-gray-500">Referred To:</Text>
              <View className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                <Text className="text-xs font-medium">{recordData.risk_vaw?.vaw_referred_to ?? "N/A"}</Text>
              </View>
            </View>
          </View>
        );
      case 6: // Pelvic Examination
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100">
                <Stethoscope size={20} color="#8B5CF6" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Pelvic Examination</Text>
            </View>
            {isIUD && recordData.fp_pelvic_exam ? (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-gray-500">Pelvic Exam:</Text>
                  <View className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    <Text className="text-xs font-medium">{recordData.fp_pelvic_exam.pelvicExamination ?? "N/A"}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-gray-500">Cervical Tenderness:</Text>
                  <View className={`px-3 py-1 rounded-full ${recordData.fp_pelvic_exam.cervicalTenderness ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    <Text className="text-xs font-medium">{recordData.fp_pelvic_exam.cervicalTenderness ? "Yes" : "No"}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-gray-500">Cervical Adnexal:</Text>
                  <View className={`px-3 py-1 rounded-full ${recordData.fp_pelvic_exam.cervicalAdnexal ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    <Text className="text-xs font-medium">{recordData.fp_pelvic_exam.cervicalAdnexal ? "Yes" : "No"}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-gray-500">Cervical Consistency:</Text>
                  <View className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    <Text className="text-xs font-medium">{recordData.fp_pelvic_exam.cervicalConsistency ?? "N/A"}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-gray-500">Uterine Position:</Text>
                  <View className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    <Text className="text-xs font-medium">{recordData.fp_pelvic_exam.uterinePosition ?? "N/A"}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-sm text-gray-500">Uterine Depth:</Text>
                  <View className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    <Text className="text-xs font-medium">{recordData.fp_pelvic_exam.uterineDepth ?? "N/A"}</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text className="text-sm text-gray-500 text-center">No pelvic exam data available (Method: {recordData.acknowledgement?.selectedMethod ?? "N/A"})</Text>
            )}
          </View>
        );
      case 7: // Physical Examination
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-yellow-100">
                <Activity size={20} color="#F59E0B" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Physical Examination</Text>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Skin Examination</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.fp_physical_exam?.skin_exam ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Conjunctiva Examination</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.fp_physical_exam?.conjunctiva_exam ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Neck Examination</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.fp_physical_exam?.neck_exam ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Breast Examination</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.fp_physical_exam?.breast_exam ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Abdomen Examination</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.fp_physical_exam?.abdomen_exam ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Extremities Examination</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.fp_physical_exam?.extremities_exam ?? "N/A"}</Text>
              </View>
            </View>
            <View className="border-t border-gray-100 pt-4 mt-2">
              <Text className="text-sm font-medium text-gray-800 mb-3">Vital Signs</Text>
              <View className="flex-row flex-wrap">
                <View className="bg-gray-50 rounded-lg p-3 items-center flex-1 mx-1 mb-2">
                  <Scale size={20} color="#3B82F6" />
                  <Text className="text-sm font-bold mt-2 text-blue-600">{recordData.weight ?? "N/A"}</Text>
                  <Text className="text-xs text-gray-500 text-center mt-1">Weight (kg)</Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-3 items-center flex-1 mx-1 mb-2">
                  <Ruler size={20} color="#10B981" />
                  <Text className="text-sm font-bold mt-2 text-green-600">{recordData.height ?? "N/A"}</Text>
                  <Text className="text-xs text-gray-500 text-center mt-1">Height (cm)</Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-3 items-center flex-1 mx-1 mb-2">
                  <Heart size={20} color="#EF4444" />
                  <Text className="text-sm font-bold mt-2 text-red-600">{recordData.bloodPressure ?? "N/A"}</Text>
                  <Text className="text-xs text-gray-500 text-center mt-1">Blood Pressure</Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-3 items-center flex-1 mx-1 mb-2">
                  <Heart size={20} color="#EF4444" />
                  <Text className="text-sm font-bold mt-2 text-red-600">{recordData.pulseRate ?? "N/A"}</Text>
                  <Text className="text-xs text-gray-500 text-center mt-1">Pulse Rate</Text>
                </View>
              </View>
            </View>
          </View>
        );
      case 8: // Acknowledgement
        return (
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-cyan-100">
                <UserCheck size={20} color="#06B6D4" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Acknowledgement</Text>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Method Selected</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.acknowledgement?.selectedMethod ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <User size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Client Name</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.acknowledgement?.clientName ?? "N/A"}</Text>
              </View>
            </View>
            <View className="flex-row items-start space-x-3 mb-4">
              <View className="w-5 h-5 mt-1">
                <Calendar size={18} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Signature Date</Text>
                <Text className="text-sm font-medium text-gray-900">{recordData.acknowledgement?.clientSignatureDate ?? "N/A"}</Text>
              </View>
            </View>
            <View className="mt-4">
              <Text className="text-sm text-gray-500 mb-3">Client Signature:</Text>
              {recordData.acknowledgement?.clientSignature ? (
                <View className="rounded-lg p-4 items-center">
                  <Image
                    source={{
                      uri: `data:image/png;base64,${recordData.acknowledgement.clientSignature.startsWith("data:image")
                        ? recordData.acknowledgement.clientSignature.split(",")[1]
                        : recordData.acknowledgement.clientSignature}`,
                    }}
                    className="w-48 h-24 rounded-md"
                    resizeMode="contain"
                    onError={(e) => console.log("Failed to load signature:", e.nativeEvent.error)}
                  />
                </View>
              ) : (
                <View className="bg-gray-50 rounded-lg p-6 items-center">
                  <FileText size={24} color="#9CA3AF" />
                  <Text className="text-sm text-gray-500 mt-2">No signature available</Text>
                </View>
              )}
            </View>
            {recordData.acknowledgement?.guardianSignature && (
              <>
                <View className="mt-4">
                  <Text className="text-sm text-gray-500 mb-3">Guardian Signature:</Text>
                  <View className="rounded-lg p-4 items-center">
                    <Image
                      source={{
                        uri: `data:image/png;base64,${recordData.acknowledgement.guardianSignature.startsWith("data:image")
                          ? recordData.acknowledgement.guardianSignature.split(",")[1]
                          : recordData.acknowledgement.guardianSignature}`,
                      }}
                      className="w-48 h-24 rounded-md"
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View className="flex-row items-start space-x-3 mb-4">
                  <View className="w-5 h-5 mt-1">
                    <Calendar size={18} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Guardian Signature Date</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {recordData.acknowledgement?.guardianSignatureDate ?? "N/A"}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        );
      case 9: // Service Provision
        return (
          <ScrollView className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-green-100">
                <Clock size={20} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">Service Provision</Text>
            </View>
            {(recordData.serviceProvisionRecords ?? []).map((service: any, index: any) => (
              <View key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <View className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    <Text className="text-xs font-medium">{`Visit ${index + 1}`}</Text>
                  </View>
                </View>
                <View className="flex-row items-start space-x-3 mb-4">
                  <View className="w-5 h-5 mt-1">
                    <Calendar size={18} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Visit Date</Text>
                    <Text className="text-sm font-medium text-gray-900">{service.dateOfVisit ?? "N/A"}</Text>
                  </View>
                </View>
                <View className="flex-row items-start space-x-3 mb-4">
                  <View className="w-5 h-5 mt-1">
                    <Heart size={18} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Method Accepted</Text>
                    <Text className="text-sm font-medium text-gray-900">{recordData.methodCurrentlyUsed ?? "Not specified"}</Text>
                  </View>
                </View>
                <View className="flex-row items-start space-x-3 mb-4">
                  <View className="w-5 h-5 mt-1">
                    <User size={18} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Service Provider</Text>
                    <Text className="text-sm font-medium text-gray-900">{service.nameOfServiceProvider ?? "N/A"}</Text>
                  </View>
                </View>
                <View className="flex-row items-start space-x-3 mb-4">
                  <View className="w-5 h-5 mt-1">
                    <Calendar size={18} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Follow-up Date</Text>
                    <Text className="text-sm font-medium text-gray-900">{service.dateOfFollowUp ?? "N/A"}</Text>
                  </View>
                </View>
                <View className="flex-row items-start space-x-3 mb-4">
                  <View className="w-5 h-5 mt-1">
                    <FileText size={18} color="#6B7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-1">Medical Findings</Text>
                    <Text className="text-sm font-medium text-gray-900">{service.medicalFindings ?? "N/A"}</Text>
                  </View>
                </View>
                <View className="mt-4">
                  <Text className="text-sm text-gray-500 mb-3">Service Provider Signature:</Text>
                  {service.serviceProviderSignature ? (
                    <View className="rounded-lg p-4 items-center">
                      <Image
                        source={{
                          uri: `data:image/png;base64,${service.serviceProviderSignature.startsWith("data:image")
                            ? service.serviceProviderSignature.split(",")[1]
                            : service.serviceProviderSignature}`,
                        }}
                        className="w-48 h-24 rounded-md"
                        resizeMode="contain"
                        onError={(e) => console.log("Failed to load signature:", e.nativeEvent.error)}
                      />
                    </View>
                  ) : (
                    <View className="bg-gray-50 rounded-lg p-6 items-center">
                      <FileText size={24} color="#9CA3AF" />
                      <Text className="text-sm text-gray-500 mt-2">No signature available</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
            {(!recordData.serviceProvisionRecords || recordData.serviceProvisionRecords.length === 0) && (
              <Text className="text-sm text-gray-500 text-center">No service provision records available</Text>
            )}
          </ScrollView>
        );
      case 10: // Pregnancy Check
        return (
  <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mx-4 my-3">
    {/* Header */}
    <View className="flex-row items-center mb-5">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-purple-100">
        <Stethoscope size={20} color="#8B5CF6" />
      </View>
      <Text className="text-lg font-semibold text-gray-800">Pregnancy Check</Text>
    </View>
    
    {/* Questions Container */}
    <View className="space-y-4">
      {/* Question 1 */}
      <View className="bg-gray-50 rounded-lg p-3">
        <Text className="text-sm text-gray-700 mb-2 leading-5">
          Did you have a baby less than six (6) months ago, are you fully or nearly fully breastfeeding, and have you had no menstrual period since then?
        </Text>
        <View className="flex-row justify-end">
          <View className={`px-3 py-1 rounded-full ${recordData.pregnancyCheck?.breastfeeding ? "bg-green-100" : "bg-gray-100"}`}>
            <Text className={`text-xs font-medium ${recordData.pregnancyCheck?.breastfeeding ? "text-green-800" : "text-gray-700"}`}>
              {recordData.pregnancyCheck?.breastfeeding ? "Yes" : "No"}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Question 2 */}
      <View className="bg-gray-50 rounded-lg p-3">
        <Text className="text-sm text-gray-700 mb-2 leading-5">
          Have you abstained from sexual intercourse since your last menstrual period or delivery?
        </Text>
        <View className="flex-row justify-end">
          <View className={`px-3 py-1 rounded-full ${recordData.pregnancyCheck?.abstained ? "bg-green-100" : "bg-gray-100"}`}>
            <Text className={`text-xs font-medium ${recordData.pregnancyCheck?.abstained ? "text-green-800" : "text-gray-700"}`}>
              {recordData.pregnancyCheck?.abstained ? "Yes" : "No"}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Question 3 */}
      <View className="bg-gray-50 rounded-lg p-3">
        <Text className="text-sm text-gray-700 mb-2 leading-5">
          Have you had a baby in the last four (4) weeks?
        </Text>
        <View className="flex-row justify-end">
          <View className={`px-3 py-1 rounded-full ${recordData.pregnancyCheck?.recent_baby ? "bg-green-100" : "bg-gray-100"}`}>
            <Text className={`text-xs font-medium ${recordData.pregnancyCheck?.recent_baby ? "text-green-800" : "text-gray-700"}`}>
              {recordData.pregnancyCheck?.recent_baby ? "Yes" : "No"}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Question 4 */}
      <View className="bg-gray-50 rounded-lg p-3">
        <Text className="text-sm text-gray-700 mb-2 leading-5">
          Did your last menstrual period start within the past seven (7) days?
        </Text>
        <View className="flex-row justify-end">
          <View className={`px-3 py-1 rounded-full ${recordData.pregnancyCheck?.recent_period ? "bg-green-100" : "bg-gray-100"}`}>
            <Text className={`text-xs font-medium ${recordData.pregnancyCheck?.recent_period ? "text-green-800" : "text-gray-700"}`}>
              {recordData.pregnancyCheck?.recent_period ? "Yes" : "No"}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Question 5 */}
      <View className="bg-gray-50 rounded-lg p-3">
        <Text className="text-sm text-gray-700 mb-2 leading-5">
          Have you had miscarriage or abortion in the last seven (7) days?
        </Text>
        <View className="flex-row justify-end">
          <View className={`px-3 py-1 rounded-full ${recordData.pregnancyCheck?.recent_abortion ? "bg-green-100" : "bg-gray-100"}`}>
            <Text className={`text-xs font-medium ${recordData.pregnancyCheck?.recent_abortion ? "text-green-800" : "text-gray-700"}`}>
              {recordData.pregnancyCheck?.recent_abortion ? "Yes" : "No"}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Question 6 */}
      <View className="bg-gray-50 rounded-lg p-3">
        <Text className="text-sm text-gray-700 mb-2 leading-5">
          Have you been using a reliable contraceptive method consistently and correctly?
        </Text>
        <View className="flex-row justify-end">
          <View className={`px-3 py-1 rounded-full ${recordData.pregnancyCheck?.using_contraceptive ? "bg-green-100" : "bg-gray-100"}`}>
            <Text className={`text-xs font-medium ${recordData.pregnancyCheck?.using_contraceptive ? "text-green-800" : "text-gray-700"}`}>
              {recordData.pregnancyCheck?.using_contraceptive ? "Yes" : "No"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  </View>
        );
      default:
        return null;
    }
  };

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
          headerTitle={<Text className="text-gray-900 text-lg font-semibold">Family Planning Records</Text>}
          rightAction={<View className="w-10 h-10" />}
        >
    <View className="flex-1 bg-gray-50">
    

      {/* Horizontal Scrollable Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b  border-gray-200"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        style={{ maxHeight: 40 }} // Add this to limit height
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedTab(index)}
            className={`px-3 py-2 mr-2 rounded-t-lg ${selectedTab === index
                ? "bg-blue-50 border-b-2 border-blue-600"
                : "bg-transparent"
              }`}
            style={{ minHeight: 40 }} // Fixed height for consistency
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
    </PageLayout>
  );
}