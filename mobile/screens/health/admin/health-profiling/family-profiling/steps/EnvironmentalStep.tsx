import React from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { fetchWaterSupplyOptions } from '@/api/health-family-profiling-api';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';

interface EnvironmentalStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
}

const FACILITY_TYPE_OPTIONS = [
  { label: 'Sanitary', value: 'Sanitary' },
  { label: 'Unsanitary', value: 'Unsanitary' },
];

const SANITARY_FACILITY_OPTIONS = [
  { label: 'Water-sealed', value: 'Water-sealed' },
  { label: 'Closed Pit', value: 'Closed Pit' },
];

const UNSANITARY_FACILITY_OPTIONS = [
  { label: 'Open Pit', value: 'Open Pit' },
  { label: 'Others', value: 'Others' },
];

const TOILET_FACILITY_OPTIONS = [
  { label: 'Own Toilet', value: 'Own Toilet' },
  { label: 'Shared Toilet', value: 'Shared Toilet' },
  { label: 'Public Toilet', value: 'Public Toilet' },
  { label: 'No Toilet', value: 'No Toilet' },
];

const WASTE_MANAGEMENT_OPTIONS = [
  { label: 'Collected by LGU', value: 'Collected by LGU' },
  { label: 'Burning', value: 'Burning' },
  { label: 'Composting', value: 'Composting' },
  { label: 'Recycling', value: 'Recycling' },
  { label: 'Burying', value: 'Burying' },
  { label: 'Dumping', value: 'Dumping' },
  { label: 'Others', value: 'Others' },
];

export const EnvironmentalStep: React.FC<EnvironmentalStepProps> = ({ form }) => {
  const facilityType = form.watch('environmentalForm.facilityType');
  const wasteManagement = form.watch('environmentalForm.wasteManagement');

  // Fetch water supply options
  const { data: waterSupplyOptions = [] } = useQuery({
    queryKey: ['water-supply-options'],
    queryFn: fetchWaterSupplyOptions,
  });

  const waterOptions = waterSupplyOptions.map((option: any) => ({
    label: option.name || option,
    value: option.value || option,
  }));

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-6 pb-6">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Environmental Health & Sanitation
          </Text>
          <Text className="text-sm text-gray-600">
            Provide household environmental and sanitation information
          </Text>
        </View>

        {/* Water Supply */}
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Water Supply <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="environmentalForm.waterSupply"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={waterOptions.length > 0 ? waterOptions : [
                    { label: 'Community Water System', value: 'Community Water System' },
                    { label: 'Own Use', value: 'Own Use' },
                    { label: 'Point Source', value: 'Point Source' },
                    { label: 'Bottled Water', value: 'Bottled Water' },
                  ]}
                  value={value || ''}
                  onSelect={onChange}
                  placeholder="Select Water Supply Type"
                  searchPlaceholder="Search..."
                />
                {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Sanitary Facility */}
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Sanitary Facility
          </Text>

          {/* Facility Type */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Facility Type <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={form.control}
              name="environmentalForm.facilityType"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View>
                  <CustomDropdown
                    data={FACILITY_TYPE_OPTIONS}
                    value={value || ''}
                    onSelect={onChange}
                    placeholder="Select Facility Type"
                    searchPlaceholder="Search..."
                  />
                  {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
                </View>
              )}
            />
          </View>

          {/* Conditional: Sanitary Facility Type */}
          {facilityType === 'Sanitary' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Sanitary Facility Type
              </Text>
              <Controller
                control={form.control}
                name="environmentalForm.sanitaryFacilityType"
                render={({ field: { onChange, value } }) => (
                  <CustomDropdown
                    data={SANITARY_FACILITY_OPTIONS}
                    value={value || ''}
                    onSelect={onChange}
                    placeholder="Select Sanitary Type"
                    searchPlaceholder="Search..."
                  />
                )}
              />
            </View>
          )}

          {/* Conditional: Unsanitary Facility Type */}
          {facilityType === 'Unsanitary' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Unsanitary Facility Type
              </Text>
              <Controller
                control={form.control}
                name="environmentalForm.unsanitaryFacilityType"
                render={({ field: { onChange, value } }) => (
                  <CustomDropdown
                    data={UNSANITARY_FACILITY_OPTIONS}
                    value={value || ''}
                    onSelect={onChange}
                    placeholder="Select Unsanitary Type"
                    searchPlaceholder="Search..."
                  />
                )}
              />
            </View>
          )}

          {/* Toilet Facility Type */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Toilet Facility Type <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={form.control}
              name="environmentalForm.toiletFacilityType"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View>
                  <CustomDropdown
                    data={TOILET_FACILITY_OPTIONS}
                    value={value || ''}
                    onSelect={onChange}
                    placeholder="Select Toilet Type"
                    searchPlaceholder="Search..."
                  />
                  {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
                </View>
              )}
            />
          </View>
        </View>

        {/* Waste Management */}
        <View className="bg-white p-4 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Waste Management <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="environmentalForm.wasteManagement"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <CustomDropdown
                  data={WASTE_MANAGEMENT_OPTIONS}
                  value={value || ''}
                  onSelect={onChange}
                  placeholder="Select Waste Management Type"
                  searchPlaceholder="Search..."
                />
                {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
              </View>
            )}
          />

          {/* Conditional: Others Description */}
          {wasteManagement === 'Others' && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Please Specify
              </Text>
              <Controller
                control={form.control}
                name="environmentalForm.wasteManagementOthers"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                    placeholder="Describe waste management method"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};
