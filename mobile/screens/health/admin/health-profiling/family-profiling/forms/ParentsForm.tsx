import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { FormSelect } from '@/components/ui/form/form-select';
import { Button } from '@/components/ui/button';
import { useGetResidents } from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import { ResponsiveFormContainer, useResponsiveForm, FormContentWrapper } from '@/components/healthcomponents/ResponsiveFormContainer';

interface ParentsStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
  onNext?: () => void;
  onBack?: () => void;
}

const BLOOD_TYPE_OPTIONS = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
];

const COVID_VAX_OPTIONS = [
  { label: 'Not Vaccinated', value: 'notVaccinated' },
  { label: '1st Dose', value: 'firstdose' },
  { label: '2nd Dose', value: 'seconddose' },
  { label: 'Booster Shot', value: 'booster' },
];

const HEALTH_RISK_OPTIONS = [
  { label: 'Pregnant', value: 'pregnant' },
  { label: 'Adolescent Pregnant', value: 'adolesentPregant' },
  { label: 'Post Partum', value: 'postPartum' },
];

const IMMUNIZATION_OPTIONS = [
  { label: 'TT1', value: 'tt1' },
  { label: 'TT2', value: 'tt2' },
  { label: 'TT3', value: 'tt3' },
  { label: 'TT4', value: 'tt4' },
  { label: 'TT5', value: 'tt5' },
  { label: 'FIM', value: 'fim' },
];

const FAMILY_PLANNING_METHODS = [
  'Pills',
  'DMPA',
  'Condom',
  'IUD-I',
  'IUD-PP',
  'Implant',
  'Cervical Mucus Method',
  'Basal Body Temp',
  'Vasectomy',
  'No Family Planning',
];

const FAMILY_PLANNING_SOURCES = [
  { label: 'Health Center', value: 'healthCenter' },
  { label: 'Hospital', value: 'hospital' },
  { label: 'Pharmacy', value: 'pharmacy' },
  { label: 'Others', value: 'others' },
];

export const ParentsStep: React.FC<ParentsStepProps> = ({ form, onNext, onBack }) => {
  const [showLMPPicker, setShowLMPPicker] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [showRespondentInfo, setShowRespondentInfo] = useState(false);
  const [showFatherInfo, setShowFatherInfo] = useState(false);
  const [showMotherInfo, setShowMotherInfo] = useState(false);

  const {
    headingSize,
    bodyTextSize,
    smallTextSize,
    sectionMargin,
    cardPadding,
    marginBottom,
  } = useResponsiveForm();

  // Fetch residents
  const { data: residents = [], isLoading } = useGetResidents({ exclude_independent: true });

  const residentOptions = residents.map((resident: any) => {
    const personal = resident.personal_info || resident;
    const fullName = `${personal.per_fname} ${personal.per_mname || ''} ${personal.per_lname}`.trim();
    return {
      label: `${resident.rp_id} - ${fullName}`,
      value: resident.rp_id,
      resident: resident,
    };
  });

  const handleResidentSelect = (rpId: string, prefix: 'respondentInfo' | 'motherInfo' | 'fatherInfo') => {
    // Check if the same resident is already selected - if so, unselect
    const currentId = form.watch(`${prefix}.id`);
    if (currentId === rpId) {
      // Clear all fields for this prefix
      form.setValue(`${prefix}.id`, '');
      form.setValue(`${prefix}.lastName`, '');
      form.setValue(`${prefix}.firstName`, '');
      form.setValue(`${prefix}.middleName`, '');
      form.setValue(`${prefix}.suffix`, '');
      form.setValue(`${prefix}.dateOfBirth`, '');
      form.setValue(`${prefix}.status`, '');
      form.setValue(`${prefix}.religion`, '');
      form.setValue(`${prefix}.edAttainment`, '');
      form.setValue(`${prefix}.contact`, '');
      form.setValue(`${prefix}.perAddDetails.bloodType`, '');
      form.setValue(`${prefix}.perAddDetails.philHealthId`, '');
      form.setValue(`${prefix}.perAddDetails.covidVaxStatus`, '');
      
      // Clear mother health info if applicable
      if (prefix === 'motherInfo') {
        form.setValue('motherInfo.motherHealthInfo.healthRiskClass', '');
        form.setValue('motherInfo.motherHealthInfo.immunizationStatus', '');
        form.setValue('motherInfo.motherHealthInfo.method', []);
        form.setValue('motherInfo.motherHealthInfo.source', '');
        form.setValue('motherInfo.motherHealthInfo.lmpDate', '');
        setSelectedMethods([]);
      }
      
      return;
    }
    
    const selected = residents.find((r: any) => r.rp_id === rpId);
    if (selected) {
      const personal = selected.personal_info || selected;
      form.setValue(`${prefix}.id`, rpId);
      form.setValue(`${prefix}.lastName`, personal.per_lname || '');
      form.setValue(`${prefix}.firstName`, personal.per_fname || '');
      form.setValue(`${prefix}.middleName`, personal.per_mname || '');
      form.setValue(`${prefix}.suffix`, personal.per_suffix || '');
      form.setValue(`${prefix}.dateOfBirth`, personal.per_dob || '');
      form.setValue(`${prefix}.status`, personal.per_status || '');
      form.setValue(`${prefix}.religion`, personal.per_religion || '');
      form.setValue(`${prefix}.edAttainment`, personal.per_edAttainment || '');
      form.setValue(`${prefix}.contact`, personal.per_contact || '');
      
      // Set health details if available
      form.setValue(`${prefix}.perAddDetails.bloodType`, personal.bloodType || '');
      form.setValue(`${prefix}.perAddDetails.philHealthId`, personal.philHealthId || '');
      form.setValue(`${prefix}.perAddDetails.covidVaxStatus`, personal.covidVaxStatus || '');
    }
  };

  const toggleFamilyPlanningMethod = (method: string) => {
    const currentMethods = form.watch('motherInfo.motherHealthInfo.method') || [];
    
    // If "No Family Planning" is clicked
    if (method === 'No Family Planning') {
      // If already selected, unselect it
      if (currentMethods.includes('No Family Planning')) {
        form.setValue('motherInfo.motherHealthInfo.method', []);
        setSelectedMethods([]);
        return;
      }
      // Otherwise, clear all other methods and set only "No Family Planning"
      form.setValue('motherInfo.motherHealthInfo.method', ['No Family Planning']);
      setSelectedMethods(['No Family Planning']);
      // Clear the source field
      form.setValue('motherInfo.motherHealthInfo.source', '');
      return;
    }
    
    // If trying to select another method while "No Family Planning" is selected
    if (currentMethods.includes('No Family Planning')) {
      // Remove "No Family Planning" and add the new method
      form.setValue('motherInfo.motherHealthInfo.method', [method]);
      setSelectedMethods([method]);
      return;
    }
    
    // Normal toggle behavior for other methods
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    
    form.setValue('motherInfo.motherHealthInfo.method', newMethods);
    setSelectedMethods(newMethods);
  };

  const validateAndNext = async () => {
    // Check if at least one parent is selected
    const motherId = form.watch('motherInfo.id');
    const fatherId = form.watch('fatherInfo.id');

    if (!motherId && !fatherId) {
      Alert.alert(
        'Parent Required',
        'Please select at least one parent (Mother or Father) to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    onNext?.();
  };

  if (isLoading) {
    return (
      <ResponsiveFormContainer>
        <FormContentWrapper>
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ fontSize: bodyTextSize }} className="text-gray-600 mt-4">
              Loading residents...
            </Text>
          </View>
        </FormContentWrapper>
      </ResponsiveFormContainer>
    );
  }

  return (
    <ResponsiveFormContainer>
      <FormContentWrapper>
        <View className="flex-1">
          {/* Header */}
          <View style={{ marginBottom: sectionMargin }}>
            <Text style={{ fontSize: headingSize }} className="font-bold text-gray-900 mb-2">
              Parents & Family Members
            </Text>
            <Text style={{ fontSize: smallTextSize }} className="text-gray-600">
              Select respondent, mother, and father information
            </Text>
          </View>

          {/* Info Card */}
          <View 
            style={{ marginBottom: marginBottom, padding: cardPadding }} 
            className="bg-blue-50 border border-blue-200 rounded-lg flex-row"
          >
            <Info size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
            <View className="flex-1">
              <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-blue-900 mb-1">
                Important
              </Text>
              <Text style={{ fontSize: smallTextSize }} className="text-blue-800">
                At least one parent (Mother or Father) is required. Respondent is optional.
              </Text>
            </View>
          </View>

          {/* Respondent Information */}
          <View 
            style={{ marginBottom: marginBottom, padding: cardPadding }} 
            className="bg-white rounded-lg border border-gray-200"
          >
            <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-3">
              Respondent Information (Optional)
            </Text>
            <Controller
              control={form.control}
              name="respondentInfo.id"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: form.watch('respondentInfo.id') ? marginBottom : 0 }}>
                  <CustomDropdown
                    data={residentOptions}
                    value={value || ''}
                    onSelect={(val: string) => {
                      handleResidentSelect(val, 'respondentInfo');
                      // Only call onChange if not unselecting (handleResidentSelect already clears the form)
                      if (val !== value) {
                        onChange(val === value ? '' : val);
                      }
                    }}
                    placeholder="Select Respondent"
                    searchPlaceholder="Search residents..."
                    loading={isLoading}
                  />
                </View>
              )}
            />
            
            {form.watch('respondentInfo.id') && (
              <View className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Accordion Header */}
                <TouchableOpacity
                  onPress={() => setShowRespondentInfo(!showRespondentInfo)}
                  className="flex-row items-center justify-between p-3 bg-gray-50"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                      <Text style={{ fontSize: smallTextSize }} className="text-green-700 font-semibold">
                        {form.watch('respondentInfo.id').split(' ')[0]}
                      </Text>
                    </View>
                    <Text style={{ fontSize: smallTextSize }} className="text-gray-900 font-semibold flex-1">
                      {form.watch('respondentInfo.firstName')} {form.watch('respondentInfo.lastName')}
                    </Text>
                  </View>
                  {showRespondentInfo ? (
                    <ChevronUp size={20} color="#6B7280" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>

                {/* Accordion Content */}
                {showRespondentInfo && (
                  <View className="p-3 bg-white border-t border-gray-200">
                    <View className="space-y-2">
                      <View className="flex-row">
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Full Name:</Text>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                          {form.watch('respondentInfo.firstName')} {form.watch('respondentInfo.middleName')} {form.watch('respondentInfo.lastName')} {form.watch('respondentInfo.suffix')}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Date of Birth:</Text>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                          {form.watch('respondentInfo.dateOfBirth') || 'N/A'}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Status:</Text>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                          {form.watch('respondentInfo.status') || 'N/A'}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Religion:</Text>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                          {form.watch('respondentInfo.religion') || 'N/A'}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Education:</Text>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                          {form.watch('respondentInfo.edAttainment') || 'N/A'}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Contact:</Text>
                        <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                          {form.watch('respondentInfo.contact') || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Father Information */}
          <View 
            style={{ marginBottom: marginBottom, padding: cardPadding }} 
            className="bg-white rounded-lg border border-gray-200"
          >
            <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-3">
              Father Information
            </Text>
            <Controller
              control={form.control}
              name="fatherInfo.id"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: form.watch('fatherInfo.id') ? marginBottom : 0 }}>
                  <CustomDropdown
                    data={residentOptions}
                    value={value || ''}
                    onSelect={(val: string) => {
                      handleResidentSelect(val, 'fatherInfo');
                      // Only call onChange if not unselecting (handleResidentSelect already clears the form)
                      if (val !== value) {
                        onChange(val === value ? '' : val);
                      }
                    }}
                    placeholder="Select Father"
                    searchPlaceholder="Search residents..."
                    loading={isLoading}
                  />
                </View>
              )}
            />
            
            {form.watch('fatherInfo.id') && (
              <View>
                {/* Personal Info Accordion */}
                <View className="border border-gray-200 rounded-lg overflow-hidden" style={{ marginBottom: marginBottom }}>
                  {/* Accordion Header */}
                  <TouchableOpacity
                    onPress={() => setShowFatherInfo(!showFatherInfo)}
                    className="flex-row items-center justify-between p-3 bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                        <Text style={{ fontSize: smallTextSize }} className="text-green-700 font-semibold">
                          {form.watch('fatherInfo.id').split(' ')[0]}
                        </Text>
                      </View>
                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 font-semibold flex-1">
                        {form.watch('fatherInfo.firstName')} {form.watch('fatherInfo.lastName')}
                      </Text>
                    </View>
                    {showFatherInfo ? (
                      <ChevronUp size={20} color="#6B7280" />
                    ) : (
                      <ChevronDown size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>

                  {/* Accordion Content */}
                  {showFatherInfo && (
                    <View className="p-3 bg-white border-t border-gray-200">
                      <View className="space-y-2">
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Full Name:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                            {form.watch('fatherInfo.firstName')} {form.watch('fatherInfo.middleName')} {form.watch('fatherInfo.lastName')} {form.watch('fatherInfo.suffix')}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Date of Birth:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('fatherInfo.dateOfBirth') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Status:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('fatherInfo.status') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Religion:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('fatherInfo.religion') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Education:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('fatherInfo.edAttainment') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Contact:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('fatherInfo.contact') || 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* Father Health Information */}
                <View className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-blue-900 mb-3">
                    Health Information
                  </Text>

                  {/* Blood Type */}
                  <View style={{ marginBottom: marginBottom }}>
                    <FormSelect
                      control={form.control}
                      name="fatherInfo.perAddDetails.bloodType"
                      label="Blood Type"
                      options={BLOOD_TYPE_OPTIONS}
                      placeholder="Select Blood Type"
                    />
                  </View>

                  {/* PhilHealth ID */}
                  <View style={{ marginBottom: marginBottom }}>
                    <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-700 mb-2">
                      PhilHealth ID
                    </Text>
                    <Controller
                      control={form.control}
                      name="fatherInfo.perAddDetails.philHealthId"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value || ''}
                          onChangeText={onChange}
                          placeholder="Enter PhilHealth ID"
                          keyboardType="numeric"
                          className="border border-gray-300 rounded-lg px-4 bg-white text-gray-900"
                          style={{ fontSize: bodyTextSize, height: 44 }}
                          placeholderTextColor="#9CA3AF"
                        />
                      )}
                    />
                  </View>

                  {/* COVID Vaccination Status */}
                  <View>
                    <FormSelect
                      control={form.control}
                      name="fatherInfo.perAddDetails.covidVaxStatus"
                      label="COVID Vaccination Status"
                      options={COVID_VAX_OPTIONS}
                      placeholder="Select Vaccination Status"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Mother Information */}
          <View 
            style={{ marginBottom: marginBottom, padding: cardPadding }} 
            className="bg-white rounded-lg border border-gray-200"
          >
            <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-gray-900 mb-3">
              Mother Information
            </Text>
            <Controller
              control={form.control}
              name="motherInfo.id"
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: form.watch('motherInfo.id') ? marginBottom : 0 }}>
                  <CustomDropdown
                    data={residentOptions}
                    value={value || ''}
                    onSelect={(val: string) => {
                      handleResidentSelect(val, 'motherInfo');
                      // Only call onChange if not unselecting (handleResidentSelect already clears the form)
                      if (val !== value) {
                        onChange(val === value ? '' : val);
                      }
                    }}
                    placeholder="Select Mother"
                    searchPlaceholder="Search residents..."
                    loading={isLoading}
                  />
                </View>
              )}
            />
            
            {form.watch('motherInfo.id') && (
              <View>
                {/* Personal Info Accordion */}
                <View className="border border-gray-200 rounded-lg overflow-hidden" style={{ marginBottom: marginBottom }}>
                  {/* Accordion Header */}
                  <TouchableOpacity
                    onPress={() => setShowMotherInfo(!showMotherInfo)}
                    className="flex-row items-center justify-between p-3 bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                        <Text style={{ fontSize: smallTextSize }} className="text-green-700 font-semibold">
                          {form.watch('motherInfo.id').split(' ')[0]}
                        </Text>
                      </View>
                      <Text style={{ fontSize: smallTextSize }} className="text-gray-900 font-semibold flex-1">
                        {form.watch('motherInfo.firstName')} {form.watch('motherInfo.lastName')}
                      </Text>
                    </View>
                    {showMotherInfo ? (
                      <ChevronUp size={20} color="#6B7280" />
                    ) : (
                      <ChevronDown size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>

                  {/* Accordion Content */}
                  {showMotherInfo && (
                    <View className="p-3 bg-white border-t border-gray-200">
                      <View className="space-y-2">
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Full Name:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                            {form.watch('motherInfo.firstName')} {form.watch('motherInfo.middleName')} {form.watch('motherInfo.lastName')} {form.watch('motherInfo.suffix')}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Date of Birth:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('motherInfo.dateOfBirth') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Status:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('motherInfo.status') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Religion:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('motherInfo.religion') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Education:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('motherInfo.edAttainment') || 'N/A'}
                          </Text>
                        </View>
                        <View className="flex-row">
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">Contact:</Text>
                          <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                            {form.watch('motherInfo.contact') || 'N/A'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* Mother Health Information */}
                <View className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <Text style={{ fontSize: bodyTextSize }} className="font-semibold text-pink-900 mb-3">
                    Health Information
                  </Text>

                  {/* Blood Type */}
                  <View style={{ marginBottom: marginBottom }}>
                    <FormSelect
                      control={form.control}
                      name="motherInfo.perAddDetails.bloodType"
                      label="Blood Type"
                      options={BLOOD_TYPE_OPTIONS}
                      placeholder="Select Blood Type"
                    />
                  </View>

                  {/* PhilHealth ID */}
                  <View style={{ marginBottom: marginBottom }}>
                    <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-700 mb-2">
                      PhilHealth ID
                    </Text>
                    <Controller
                      control={form.control}
                      name="motherInfo.perAddDetails.philHealthId"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          value={value || ''}
                          onChangeText={onChange}
                          placeholder="Enter PhilHealth ID"
                          keyboardType="numeric"
                          className="border border-gray-300 rounded-lg px-4 bg-white text-gray-900"
                          style={{ fontSize: bodyTextSize, height: 44 }}
                          placeholderTextColor="#9CA3AF"
                        />
                      )}
                    />
                  </View>

                  {/* COVID Vaccination Status */}
                  <View style={{ marginBottom: marginBottom }}>
                    <FormSelect
                      control={form.control}
                      name="motherInfo.perAddDetails.covidVaxStatus"
                      label="COVID Vaccination Status"
                      options={COVID_VAX_OPTIONS}
                      placeholder="Select Vaccination Status"
                    />
                  </View>

                  {/* Health Risk Class */}
                  <View style={{ marginBottom: marginBottom }}>
                    <FormSelect
                      control={form.control}
                      name="motherInfo.motherHealthInfo.healthRiskClass"
                      label="Health Risk Class"
                      options={HEALTH_RISK_OPTIONS}
                      placeholder="Select Health Risk Class"
                    />
                  </View>

                  {/* Immunization Status */}
                  <View style={{ marginBottom: marginBottom }}>
                    <FormSelect
                      control={form.control}
                      name="motherInfo.motherHealthInfo.immunizationStatus"
                      label="Immunization Status"
                      options={IMMUNIZATION_OPTIONS}
                      placeholder="Select Immunization Status"
                    />
                  </View>

                  {/* Family Planning Method (Multi-select) */}
                  <View style={{ marginBottom: marginBottom }}>
                    <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-700 mb-2">
                      Family Planning Method
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {FAMILY_PLANNING_METHODS.map((method) => {
                        const currentMethods = form.watch('motherInfo.motherHealthInfo.method') || [];
                        const isSelected = currentMethods.includes(method);
                        const noFamilyPlanningSelected = currentMethods.includes('No Family Planning');
                        const isDisabled = noFamilyPlanningSelected && method !== 'No Family Planning';
                        
                        return (
                          <TouchableOpacity
                            key={method}
                            onPress={() => !isDisabled && toggleFamilyPlanningMethod(method)}
                            disabled={isDisabled}
                            className={`px-3 py-2 rounded-full border ${
                              isSelected
                                ? 'bg-pink-600 border-pink-600'
                                : isDisabled
                                ? 'bg-gray-100 border-gray-200'
                                : 'bg-white border-gray-300'
                            }`}
                            style={{ opacity: isDisabled ? 0.5 : 1 }}
                          >
                            <Text
                              style={{ fontSize: smallTextSize }}
                              className={`${
                                isSelected 
                                  ? 'text-white font-medium' 
                                  : isDisabled
                                  ? 'text-gray-400'
                                  : 'text-gray-700'
                              }`}
                            >
                              {method}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Family Planning Source - Only show if methods selected and "No Family Planning" not active */}
                  {(() => {
                    const currentMethods = form.watch('motherInfo.motherHealthInfo.method') || [];
                    const showSource = currentMethods.length > 0 && !currentMethods.includes('No Family Planning');
                    
                    return showSource ? (
                      <View style={{ marginBottom: marginBottom }}>
                        <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-700 mb-2">
                          Family Planning Source
                        </Text>
                        <Controller
                          control={form.control}
                          name="motherInfo.motherHealthInfo.source"
                          render={({ field: { onChange, value } }) => (
                            <CustomDropdown
                              data={FAMILY_PLANNING_SOURCES}
                              value={value || ''}
                              onSelect={onChange}
                              placeholder="Select Source"
                              searchPlaceholder="Search..."
                            />
                          )}
                        />
                      </View>
                    ) : null;
                  })()}

                  {/* Last Menstrual Period Date */}
                  <View>
                    <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-700 mb-2">
                      Last Menstrual Period (LMP) Date
                    </Text>
                    <Controller
                      control={form.control}
                      name="motherInfo.motherHealthInfo.lmpDate"
                      render={({ field: { onChange, value } }) => (
                        <View>
                          <TouchableOpacity
                            onPress={() => setShowLMPPicker(true)}
                            className="flex-row items-center border border-gray-300 rounded-lg px-4 bg-white"
                            style={{ height: 44 }}
                          >
                            <Calendar size={20} color="#6B7280" />
                            <Text style={{ fontSize: bodyTextSize }} className="ml-2 text-gray-900">
                              {value ? new Date(value).toLocaleDateString() : 'Select Date'}
                            </Text>
                          </TouchableOpacity>
                          
                          {showLMPPicker && (
                            <DateTimePicker
                              value={value ? new Date(value) : new Date()}
                              mode="date"
                              display="default"
                              onChange={(event, selectedDate) => {
                                setShowLMPPicker(false);
                                if (selectedDate) {
                                  onChange(selectedDate.toISOString().split('T')[0]);
                                }
                              }}
                              maximumDate={new Date()}
                            />
                          )}
                        </View>
                      )}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={{ marginTop: sectionMargin }} className="flex-row gap-3">
            {/* Back Button */}
            <View className="flex-1">
              <Button
                onPress={onBack}
                disabled={isLoading}
                variant="outline"
              >
                <Text className="text-gray-700 font-semibold">Back</Text>
              </Button>
            </View>

            {/* Next Button */}
            <View className="flex-1">
              <Button
                onPress={validateAndNext}
                disabled={isLoading}
                className="bg-blue-600"
              >
                <Text className="text-white font-semibold">Next</Text>
              </Button>
            </View>
          </View>
        </View>
      </FormContentWrapper>
    </ResponsiveFormContainer>
  );
};
