import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { FormSelect } from '@/components/ui/form/form-select';
import { useGetFamilyMembers, useIllnessesList } from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import { Plus, Trash2, Check, User, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ResponsiveFormContainer, FormContentWrapper, useResponsiveForm } from '@/components/healthcomponents/ResponsiveFormContainer';

interface HealthRecordsStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
  familyId: string | null;
  onNext?: () => void;
  onBack?: () => void;
}

const RISK_CLASS_OPTIONS = [
  { label: 'Newborn (0-28 days)', value: 'NEWBORN' },
  { label: 'Infant (29 days - 11 months)', value: 'INFANT' },
  { label: 'Under five (1-4 years old)', value: 'UNDER FIVE' },
  { label: 'School-aged (5-9 years old)', value: 'SCHOOLAGED' },
  { label: 'Adolescent (10-19 years old)', value: 'ADOLESCENT' },
  { label: 'Adult (20-59 years old)', value: 'ADULT' },
  { label: 'Senior Citizen (60+ years old)', value: 'SENIOR CITIZEN' },
];

const LIFESTYLE_RISK_OPTIONS = [
  { label: 'Smoker', value: 'SMOKER' },
  { label: 'Alcoholic Beverage Drinking', value: 'ALCOHOLIC' },
  { label: 'None', value: 'NONE' },
  { label: 'Others', value: 'OTHERS' },
];

const MAINTENANCE_OPTIONS = [
  { label: 'Yes', value: 'YES' },
  { label: 'No', value: 'NO' },
];

const TB_STATUS_OPTIONS = [
  { label: 'Treatment Ongoing', value: 'TREATMENT ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Not Completed', value: 'NOT COMPLETED' },
];

const TB_MEDS_SOURCE_OPTIONS = [
  { label: 'Health Center', value: 'Health Center' },
  { label: 'Private Clinic', value: 'Private Clinic' },
  { label: 'Government Hospital', value: 'Government' },
  { label: 'Private Hospital', value: 'Private Hospital' },
  { label: 'Others', value: 'Others' },
];

export const HealthRecordsStep: React.FC<HealthRecordsStepProps> = ({ form, familyId, onNext, onBack }) => {
  const [activeTab, setActiveTab] = useState<'ncd' | 'tb'>('ncd');
  const [selectedNCDMember, setSelectedNCDMember] = useState<string>('');
  const [selectedTBMember, setSelectedTBMember] = useState<string>('');
  const [showNCDPersonalInfo, setShowNCDPersonalInfo] = useState(false);
  const [showTBPersonalInfo, setShowTBPersonalInfo] = useState(false);
  const [expandedNCDRecords, setExpandedNCDRecords] = useState<Set<number>>(new Set());
  const [expandedTBRecords, setExpandedTBRecords] = useState<Set<number>>(new Set());

  const {
    headingSize,
    bodyTextSize,
    smallTextSize,
    sectionMargin,
    cardPadding,
    marginBottom,
  } = useResponsiveForm();

  // Compact spacing for form fields (half of marginBottom)
  const fieldSpacing = marginBottom / 2;

  const ncdList = form.watch('ncdRecords.list') || [];
  const tbList = form.watch('tbRecords.list') || [];

  // Fetch family members instead of all residents
  const { data: familyMembers = [], isLoading, refetch: refetchFamilyMembers } = useGetFamilyMembers(familyId || '');

  // Refetch family members when familyId changes (observer pattern like web)
  React.useEffect(() => {
    if (familyId) {
      console.log('HealthRecordsForm - Family ID changed, refetching members:', familyId);
      refetchFamilyMembers();
    }
  }, [familyId, refetchFamilyMembers]);

  // Debug logging
  React.useEffect(() => {
    console.log('HealthRecordsForm - familyId:', familyId);
    console.log('HealthRecordsForm - familyMembers:', familyMembers);
    console.log('HealthRecordsForm - isLoading:', isLoading);
    
    // Check the data structure
    const membersArray = Array.isArray(familyMembers) 
      ? familyMembers 
      : (familyMembers as any)?.results || [];
    
    console.log('HealthRecordsForm - familyMembers isArray:', Array.isArray(familyMembers));
    console.log('HealthRecordsForm - Extracted members array:', membersArray);
    console.log('HealthRecordsForm - Members count:', membersArray.length);
  }, [familyId, familyMembers, isLoading]);

  // Fetch illnesses list
  const { data: illnessesList, isLoading: isLoadingIllnesses } = useIllnessesList();

  // Format illnesses for CustomDropdown
  const formattedIllnesses = React.useMemo(() => {
    if (!illnessesList) {
      return [];
    }
    
    // The API returns data in this format: { illnesses: [...] }
    const illnessesArray = illnessesList.illnesses || [];
    
    if (!Array.isArray(illnessesArray)) {
      return [];
    }
    
    return illnessesArray.map((illness: any) => ({
      label: illness.ill_name || illness.illname,
      value: illness.ill_name || illness.illname
    }));
  }, [illnessesList]);

  // Watch for "Others" selection in NCD form
  const selectedLifestyleRisk = form.watch('ncdRecords.new.ncdFormSchema.lifestyleRisk');
  
  // Clear "Others" field when lifestyle risk selection changes
  React.useEffect(() => {
    if (selectedLifestyleRisk !== 'OTHERS') {
      form.setValue('ncdRecords.new.ncdFormSchema.lifestyleRiskOthers', '');
    }
  }, [selectedLifestyleRisk, form]);

  // Watch for "Others" selection in TB form
  const selectedSrcAntiTBmeds = form.watch('tbRecords.new.tbSurveilanceSchema.srcAntiTBmeds');
  
  // Clear "Others" field when TB meds source selection changes
  React.useEffect(() => {
    if (selectedSrcAntiTBmeds !== 'Others') {
      form.setValue('tbRecords.new.tbSurveilanceSchema.srcAntiTBmedsOthers', '');
    }
  }, [selectedSrcAntiTBmeds, form]);

  // Get added member IDs for NCD
  const addedNCDMemberIds = React.useMemo(() => 
    ncdList.map((record: any) => record.id), 
    [ncdList]
  );

  // Get added member IDs for TB
  const addedTBMemberIds = React.useMemo(() => 
    tbList.map((record: any) => record.id), 
    [tbList]
  );

  // Available family members for NCD (excluding those already added)
  const availableNCDResidents = React.useMemo(() => {
    // Handle different response structures (direct array vs { results: [...] })
    const membersArray = Array.isArray(familyMembers) 
      ? familyMembers 
      : (familyMembers as any)?.results || [];
    
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      console.log('availableNCDResidents - No valid members array:', membersArray);
      return [];
    }
    
    return membersArray.filter((member: any) => 
      !addedNCDMemberIds.includes(member.rp_id)
    ).map((member: any) => {
      // Parse the name field "LASTNAME, FIRSTNAME MIDDLENAME" from API
      let firstName = '';
      let lastName = '';
      let middleName = '';
      
      if (member.name) {
        const [lastNamePart, ...restParts] = member.name.split(', ');
        lastName = lastNamePart?.trim() || '';
        
        if (restParts.length > 0) {
          const nameParts = restParts.join(', ').trim().split(' ');
          firstName = nameParts[0] || '';
          middleName = nameParts.slice(1).join(' ') || '';
        }
      }
      
      const fullName = `${firstName} ${middleName} ${lastName}`.trim();
      
      // Create a normalized personal object matching expected structure
      const personal = {
        per_fname: firstName,
        per_lname: lastName,
        per_mname: middleName,
        per_sex: member.sex || '',
        per_dob: member.dob || '',
        per_contact: member.contact || '',
        per_suffix: ''
      };
      
      return {
        rp_id: member.rp_id,
        displayName: fullName || member.name, // Fallback to raw name if parsing fails
        displayId: member.rp_id,
        personal: personal,
        rawMember: member, // Keep reference to original data
      };
    });
  }, [familyMembers, addedNCDMemberIds]);

  // Available family members for TB (excluding those already added)
  const availableTBResidents = React.useMemo(() => {
    // Handle different response structures (direct array vs { results: [...] })
    const membersArray = Array.isArray(familyMembers) 
      ? familyMembers 
      : (familyMembers as any)?.results || [];
    
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      console.log('availableTBResidents - No valid members array:', membersArray);
      return [];
    }
    
    return membersArray.filter((member: any) => 
      !addedTBMemberIds.includes(member.rp_id)
    ).map((member: any) => {
      // Parse the name field "LASTNAME, FIRSTNAME MIDDLENAME" from API
      let firstName = '';
      let lastName = '';
      let middleName = '';
      
      if (member.name) {
        const [lastNamePart, ...restParts] = member.name.split(', ');
        lastName = lastNamePart?.trim() || '';
        
        if (restParts.length > 0) {
          const nameParts = restParts.join(', ').trim().split(' ');
          firstName = nameParts[0] || '';
          middleName = nameParts.slice(1).join(' ') || '';
        }
      }
      
      const fullName = `${firstName} ${middleName} ${lastName}`.trim();
      
      // Create a normalized personal object matching expected structure
      const personal = {
        per_fname: firstName,
        per_lname: lastName,
        per_mname: middleName,
        per_sex: member.sex || '',
        per_dob: member.dob || '',
        per_contact: member.contact || '',
        per_suffix: ''
      };
      
      return {
        rp_id: member.rp_id,
        displayName: fullName || member.name, // Fallback to raw name if parsing fails
        displayId: member.rp_id,
        personal: personal,
        rawMember: member, // Keep reference to original data
      };
    });
  }, [familyMembers, addedTBMemberIds]);

  const handleNCDMemberToggle = (member: any) => {
    const memberId = member.rp_id;
    const isSelected = selectedNCDMember === memberId;
    
    if (isSelected) {
      // Unselect member - clear selection
      setSelectedNCDMember('');
      // Clear form
      form.setValue('ncdRecords.new', {
        id: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        sex: '',
        dateOfBirth: '',
        contact: '',
        ncdFormSchema: {
          riskClassAgeGroup: '',
          comorbidities: '',
          lifestyleRisk: '',
          lifestyleRiskOthers: '',
          inMaintenance: ''
        }
      });
    } else {
      // Select member - replace current selection
      setSelectedNCDMember(memberId);
      
      console.log('handleNCDMemberToggle - Selected member:', member);
      console.log('handleNCDMemberToggle - member.personal:', member.personal);
      
      const personal = member.personal;
      const sexValue = personal.per_sex || '';
      const formattedSex = sexValue.toLowerCase() === 'male' ? 'Male' : 
                         sexValue.toLowerCase() === 'female' ? 'Female' : 
                         sexValue;
      
      const formData = {
        id: memberId,
        lastName: personal.per_lname || '',
        firstName: personal.per_fname || '',
        middleName: personal.per_mname || '',
        suffix: personal.per_suffix || '',
        sex: formattedSex,
        dateOfBirth: personal.per_dob || '',
        contact: personal.per_contact || '',
        ncdFormSchema: {
          riskClassAgeGroup: '',
          comorbidities: '',
          lifestyleRisk: '',
          lifestyleRiskOthers: '',
          inMaintenance: ''
        }
      };
      
      console.log('handleNCDMemberToggle - Form data to set:', formData);
      form.setValue('ncdRecords.new', formData);
    }
  };

  const handleTBMemberToggle = (member: any) => {
    const memberId = member.rp_id;
    const isSelected = selectedTBMember === memberId;
    
    if (isSelected) {
      // Unselect member - clear selection
      setSelectedTBMember('');
      // Clear form
      form.setValue('tbRecords.new', {
        id: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        sex: '',
        dateOfBirth: '',
        contact: '',
        tbSurveilanceSchema: {
          srcAntiTBmeds: '',
          srcAntiTBmedsOthers: '',
          noOfDaysTakingMeds: '',
          tbStatus: ''
        }
      });
    } else {
      // Select member - replace current selection
      setSelectedTBMember(memberId);
      
      const personal = member.personal;
      const sexValue = personal.per_sex || '';
      const formattedSex = sexValue.toLowerCase() === 'male' ? 'Male' : 
                         sexValue.toLowerCase() === 'female' ? 'Female' : 
                         sexValue;
      
      form.setValue('tbRecords.new', {
        id: memberId,
        lastName: personal.per_lname || '',
        firstName: personal.per_fname || '',
        middleName: personal.per_mname || '',
        suffix: personal.per_suffix || '',
        sex: formattedSex,
        dateOfBirth: personal.per_dob || '',
        contact: personal.per_contact || '',
        tbSurveilanceSchema: {
          srcAntiTBmeds: '',
          srcAntiTBmedsOthers: '',
          noOfDaysTakingMeds: '',
          tbStatus: ''
        }
      });
    }
  };

  const addNCDRecord = () => {
    const newRecord = form.getValues('ncdRecords.new');
    
    console.log('addNCDRecord - Current form values:', newRecord);
    
    if (!newRecord.id) {
      Alert.alert('Error', 'Please select a resident');
      return;
    }

    // Validate that NCD form data is filled
    const ncdData = newRecord.ncdFormSchema;
    if (!ncdData?.riskClassAgeGroup || !ncdData?.comorbidities || !ncdData?.lifestyleRisk || !ncdData?.inMaintenance) {
      Alert.alert('Error', 'Please fill all required NCD fields');
      return;
    }

    // Validate "Others" field if "OTHERS" is selected for lifestyle risk
    if (ncdData.lifestyleRisk === 'OTHERS' && !ncdData.lifestyleRiskOthers?.trim()) {
      Alert.alert('Error', 'Please specify lifestyle risk');
      return;
    }

    const currentList = form.getValues('ncdRecords.list') || [];
    console.log('addNCDRecord - Adding record to list:', newRecord);
    console.log('addNCDRecord - Current list:', currentList);
    
    // Cast to the correct type since we've validated all required fields are present
    form.setValue('ncdRecords.list', [...currentList, newRecord as any]);
    
    console.log('addNCDRecord - Updated list:', form.getValues('ncdRecords.list'));
    
    // Reset form
    setSelectedNCDMember('');
    form.setValue('ncdRecords.new', {
      id: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      sex: '',
      dateOfBirth: '',
      contact: '',
      ncdFormSchema: {
        riskClassAgeGroup: '',
        comorbidities: '',
        lifestyleRisk: '',
        lifestyleRiskOthers: '',
        inMaintenance: ''
      }
    });
  };

  const removeNCDRecord = (index: number) => {
    const updated = ncdList.filter((_, i) => i !== index);
    form.setValue('ncdRecords.list', updated);
  };

  const addTBRecord = () => {
    const newRecord = form.getValues('tbRecords.new');
    
    if (!newRecord.id) {
      Alert.alert('Error', 'Please select a resident');
      return;
    }

    // Validate that TB form data is filled
    const tbData = newRecord.tbSurveilanceSchema;
    if (!tbData?.srcAntiTBmeds || !tbData?.noOfDaysTakingMeds || !tbData?.tbStatus) {
      Alert.alert('Error', 'Please fill all required TB fields');
      return;
    }

    // Validate "Others" field if "Others" is selected
    if (tbData.srcAntiTBmeds === 'Others' && !tbData.srcAntiTBmedsOthers?.trim()) {
      Alert.alert('Error', 'Please specify source of anti-TB medication');
      return;
    }

    const currentList = form.getValues('tbRecords.list') || [];
    // Cast to the correct type since we've validated all required fields are present
    form.setValue('tbRecords.list', [...currentList, newRecord as any]);
    
    // Reset form
    setSelectedTBMember('');
    form.setValue('tbRecords.new', {
      id: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      sex: '',
      dateOfBirth: '',
      contact: '',
      tbSurveilanceSchema: {
        srcAntiTBmeds: '',
        srcAntiTBmedsOthers: '',
        noOfDaysTakingMeds: '',
        tbStatus: ''
      }
    });
  };

  const removeTBRecord = (index: number) => {
    const updated = tbList.filter((_, i) => i !== index);
    form.setValue('tbRecords.list', updated);
  };

  const toggleNCDRecord = (index: number) => {
    const newExpanded = new Set(expandedNCDRecords);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedNCDRecords(newExpanded);
  };

  const toggleTBRecord = (index: number) => {
    const newExpanded = new Set(expandedTBRecords);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTBRecords(newExpanded);
  };

  return (
    <ResponsiveFormContainer>
      <FormContentWrapper>
        <View className="flex-1">
          {/* Header */}
          <View style={{ marginBottom: sectionMargin }}>
            <Text style={{ fontSize: headingSize }} className="font-bold text-gray-900 mb-2">
              Health Records
            </Text>
            <Text style={{ fontSize: smallTextSize }} className="text-gray-600">
              Add NCD and TB surveillance records (Optional)
            </Text>
          </View>

          {/* Tab Switcher */}
          <View style={{ marginBottom: marginBottom }} className="flex-row bg-gray-100 p-1 rounded-lg">
            <TouchableOpacity
              onPress={() => setActiveTab('ncd')}
              className={`flex-1 py-3 rounded-lg ${activeTab === 'ncd' ? 'bg-white' : ''}`}
            >
              <Text style={{ fontSize: bodyTextSize }} className={`text-center font-semibold ${activeTab === 'ncd' ? 'text-blue-600' : 'text-gray-600'}`}>
                NCD Records ({ncdList.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('tb')}
              className={`flex-1 py-3 rounded-lg ${activeTab === 'tb' ? 'bg-white' : ''}`}
            >
              <Text style={{ fontSize: bodyTextSize }} className={`text-center font-semibold ${activeTab === 'tb' ? 'text-blue-600' : 'text-gray-600'}`}>
                TB Records ({tbList.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* NCD Tab Content */}
          {activeTab === 'ncd' && (
            <View>
              {/* Debug Info */}
              {!familyId && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <Text style={{ fontSize: smallTextSize }} className="text-yellow-800">
                    ⚠️ No family ID available. Please complete the previous steps.
                  </Text>
                </View>
              )}
              
              {familyId && isLoading && (
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <Text style={{ fontSize: smallTextSize }} className="text-blue-800">
                    Loading family members...
                  </Text>
                </View>
              )}
              
              {familyId && !isLoading && (() => {
                const membersArray = Array.isArray(familyMembers) 
                  ? familyMembers 
                  : (familyMembers as any)?.results || [];
                return (!Array.isArray(membersArray) || membersArray.length === 0);
              })() && (
                <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <Text style={{ fontSize: smallTextSize }} className="text-orange-800">
                    No family members found for Family ID: {familyId}
                  </Text>
                  <Text style={{ fontSize: smallTextSize - 2 }} className="text-orange-600 mt-1">
                    Data structure: {Array.isArray(familyMembers) ? 'Array' : 'Object'}
                  </Text>
                  <Text style={{ fontSize: smallTextSize - 2 }} className="text-orange-600 mt-1">
                    Count: {(familyMembers as any)?.count || 0}
                  </Text>
                </View>
              )}
              
              {/* NCD List */}
              {ncdList.length > 0 && (
                <View 
                  style={{ marginBottom: marginBottom, padding: cardPadding }} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-3">
                    NCD Records ({ncdList.length})
                  </Text>
                  <View>
                    {ncdList.map((item: any, index: number) => {
                      const isExpanded = expandedNCDRecords.has(index);
                      return (
                        <View 
                          key={`ncd-${index}`} 
                          className="border border-gray-200 rounded-lg overflow-hidden mb-3"
                        >
                          {/* Accordion Header */}
                          <View className="flex-row items-center justify-between p-3 bg-gray-50">
                            <TouchableOpacity
                              onPress={() => toggleNCDRecord(index)}
                              className="flex-row items-center flex-1"
                              activeOpacity={0.7}
                            >
                              <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                                <Text style={{ fontSize: smallTextSize }} className="text-green-700 font-semibold">
                                  {item.id || 'N/A'}
                                </Text>
                              </View>
                              <View className="flex-1">
                                <Text style={{ fontSize: bodyTextSize }} className="text-gray-900 font-semibold">
                                  {item.firstName} {item.lastName}
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 mt-1">
                                  {item.ncdFormSchema?.riskClassAgeGroup || 'No risk class'}
                                </Text>
                              </View>
                              {isExpanded ? (
                                <ChevronUp size={20} color="#6B7280" />
                              ) : (
                                <ChevronDown size={20} color="#6B7280" />
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={() => removeNCDRecord(index)} 
                              className="p-2 ml-2"
                            >
                              <Trash2 size={20} color="#EF4444" />
                            </TouchableOpacity>
                          </View>

                          {/* Accordion Content */}
                          {isExpanded && (
                            <View className="p-3 bg-white border-t border-gray-200">
                              <View className="space-y-2">
                                {/* Personal Information */}
                                <View className="mb-3">
                                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-2">
                                    Personal Information
                                  </Text>
                                  <View className="space-y-2">
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Full Name:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.firstName} {item.middleName} {item.lastName} {item.suffix}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Date of Birth:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                        {item.dateOfBirth || 'N/A'}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Sex:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                        {item.sex || 'N/A'}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Contact:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                        {item.contact || 'N/A'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>

                                {/* NCD Health Information */}
                                <View className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-blue-900 mb-2">
                                    NCD Health Information
                                  </Text>
                                  <View className="space-y-2">
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-40">Risk Class:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.ncdFormSchema?.riskClassAgeGroup || 'N/A'}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-40">Comorbidities:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.ncdFormSchema?.comorbidities || 'N/A'}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-40">Lifestyle Risk:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.ncdFormSchema?.lifestyleRisk || 'N/A'}
                                        {item.ncdFormSchema?.lifestyleRisk === 'OTHERS' && item.ncdFormSchema?.lifestyleRiskOthers 
                                          ? ` (${item.ncdFormSchema.lifestyleRiskOthers})` 
                                          : ''}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-40">Maintenance:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.ncdFormSchema?.inMaintenance || 'N/A'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Member Selection */}
              <View style={{ marginBottom: marginBottom }}>
                <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-3">
                  Select Family Members
                </Text>
                {availableNCDResidents.length === 0 ? (
                  <View style={{ padding: cardPadding }} className="bg-gray-50 rounded-lg">
                    <Text style={{ fontSize: bodyTextSize }} className="text-gray-500 text-center">
                      All family members have been added to NCD records.
                    </Text>
                    <Text style={{ fontSize: smallTextSize }} className="text-gray-400 text-center mt-1">
                      Delete records from the table above to make members available again.
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-2">
                    {availableNCDResidents.map((member: any) => {
                      const isSelected = selectedNCDMember === member.rp_id;
                      return (
                        <TouchableOpacity
                          key={member.rp_id}
                          onPress={() => handleNCDMemberToggle(member)}
                          style={{ padding: cardPadding }}
                          className={`rounded-lg border-2 ${
                            isSelected 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <View className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                isSelected 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check size={16} color="white" />}
                              </View>
                              <View className="flex-1">
                                <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-900">
                                  {member.displayName}
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-500 mt-1">
                                  ID: {member.displayId}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* NCD Form - Only show if there are available members */}
              {availableNCDResidents.length > 0 && selectedNCDMember && (
                <View 
                  style={{ marginBottom: marginBottom, padding: cardPadding }} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-4">
                    NCD Information
                  </Text>

                  {/* Personal Information Accordion */}
                  <View style={{ marginBottom: marginBottom }} className="border border-gray-200 rounded-lg overflow-hidden">
                    <TouchableOpacity
                      onPress={() => setShowNCDPersonalInfo(!showNCDPersonalInfo)}
                      className="flex-row items-center justify-between p-3 bg-gray-50"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                          <Text style={{ fontSize: smallTextSize }} className="text-green-700 font-semibold">
                            {form.watch('ncdRecords.new.id') || 'N/A'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 font-semibold flex-1">
                          {form.watch('ncdRecords.new.firstName')} {form.watch('ncdRecords.new.lastName')}
                        </Text>
                      </View>
                      {showNCDPersonalInfo ? (
                        <ChevronUp size={20} color="#6B7280" />
                      ) : (
                        <ChevronDown size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>

                    {showNCDPersonalInfo && (
                      <View className="p-3 bg-white border-t border-gray-200">
                        <View className="space-y-2">
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Full Name:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                              {form.watch('ncdRecords.new.firstName') || 'N/A'} {form.watch('ncdRecords.new.middleName') || ''} {form.watch('ncdRecords.new.lastName') || 'N/A'} {form.watch('ncdRecords.new.suffix') || ''}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Date of Birth:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {form.watch('ncdRecords.new.dateOfBirth') || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Sex:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {form.watch('ncdRecords.new.sex') || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Contact:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {form.watch('ncdRecords.new.contact') || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* NCD Form Fields */}
                  <View style={{ marginBottom: fieldSpacing }}>
                    <FormSelect
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.riskClassAgeGroup"
                      label="Risk class by age/group *"
                      options={RISK_CLASS_OPTIONS}
                      placeholder="Select Risk Class"
                    />
                  </View>

                  <View style={{ marginBottom: fieldSpacing }}>
                    <Text style={{ fontSize: smallTextSize }} className="font-medium text-gray-700 mb-2">
                      Comorbidities/Sakit Balation *
                    </Text>
                    <Controller
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.comorbidities"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={formattedIllnesses}
                          value={value || ''}
                          onSelect={onChange}
                          placeholder="Select Illness"
                          searchPlaceholder="Search illness..."
                          loading={isLoadingIllnesses}
                          emptyMessage={
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-500 text-center py-4">
                              No illnesses found
                            </Text>
                          }
                        />
                      )}
                    />
                  </View>

                  <View style={{ marginBottom: fieldSpacing }}>
                    <FormSelect
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.lifestyleRisk"
                      label="Lifestyle Risk *"
                      options={LIFESTYLE_RISK_OPTIONS}
                      placeholder="Select Lifestyle Risk"
                    />
                  </View>

                  {selectedLifestyleRisk === 'OTHERS' && (
                    <View style={{ marginBottom: fieldSpacing }}>
                      <Text style={{ fontSize: smallTextSize }} className="font-medium text-gray-700 mb-2">
                        Please specify lifestyle risk *
                      </Text>
                      <Controller
                        control={form.control}
                        name="ncdRecords.new.ncdFormSchema.lifestyleRiskOthers"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            className="border border-gray-300 rounded-lg px-4 bg-white h-12 text-gray-900"
                            placeholder="Enter lifestyle risk"
                            value={value}
                            onChangeText={onChange}
                            style={{ fontSize: bodyTextSize }}
                          />
                        )}
                      />
                    </View>
                  )}

                  <View style={{ marginBottom: fieldSpacing }}>
                    <FormSelect
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.inMaintenance"
                      label="Naka Maintenance? *"
                      options={MAINTENANCE_OPTIONS}
                      placeholder="Select Maintenance Status"
                    />
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row space-x-3 mt-2">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedNCDMember('');
                        setShowNCDPersonalInfo(false);
                        form.setValue('ncdRecords.new', {
                          id: '',
                          lastName: '',
                          firstName: '',
                          middleName: '',
                          suffix: '',
                          sex: '',
                          dateOfBirth: '',
                          contact: '',
                          ncdFormSchema: {
                            riskClassAgeGroup: '',
                            comorbidities: '',
                            lifestyleRisk: '',
                            lifestyleRiskOthers: '',
                            inMaintenance: ''
                          }
                        });
                      }}
                      className="flex-1 bg-gray-200 rounded-lg p-3 h-12 items-center justify-center"
                    >
                      <Text style={{ fontSize: bodyTextSize }} className="text-gray-700 font-semibold">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={addNCDRecord}
                      className="flex-1 bg-green-600 rounded-lg p-3 h-12 flex-row items-center justify-center"
                    >
                      <Plus size={20} color="white" />
                      <Text style={{ fontSize: bodyTextSize }} className="text-white font-semibold ml-2">
                        Add Patient
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* TB Tab Content */}
          {activeTab === 'tb' && (
            <View>
              {/* Debug Info */}
              {!familyId && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <Text style={{ fontSize: smallTextSize }} className="text-yellow-800">
                    ⚠️ No family ID available. Please complete the previous steps.
                  </Text>
                </View>
              )}
              
              {familyId && isLoading && (
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <Text style={{ fontSize: smallTextSize }} className="text-blue-800">
                    Loading family members...
                  </Text>
                </View>
              )}
              
              {familyId && !isLoading && (() => {
                const membersArray = Array.isArray(familyMembers) 
                  ? familyMembers 
                  : (familyMembers as any)?.results || [];
                return (!Array.isArray(membersArray) || membersArray.length === 0);
              })() && (
                <View className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <Text style={{ fontSize: smallTextSize }} className="text-orange-800">
                    No family members found for Family ID: {familyId}
                  </Text>
                  <Text style={{ fontSize: smallTextSize - 2 }} className="text-orange-600 mt-1">
                    Data structure: {Array.isArray(familyMembers) ? 'Array' : 'Object'}
                  </Text>
                  <Text style={{ fontSize: smallTextSize - 2 }} className="text-orange-600 mt-1">
                    Count: {(familyMembers as any)?.count || 0}
                  </Text>
                </View>
              )}
              
              {/* TB List */}
              {tbList.length > 0 && (
                <View 
                  style={{ marginBottom: marginBottom, padding: cardPadding }} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-3">
                    TB Records ({tbList.length})
                  </Text>
                  <View>
                    {tbList.map((item: any, index: number) => {
                      const isExpanded = expandedTBRecords.has(index);
                      return (
                        <View 
                          key={`tb-${index}`} 
                          className="border border-gray-200 rounded-lg overflow-hidden mb-3"
                        >
                          {/* Accordion Header */}
                          <View className="flex-row items-center justify-between p-3 bg-gray-50">
                            <TouchableOpacity
                              onPress={() => toggleTBRecord(index)}
                              className="flex-row items-center flex-1"
                              activeOpacity={0.7}
                            >
                              <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                                <Text style={{ fontSize: smallTextSize }} className="text-green-700 font-semibold">
                                  {item.id || 'N/A'}
                                </Text>
                              </View>
                              <View className="flex-1">
                                <Text style={{ fontSize: bodyTextSize }} className="text-gray-900 font-semibold">
                                  {item.firstName} {item.lastName}
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 mt-1">
                                  {item.tbSurveilanceSchema?.tbStatus || 'No status'}
                                </Text>
                              </View>
                              {isExpanded ? (
                                <ChevronUp size={20} color="#6B7280" />
                              ) : (
                                <ChevronDown size={20} color="#6B7280" />
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity 
                              onPress={() => removeTBRecord(index)} 
                              className="p-2 ml-2"
                            >
                              <Trash2 size={20} color="#EF4444" />
                            </TouchableOpacity>
                          </View>

                          {/* Accordion Content */}
                          {isExpanded && (
                            <View className="p-3 bg-white border-t border-gray-200">
                              <View className="space-y-2">
                                {/* Personal Information */}
                                <View className="mb-3">
                                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-2">
                                    Personal Information
                                  </Text>
                                  <View className="space-y-2">
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Full Name:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.firstName} {item.middleName} {item.lastName} {item.suffix}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Date of Birth:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                        {item.dateOfBirth || 'N/A'}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Sex:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                        {item.sex || 'N/A'}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Contact:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                        {item.contact || 'N/A'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>

                                {/* TB Health Information */}
                                <View className="p-3 bg-red-50 rounded-lg border border-red-200">
                                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-red-900 mb-2">
                                    TB Surveillance Information
                                  </Text>
                                  <View className="space-y-2">
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-40">Source of Meds:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.tbSurveilanceSchema?.srcAntiTBmeds || 'N/A'}
                                        {item.tbSurveilanceSchema?.srcAntiTBmeds === 'OTHERS' && item.tbSurveilanceSchema?.srcAntiTBmedsOthers 
                                          ? ` (${item.tbSurveilanceSchema.srcAntiTBmedsOthers})` 
                                          : ''}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-40">Days Taking Meds:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.tbSurveilanceSchema?.noOfDaysTakingMeds || 'N/A'}
                                      </Text>
                                    </View>
                                    <View className="flex-row">
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-40">TB Status:</Text>
                                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                                        {item.tbSurveilanceSchema?.tbStatus || 'N/A'}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Member Selection */}
              <View style={{ marginBottom: marginBottom }}>
                <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-3">
                  Select Family Members
                </Text>
                {availableTBResidents.length === 0 ? (
                  <View style={{ padding: cardPadding }} className="bg-gray-50 rounded-lg">
                    <Text style={{ fontSize: bodyTextSize }} className="text-gray-500 text-center">
                      All family members have been added to TB records.
                    </Text>
                    <Text style={{ fontSize: smallTextSize }} className="text-gray-400 text-center mt-1">
                      Delete records from the table above to make members available again.
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-2">
                    {availableTBResidents.map((member: any) => {
                      const isSelected = selectedTBMember === member.rp_id;
                      return (
                        <TouchableOpacity
                          key={member.rp_id}
                          onPress={() => handleTBMemberToggle(member)}
                          style={{ padding: cardPadding }}
                          className={`rounded-lg border-2 ${
                            isSelected 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <View className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                isSelected 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && <Check size={16} color="white" />}
                              </View>
                              <View className="flex-1">
                                <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-900">
                                  {member.displayName}
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-500 mt-1">
                                  ID: {member.displayId}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* TB Form - Only show if there are available members */}
              {availableTBResidents.length > 0 && selectedTBMember && (
                <View 
                  style={{ marginBottom: marginBottom, padding: cardPadding }} 
                  className="bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-4">
                    TB Surveillance Information
                  </Text>

                  {/* Personal Information Accordion */}
                  <View style={{ marginBottom: marginBottom }} className="border border-gray-200 rounded-lg overflow-hidden">
                    <TouchableOpacity
                      onPress={() => setShowTBPersonalInfo(!showTBPersonalInfo)}
                      className="flex-row items-center justify-between p-3 bg-gray-50"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                          <Text style={{ fontSize: smallTextSize }} className="text-green-700 font-semibold">
                            {form.watch('tbRecords.new.id') || 'N/A'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 font-semibold flex-1">
                          {form.watch('tbRecords.new.firstName')} {form.watch('tbRecords.new.lastName')}
                        </Text>
                      </View>
                      {showTBPersonalInfo ? (
                        <ChevronUp size={20} color="#6B7280" />
                      ) : (
                        <ChevronDown size={20} color="#6B7280" />
                      )}
                    </TouchableOpacity>

                    {showTBPersonalInfo && (
                      <View className="p-3 bg-white border-t border-gray-200">
                        <View className="space-y-2">
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Full Name:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                              {form.watch('tbRecords.new.firstName') || 'N/A'} {form.watch('tbRecords.new.middleName') || ''} {form.watch('tbRecords.new.lastName') || 'N/A'} {form.watch('tbRecords.new.suffix') || ''}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Date of Birth:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {form.watch('tbRecords.new.dateOfBirth') || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Sex:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {form.watch('tbRecords.new.sex') || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Contact:</Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {form.watch('tbRecords.new.contact') || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* TB Form Fields */}
                  <View style={{ marginBottom: fieldSpacing }}>
                    <FormSelect
                      control={form.control}
                      name="tbRecords.new.tbSurveilanceSchema.srcAntiTBmeds"
                      label="Source of Anti TB Meds *"
                      options={TB_MEDS_SOURCE_OPTIONS}
                      placeholder="Select Meds Source"
                    />
                  </View>

                  {selectedSrcAntiTBmeds === 'Others' && (
                    <View style={{ marginBottom: fieldSpacing }}>
                      <Text style={{ fontSize: smallTextSize }} className="font-medium text-gray-700 mb-2">
                        Please specify source *
                      </Text>
                      <Controller
                        control={form.control}
                        name="tbRecords.new.tbSurveilanceSchema.srcAntiTBmedsOthers"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            className="border border-gray-300 rounded-lg px-4 bg-white h-12 text-gray-900"
                            placeholder="Enter source of Anti TB Meds"
                            value={value}
                            onChangeText={onChange}
                            style={{ fontSize: bodyTextSize }}
                          />
                        )}
                      />
                    </View>
                  )}

                  <View style={{ marginBottom: fieldSpacing }}>
                    <Text style={{ fontSize: smallTextSize }} className="font-medium text-gray-700 mb-2">
                      No. of Days Taking Meds *
                    </Text>
                    <Controller
                      control={form.control}
                      name="tbRecords.new.tbSurveilanceSchema.noOfDaysTakingMeds"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="border border-gray-300 rounded-lg px-4 bg-white h-12 text-gray-900"
                          placeholder="Enter number of days"
                          value={value || ''}
                          onChangeText={onChange}
                          keyboardType="numeric"
                          style={{ fontSize: bodyTextSize }}
                        />
                      )}
                    />
                  </View>

                  <View style={{ marginBottom: fieldSpacing }}>
                    <FormSelect
                      control={form.control}
                      name="tbRecords.new.tbSurveilanceSchema.tbStatus"
                      label="TB Status *"
                      options={TB_STATUS_OPTIONS}
                      placeholder="Select TB Status"
                    />
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row space-x-3 mt-2">
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTBMember('');
                        setShowTBPersonalInfo(false);
                        form.setValue('tbRecords.new', {
                          id: '',
                          lastName: '',
                          firstName: '',
                          middleName: '',
                          suffix: '',
                          sex: '',
                          dateOfBirth: '',
                          contact: '',
                          tbSurveilanceSchema: {
                            srcAntiTBmeds: '',
                            srcAntiTBmedsOthers: '',
                            noOfDaysTakingMeds: '',
                            tbStatus: ''
                          }
                        });
                      }}
                      className="flex-1 bg-gray-200 rounded-lg p-3 h-12 items-center justify-center"
                    >
                      <Text style={{ fontSize: bodyTextSize }} className="text-gray-700 font-semibold">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={addTBRecord}
                      className="flex-1 bg-green-600 rounded-lg p-3 h-12 flex-row items-center justify-center"
                    >
                      <Plus size={20} color="white" />
                      <Text style={{ fontSize: bodyTextSize }} className="text-white font-semibold ml-2">
                        Add Patient
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Navigation Buttons - Only show if handlers are provided */}
          {(onNext || onBack) && (
            <View style={{ marginTop: sectionMargin, paddingBottom: marginBottom }}>
              <View className="flex-row gap-3">
                {onBack && (
                  <TouchableOpacity
                    onPress={onBack}
                    className="flex-1 bg-gray-100 rounded-lg h-12 items-center justify-center border border-gray-300"
                  >
                    <Text style={{ fontSize: bodyTextSize }} className="text-gray-700 font-semibold">
                      Back
                    </Text>
                  </TouchableOpacity>
                )}
                {onNext && (
                  <TouchableOpacity
                    onPress={onNext}
                    className="flex-1 bg-blue-600 rounded-lg h-12 items-center justify-center shadow-sm"
                  >
                    <Text style={{ fontSize: bodyTextSize }} className="text-white font-semibold">
                      Next
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </FormContentWrapper>
    </ResponsiveFormContainer>
  );
};
