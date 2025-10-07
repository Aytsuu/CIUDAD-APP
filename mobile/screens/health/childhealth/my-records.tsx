// InvChildHealthRecords.js - WITH HORIZONTALLY SCROLLABLE HEALTH RECORD CARDS
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, FileText, Plus, Calendar, Weight, Ruler, Thermometer, Shield, Stethoscope, Heart, Droplets, Eye, ArrowRight } from "lucide-react-native";
import { router } from "expo-router";
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
import PageLayout from "@/screens/_PageLayout";
import { PaginationControls } from "../admin/components/pagination-layout";
import NoRecordsCard from "../admin/components/no-records-card";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function InvChildHealthRecords() {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { pat_id } = useAuth();
  const [patId, setPatientId] = useState("");

  // Parse the parameters from strings to objects with proper error handling
  const passed_pat_id = useMemo(() => {
    try {
      const parsedId = typeof params.pat_id === "string" ? params.pat_id : "";
      return parsedId;
    } catch (error) {
      console.error("Error parsing record:", error);
      return null;
    }
  }, [params.patId]);

  const mode = typeof params.mode === "string" ? params.mode : null;

  // Get patient ID from route params with safe access
  useEffect(() => {
    console.log("CHILD ID:", passed_pat_id);
    console.log("MODE:", mode);
    if (mode === "admin" || mode === "parents") {
      setPatientId(passed_pat_id || "");
    } else if (pat_id) {
      setPatientId(pat_id || "");
    }
  }, [passed_pat_id, mode]);

  const { data: childData, isLoading: isChildDataLoading, isError: isChildDataError, error: childDataError, refetch: refetchChildData } = useChildData(patId || "");
  const [activeTab, setActiveTab] = useState("status");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // Show 5 records per page

  useEffect(() => {
    console.log("-----RAW CHILD DATA:", childData);
    console.log("----Is Loading:", isChildDataLoading);
    console.log("-----Is Error:", isChildDataError);
  }, [childData, isChildDataLoading, isChildDataError]);

  // FIXED: Transform child data based on actual API response structure
  const transformChildData = useMemo(() => {
    if (!childData) {
      console.log("------No child data available for transformation");
      return null;
    }

    console.log("-----TRANSFORMING CHILD DATA STRUCTURE:", childData);

    // Based on your API response, the main data is an object with chrec_id and child_health_histories
    const mainData = childData;
    if (!mainData) {
      console.log("-----No main data found in response");
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
      pat_id: chrecDetails?.patient || patDetails.pat_id || patId,
      fname: personalInfo?.per_fname || "",
      lname: personalInfo?.per_lname || "",
      mname: personalInfo?.per_mname || "",
      sex: personalInfo?.per_sex || "",
      age: personalInfo?.per_dob ? calculateAgeFromDOB(personalInfo.per_dob, chrecDetails?.created_at).years : "",
      dob: personalInfo?.per_dob || "",

      // Mother info
      mother_fname: motherInfo?.per_fname || "",
      mother_lname: motherInfo?.per_lname || "",
      mother_mname: motherInfo?.per_mname || "",
      mother_occupation: chrecDetails?.mother_occupation || motherInfo?.per_occupation || "",
      mother_age: motherInfo?.per_dob ? calculateAgeFromDOB(motherInfo.per_dob, chrecDetails?.created_at).years : "",

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
  }, [childData, patId]);

  // Other hooks remain the same
  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading, refetch: refetchUnvaccinated } = useUnvaccinatedVaccines(patId, transformChildData?.dob || undefined);
  const { data: followUps = [], isLoading: followupLoading, refetch: refetchFollowups, isError: isUnVacError } = useFollowupChildHealthandVaccines(patId);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading, refetch: refetchVaccinations, isError: isVacError } = usePatientVaccinationDetails(patId);
  const { data: nutritionalStatusData = [], isLoading: isGrowthLoading, isError: isgrowthError, refetch: refetchNutritional } = useNutriotionalStatus(patId);

  const isLoading = isChildDataLoading || followupLoading || isUnvaccinatedLoading || isCompleteVaccineLoading || isGrowthLoading;

  // State
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
        patrec: patId,

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
  }, [childData, transformChildData, patId]);

  // NEW: Check if no records found
  const noRecordsFound = useMemo(() => {
    return !isChildDataLoading && processedHistoryData.length === 0;
  }, [isChildDataLoading, processedHistoryData.length]);

  // Paginate health records
  const paginatedHealthRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedHistoryData.slice(startIndex, endIndex);
  }, [processedHistoryData, currentPage, pageSize]);

  const totalPages = Math.ceil(processedHistoryData.length / pageSize);
  const startEntry = processedHistoryData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endEntry = Math.min(currentPage * pageSize, processedHistoryData.length);

  // NEW: Function to navigate to detailed record view
  const navigateToRecordDetails = useCallback(
    (record: any) => {
      router.push({
        pathname: "/childhealth/current-record",
        params: {
          record: JSON.stringify(record),
          patientData: JSON.stringify(transformChildData),
          childData: JSON.stringify(childData)
        }
      });
    },
    [navigation, transformChildData]
  );

  // UPDATED: Render health record card - COMPACT DESIGN WITH ALL DETAILS
  const renderHealthRecordCard = (record: any) => {
    console.log(`🎨 RENDERING CARD ${record.id}:`, {
      temp: record.temp,
      wt: record.wt,
      ht: record.ht
    });

    return (
      <View key={record.chhist_id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm  mr-4">
        {/* Card Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="">
            <View className="flex-row items-center  gap-4 justify-between mb-2">
              <Text className="text-gray-900 text-lg font-bold mr-3">Record {processedHistoryData.length - record.id + 1}</Text>

              <Text className="text-gray-500 text-sm">{record.updatedAt}</Text>
            </View>

            <View className="flex-row justify-between gap-4">
              <View className={`${getStatusColor(record.status)} px-2 py-1 rounded-lg`}>
                <Text className="text-white text-xs font-medium">{record.status === "recorded" ? "Completed" : record.status}</Text>
              </View>
              <Text className="text-gray-700 text-sm font-medium">Age: {record.age}</Text>
            </View>
          </View>
        </View>

        {/* Vital Signs - ALWAYS VISIBLE */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-gray-800 text-sm font-semibold mb-2">Vital Signs & Measurements</Text>

          <View className="space-y-2">
            {/* Temperature */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center">
                <Thermometer size={16} color="#ef4444" />
                <Text className="text-gray-600 text-xs ml-2">Temperature:</Text>
              </View>
              <Text className="text-gray-900 text-sm font-medium">{record.temp ? `${record.temp}°C` : "Not recorded"}</Text>
            </View>

            {/* Weight */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center">
                <Weight size={16} color="#3b82f6" />
                <Text className="text-gray-600 text-xs ml-2">Weight:</Text>
              </View>
              <Text className="text-gray-900 text-sm font-medium">{record.wt ? `${record.wt} kg` : "Not recorded"}</Text>
            </View>

            {/* Height */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center">
                <Ruler size={16} color="#10b981" />
                <Text className="text-gray-600 text-xs ml-2">Height:</Text>
              </View>
              <Text className="text-gray-900 text-sm font-medium">{record.ht ? `${record.ht} cm` : "Not recorded"}</Text>
            </View>

            {/* BMI */}
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-row items-center">
                <Heart size={16} color="#8b5cf6" />
                <Text className="text-gray-600 text-xs ml-2">BMI:</Text>
              </View>
              <Text className="text-gray-900 text-sm font-medium">{record.bmi !== "N/A" ? record.bmi : "Not calculated"}</Text>
            </View>

            {/* MUAC - only show if available */}
            {record.muac && record.muac !== "None" && (
              <View className="flex-row items-center justify-between py-1">
                <View className="flex-row items-center">
                  <Ruler size={16} color="#f59e0b" />
                  <Text className="text-gray-600 text-xs ml-2">MUAC:</Text>
                </View>
                <Text className="text-gray-900 text-sm font-medium">{record.muac}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Detailed Measurements - ALWAYS VISIBLE */}
        {(record.muac || record.edemaSeverity || record.wfa || record.lhfa || record.wfl) && (
          <View className="bg-blue-50 rounded-lg p-3 mb-3">
            <Text className="text-gray-800 text-sm font-semibold mb-2">Nutritional Status</Text>

            <View className="space-y-1">
              {record.muac && record.muac !== "None" && (
                <Text className="text-gray-700 text-sm">
                  <Text className="font-medium">MUAC:</Text> {record.muac}
                </Text>
              )}
              {record.edemaSeverity && record.edemaSeverity !== "None" && (
                <Text className="text-gray-700 text-sm">
                  <Text className="font-medium">Edema:</Text> {record.edemaSeverity}
                </Text>
              )}
              {record.wfa && (
                <Text className="text-gray-700 text-sm">
                  <Text className="font-medium">WFA:</Text> {record.wfa}
                </Text>
              )}
              {record.lhfa && (
                <Text className="text-gray-700 text-sm">
                  <Text className="font-medium">LHFA:</Text> {record.lhfa}
                </Text>
              )}
              {record.wfl && (
                <Text className="text-gray-700 text-sm">
                  <Text className="font-medium">WFL:</Text> {record.wfl}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Additional Information */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Shield size={16} color="#6b7280" />
            <Text className="text-gray-700 text-sm font-medium ml-1">TT Status of mother: {record.vaccineStat}</Text>
          </View>
        </View>

        {/* Notes Preview */}
        {record.latestNote && (
          <View className="mb-3">
            <Text className="text-gray-600 text-xs font-medium mb-1">Latest Note:</Text>
            <Text className="text-gray-700 text-sm" numberOfLines={2}>
              {record.latestNote.length > 80 ? `${record.latestNote.substring(0, 80)}...` : record.latestNote}
            </Text>
          </View>
        )}

        {/* Follow-up Preview */}
        {(record.followUpDescription || record.followUpDate) && (
          <View className="mb-3">
            <Text className="text-gray-600 text-xs font-medium mb-1">Follow-up:</Text>
            {record.followUpDescription && (
              <Text className="text-gray-700 text-sm" numberOfLines={2}>
                {record.followUpDescription.length > 80 ? `${record.followUpDescription.substring(0, 80)}...` : record.followUpDescription}
              </Text>
            )}
            {record.followUpDate && (
              <View className="flex-row items-center mt-1">
                <Calendar size={12} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">{record.followUpDate}</Text>
              </View>
            )}
            {record.followUpStatus && (
              <View className="flex-row items-center mt-1">
                <Stethoscope size={12} color="#6b7280" />
                <Text className="text-gray-500 text-xs ml-1">{record.followUpStatus}</Text>
              </View>
            )}
          </View>
        )}

        {/* View Details Button */}
        <TouchableOpacity onPress={() => navigateToRecordDetails(record)} className="flex-row items-center justify-center bg-blue-50 border border-blue-200 rounded-lg py-2 mt-2" activeOpacity={0.7}>
          <Text className="text-blue-600 text-sm font-medium mr-2">View Full Details</Text>
          <ArrowRight size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    );
  };

  const getStatusColor = (status: any) => {
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchChildData(), refetchUnvaccinated(), refetchFollowups(), refetchVaccinations(), refetchNutritional()]);
      setCurrentPage(1); // Reset to first page on refresh
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchChildData, refetchUnvaccinated, refetchFollowups, refetchVaccinations, refetchNutritional]);

  const handlePageChange = useCallback((page: any) => {
    setCurrentPage(page);
  }, []);

  if (isChildDataLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <LoadingState />
      </View>
    );
  }

  const error = isChildDataError || isgrowthError || isVacError || isUnVacError;
  if (error) {
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
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-slate-900 text-[13px]">Child Health Records</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1 b" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* NEW: Show "No Records Found" message when no records exist */}
        {noRecordsFound ? (
          <NoRecordsCard />
        ) : (
          <>
            <View className="mx-4 mb-2">
              <ChildHealthRecordCard child={transformChildData} isLoading={isChildDataLoading} />
            </View>
            {/* Vaccination Status & Follow-ups Tabs */}
            {!isLoading && (
              <View className="bg-white mx-4 my-2 rounded-xl p-4 shadow-sm border border-gray-200">
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
            <View className="p-4">
              <GrowthChart data={nutritionalStatusData} isLoading={isGrowthLoading} error={isgrowthError} />
            </View>

            {/* Health Records Section */}
            <View className="bg-white my-2  mb-4 border-gray-200 border-t ">
              <View className="flex-row justify-between items-center mb-4 p-4">
                <Text className="text-gray-800 text-lg font-semibold">Health Records</Text>
                <View className="flex-row items-center space-x-2">
                  <Text className="text-gray-700 text-sm font-medium mr-2">Records Found</Text>
                  <View className="bg-blue-100 border border-blue-300 rounded-full px-3 py-1">
                    <Text className="text-blue-600 text-xs font-semibold">{processedHistoryData.length}</Text>
                  </View>
                </View>
              </View>

              {/* Entries Summary */}
              {processedHistoryData.length > 0 && (
                <View className="py-2 border-b border-gray-100 mb-3 p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">
                      Showing {startEntry} to {endEntry} of {processedHistoryData.length} entries
                    </Text>
                    <Text className="text-sm font-medium text-gray-800">
                      Page {currentPage} of {totalPages}
                    </Text>
                  </View>
                </View>
              )}

              {/* Health Records List - HORIZONTAL SCROLL */}
              <View className="mb-4 p-4">
                {isChildDataLoading ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-500 text-base mt-3">Loading records...</Text>
                  </View>
                ) : paginatedHealthRecords.length === 0 ? (
                  <View className="items-center py-8">
                    <Text className="text-gray-500 text-base">No health records found</Text>
                  </View>
                ) : (
                  <>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ paddingRight: 16 }}>
                      <View className="flex-row">{paginatedHealthRecords.map((record) => renderHealthRecordCard(record))}</View>
                    </ScrollView>

                    {/* Pagination Controls */}
                    {totalPages > 1 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </PageLayout>
  );
}
