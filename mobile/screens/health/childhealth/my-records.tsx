// InvChildHealthRecords.js - UPDATED VERSION
import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, FileText, Plus, Calendar, Weight, Ruler, Thermometer, Shield, Stethoscope, Heart, Droplets, Eye } from "lucide-react-native";

// Custom hooks
import { useNutriotionalStatus, useChildData } from "../admin/admin-childhealth/queries/fetchQueries";
import { useUnvaccinatedVaccines } from "../admin/admin-vaccination/queries/fetch";
import { useFollowupChildHealthandVaccines } from "../admin/admin-vaccination/queries/fetch";
import { usePatientVaccinationDetails } from "../admin/admin-vaccination/queries/fetch";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { ChildHealthRecordCard } from "@/components/healthcomponents/childInfoCard";
import { VaccinationStatusCards } from "../admin/components/vaccination-status-cards";
import { FollowUpsCard } from "../admin/components/followup-cards";
import { GrowthChart } from "./growth-chart";
import HealthRecordCard from "./health-record-card";
export default function InvChildHealthRecords() {
  const navigation = useNavigation();
  const route = useRoute();

  // Get patient ID from route params with safe access
  const [patientId, setPatientId] = useState("PR20200001");
  const patId = patientId;

  // State
  const [activeTab, setActiveTab] = useState("status");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  // Use the useChildData hook
  const { data: childData, isLoading: isChildDataLoading, isError: isChildDataError, error: childDataError, refetch: refetchChildData } = useChildData(patId);

  // DEBUG: Log the raw data
  useEffect(() => {
    console.log("🔍 RAW CHILD DATA:", childData);
    console.log("🔍 Is Loading:", isChildDataLoading);
    console.log("🔍 Is Error:", isChildDataError);
  }, [childData, isChildDataLoading, isChildDataError]);

  // FIXED: Transform child data based on actual API response structure
  const transformChildData = useMemo(() => {
    if (!childData) {
      console.log("❌ No child data available for transformation");
      return null;
    }

    console.log("🔄 TRANSFORMING CHILD DATA STRUCTURE:", childData);

    // Based on your API response, the main data is an object with chrec_id and child_health_histories
    const mainData = childData;
    if (!mainData) {
      console.log("❌ No main data found in response");
      return null;
    }

    // Extract patient details from the first child_health_history's chrec_details
    const firstHistory = mainData.child_health_histories?.[0];
    if (!firstHistory) {
      console.log("❌ No child health histories found");
      return null;
    }

    const chrecDetails = firstHistory.chrec_details;
    const patrecDetails = chrecDetails?.patrec_details;
    const patDetails = patrecDetails?.pat_details;

    if (!patDetails) {
      console.log("❌ No patient details found");
      return null;
    }

    const personalInfo = patDetails.personal_info || {};
    const address = patDetails.address || {};
    const familyHeadInfo = patDetails.family_head_info?.family_heads || {};

    const motherInfo = familyHeadInfo.mother?.personal_info || {};
    const fatherInfo = familyHeadInfo.father?.personal_info || {};

    console.log("👨‍👩‍👧‍👦 EXTRACTED PATIENT DATA:", {
      personalInfo,
      address,
      motherInfo,
      fatherInfo
    });

    const transformedData = {
      // Patient basic info
      pat_id: chrecDetails?.patient || patDetails.pat_id || patientId,
      fname: personalInfo?.per_fname || "",
      lname: personalInfo?.per_lname || "",
      mname: personalInfo?.per_mname || "",
      sex: personalInfo?.per_sex || "",
      age: personalInfo?.per_dob ? calculateAgeFromDOB(personalInfo.per_dob,chrecDetails?.created_at).years : "",
      dob: personalInfo?.per_dob || "",

      // Mother info
      mother_fname: motherInfo?.per_fname || "",
      mother_lname: motherInfo?.per_lname || "",
      mother_mname: motherInfo?.per_mname || "",
      mother_occupation: chrecDetails?.mother_occupation || motherInfo?.per_occupation || "",
      mother_age: motherInfo?.per_dob ? calculateAgeFromDOB(motherInfo.per_dob,chrecDetails?.created_at).years : "",

      // Father info
      father_fname: fatherInfo?.per_fname || "",
      father_lname: fatherInfo?.per_lname || "",
      father_mname: fatherInfo?.per_mname || "",
      father_age: fatherInfo?.per_dob ? calculateAgeFromDOB(fatherInfo.per_dob).ageString : "",
      father_occupation: chrecDetails?.father_occupation || fatherInfo?.per_occupation || "",

      // Address info
      address: address?.full_address || "",
      street: address?.add_street || "",
      barangay: address?.add_barangay || "",
      city: address?.add_city || "",
      province: address?.add_province || "",
      landmarks: chrecDetails?.landmarks || address?.add_landmarks || "",

      // Child health specific info
      type_of_feeding: chrecDetails?.type_of_feeding || "",
      delivery_type: chrecDetails?.place_of_delivery_type || "",
      pod_location: chrecDetails?.pod_location || "",
      tt_status: familyHeadInfo?.tt_status || firstHistory?.tt_status || "",
      birth_order: chrecDetails?.birth_order?.toString() || ""
    };

    console.log("✅ TRANSFORMED CHILD DATA:", transformedData);
    return transformedData;
  }, [childData, patientId]);

  // FIXED: Process history data based on actual API structure (matching web version)
  const processedHistoryData = useMemo(() => {
    if (!childData || !childData.child_health_histories) {
      console.log("❌ No child health histories found in data");
      return [];
    }

    console.log("🔄 RAW HISTORY DATA:", childData.child_health_histories);

    // Extract histories array (matching web version structure)
    const histories = childData.child_health_histories;

    if (!Array.isArray(histories) || histories.length === 0) {
      console.log("❌ No valid histories array found");
      return [];
    }

    // Sort by created_at to show latest first
    const sortedHistories = [...histories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return sortedHistories.map((record, index) => {
      console.log(`📝 PROCESSING RECORD ${index}:`, record);

      // Calculate BMI (matching web version logic)
      let bmi = "N/A";
      let findingsData = {
        subj_summary: "",
        obj_summary: "",
        assessment_summary: "",
        plantreatment_summary: ""
      };

      // Extract vital signs and findings (matching web version)
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

      // Extract notes and follow-up info (matching web version)
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

      // Get vital sign values (matching web version)
      const vitalSign = record.child_health_vital_signs?.[0];
      const bmDetails = vitalSign?.bm_details || {};

      const processedRecord = {
        // IDs
        chhist_id: record.chhist_id,
        chrec_id: childData.chrec_id,
        patrec: patientId,

        // Basic info
        id: index + 1,
        status: record.status || "N/A",
        age: transformChildData?.dob ? calculateAgeFromDOB(transformChildData.dob, record.created_at).ageString : "N/A",
        updatedAt: new Date(record.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        rawCreatedAt: record.created_at,

        // Core measurements (matching web version - use 0 as fallback for numbers)
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

        // Additional vital signs
        blood_pressure: vitalSign?.vital_details?.blood_pressure || "",
        heart_rate: vitalSign?.vital_details?.heart_rate || "",
        respiratory_rate: vitalSign?.vital_details?.respiratory_rate || "",
        oxygen_saturation: vitalSign?.vital_details?.oxygen_saturation || "",

        // Findings
        findings: findingsData,
        hasFindings: !!findingsData.subj_summary || !!findingsData.obj_summary || !!findingsData.assessment_summary || !!findingsData.plantreatment_summary,

        // Notes & Follow-up
        latestNote: latestNoteContent,
        followUpDescription,
        followUpDate,
        followUpStatus,

        // Vaccine status
        vaccineStat: record.tt_status || "N/A"
      };

      console.log(`✅ PROCESSED RECORD ${index}:`, {
        id: processedRecord.id,
        temp: processedRecord.temp,
        wt: processedRecord.wt,
        ht: processedRecord.ht,
        bmi: processedRecord.bmi,
        hasData: !!(processedRecord.temp || processedRecord.wt || processedRecord.ht)
      });

      return processedRecord;
    });
  }, [childData, transformChildData, patientId]);

  // Other hooks remain the same
  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading, refetch: refetchUnvaccinated } = useUnvaccinatedVaccines(patId, transformChildData?.dob || "");
  const { data: followUps = [], isLoading: followupLoading, refetch: refetchFollowups } = useFollowupChildHealthandVaccines(patId);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading, refetch: refetchVaccinations } = usePatientVaccinationDetails(patId);
  const { data: nutritionalStatusData = [], isLoading: isGrowthLoading, isError: isgrowthError, refetch: refetchNutritional } = useNutriotionalStatus(patId);

  const isLoading = isChildDataLoading || followupLoading || isUnvaccinatedLoading || isCompleteVaccineLoading || isGrowthLoading;

  // Helper function for status colors
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-500";
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "immunization":
        return "bg-green-500";
      case "check-up":
        return "bg-blue-500";
      case "follow-up":
        return "bg-yellow-500";
      case "recorded":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Toggle card expand
  const toggleCardExpand = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchChildData(), refetchUnvaccinated(), refetchFollowups(), refetchVaccinations(), refetchNutritional()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchChildData, refetchUnvaccinated, refetchFollowups, refetchVaccinations, refetchNutritional]);

  if (isChildDataLoading) {
    return <LoadingState />;
  }

  if (isChildDataError) {
    return (
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-red-500 text-base text-center mb-4">Error loading data: {childDataError?.message || "Unknown error"}</Text>
        <Button variant="outline" onPress={onRefresh}>
          <Text>Refresh</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2 border border-gray-300 rounded-lg">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-semibold text-xl text-gray-800">Child Health History Records</Text>
          <Text className="text-gray-500 text-sm mt-1">Manage and view child's health history</Text>
        </View>
      </View>

      {/* Child Health Record Card */}
      <View className=" mx-4 my-4 rounded-xl ">
        {transformChildData ? (
          <ChildHealthRecordCard child={transformChildData} />
        ) : (
          <View className="items-center py-4">
            <Text className="text-gray-500">No child data available</Text>
          </View>
        )}
      </View>

      {/* Vaccination Status & Follow-ups Tabs */}
      {!isLoading && (
        <View className="bg-white mx-4 my-2 rounded-xl p-4 shadow-sm">
          <View className="flex-row border-b border-gray-200">
            <TouchableOpacity onPress={() => setActiveTab("status")} className={`flex-1 py-3 items-center ${activeTab === "status" ? "border-b-2 border-blue-500" : ""}`}>
              <Text className={`text-sm font-medium ${activeTab === "status" ? "text-blue-500" : "text-gray-500"}`}>Vaccination Status</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("followups")} className={`flex-1 py-3 items-center ${activeTab === "followups" ? "border-b-2 border-blue-500" : ""}`}>
              <Text className={`text-sm font-medium ${activeTab === "followups" ? "text-blue-500" : "text-gray-500"}`}>Follow-ups</Text>
            </TouchableOpacity>
          </View>
          <View className="mt-4">
            {activeTab === "status" && <VaccinationStatusCards unvaccinatedVaccines={unvaccinatedVaccines} vaccinations={vaccinations} />}
            {activeTab === "followups" && <FollowUpsCard childHealthFollowups={followUps} />}
          </View>
        </View>
      )}

      {/* Growth Chart */}
      <View className="bg-white mx-4 my-2 rounded-xl p-4 shadow-sm">
        <GrowthChart data={nutritionalStatusData} isLoading={isGrowthLoading} error={isgrowthError} />
      </View>

      {/* Health Records Section */}
      <View className="bg-white mx-4 my-2 rounded-xl p-4 shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 text-lg font-semibold">Health Records</Text>
          <Text className="text-gray-500 text-sm">{processedHistoryData.length} records found</Text>
        </View>

        {/* Health Records List - Using the separated component */}
        <View className="mb-4">
          {isChildDataLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 text-base mt-3">Loading records...</Text>
            </View>
          ) : processedHistoryData.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-base">No health records found</Text>
            </View>
          ) : (
            processedHistoryData.map((record) => (
              <HealthRecordCard
                key={record.chhist_id}
                record={record}
                isExpanded={expandedCard === record.chhist_id}
                onToggleExpand={toggleCardExpand}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}