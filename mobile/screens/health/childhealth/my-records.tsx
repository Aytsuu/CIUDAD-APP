// InvChildHealthRecords.js - COMPLETE FIXED VERSION
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, FileText, Plus, Calendar, Weight, Ruler, Thermometer, Shield, Stethoscope, Heart, Droplets, Eye } from 'lucide-react-native';

// Custom hooks
import { useNutriotionalStatus, useChildData } from '../admin/admin-childhealth/queries/fetchQueries';
import { useUnvaccinatedVaccines } from '../admin/admin-vaccination/queries/fetch';
import { useFollowupChildHealthandVaccines } from '../admin/admin-vaccination/queries/fetch';
import { usePatientVaccinationDetails } from '../admin/admin-vaccination/queries/fetch';
import { calculateAgeFromDOB } from '@/helpers/ageCalculator';
import { LoadingState } from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { ChildHealthRecordCard } from '@/components/healthcomponents/childInfoCard';
import { VaccinationStatusCards } from '../admin/components/vaccination-status-cards';
import { FollowUpsCard } from '../admin/components/followup-cards';
import { GrowthChart } from './growth-chart';

export default function InvChildHealthRecords() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get patient ID from route params with safe access
  const patientId = 'PR20200001';
  const patId = patientId;
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('status');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Use the useChildData hook
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
    
    if (!mainData.child_health_histories || mainData.child_health_histories.length === 0) {
      return mainData;
    }
    
    const sortedHistories = [...mainData.child_health_histories].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    
    return sortedHistories[0];
  }, [childData]);

  const latestRecordData = getLatestRecord?.chrec_details || getLatestRecord;
  const dob = latestRecordData?.patrec_details?.pat_details?.personal_info?.per_dob || '';
  
  const totalRecords = childData && Array.isArray(childData) && childData.length > 0 
    ? childData[0].child_health_histories?.length || 0 
    : 0;
  const totalPages = Math.ceil(totalRecords / pageSize);
  
  // Transform the LATEST backend data to match ChildHealthRecordCard interface
  const transformChildData = (latestRecord) => {
    if (!latestRecord || !latestRecord.patrec_details?.pat_details) {
      console.log('No latest record data available for transformation');
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
      fname: personalInfo?.per_fname || '',
      lname: personalInfo?.per_lname || '',
      mname: personalInfo?.per_mname || '',
      sex: personalInfo?.per_sex || '',
      age: personalInfo?.per_dob ? calculateAgeFromDOB(personalInfo.per_dob).ageString : '',
      dob: personalInfo?.per_dob || '',
      
      // Mother info
      mother_fname: motherInfo?.per_fname || '',
      mother_lname: motherInfo?.per_lname || '',
      mother_mname: motherInfo?.per_mname || '',
      mother_occupation: latestRecord?.mother_occupation || '',
      mother_age: motherInfo?.per_dob ? calculateAgeFromDOB(motherInfo.per_dob).ageString : '',
      
      // Father info
      father_fname: fatherInfo?.per_fname || '',
      father_lname: fatherInfo?.per_lname || '',
      father_mname: fatherInfo?.per_mname || '',
      father_age: fatherInfo?.per_dob ? calculateAgeFromDOB(fatherInfo.per_dob).ageString : '',
      father_occupation: latestRecord?.father_occupation || '',
      
      // Address info
      address: address?.full_address || '',
      street: address?.add_street || '',
      barangay: address?.add_barangay || '',
      city: address?.add_city || '',
      province: address?.add_province || '',
      landmarks: latestRecord?.landmarks || '',
      
      // Child health specific info
      type_of_feeding: latestRecord?.type_of_feeding || '',
      delivery_type: latestRecord?.place_of_delivery_type || '',
      pod_location: latestRecord?.pod_location || '',
      tt_status: familyHeadInfo?.tt_status || latestRecord?.tt_status || '',
      birth_order: latestRecord?.birth_order?.toString() || '',
    };
  };

  const transformedChildData = useMemo(() => {
    return transformChildData(latestRecordData);
  }, [latestRecordData]);

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
      console.error('Patient ID is missing from route params.');
      Alert.alert('Error', 'Patient ID is required');
      return;
    }
  }, [patientId, navigation]);
  
  useEffect(() => {
    if (isChildDataError) {
      console.error('Error fetching child data:', childDataError);
      Alert.alert('Error', 'Failed to load child health record');
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
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchChildData,
    refetchUnvaccinated,
    refetchFollowups,
    refetchVaccinations,
    refetchNutritional
  ]);
  
  // FIXED: Process history data ensuring each record has ONLY its own vital signs
  const processedHistoryData = useMemo(() => {
    if (!childData || !Array.isArray(childData) || childData.length === 0) {
      console.log('❌ No child data found or invalid structure');
      return [];
    }
    
    // Get the first item which contains the child_health_histories array
    const mainData = childData[0];
    
    if (!mainData.child_health_histories || !Array.isArray(mainData.child_health_histories)) {
      console.log('❌ No child health histories found');
      return [];
    }
    
    console.log('🔍 PROCESSING CHILD HEALTH HISTORIES:', mainData.child_health_histories.length, 'records');
    
    // Sort by created_at to show latest first
    const sortedHistories = [...mainData.child_health_histories].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    
    return sortedHistories.map((historyRecord, index) => {
      console.log(`\n📋 PROCESSING HISTORY RECORD ${historyRecord.chhist_id}:`);
      console.log('- History Record chrec:', historyRecord.chrec);
      console.log('- History Record chhist_id:', historyRecord.chhist_id);
      console.log('- Raw vital signs for THIS record:', historyRecord.child_health_vital_signs);
      console.log('- Vital signs count for THIS record:', historyRecord.child_health_vital_signs?.length || 0);
      
      // CRITICAL: Only process vital signs that belong to THIS specific history record
      const thisRecordVitalSigns = historyRecord.child_health_vital_signs || [];
      
      console.log(`🩺 Processing ${thisRecordVitalSigns.length} vital signs for record ${historyRecord.chhist_id}`);
      
      const processedVitalSigns = thisRecordVitalSigns.map((vital, vitalIndex) => {
        console.log(`\n🩺 VITAL SIGN ${vitalIndex + 1} for record ${historyRecord.chhist_id}:`);
        console.log('- Vital ID:', vital.chvital_id);
        console.log('- Vital chhist reference:', vital.chhist);
        console.log('- Temperature:', vital.temp);
        console.log('- BM Details:', vital.bm_details);
        console.log('- Complete Vital Data:', JSON.stringify(vital, null, 2));
        
        // VERIFICATION: Ensure this vital sign belongs to this history record
        if (vital.chhist !== historyRecord.chhist_id) {
          console.warn(`⚠️ MISMATCH: Vital sign ${vital.chvital_id} has chhist ${vital.chhist} but should be ${historyRecord.chhist_id}`);
        }
        
        // Extract ALL vital sign values - handle null/undefined properly
        const temperature = vital.temp !== null && vital.temp !== undefined ? String(vital.temp) : '';
        
        // Body measurements
        const weight = vital.bm_details?.weight !== null && vital.bm_details?.weight !== undefined 
          ? String(vital.bm_details.weight) : '';
        const height = vital.bm_details?.height !== null && vital.bm_details?.height !== undefined 
          ? String(vital.bm_details.height) : '';
        const muac = vital.bm_details?.muac !== null && vital.bm_details?.muac !== undefined 
          ? String(vital.bm_details.muac) : '';
        const edemaSeverity = vital.bm_details?.edemaSeverity || '';
        const wfa = vital.bm_details?.wfa || '';
        const lhfa = vital.bm_details?.lhfa || '';
        const wfl = vital.bm_details?.wfl || '';
        const muac_status = vital.bm_details?.muac_status || '';
        const bm_remarks = vital.bm_details?.remarks || '';
        
        // Calculate BMI if we have both weight and height
        let bmi = 'N/A';
        if (weight && height && weight !== '' && height !== '') {
          try {
            const weightNum = parseFloat(weight);
            const heightNum = parseFloat(height);
            if (weightNum > 0 && heightNum > 0) {
              const heightM = heightNum / 100; // Convert cm to meters
              const bmiValue = weightNum / (heightM * heightM);
              bmi = bmiValue.toFixed(1);
            }
          } catch (e) {
            console.log('BMI calculation error:', e);
          }
        }
        
        // Extract findings if available
        let findingsData = {
          subj_summary: '',
          obj_summary: '',
          assessment_summary: '',
          plantreatment_summary: '',
        };
        
        if (vital.find_details) {
          findingsData = {
            subj_summary: vital.find_details.subj_summary || '',
            obj_summary: vital.find_details.obj_summary || '',
            assessment_summary: vital.find_details.assessment_summary || '',
            plantreatment_summary: vital.find_details.plantreatment_summary || '',
          };
        }
        
        // Check if we have additional vital signs in the vital object
        const hasAdditionalVitals = vital.vital_details && typeof vital.vital_details === 'object';
        
        const processedVital = {
          vital_id: vital.chvital_id,
          vital_index: vitalIndex + 1,
          chhist_reference: vital.chhist, // Track which history record this belongs to
          
          // Core vital signs
          temp: temperature,
          
          // Body measurements
          wt: weight,
          ht: height,
          bmi,
          muac,
          edemaSeverity,
          wfa,
          lhfa,
          wfl,
          muac_status,
          bm_remarks,
          
          // Additional vital signs if available
          blood_pressure: hasAdditionalVitals ? vital.vital_details?.blood_pressure : '',
          heart_rate: hasAdditionalVitals ? vital.vital_details?.heart_rate : '',
          respiratory_rate: hasAdditionalVitals ? vital.vital_details?.respiratory_rate : '',
          oxygen_saturation: hasAdditionalVitals ? vital.vital_details?.oxygen_saturation : '',
          
          findings: findingsData,
          hasFindings: !!findingsData.subj_summary ||
            !!findingsData.obj_summary ||
            !!findingsData.assessment_summary ||
            !!findingsData.plantreatment_summary,
          created_at: vital.created_at,
        };
        
        console.log(`✅ PROCESSED VITAL SIGN ${vitalIndex + 1} for record ${historyRecord.chhist_id}:`, {
          vital_id: processedVital.vital_id,
          chhist_reference: processedVital.chhist_reference,
          temp: processedVital.temp,
          wt: processedVital.wt,
          ht: processedVital.ht,
          bmi: processedVital.bmi,
          muac: processedVital.muac,
          edemaSeverity: processedVital.edemaSeverity,
          wfa: processedVital.wfa,
          lhfa: processedVital.lhfa,
          wfl: processedVital.wfl,
        });
        
        return processedVital;
      });
      
      // Check if we have any actual vital data (non-empty values)
      const hasVitalData = processedVitalSigns.some(vital => 
        (vital.temp !== '' && vital.temp !== null) || 
        (vital.wt !== '' && vital.wt !== null) || 
        (vital.ht !== '' && vital.ht !== null) ||
        (vital.muac !== '' && vital.muac !== null) ||
        (vital.blood_pressure !== '' && vital.blood_pressure !== null) ||
        (vital.heart_rate !== '' && vital.heart_rate !== null)
      );
      
      console.log(`🎯 RECORD ${historyRecord.chhist_id} FINAL SUMMARY:`, {
        chhist_id: historyRecord.chhist_id,
        chrec: historyRecord.chrec,
        vitalSignsCount: processedVitalSigns.length,
        hasVitalData: hasVitalData,
        vitalSigns: processedVitalSigns.map(v => ({
          vital_id: v.vital_id,
          chhist_ref: v.chhist_reference,
          temp: v.temp,
          wt: v.wt,
          ht: v.ht,
          bmi: v.bmi,
          muac: v.muac,
          edemaSeverity: v.edemaSeverity,
          wfa: v.wfa,
          lhfa: v.lhfa,
          wfl: v.wfl
        }))
      });
      
      // Extract notes and follow-up info from THIS specific history record
      let latestNoteContent = null;
      let followUpDescription = '';
      let followUpDate = '';
      let followUpStatus = '';
      
      if (historyRecord.child_health_notes && historyRecord.child_health_notes.length > 0) {
        const sortedNotes = [...historyRecord.child_health_notes].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        latestNoteContent = sortedNotes[0].chn_notes || null;
        
        if (sortedNotes[0].followv_details) {
          followUpDescription = sortedNotes[0].followv_details.followv_description || '';
          followUpDate = sortedNotes[0].followv_details.followv_date || '';
          followUpStatus = sortedNotes[0].followv_details.followv_status || '';
        }
      }
      
      const processedRecord = {
        chrec_id: historyRecord.chrec, // This should match the main chrec_id
        patrec: mainData.patrec,
        status: historyRecord.status || 'N/A',
        chhist_id: historyRecord.chhist_id, // Unique ID for this history record
        id: index + 1,
        age: dob ? calculateAgeFromDOB(dob, historyRecord.created_at).ageString : 'N/A',
        latestNote: latestNoteContent,
        followUpDescription,
        followUpDate,
        followUpStatus,
        vaccineStat: historyRecord.tt_status || 'N/A',
        updatedAt: new Date(historyRecord.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        rawCreatedAt: historyRecord.created_at,
        // CRITICAL: Only include vital signs that belong to THIS history record
        vitalSigns: processedVitalSigns,
        hasVitalSigns: processedVitalSigns.length > 0,
        hasVitalData: hasVitalData,
      };
      
      console.log(`🎯 FINAL PROCESSED RECORD ${historyRecord.chhist_id}:`, {
        chhist_id: processedRecord.chhist_id,
        chrec_id: processedRecord.chrec_id,
        vitalSignsCount: processedRecord.vitalSigns.length,
        hasVitalData: processedRecord.hasVitalData
      });
      
      return processedRecord;
    });
  }, [childData, dob]);
  
  const latestHealthRecord = useMemo(() => {
    if (processedHistoryData.length === 0) return null;
    return processedHistoryData[0];
  }, [processedHistoryData]);
  
  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handlePageSizeChange = (newSize) => {
    const value = Math.max(1, parseInt(newSize) || 10);
    setPageSize(value);
    setCurrentPage(1);
  };
  
  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
  };
  
  const toggleCardExpand = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };
  
  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string' || status.trim() === '') {
      return 'bg-gray-500';
    }
    
    const lowerStatus = status.toLowerCase().trim();
    
    switch (lowerStatus) {
      case 'immunization':
        return 'bg-green-500';
      case 'check-up':
        return 'bg-blue-500';
      case 'follow-up':
        return 'bg-yellow-500';
      case 'recorded':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // FIXED: Render health record card with ALL vital signs properly displayed
  const renderHealthRecordCard = (record) => {
    const isExpanded = expandedCard === record.chhist_id;
    
    console.log(`🎨 RENDERING CARD for record ${record.chhist_id}:`);
    console.log('- Vital signs count:', record.vitalSigns.length);
    console.log('- Has vital data:', record.hasVitalData);
    console.log('- All vital signs data:', record.vitalSigns);
    
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
              <View className={`${getStatusColor(record.status)} px-2 py-1 rounded-lg`}>
                <Text className="text-white text-xs font-medium">
                  {record.status || 'N/A'}
                </Text>
              </View>
            </View>
            <Text className="text-gray-500 text-sm">{record.updatedAt}</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-700 text-sm font-medium">Age: {record.age}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {record.vitalSigns.length} vital sign{record.vitalSigns.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        {/* FIXED: Show ALL vital signs data */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-gray-800 text-sm font-semibold mb-2">
            Vital Signs & Measurements 
            <Text className="text-gray-500 text-xs font-normal"> ({record.vitalSigns.length} recorded)</Text>
          </Text>
          
          {record.vitalSigns.length > 0 ? (
            record.vitalSigns.map((vital, index) => (
              <View key={vital.vital_id || index} className="mb-3 last:mb-0">
                {record.vitalSigns.length > 1 && (
                  <Text className="text-gray-600 text-xs font-medium mb-2">
                    Measurement #{vital.vital_index}
                  </Text>
                )}
                
                {/* Show ALL vital signs in a comprehensive grid */}
                <View className="flex-row flex-wrap gap-3">
                  {/* Temperature */}
                  <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[100px]">
                    <Thermometer size={14} color="#ef4444" />
                    <Text className="text-gray-700 text-xs ml-1">
                      {vital.temp !== '' ? `${vital.temp}°C` : 'No temp'}
                    </Text>
                  </View>
                  
                  {/* Weight */}
                  <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[100px]">
                    <Weight size={14} color="#3b82f6" />
                    <Text className="text-gray-700 text-xs ml-1">
                      {vital.wt !== '' ? `${vital.wt} kg` : 'No weight'}
                    </Text>
                  </View>
                  
                  {/* Height */}
                  <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[100px]">
                    <Ruler size={14} color="#10b981" />
                    <Text className="text-gray-700 text-xs ml-1">
                      {vital.ht !== '' ? `${vital.ht} cm` : 'No height'}
                    </Text>
                  </View>
                  
                  {/* BMI */}
                  {vital.bmi !== 'N/A' && (
                    <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[80px]">
                      <Text className="text-gray-700 text-xs font-medium">
                        BMI: {vital.bmi}
                      </Text>
                    </View>
                  )}
                  
                  {/* MUAC */}
                  {vital.muac && vital.muac !== '' && (
                    <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[80px]">
                      <Text className="text-gray-700 text-xs">
                        MUAC: {vital.muac}
                      </Text>
                    </View>
                  )}
                  
                  {/* Edema */}
                  {vital.edemaSeverity && vital.edemaSeverity !== '' && vital.edemaSeverity !== 'None' && (
                    <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[80px]">
                      <Text className="text-gray-700 text-xs">
                        Edema: {vital.edemaSeverity}
                      </Text>
                    </View>
                  )}
                  
                  {/* Nutritional Status Indicators */}
                  {vital.wfa && vital.wfa !== '' && (
                    <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[60px]">
                      <Text className="text-gray-700 text-xs">
                        WFA: {vital.wfa}
                      </Text>
                    </View>
                  )}
                  
                  {vital.lhfa && vital.lhfa !== '' && (
                    <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[60px]">
                      <Text className="text-gray-700 text-xs">
                        LHFA: {vital.lhfa}
                      </Text>
                    </View>
                  )}
                  
                  {vital.wfl && vital.wfl !== '' && (
                    <View className="flex-row items-center bg-white px-2 py-1 rounded-md min-w-[60px]">
                      <Text className="text-gray-700 text-xs">
                        WFL: {vital.wfl}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Additional vital signs if available */}
                {(vital.blood_pressure || vital.heart_rate || vital.respiratory_rate || vital.oxygen_saturation) && (
                  <View className="flex-row flex-wrap gap-3 mt-2">
                    {vital.blood_pressure && (
                      <View className="flex-row items-center bg-white px-2 py-1 rounded-md">
                        <Heart size={14} color="#dc2626" />
                        <Text className="text-gray-700 text-xs ml-1">
                          BP: {vital.blood_pressure}
                        </Text>
                      </View>
                    )}
                    
                    {vital.heart_rate && (
                      <View className="flex-row items-center bg-white px-2 py-1 rounded-md">
                        <Heart size={14} color="#ef4444" />
                        <Text className="text-gray-700 text-xs ml-1">
                          HR: {vital.heart_rate}
                        </Text>
                      </View>
                    )}
                    
                    {vital.respiratory_rate && (
                      <View className="flex-row items-center bg-white px-2 py-1 rounded-md">
                        <Droplets size={14} color="#0ea5e9" />
                        <Text className="text-gray-700 text-xs ml-1">
                          RR: {vital.respiratory_rate}
                        </Text>
                      </View>
                    )}
                    
                    {vital.oxygen_saturation && (
                      <View className="flex-row items-center bg-white px-2 py-1 rounded-md">
                        <Eye size={14} color="#10b981" />
                        <Text className="text-gray-700 text-xs ml-1">
                          SpO₂: {vital.oxygen_saturation}%
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                
                {index < record.vitalSigns.length - 1 && (
                  <View className="border-t border-gray-200 mt-3 pt-3" />
                )}
              </View>
            ))
          ) : (
            <Text className="text-yellow-800 text-sm">
              No vital signs recorded for this visit
            </Text>
          )}
        </View>
        
        {/* Vaccine Status */}
        <View className="flex-row items-center mb-3">
          <Shield size={16} color="#6b7280" />
          <Text className="text-gray-700 text-sm font-medium ml-1">
            Vaccine Status: {record.vaccineStat}
          </Text>
        </View>
        
        {/* Expandable Content */}
        {isExpanded && (
          <View className="mt-3 pt-3 border-t border-gray-100">
            {/* Record Details */}
            <View className="mb-4">
              <Text className="text-gray-900 text-base font-semibold mb-2">Record Details</Text>
              <View className="flex-row flex-wrap gap-4">
                <Text className="text-gray-600 text-sm">
                  <Text className="font-medium">Record ID:</Text> {record.chhist_id}
                </Text>
                <Text className="text-gray-600 text-sm">
                  <Text className="font-medium">Child Record ID:</Text> {record.chrec_id}
                </Text>
                <Text className="text-gray-600 text-sm">
                  <Text className="font-medium">Patient Record:</Text> {record.patrec}
                </Text>
                <Text className="text-gray-600 text-sm">
                  <Text className="font-medium">Vital Signs:</Text> {record.vitalSigns.length}
                </Text>
              </View>
            </View>

            {/* Detailed Measurements */}
            <View className="mb-4">
              <Text className="text-gray-900 text-base font-semibold mb-2">
                Detailed Measurements ({record.vitalSigns.length} recorded)
              </Text>
              
              {record.vitalSigns.length > 0 ? (
                record.vitalSigns.map((vital, index) => (
                  <View key={vital.vital_id || index} className="bg-blue-50 rounded-lg p-3 mb-3 last:mb-0">
                    {record.vitalSigns.length > 1 && (
                      <Text className="text-blue-700 text-sm font-medium mb-2">
                        Measurement #{vital.vital_index} (ID: {vital.vital_id})
                      </Text>
                    )}
                    
                    {/* Core Measurements */}
                    <View className="mb-3">
                      <Text className="text-gray-700 text-sm font-medium mb-2">Core Measurements</Text>
                      <View className="flex-row flex-wrap gap-4">
                        <Text className="text-gray-700 text-sm">
                          <Text className="font-medium">Temperature:</Text> {vital.temp !== '' ? `${vital.temp}°C` : 'Not recorded'}
                        </Text>
                        <Text className="text-gray-700 text-sm">
                          <Text className="font-medium">Weight:</Text> {vital.wt !== '' ? `${vital.wt} kg` : 'Not recorded'}
                        </Text>
                        <Text className="text-gray-700 text-sm">
                          <Text className="font-medium">Height:</Text> {vital.ht !== '' ? `${vital.ht} cm` : 'Not recorded'}
                        </Text>
                        <Text className="text-gray-700 text-sm">
                          <Text className="font-medium">BMI:</Text> {vital.bmi}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Nutritional Status */}
                    {(vital.muac || vital.edemaSeverity || vital.wfa || vital.lhfa || vital.wfl) && (
                      <View className="mb-3">
                        <Text className="text-gray-700 text-sm font-medium mb-2">Nutritional Status</Text>
                        <View className="flex-row flex-wrap gap-4">
                          {vital.muac && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">MUAC:</Text> {vital.muac}
                            </Text>
                          )}
                          {vital.edemaSeverity && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">Edema:</Text> {vital.edemaSeverity}
                            </Text>
                          )}
                          {vital.wfa && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">WFA:</Text> {vital.wfa}
                            </Text>
                          )}
                          {vital.lhfa && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">LHFA:</Text> {vital.lhfa}
                            </Text>
                          )}
                          {vital.wfl && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">WFL:</Text> {vital.wfl}
                            </Text>
                          )}
                          {vital.muac_status && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">MUAC Status:</Text> {vital.muac_status}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                    
                    {/* Additional Vital Signs */}
                    {(vital.blood_pressure || vital.heart_rate || vital.respiratory_rate || vital.oxygen_saturation) && (
                      <View className="mb-3">
                        <Text className="text-gray-700 text-sm font-medium mb-2">Additional Vital Signs</Text>
                        <View className="flex-row flex-wrap gap-4">
                          {vital.blood_pressure && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">Blood Pressure:</Text> {vital.blood_pressure}
                            </Text>
                          )}
                          {vital.heart_rate && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">Heart Rate:</Text> {vital.heart_rate} bpm
                            </Text>
                          )}
                          {vital.respiratory_rate && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">Respiratory Rate:</Text> {vital.respiratory_rate} breaths/min
                            </Text>
                          )}
                          {vital.oxygen_saturation && (
                            <Text className="text-gray-700 text-sm">
                              <Text className="font-medium">Oxygen Saturation:</Text> {vital.oxygen_saturation}%
                            </Text>
                          )}
                        </View>
                      </View>
                    )}
                    
                    {/* Remarks */}
                    {vital.bm_remarks && (
                      <View className="mb-3">
                        <Text className="text-gray-700 text-sm font-medium mb-1">Remarks:</Text>
                        <Text className="text-gray-600 text-sm">{vital.bm_remarks}</Text>
                      </View>
                    )}
                    
                    {/* Findings for this vital sign */}
                    {vital.hasFindings && (
                      <View className="mt-3 pt-3 border-t border-blue-200">
                        <Text className="text-blue-700 text-sm font-medium mb-2">Medical Findings</Text>
                        {vital.findings.subj_summary && (
                          <View className="mb-2">
                            <Text className="text-gray-700 text-sm font-medium mb-1">Subjective:</Text>
                            <Text className="text-gray-500 text-sm leading-5">{vital.findings.subj_summary}</Text>
                          </View>
                        )}
                        {vital.findings.obj_summary && (
                          <View className="mb-2">
                            <Text className="text-gray-700 text-sm font-medium mb-1">Objective:</Text>
                            <Text className="text-gray-500 text-sm leading-5">{vital.findings.obj_summary}</Text>
                          </View>
                        )}
                        {vital.findings.assessment_summary && (
                          <View className="mb-2">
                            <Text className="text-gray-700 text-sm font-medium mb-1">Assessment:</Text>
                            <Text className="text-gray-500 text-sm leading-5">{vital.findings.assessment_summary}</Text>
                          </View>
                        )}
                        {vital.findings.plantreatment_summary && (
                          <View className="mb-2">
                            <Text className="text-gray-700 text-sm font-medium mb-1">Plan/Treatment:</Text>
                            <Text className="text-gray-500 text-sm leading-5">{vital.findings.plantreatment_summary}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View className="bg-yellow-50 rounded-lg p-3">
                  <Text className="text-yellow-800 text-sm">
                    No vital signs data available for this record
                  </Text>
                </View>
              )}
            </View>
            
            {/* Notes */}
            {record.latestNote && (
              <View className="mb-4">
                <Text className="text-gray-900 text-base font-semibold mb-2">Notes</Text>
                <Text className="text-gray-700 text-sm leading-5">{record.latestNote}</Text>
              </View>
            )}
            
            {/* Follow-up Information */}
            {(record.followUpDescription || record.followUpDate) && (
              <View className="mb-4">
                <Text className="text-gray-900 text-base font-semibold mb-2">Follow-up</Text>
                {record.followUpDescription && (
                  <Text className="text-gray-700 text-sm leading-5 mb-2">{record.followUpDescription}</Text>
                )}
                {record.followUpDate && (
                  <View className="flex-row items-center">
                    <Calendar size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-1 mr-2">
                      {record.followUpDate}
                    </Text>
                    {record.followUpStatus && (
                      <View className={`${getStatusColor(record.followUpStatus)} px-2 py-1 rounded-lg`}>
                        <Text className="text-white text-xs font-medium">
                          {record.followUpStatus}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        
        {/* Expand/Collapse Indicator */}
        <View className="items-center pt-2 border-t border-gray-100">
          <Text className="text-blue-500 text-sm font-medium">
            {isExpanded ? 'Show Less' : `Show More Details (${record.vitalSigns.length} vital signs)`}
          </Text>
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
          Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
        <Button variant="outline" onPress={onRefresh}>
          <Text>Refresh</Text>
        </Button>
      </View>
    );
  }
  
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
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mr-2 border border-gray-300 rounded-lg"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="font-semibold text-xl text-gray-800">
            Child Health History Records
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            Manage and view child's health history
          </Text>
        </View>
      </View>
      
      <View className="border-b border-gray-200" />
      
      {/* Child Health Record Card - with LATEST transformed data */}
      <View className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm">
        {transformedChildData ? (
          <ChildHealthRecordCard child={transformedChildData} />
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
            <TouchableOpacity
              onPress={() => handleSetActiveTab('status')}
              className={`flex-1 py-3 items-center ${
                activeTab === 'status' ? 'border-b-2 border-blue-500' : ''
              }`}
            >
              <Text className={`text-sm font-medium ${
                activeTab === 'status' ? 'text-blue-500' : 'text-gray-500'
              }`}>
                Vaccination Status
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSetActiveTab('followups')}
              className={`flex-1 py-3 items-center ${
                activeTab === 'followups' ? 'border-b-2 border-blue-500' : ''
              }`}
            >
              <Text className={`text-sm font-medium ${
                activeTab === 'followups' ? 'text-blue-500' : 'text-gray-500'
              }`}>
                Follow-ups
              </Text>
            </TouchableOpacity>
          </View>
          <View className="mt-4">
            {activeTab === 'status' && (
              <VaccinationStatusCards
                unvaccinatedVaccines={unvaccinatedVaccines}
                vaccinations={vaccinations}
              />
            )}
            {activeTab === 'followups' && (
              <FollowUpsCard childHealthFollowups={followUps} />
            )}
          </View>
        </View>
      )}
      
      {/* Growth Chart */}
      <View className="bg-white mx-4 my-2 rounded-xl p-4 shadow-sm">
        <GrowthChart
          data={nutritionalStatusData}
          isLoading={isGrowthLoading}
          error={isgrowthError}
        />
      </View>
      
      {/* Health Records Section */}
      <View className="bg-white mx-4 my-2 rounded-xl p-4 shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 text-lg font-semibold">Health Records</Text>
          <Text className="text-gray-500 text-sm">{totalRecords} records found</Text>
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
            processedHistoryData.map(renderHealthRecordCard)
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
                  currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500'
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
                  currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500'
                }`}
              >
                <Text className="text-white font-medium">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}