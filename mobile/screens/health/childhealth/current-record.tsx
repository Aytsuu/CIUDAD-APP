// ChildHealthRecordDetails.js - WITH SEPARATED COMPONENTS
import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import PageLayout from "@/screens/_PageLayout";
import { ChildHealthRecordCard } from "@/components/healthcomponents/childInfoCard";

// Import the separated Card components
import { VitalSignsCard } from "./render-cards/vitalsigns-card";
import { ImmunizationCard } from "./render-cards/immunization-card";
import { BFCheckCard } from "./render-cards/bfchecks-card";
import { MedicinesCard } from "./render-cards/medicine-card";
import { SupplementStatusCard } from "./render-cards/supplement-card";

export default function ChildHealthRecordDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse the parameters from strings to objects with proper error handling
  const parsedRecord = useMemo(() => {
    try {
      return typeof params.record === "string" ? JSON.parse(params.record) : null;
    } catch (error) {
      console.error("Error parsing record:", error);
      return null;
    }
  }, [params.record]);

  const parsedPatientData = useMemo(() => {
    try {
      return typeof params.patientData === "string" ? JSON.parse(params.patientData) : null;
    } catch (error) {
      console.error("Error parsing patientData:", error);
      return null;
    }
  }, [params.patientData]);

  const parsedChildData = useMemo(() => {
    try {
      return typeof params.childData === "string" ? JSON.parse(params.childData) : null;
    } catch (error) {
      console.error("Error parsing childData:", error);
      return null;
    }
  }, [params.childData]);

  // State for current record index and active tab
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("vitals");

  // Process child data to extract and transform history records
  const processedRecords = useMemo(() => {
    if (!parsedChildData || !parsedChildData.child_health_histories) {
      console.log("❌ No child health histories found in data");
      return [];
    }

    const histories = parsedChildData.child_health_histories;

    if (!Array.isArray(histories) || histories.length === 0) {
      console.log("❌ No valid histories array found");
      return [];
    }

    // Sort by created_at to show latest first
    const sortedHistories = [...histories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return sortedHistories.map((record, index) => {
      // Calculate BMI
      let bmi = "N/A";
      let findingsData = {
        subj_summary: "",
        obj_summary: "",
        assessment_summary: "",
        plantreatment_summary: ""
      };

      // Extract vital signs and findings
      if (record.child_health_vital_signs?.length > 0) {
        const vital = record.child_health_vital_signs[0];

        // Calculate BMI
        if (vital.bm_details?.height && vital.bm_details?.weight) {
          const heightInM = vital.bm_details.height / 100;
          const bmiValue = (vital.bm_details.weight / (heightInM * heightInM)).toFixed(1);
          bmi = bmiValue;
        }

        // Extract findings data
        if (vital.find_details) {
          findingsData = {
            subj_summary: vital.find_details.subj_summary || "",
            obj_summary: vital.find_details.obj_summary || "",
            assessment_summary: vital.find_details.assessment_summary || "",
            plantreatment_summary: vital.find_details.plantreatment_summary || ""
          };
        }
      }

      // Extract notes and follow-up info
      let latestNoteContent = null;
      let followUpDescription = "";
      let followUpDate = "";
      let followUpStatus = "";

      if (record.child_health_notes && record.child_health_notes.length > 0) {
        const sortedNotes = [...record.child_health_notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        latestNoteContent = sortedNotes[0].chn_notes || null;

        if (sortedNotes[0].followv_details) {
          followUpDescription = sortedNotes[0].followv_details.followv_description || "";
          followUpDate = sortedNotes[0].followv_details.followv_date || "";
          followUpStatus = sortedNotes[0].followv_details.followv_status || "";
        }
      }

      // Get vital sign values
      const vitalSign = record.child_health_vital_signs?.[0];
      const bmDetails = vitalSign?.bm_details || {};

      return {
        // IDs
        chhist_id: record.chhist_id,
        chrec_id: parsedChildData.chrec_id,

        // Basic info
        id: index + 1,
        status: record.status || "N/A",
        age: parsedPatientData?.dob ? calculateAgeFromDOB(parsedPatientData.dob, record.created_at).ageString : "N/A",
        updatedAt: new Date(record.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        rawCreatedAt: record.created_at,

        // Core measurements
        temp: vitalSign?.temp || 0,
        wt: bmDetails.weight || 0,
        ht: bmDetails.height || 0,
        bmi,

        // Nutritional measurements
        muac: bmDetails.muac || "",
        edemaSeverity: bmDetails.edemaSeverity || "",
        wfa: bmDetails.wfa || "",
        lhfa: bmDetails.lhfa || "",
        wfl: bmDetails.wfl || "",
        muac_status: bmDetails.muac_status || "",
        bm_remarks: bmDetails.remarks || "",

        // Vaccine status
        vaccineStat: record.tt_status || "N/A",

        // Notes & Follow-up
        latestNote: latestNoteContent,
        followUpDescription,
        followUpDate,
        followUpStatus,

        // Raw record data for Cards
        rawRecord: record
      };
    });
  }, [parsedChildData, parsedPatientData]);

  // Find current record index
  const currentRecord = useMemo(() => {
    if (!parsedRecord || processedRecords.length === 0) return processedRecords[0] || null;

    const index = processedRecords.findIndex((r) => r.chhist_id === parsedRecord.chhist_id);
    if (index >= 0) {
      setCurrentRecordIndex(index);
      return processedRecords[index];
    }
    return processedRecords[0] || null;
  }, [parsedRecord, processedRecords]);

  // Get current raw record for Cards
  const currentRawRecord = currentRecord?.rawRecord;

  // Extract medicines information from processedRecords
  const medicinesInfo = useMemo(() => {
    const medicineRecords = processedRecords
      .flatMap(
        (record) =>
          record.rawRecord.child_health_supplements?.map((supplement: any) => ({
            record,
            supplement
          })) || []
      )
      .filter(({ record }) => {
        const recordDate = new Date(record.rawCreatedAt).getTime();
        const currentRecordDate = new Date(currentRecord?.rawCreatedAt || 0).getTime();
        return recordDate <= currentRecordDate;
      })
      .sort((a, b) => new Date(a.record.rawCreatedAt).getTime() - new Date(b.record.rawCreatedAt).getTime());

    return medicineRecords;
  }, [processedRecords, currentRecord]);

  // Helper function to extract DOB from the nested record structure
  const extractDOBFromRecord = (record: any) => {
    return record?.chrec_details?.patrec_details?.pat_details?.personal_info?.per_dob || "";
  };

  // Handle case where no record data is available
  if (!parsedRecord || !parsedPatientData || !parsedChildData) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-slate-900 text-[13px]">Record Details</Text>}
      >
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-red-500 text-base text-center mb-4 py-16">No record data available</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
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
      headerTitle={<Text className="text-slate-900 text-[13px]">Record Details</Text>}
      rightAction={<></>}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mx-4">
          <ChildHealthRecordCard child={parsedPatientData} className="mx-4 my-2" />
        </View>

        {/* Additional Data Tabs */}
        <View className="bg-white mx-4 my-2 rounded-xl p-4 shadow-sm border border-gray-100">
          <Text className="text-gray-900 text-lg font-semibold mb-3">Health Records</Text>

          {/* Scrollable Tab Navigation */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row border border-gray-200 rounded-lg mb-4 bg-gray-50">
            <TouchableOpacity onPress={() => setActiveTab("vitals")} className={`py-3 px-4 items-center ${activeTab === "vitals" ? "bg-blue-500 rounded-lg" : ""}`}>
              <Text className={`text-sm font-medium ${activeTab === "vitals" ? "text-white" : "text-gray-500"}`}>Vital Signs</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("immunization")} className={`py-3 px-4 items-center ${activeTab === "immunization" ? "bg-blue-500 rounded-lg" : ""}`}>
              <Text className={`text-sm font-medium ${activeTab === "immunization" ? "text-white" : "text-gray-500"}`}>Immunization</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("supplements")} className={`py-3 px-4 items-center ${activeTab === "supplements" ? "bg-blue-500 rounded-lg" : ""}`}>
              <Text className={`text-sm font-medium ${activeTab === "supplements" ? "text-white" : "text-gray-500"}`}>Supplements</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("bf")} className={`py-3 px-4 items-center ${activeTab === "bf" ? "bg-blue-500 rounded-lg" : ""}`}>
              <Text className={`text-sm font-medium ${activeTab === "bf" ? "text-white" : "text-gray-500"}`}>BF Check</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("medicines")} className={`py-3 px-4 items-center ${activeTab === "medicines" ? "bg-blue-500 rounded-lg" : ""}`}>
              <Text className={`text-sm font-medium ${activeTab === "medicines" ? "text-white" : "text-gray-500"}`}>Medicines</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Tab Content */}
          <View className="min-h-[200px]">
            {activeTab === "vitals" && <VitalSignsCard processedRecords={processedRecords} currentRecord={currentRecord} extractDOBFromRecord={extractDOBFromRecord} />}
            {activeTab === "immunization" && <ImmunizationCard processedRecords={processedRecords} currentRecord={currentRecord} extractDOBFromRecord={extractDOBFromRecord} />}
            {activeTab === "supplements" && <SupplementStatusCard processedRecords={processedRecords} currentRecord={currentRecord} />}
            {activeTab === "bf" && <BFCheckCard processedRecords={processedRecords} currentRecord={currentRecord} />}
            {activeTab === "medicines" && <MedicinesCard medicinesInfo={medicinesInfo} currentRecord={currentRecord} />}
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  );
}
