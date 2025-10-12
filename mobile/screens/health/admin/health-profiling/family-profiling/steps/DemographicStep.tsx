import React, { useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { fetchHouseholds, fetchHouseholdData, fetchResidentPersonalInfo } from '@/api/health-family-profiling-api';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';

interface DemographicStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
}

const BUILDING_OPTIONS = [
  { label: 'Concrete', value: 'Concrete' },
  { label: 'Semi-Concrete', value: 'Semi-Concrete' },
  { label: 'Wood', value: 'Wood' },
  { label: 'Mixed Materials', value: 'Mixed Materials' },
  { label: 'Light Materials', value: 'Light Materials' },
];

const INDIGENOUS_OPTIONS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const DemographicStep: React.FC<DemographicStepProps> = ({ form }) => {
  const selectedHouseholdId = form.watch('demographicInfo.householdNo');

  // Fetch all households
  const { data: households = [], isLoading: isLoadingHouseholds } = useQuery({
    queryKey: ['households'],
    queryFn: fetchHouseholds,
  });

  // Fetch selected household data
  const { data: householdData, isLoading: isLoadingHousehold } = useQuery({
    queryKey: ['household', selectedHouseholdId],
    queryFn: () => fetchHouseholdData(selectedHouseholdId),
    enabled: !!selectedHouseholdId,
  });

  // Extract household head ID
  const householdHeadId = React.useMemo(() => {
    if (!householdData) return null;
    return householdData.rp_id || householdData.rp || null;
  }, [householdData]);

  // Fetch personal info of household head
  const { data: personalInfo } = useQuery({
    queryKey: ['resident-personal', householdHeadId],
    queryFn: () => fetchResidentPersonalInfo(householdHeadId!),
    enabled: !!householdHeadId,
  });

  // Populate household head fields when data is available
  useEffect(() => {
    if (personalInfo && selectedHouseholdId) {
      form.setValue('householdHead.per_lname', personalInfo.per_lname || '');
      form.setValue('householdHead.per_fname', personalInfo.per_fname || '');
      form.setValue('householdHead.per_mname', personalInfo.per_mname || '');
      form.setValue('householdHead.per_sex', personalInfo.per_sex || '');
    }
  }, [personalInfo, selectedHouseholdId]);

  // Clear household head fields when household is deselected
  useEffect(() => {
    if (!selectedHouseholdId) {
      form.setValue('householdHead.per_lname', '');
      form.setValue('householdHead.per_fname', '');
      form.setValue('householdHead.per_mname', '');
      form.setValue('householdHead.per_sex', '');
    }
  }, [selectedHouseholdId]);

  const householdOptions = households.map((hh: any) => ({
    label: `HH-${hh.hh_id} - ${hh.hh_address || 'No Address'}`,
    value: hh.hh_id,
  }));

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-6">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Demographic Information
          </Text>
          <Text className="text-sm text-gray-600">
            Select the household and provide basic information
          </Text>
        </View>

        {/* Household Selection */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Household <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="demographicInfo.householdNo"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={householdOptions}
                  value={value || ''}
                  onSelect={onChange}
                  placeholder="Select Household"
                  searchPlaceholder="Search households..."
                  loading={isLoadingHouseholds}
                />
                {error && (
                  <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Household Head Information (Read-only) */}
        {selectedHouseholdId && (
          <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Text className="text-sm font-semibold text-blue-900 mb-3">
              Household Head Information
            </Text>
            
            {isLoadingHousehold ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <View className="space-y-2">
                <View>
                  <Text className="text-xs text-blue-700 mb-1">Last Name</Text>
                  <Text className="text-base text-blue-900 font-medium">
                    {form.watch('householdHead.per_lname') || '---'}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-blue-700 mb-1">First Name</Text>
                  <Text className="text-base text-blue-900 font-medium">
                    {form.watch('householdHead.per_fname') || '---'}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-blue-700 mb-1">Middle Name</Text>
                  <Text className="text-base text-blue-900 font-medium">
                    {form.watch('householdHead.per_mname') || '---'}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-blue-700 mb-1">Sex</Text>
                  <Text className="text-base text-blue-900 font-medium">
                    {form.watch('householdHead.per_sex') || '---'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Building Type */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Building Type <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="demographicInfo.building"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={BUILDING_OPTIONS}
                  value={value || ''}
                  onSelect={onChange}
                  placeholder="Select Building Type"
                  searchPlaceholder="Search building types..."
                />
                {error && (
                  <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Indigenous */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Indigenous <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="demographicInfo.indigenous"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={INDIGENOUS_OPTIONS}
                  value={value || ''}
                  onSelect={onChange}
                  placeholder="Select Indigenous Status"
                  searchPlaceholder="Search..."
                />
                {error && (
                  <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
};
