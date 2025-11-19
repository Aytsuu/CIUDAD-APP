import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { FormSelect } from '@/components/ui/form/form-select';
import { ResponsiveFormContainer, useResponsiveForm } from '@/components/healthcomponents/ResponsiveFormContainer';
import { useGetWaterSupplyOptions } from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';

interface EnvironmentalStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
}

const FACILITY_TYPE_OPTIONS = [
  { label: 'Sanitary', value: 'SANITARY' },
  { label: 'Unsanitary', value: 'UNSANITARY' },
];

const SANITARY_FACILITY_OPTIONS = [
  { label: 'Pour/flush type with septic tank', value: 'santype1' },
  { label: 'Pour/flush toilet connected to septic tank AND to sewerage system', value: 'santype2' },
  { label: 'Ventilated Pit (VIP) Latrine', value: 'santype3' },
];

const UNSANITARY_FACILITY_OPTIONS = [
  { label: 'Water-sealed toilet without septic tank', value: 'unsanType1' },
  { label: 'Overhung latrine', value: 'unsantype2' },
  { label: 'Open Pit Latrine', value: 'unsantype3' },
  { label: 'Without toilet', value: 'unsantype4' },
];

const TOILET_FACILITY_OPTIONS = [
  { label: 'SHARED with Other Household', value: 'SHARED' },
  { label: 'NOT SHARED with Other Household', value: 'NOT SHARED' },
];

const WASTE_MANAGEMENT_OPTIONS = [
  { label: 'Waste Segregation', value: 'WASTE SEGREGATION' },
  { label: 'Backyard Composting', value: 'BACKYARD COMPOSTING' },
  { label: 'Recycling/Reuse', value: 'RECYCLING' },
  { label: 'Collected by City Collection and Disposal System', value: 'COLLECTED BY CITY' },
  { label: 'Burning/Burying', value: 'BURNING/BURYING' },
  { label: 'Others', value: 'OTHERS' },
];

export const EnvironmentalStep: React.FC<EnvironmentalStepProps> = ({ form }) => {
  const {
    bodyTextSize,
    smallTextSize,
    marginBottom,
  } = useResponsiveForm();

  // Watch form values
  const facilityType = form.watch('environmentalForm.facilityType');
  const wasteManagement = form.watch('environmentalForm.wasteManagement');

  // Fetch water supply options
  const { data: waterSupplyData, isLoading: isLoadingWaterSupply } = useGetWaterSupplyOptions();

  // Prepare water supply options
  const waterSupplyOptions = React.useMemo(() => {
    if (!waterSupplyData?.data) {
      return [
        { label: 'LEVEL I - POINT SOURCE', value: 'level1' },
        { label: 'LEVEL II - COMMUNAL FAUCET OR STAND POST', value: 'level2' },
        { label: 'LEVEL III - INDIVIDUAL CONNECTION', value: 'level3' },
      ];
    }
    return waterSupplyData.data.map((option: any) => ({
      label: `${option.title} - ${option.subtitle}`,
      value: option.value,
    }));
  }, [waterSupplyData]);

  // Clear conditional fields based on facility type
  React.useEffect(() => {
    const normalized = (facilityType || '').toUpperCase();
    if (normalized === 'SANITARY') {
      form.setValue('environmentalForm.unsanitaryFacilityType', '');
    } else if (normalized === 'UNSANITARY') {
      form.setValue('environmentalForm.sanitaryFacilityType', '');
    }
  }, [facilityType, form]);

  // Clear wasteManagementOthers when not "OTHERS"
  React.useEffect(() => {
    const wm = (wasteManagement || '').toUpperCase();
    if (wm !== 'OTHERS') {
      form.setValue('environmentalForm.wasteManagementOthers', '');
    }
  }, [wasteManagement, form]);

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="px-4 pt-6 pb-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Environmental Health & Sanitation
        </Text>
        <Text className="text-sm text-gray-600">
          Provide household environmental and sanitation information
        </Text>
      </View>

      {/* Scrollable Content - Single White Card */}
      <View className="flex-1 px-4 pt-6">
        <View className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
          {/* A. Type of Water Supply */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              A. Type of Water Supply
            </Text>
            
            {isLoadingWaterSupply ? (
              <View className="p-8 items-center">
                <Text className="text-gray-500">Loading water supply options...</Text>
              </View>
            ) : (
              <FormSelect
                control={form.control}
                name="environmentalForm.waterSupply"
                options={waterSupplyOptions}
                label="Water Supply Type"
                placeholder="Select Water Supply"
              />
            )}
          </View>

          {/* B. Type of Sanitary Facility */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              B. Type of Sanitary Facility
            </Text>

            {/* Facility Type */}
            <FormSelect
              control={form.control}
              name="environmentalForm.facilityType"
              options={FACILITY_TYPE_OPTIONS}
              label="Facility Type"
              placeholder="Select Facility Type"
            />

            {/* Conditional: Sanitary Facility Type */}
            {(facilityType === 'SANITARY' || facilityType === 'Sanitary') && (
              <FormSelect
                control={form.control}
                name="environmentalForm.sanitaryFacilityType"
                options={SANITARY_FACILITY_OPTIONS}
                label="Sanitary Facility Type"
                placeholder="Select Sanitary Type"
              />
            )}

            {/* Conditional: Unsanitary Facility Type */}
            {(facilityType === 'UNSANITARY' || facilityType === 'Unsanitary') && (
              <FormSelect
                control={form.control}
                name="environmentalForm.unsanitaryFacilityType"
                options={UNSANITARY_FACILITY_OPTIONS}
                label="Unsanitary Facility Type"
                placeholder="Select Unsanitary Type"
              />
            )}

            {/* Toilet Facility Type */}
            <FormSelect
              control={form.control}
              name="environmentalForm.toiletFacilityType"
              options={TOILET_FACILITY_OPTIONS}
              label="Toilet Facility Type"
              placeholder="Select Toilet Type"
            />
          </View>

          {/* C. Solid Waste Management */}
          <View className="mb-0">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              C. Solid Waste Management
            </Text>

            <FormSelect
              control={form.control}
              name="environmentalForm.wasteManagement"
              options={WASTE_MANAGEMENT_OPTIONS}
              label="Waste Management Type"
              placeholder="Select Waste Management"
            />

            {/* Conditional: Others Description */}
            {(wasteManagement === 'OTHERS' || wasteManagement === 'Others') && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Please Specify
                </Text>
                <Controller
                  control={form.control}
                  name="environmentalForm.wasteManagementOthers"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 h-12 bg-white"
                      placeholder="Enter waste management type"
                      value={value || ''}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
