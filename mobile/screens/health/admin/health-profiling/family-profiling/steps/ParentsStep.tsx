import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { useGetResidents } from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface ParentsStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
}

const HEALTH_RISK_OPTIONS = [
  { label: 'Low Risk', value: 'Low Risk' },
  { label: 'Moderate Risk', value: 'Moderate Risk' },
  { label: 'High Risk', value: 'High Risk' },
];

const IMMUNIZATION_OPTIONS = [
  { label: 'Fully Immunized', value: 'Fully Immunized' },
  { label: 'Partially Immunized', value: 'Partially Immunized' },
  { label: 'Not Immunized', value: 'Not Immunized' },
];

const FAMILY_PLANNING_METHODS = [
  'Pills', 'Injectable', 'IUD', 'Implant', 'Condom', 
  'Natural Family Planning', 'LAM', 'BTL', 'Others'
];

const FAMILY_PLANNING_SOURCES = [
  { label: 'Health Center', value: 'Health Center' },
  { label: 'Private Clinic', value: 'Private Clinic' },
  { label: 'Hospital', value: 'Hospital' },
  { label: 'Pharmacy', value: 'Pharmacy' },
  { label: 'Others', value: 'Others' },
];

export const ParentsStep: React.FC<ParentsStepProps> = ({ form }) => {
  const [showLMPPicker, setShowLMPPicker] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

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
    }
  };

  const toggleFamilyPlanningMethod = (method: string) => {
    const currentMethods = form.watch('motherInfo.motherHealthInfo.method') || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    
    form.setValue('motherInfo.motherHealthInfo.method', newMethods);
    setSelectedMethods(newMethods);
  };

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-6 pb-6">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Parents & Family Members
          </Text>
          <Text className="text-sm text-gray-600">
            Select respondent, mother, and father information
          </Text>
        </View>

        {/* Respondent Information */}
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Respondent Information <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="respondentInfo.id"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={residentOptions}
                  value={value || ''}
                  onSelect={(val: string) => {
                    onChange(val);
                    handleResidentSelect(val, 'respondentInfo');
                  }}
                  placeholder="Select Respondent"
                  searchPlaceholder="Search residents..."
                  loading={isLoading}
                />
                {error && (
                  <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
                )}
              </View>
            )}
          />
          
          {form.watch('respondentInfo.id') && (
            <View className="mt-3 p-3 bg-gray-50 rounded">
              <Text className="text-sm text-gray-700">
                {form.watch('respondentInfo.firstName')} {form.watch('respondentInfo.middleName')} {form.watch('respondentInfo.lastName')}
              </Text>
            </View>
          )}
        </View>

        {/* Father Information */}
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Father Information
          </Text>
          <Controller
            control={form.control}
            name="fatherInfo.id"
            render={({ field: { onChange, value } }) => (
              <CustomDropdown
                data={residentOptions}
                value={value || ''}
                onSelect={(val: string) => {
                  onChange(val);
                  handleResidentSelect(val, 'fatherInfo');
                }}
                placeholder="Select Father (Optional)"
                searchPlaceholder="Search residents..."
                loading={isLoading}
              />
            )}
          />
          
          {form.watch('fatherInfo.id') && (
            <View className="mt-3 p-3 bg-gray-50 rounded">
              <Text className="text-sm text-gray-700">
                {form.watch('fatherInfo.firstName')} {form.watch('fatherInfo.middleName')} {form.watch('fatherInfo.lastName')}
              </Text>
            </View>
          )}
        </View>

        {/* Mother Information */}
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Mother Information
          </Text>
          <Controller
            control={form.control}
            name="motherInfo.id"
            render={({ field: { onChange, value } }) => (
              <CustomDropdown
                data={residentOptions}
                value={value || ''}
                onSelect={(val: string) => {
                  onChange(val);
                  handleResidentSelect(val, 'motherInfo');
                }}
                placeholder="Select Mother (Optional)"
                searchPlaceholder="Search residents..."
                loading={isLoading}
              />
            )}
          />
          
          {form.watch('motherInfo.id') && (
            <View className="mt-3 p-3 bg-gray-50 rounded">
              <Text className="text-sm text-gray-700">
                {form.watch('motherInfo.firstName')} {form.watch('motherInfo.middleName')} {form.watch('motherInfo.lastName')}
              </Text>
            </View>
          )}

          {/* Mother Health Information */}
          {form.watch('motherInfo.id') && (
            <View className="mt-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <Text className="text-base font-semibold text-pink-900 mb-4">
                Mother's Health Information
              </Text>

              {/* Health Risk Class */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Health Risk Class
                </Text>
                <Controller
                  control={form.control}
                  name="motherInfo.motherHealthInfo.healthRiskClass"
                  render={({ field: { onChange, value } }) => (
                    <CustomDropdown
                      data={HEALTH_RISK_OPTIONS}
                      value={value || ''}
                      onSelect={onChange}
                      placeholder="Select Health Risk Class"
                      searchPlaceholder="Search..."
                    />
                  )}
                />
              </View>

              {/* Immunization Status */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Immunization Status
                </Text>
                <Controller
                  control={form.control}
                  name="motherInfo.motherHealthInfo.immunizationStatus"
                  render={({ field: { onChange, value } }) => (
                    <CustomDropdown
                      data={IMMUNIZATION_OPTIONS}
                      value={value || ''}
                      onSelect={onChange}
                      placeholder="Select Immunization Status"
                      searchPlaceholder="Search..."
                    />
                  )}
                />
              </View>

              {/* Family Planning Method (Multi-select) */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Family Planning Method
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {FAMILY_PLANNING_METHODS.map((method) => {
                    const isSelected = (form.watch('motherInfo.motherHealthInfo.method') || []).includes(method);
                    return (
                      <TouchableOpacity
                        key={method}
                        onPress={() => toggleFamilyPlanningMethod(method)}
                        className={`px-3 py-2 rounded-full border ${
                          isSelected
                            ? 'bg-pink-600 border-pink-600'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? 'text-white font-medium' : 'text-gray-700'
                          }`}
                        >
                          {method}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Family Planning Source */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
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

              {/* Last Menstrual Period Date */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Last Menstrual Period (LMP) Date
                </Text>
                <Controller
                  control={form.control}
                  name="motherInfo.motherHealthInfo.lmpDate"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <TouchableOpacity
                        onPress={() => setShowLMPPicker(true)}
                        className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-white"
                      >
                        <Calendar size={20} color="#6B7280" />
                        <Text className="ml-2 text-gray-900">
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
          )}
        </View>
      </View>
    </ScrollView>
  );
};
