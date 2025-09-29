<<<<<<< HEAD
// InvChildHealthRecords.js - COMPLETE FIXED VERSION
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ChevronLeft, Weight,
  Ruler,
  Thermometer
} from "lucide-react-native";

// Custom hooks
import {
  useNutriotionalStatus,
  useChildData,
} from "../admin/admin-childhealth/queries/fetchQueries";
=======
// InvChildHealthRecords.js - UPDATED VERSION
import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, FileText, Plus, Calendar, Weight, Ruler, Thermometer, Shield, Stethoscope, Heart, Droplets, Eye } from "lucide-react-native";

// Custom hooks
import { useNutriotionalStatus, useChildData } from "../admin/admin-childhealth/queries/fetchQueries";
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
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
<<<<<<< HEAD



=======
import HealthRecordCard from "./health-record-card";
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
export default function InvChildHealthRecords() {
  const navigation = useNavigation();
  const route = useRoute();

  // Get patient ID from route params with safe access
<<<<<<< HEAD
  const patientId = "PR20200001";
  const patId = patientId;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
=======
  const [patientId, setPatientId] = useState("PR20200001");
  const patId = patientId;

  // State
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
  const [activeTab, setActiveTab] = useState("status");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);

  // Use the useChildData hook
<<<<<<< HEAD
  const {
    data: childData,
    isLoading: isChildDataLoading,
    isError: isChildDataError,
    error: childDataError,
    refetch: refetchChildData,
  } = useChildData(patientId, currentPage, pageSize);

  // Get the LATEST record for parent information - FIXED
  const getLatestRecord = useMemo(() => {
    if (!childData || !Array.isArray(childData) || childData.length === 0) {
      return null;
    }

    const mainData = childData[0];

    if (
      !mainData.child_health_histories ||
      mainData.child_health_histories.length === 0
    ) {
      return mainData;
    }

    const sortedHistories = [...mainData.child_health_histories].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return sortedHistories[0];
  }, [childData]);

  const latestRecordData = getLatestRecord?.chrec_details || getLatestRecord;
  const dob =
    latestRecordData?.patrec_details?.pat_details?.personal_info?.per_dob || "";

  const totalRecords =
    childData && Array.isArray(childData) && childData.length > 0
      ? childData[0].child_health_histories?.length || 0
      : 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Transform the LATEST backend data to match ChildHealthRecordCard interface
  const transformChildData = (latestRecord: any) => {
    if (!latestRecord || !latestRecord.patrec_details?.pat_details) {
      console.log("No latest record data available for transformation");
      return null;
    }

    const patDetails = latestRecord.patrec_details.pat_details;
    const personalInfo = patDetails.personal_info;
    const address = patDetails.address;
    const familyHeadInfo = patDetails.family_head_info?.family_heads;

    const motherInfo = familyHeadInfo?.mother?.personal_info;
    const fatherInfo = familyHeadInfo?.father?.personal_info;

    return {
      // Patient basic info
      pat_id: personalInfo?.per_id || patDetails.pat_id,
=======
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
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
      fname: personalInfo?.per_fname || "",
      lname: personalInfo?.per_lname || "",
      mname: personalInfo?.per_mname || "",
      sex: personalInfo?.per_sex || "",
<<<<<<< HEAD
      age: personalInfo?.per_dob
        ? calculateAgeFromDOB(personalInfo.per_dob).ageString
        : "",
=======
      age: personalInfo?.per_dob ? calculateAgeFromDOB(personalInfo.per_dob,chrecDetails?.created_at).years : "",
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
      dob: personalInfo?.per_dob || "",

      // Mother info
      mother_fname: motherInfo?.per_fname || "",
      mother_lname: motherInfo?.per_lname || "",
      mother_mname: motherInfo?.per_mname || "",
<<<<<<< HEAD
      mother_occupation: latestRecord?.mother_occupation || "",
      mother_age: motherInfo?.per_dob
        ? calculateAgeFromDOB(motherInfo.per_dob).ageString
        : "",
=======
      mother_occupation: chrecDetails?.mother_occupation || motherInfo?.per_occupation || "",
      mother_age: motherInfo?.per_dob ? calculateAgeFromDOB(motherInfo.per_dob,chrecDetails?.created_at).years : "",
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52

      // Father info
      father_fname: fatherInfo?.per_fname || "",
      father_lname: fatherInfo?.per_lname || "",
      father_mname: fatherInfo?.per_mname || "",
<<<<<<< HEAD
      father_age: fatherInfo?.per_dob
        ? calculateAgeFromDOB(fatherInfo.per_dob).ageString
        : "",
      father_occupation: latestRecord?.father_occupation || "",
=======
      father_age: fatherInfo?.per_dob ? calculateAgeFromDOB(fatherInfo.per_dob).ageString : "",
      father_occupation: chrecDetails?.father_occupation || fatherInfo?.per_occupation || "",
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52

      // Address info
      address: address?.full_address || "",
      street: address?.add_street || "",
      barangay: address?.add_barangay || "",
      city: address?.add_city || "",
      province: address?.add_province || "",
<<<<<<< HEAD
      landmarks: latestRecord?.landmarks || "",

      // Child health specific info
      type_of_feeding: latestRecord?.type_of_feeding || "",
      delivery_type: latestRecord?.place_of_delivery_type || "",
      pod_location: latestRecord?.pod_location || "",
      tt_status: familyHeadInfo?.tt_status || latestRecord?.tt_status || "",
      birth_order: latestRecord?.birth_order?.toString() || "",
=======
      landmarks: chrecDetails?.landmarks || address?.add_landmarks || "",

      // Child health specific info
      type_of_feeding: chrecDetails?.type_of_feeding || "",
      delivery_type: chrecDetails?.place_of_delivery_type || "",
      pod_location: chrecDetails?.pod_location || "",
      tt_status: familyHeadInfo?.tt_status || firstHistory?.tt_status || "",
      birth_order: chrecDetails?.birth_order?.toString() || ""
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
    };

    console.log("✅ TRANSFORMED CHILD DATA:", transformedData);
    return transformedData;
  }, [childData, patientId]);

<<<<<<< HEAD
  const {
    data: unvaccinatedVaccines = [],
    isLoading: isUnvaccinatedLoading,
    refetch: refetchUnvaccinated,
  } = useUnvaccinatedVaccines(patId, dob);

  const {
    data: followUps = [],
    isLoading: followupLoading,
    refetch: refetchFollowups,
  } = useFollowupChildHealthandVaccines(patId);

  const {
    data: vaccinations = [],
    isLoading: isCompleteVaccineLoading,
    refetch: refetchVaccinations,
  } = usePatientVaccinationDetails(patId);

  const {
    data: nutritionalStatusData = [],
    isLoading: isGrowthLoading,
    isError: isgrowthError,
    refetch: refetchNutritional,
  } = useNutriotionalStatus(patId);

  const isLoading =
    isChildDataLoading ||
    followupLoading ||
    isUnvaccinatedLoading ||
    isCompleteVaccineLoading ||
    isGrowthLoading;

  const isError = isChildDataError;
  const error = childDataError;

  useEffect(() => {
    if (!patientId) {
      console.error("Patient ID is missing from route params.");
      Alert.alert("Error", "Patient ID is required");
      return;
    }
  }, [patientId, navigation]);

  useEffect(() => {
    if (isChildDataError) {
      console.error("Error fetching child data:", childDataError);
      Alert.alert("Error", "Failed to load child health record");
    }
  }, [isChildDataError, childDataError]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchChildData(),
        refetchUnvaccinated(),
        refetchFollowups(),
        refetchVaccinations(),
        refetchNutritional(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchChildData,
    refetchUnvaccinated,
    refetchFollowups,
    refetchVaccinations,
    refetchNutritional,
  ]);

  // In your processedchildData useMemo
  const processedchildData = useMemo(() => {
    if (!childData || childData.length === 0) return [];
    const mainRecord = childData[0];
    if (!mainRecord || !mainRecord.child_health_histories) {
      return [];
    }
    const sortedHistories = [...mainRecord.child_health_histories].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sortedHistories.map((record: any, index: number) => {
=======
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
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
      let bmi = "N/A";
      let findingsData = {
        subj_summary: "",
        obj_summary: "",
        assessment_summary: "",
<<<<<<< HEAD
        plantreatment_summary: "",
      };

      // Extract findings from vital signs if available
=======
        plantreatment_summary: ""
      };

      // Extract vital signs and findings (matching web version)
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
      if (record.child_health_vital_signs?.length > 0) {
        const vital = record.child_health_vital_signs[0];

        // Calculate BMI
        if (vital.bm_details?.height && vital.bm_details?.weight) {
          const heightInM = vital.bm_details.height / 100;
<<<<<<< HEAD
          const bmiValue = (
            vital.bm_details.weight /
            (heightInM * heightInM)
          ).toFixed(1);
=======
          const bmiValue = (vital.bm_details.weight / (heightInM * heightInM)).toFixed(1);
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
          bmi = bmiValue;
        }

        // Extract findings data
        if (vital.find_details) {
          findingsData = {
            subj_summary: vital.find_details.subj_summary || "",
            obj_summary: vital.find_details.obj_summary || "",
            assessment_summary: vital.find_details.assessment_summary || "",
<<<<<<< HEAD
            plantreatment_summary:
              vital.find_details.plantreatment_summary || "",
=======
            plantreatment_summary: vital.find_details.plantreatment_summary || ""
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
          };
        }
      }

<<<<<<< HEAD
      let latestNoteContent: string | null = null;
=======
      // Extract notes and follow-up info (matching web version)
      let latestNoteContent = null;
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
      let followUpDescription = "";
      let followUpDate = "";
      let followUpStatus = "";

      if (record.child_health_notes && record.child_health_notes.length > 0) {
<<<<<<< HEAD
        const sortedNotes = [...record.child_health_notes].sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        latestNoteContent = sortedNotes[0].chn_notes || null;

        if (sortedNotes[0].followv_details) {
          followUpDescription =
            sortedNotes[0].followv_details.followv_description || "";
=======
        const sortedNotes = [...record.child_health_notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        latestNoteContent = sortedNotes[0].chn_notes || null;

        if (sortedNotes[0].followv_details) {
          followUpDescription = sortedNotes[0].followv_details.followv_description || "";
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
          followUpDate = sortedNotes[0].followv_details.followv_date || "";
          followUpStatus = sortedNotes[0].followv_details.followv_status || "";
        }
      }

<<<<<<< HEAD
      return {
        chrec_id: mainRecord.chrec,
        patrec: mainRecord.patrec_id,
        status: record.status || "N/A",
        chhist_id: record.chhist_id,
        id: index + 1,
        temp: record.child_health_vital_signs?.[0]?.temp || 0,
        age: dob
          ? calculateAgeFromDOB(dob, record.created_at).ageString
          : "N/A", // Safe access
        wt: record.child_health_vital_signs?.[0]?.bm_details?.weight || 0,
        ht: record.child_health_vital_signs?.[0]?.bm_details?.height || 0,
        bmi,
=======
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
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
        latestNote: latestNoteContent,
        followUpDescription,
        followUpDate,
        followUpStatus,
<<<<<<< HEAD
        vaccineStat: record.tt_status || "N/A",
        updatedAt: new Date(record.created_at).toLocaleDateString(),
        rawCreatedAt: record.created_at,
        // Add findings data
        findings: findingsData,
        hasFindings:
          !!findingsData.subj_summary ||
          !!findingsData.obj_summary ||
          !!findingsData.assessment_summary ||
          !!findingsData.plantreatment_summary,
      };
    });
  }, [childData, dob]); // Use dob instead of childData.dob

  const latestHealthRecord = useMemo(() => {
    if (processedchildData.length === 0) return null;
    return processedchildData[0];
  }, [processedchildData]);

  // Handle page changes
  const handlePageChange = (newPage: any) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: any) => {
    const value = Math.max(1, parseInt(newSize) || 10);
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleSetActiveTab = (tab: any) => {
    setActiveTab(tab);
  };

  const toggleCardExpand = (cardId: any) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const getStatusColor = (status: any) => {
    if (!status || typeof status !== "string" || status.trim() === "") {
      return "bg-gray-500";
    }

    const lowerStatus = status.toLowerCase().trim();

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

  // FIXED: Render health record card with ALL vital signs properly displayed
  const renderHealthRecordCard = (record: any) => {
    const isExpanded = expandedCard === record.chhist_id;

    console.log(`🎨 RENDERING CARD for record ${record.chhist_id}:`);
    console.log("- Vital signs count:", record.vitalSigns.length);
    console.log("- Has vital data:", record.hasVitalData);
    console.log("- All vital signs data:", record.vitalSigns);

    return (
      <TouchableOpacity
        key={record.chhist_id}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm"
        onPress={() => toggleCardExpand(record.chhist_id)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-gray-900 text-lg font-bold mr-3">
                Record ID: {record.chhist_id}
              </Text>
              <View
                className={`${getStatusColor(
                  record.status
                )} px-2 py-1 rounded-lg`}
              >
                <Text className="text-white text-xs font-medium">
                  {record.status || "N/A"}
                </Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm">{record.updatedAt}</Text>
          </View>
        </View>

        {/* FIXED: Show ALL vital signs data */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-gray-800 text-sm font-semibold mb-2">
            Vital Signs & Measurements
          </Text>

          <View className="mb-3 last:mb-0">
            {/* Show ALL vital signs in a comprehensive grid */}
            <View className="flex-row flex-wrap gap-3">
              {/* Temperature */}
              <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[100px]">
                <Thermometer size={14} color="#ef4444" />
                <Text className="text-gray-700 text-xs ml-1">
                  {record.temp !== "" ? `${record.temp}°C` : "No temp"}
                </Text>
              </View>

              {/* Weight */}
              <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[100px]">
                <Weight size={14} color="#3b82f6" />
                <Text className="text-gray-700 text-xs ml-1">
                  {record.wt !== "" ? `${record.wt} kg` : "No weight"}
                </Text>
              </View>

              {/* Height */}
              <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[100px]">
                <Ruler size={14} color="#10b981" />
                <Text className="text-gray-700 text-xs ml-1">
                  {record.ht !== "" ? `${record.ht} cm` : "No height"}
                </Text>
              </View>

              {/* BMI */}
              {record.bmi !== "N/A" && (
                <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[80px]">
                  <Text className="text-gray-700 text-xs font-medium">
                    BMI: {record.bmi}
                  </Text>
                </View>
              )}

              {/* MUAC */}
              {record.muac && record.muac !== "" && (
                <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[80px]">
                  <Text className="text-gray-700 text-xs">
                    MUAC: {record.muac}
                  </Text>
                </View>
              )}

              {/* Edema */}
              {record.edemaSeverity &&
                record.edemaSeverity !== "" &&
                record.edemaSeverity !== "None" && (
                  <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[80px]">
                    <Text className="text-gray-700 text-xs">
                      Edema: {record.edemaSeverity}
                    </Text>
                  </View>
                )}

              {/* Nutritional Status Indicators */}
              {record.wfa && record.wfa !== "" && (
                <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[60px]">
                  <Text className="text-gray-700 text-xs">
                    WFA: {record.wfa}
                  </Text>
                </View>
              )}

              {record.lhfa && record.lhfa !== "" && (
                <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[60px]">
                  <Text className="text-gray-700 text-xs">
                    LHFA: {record.lhfa}
                  </Text>
                </View>
              )}

              {record.wfl && record.wfl !== "" && (
                <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[60px]">
                  <Text className="text-gray-700 text-xs">
                    WFL: {record.wfl}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-red-500 text-base text-center mb-4">
          Error loading data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
=======

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
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
        <Button variant="outline" onPress={onRefresh}>
          <Text>Refresh</Text>
        </Button>
      </View>
    );
  }

<<<<<<< HEAD
  if (!childData) {
    return (
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-red-500 text-base text-center mb-4">
          Child health record data not found
        </Text>
        <Button variant="outline" onPress={() => navigation.goBack()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
=======
  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
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

<<<<<<< HEAD
      <View className="border-b border-gray-200" />

      {/* Child Health Record Card - with LATEST transformed data */}
      <View className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm">
        {transformedChildData ? (
          <ChildHealthRecordCard child={transformedChildData} />
=======
      {/* Child Health Record Card */}
      <View className=" mx-4 my-4 rounded-xl ">
        {transformChildData ? (
          <ChildHealthRecordCard child={transformChildData} />
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
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
<<<<<<< HEAD
            <TouchableOpacity
              onPress={() => handleSetActiveTab("status")}
              className={`flex-1 py-3 items-center ${
                activeTab === "status" ? "border-b-2 border-blue-500" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === "status" ? "text-blue-500" : "text-gray-500"
                }`}
              >
                Vaccination Status
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSetActiveTab("followups")}
              className={`flex-1 py-3 items-center ${
                activeTab === "followups" ? "border-b-2 border-blue-500" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === "followups" ? "text-blue-500" : "text-gray-500"
                }`}
              >
                Follow-ups
              </Text>
            </TouchableOpacity>
          </View>
          <View className="mt-4">
            {activeTab === "status" && (
              <VaccinationStatusCards
                unvaccinatedVaccines={unvaccinatedVaccines}
                vaccinations={vaccinations}
              />
            )}
            {activeTab === "followups" && (
              <FollowUpsCard childHealthFollowups={followUps} />
            )}
=======
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
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
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
<<<<<<< HEAD
          <Text className="text-gray-800 text-lg font-semibold">
            Health Records
          </Text>
          <Text className="text-gray-500 text-sm">
            {totalRecords} records found
          </Text>
        </View>

        {/* Records Display Options */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Text className="text-gray-500 text-sm mr-2">Show</Text>
            <TextInput
              className="w-14 border border-gray-200 rounded-md p-2 text-center text-sm"
              value={pageSize.toString()}
              onChangeText={handlePageSizeChange}
              keyboardType="numeric"
            />
            <Text className="text-gray-500 text-sm ml-2">entries</Text>
          </View>
        </View>

        {/* Health Records List */}
=======
          <Text className="text-gray-800 text-lg font-semibold">Health Records</Text>
          <Text className="text-gray-500 text-sm">{processedHistoryData.length} records found</Text>
        </View>

        {/* Health Records List - Using the separated component */}
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
        <View className="mb-4">
          {isChildDataLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 text-base mt-3">
                Loading records...
              </Text>
            </View>
          ) : processedchildData.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-base">
                No health records found
              </Text>
            </View>
          ) : (
<<<<<<< HEAD
            processedchildData.map(renderHealthRecordCard)
          )}
        </View>

        {/* Pagination */}
        {totalRecords > 0 && (
          <View className="flex-row justify-between items-center pt-4 border-t border-gray-200">
            <Text className="text-gray-500 text-sm">
              Showing 1-{totalRecords} of {totalRecords} records
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isChildDataLoading}
                className={`px-3 py-2 rounded-md ${
                  currentPage === 1 ? "bg-gray-300" : "bg-blue-500"
                }`}
              >
                <Text className="text-white font-medium">Previous</Text>
              </TouchableOpacity>
              <Text className="text-gray-700 text-sm mx-4">
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity
                onPress={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isChildDataLoading}
                className={`px-3 py-2 rounded-md ${
                  currentPage === totalPages ? "bg-gray-300" : "bg-blue-500"
                }`}
              >
                <Text className="text-white font-medium">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
=======
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
>>>>>>> 1c5f41ba8f50df4ee820c9d322f1a2e4eac0af52
      </View>
    </ScrollView>
  );
}
