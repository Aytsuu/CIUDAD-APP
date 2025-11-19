import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { FormSelect } from '@/components/ui/form/form-select';
import { Button } from '@/components/ui/button';
import { useGetHouseholds, useGetHouseholdData, useGetResidentPersonalInfo } from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import { Search } from 'lucide-react-native';
import { ResponsiveFormContainer, useResponsiveForm, FormContentWrapper } from '../../../../../../components/healthcomponents/ResponsiveFormContainer';

interface DemographicStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
  onNext?: () => void;
  onBack?: () => void;
}

const BUILDING_OPTIONS = [
  { label: 'Owner', value: 'owner' },
  { label: 'Renter', value: 'renter' },
  { label: 'Other', value: 'other' },
];

const INDIGENOUS_OPTIONS = [
  { label: 'No', value: 'no' },
  { label: 'Yes', value: 'yes' },
];

export const DemographicStep: React.FC<DemographicStepProps> = ({ form, onNext, onBack }) => {
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false);
  const [householdSearch, setHouseholdSearch] = React.useState<string>("");
  const [showHouseholdDropdown, setShowHouseholdDropdown] = React.useState<boolean>(false);
  const selectedHouseholdId = form.watch('demographicInfo.householdNo');

  const {
    headingSize,
    bodyTextSize,
    smallTextSize,
    sectionMargin,
    cardPadding,
    marginBottom,
  } = useResponsiveForm();

  // Fetch all households
  const { data: households = [], isLoading: isLoadingHouseholds } = useGetHouseholds();

  // Fetch selected household data
  const { data: householdData, isLoading: isLoadingHousehold } = useGetHouseholdData(selectedHouseholdId);

  // Extract household head ID
  const householdHeadId = React.useMemo(() => {
    if (!householdData) return null;
    return householdData.rp_id || householdData.rp || null;
  }, [householdData]);

  // Fetch personal info of household head
  const { data: personalInfo } = useGetResidentPersonalInfo(householdHeadId || '');

  // Populate household head fields when data is available
  useEffect(() => {
    if (personalInfo && selectedHouseholdId) {
      form.setValue('householdHead.per_lname', personalInfo.per_lname || '');
      form.setValue('householdHead.per_fname', personalInfo.per_fname || '');
      form.setValue('householdHead.per_mname', personalInfo.per_mname || '');
      form.setValue('householdHead.per_sex', personalInfo.per_sex || '');
    }
  }, [personalInfo, selectedHouseholdId, form]);

  // Clear household head fields when household is deselected
  useEffect(() => {
    if (!selectedHouseholdId) {
      form.setValue('householdHead.per_lname', '');
      form.setValue('householdHead.per_fname', '');
      form.setValue('householdHead.per_mname', '');
      form.setValue('householdHead.per_sex', '');
    }
  }, [selectedHouseholdId, form]);

  const householdOptions = households.map((hh: any) => ({
    label: `${hh.hh_id}`,
    value: hh.hh_id,
  }));

  const handleSelectHousehold = (household: any) => {
    form.setValue('demographicInfo.householdNo', household.hh_id);
    setShowHouseholdDropdown(false);
    setHouseholdSearch("");
    setInvalidHousehold(false);
  };

  // Format household head name from the head field
  const formatHeadName = (head: string | undefined) => {
    if (!head) return 'N/A';
    // head format is "rp_id-Name-fam_id", we only want the Name part
    const parts = head.split('-');
    if (parts.length >= 2) {
      return parts[1]; // Return only the name
    }
    return head;
  };

  // Get selected household details for display
  const selectedHousehold = React.useMemo(() => {
    if (!selectedHouseholdId) return null;
    return households.find((hh: any) => hh.hh_id === selectedHouseholdId);
  }, [selectedHouseholdId, households]);

  const validateAndNext = async () => {
    const formIsValid = await form.trigger('demographicInfo');
    const householdId = form.watch('demographicInfo.householdNo');

    if (formIsValid && householdId) {
      // Call parent's handleNext to advance to next step
      onNext?.();
    } else {
      if (!householdId) setInvalidHousehold(true);
    }
  };

  const isLoadingData = isLoadingHousehold;

  return (
    <ResponsiveFormContainer>
      <FormContentWrapper>
        <View className="flex-1">
          {/* Header */}
          <View style={{ marginBottom: sectionMargin }}>
            <Text style={{ fontSize: headingSize }} className="font-bold text-gray-900 mb-2">
              Demographic Information
            </Text>
            <Text style={{ fontSize: smallTextSize }} className="text-gray-600">
              Fill out all necessary fields
            </Text>
          </View>

          {/* Household Selection */}
          <View style={{ marginBottom: marginBottom }}>
            <Text style={{ fontSize: bodyTextSize }} className="font-medium text-gray-700 mb-2">
              Household <Text className="text-red-500">*</Text>
            </Text>
              <Controller
                control={form.control}
                name="demographicInfo.householdNo"
                render={({ field: { value } }) => (
                  <View>
                    <TouchableOpacity
                      onPress={() => setShowHouseholdDropdown(true)}
                      className="border border-gray-300 rounded-xl bg-white min-h-[48px] justify-center"
                      style={{ paddingHorizontal: cardPadding, paddingVertical: 12 }}
                    >
                      {selectedHousehold ? (
                        <View className="flex-row items-center">
                          <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                            <Text className="text-green-700 font-PoppinsSemiBold text-xs">
                              {selectedHousehold.hh_id}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 font-PoppinsMedium" style={{ fontSize: bodyTextSize }}>
                              Owner: {formatHeadName(selectedHousehold.head)}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <Text 
                          className="font-PoppinsRegular text-gray-400" 
                          style={{ fontSize: bodyTextSize }}
                        >
                          Select a household
                        </Text>
                      )}
                    </TouchableOpacity>                  {/* Household Dropdown */}
                  {showHouseholdDropdown && (
                    <View className="border border-gray-300 rounded-xl mt-2 bg-white max-h-80">
                      {/* Search Input */}
                      <View className="flex-row items-center border-b border-gray-200 px-3 py-2">
                        <Search size={18} color="#6B7280" />
                        <TextInput
                          value={householdSearch}
                          onChangeText={setHouseholdSearch}
                          placeholder="Search household..."
                          className="flex-1 ml-2 text-gray-900 font-PoppinsRegular"
                          autoFocus
                        />
                      </View>

                      {/* Household List */}
                      <ScrollView 
                        className="max-h-64"
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                      >
                        {isLoadingHouseholds ? (
                          <View className="py-8 items-center">
                            <ActivityIndicator size="small" color="#3B82F6" />
                            <Text className="text-gray-500 text-sm font-PoppinsRegular mt-2">Loading households...</Text>
                          </View>
                        ) : households && households.length > 0 ? (
                          households
                            .filter((hh: any) => 
                              householdSearch 
                                ? hh.hh_id.toLowerCase().includes(householdSearch.toLowerCase()) ||
                                  formatHeadName(hh.head).toLowerCase().includes(householdSearch.toLowerCase())
                                : true
                            )
                            .map((household: any) => (
                              <TouchableOpacity
                                key={household.hh_id}
                                onPress={() => handleSelectHousehold(household)}
                                className="px-4 py-3 border-b border-gray-100"
                              >
                                <View className="flex-row items-center">
                                  <View className="bg-green-100 px-3 py-1 rounded-full mr-3">
                                    <Text className="text-green-700 font-PoppinsSemiBold text-xs">
                                      {household.hh_id}
                                    </Text>
                                  </View>
                                  <View className="flex-1">
                                    <Text className="text-gray-900 font-PoppinsMedium" style={{ fontSize: bodyTextSize }}>
                                      Owner: {formatHeadName(household.head)}
                                    </Text>
                                    {household.hh_address && (
                                      <Text className="text-gray-500 font-PoppinsRegular text-xs mt-0.5">
                                        {household.hh_address}
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              </TouchableOpacity>
                            ))
                        ) : (
                          <View className="py-8 items-center">
                            <Text className="text-gray-500 text-sm font-PoppinsRegular">No household found</Text>
                          </View>
                        )}
                      </ScrollView>

                      {/* Close Button */}
                      <TouchableOpacity
                        onPress={() => setShowHouseholdDropdown(false)}
                        className="border-t border-gray-200 py-3 items-center"
                      >
                        <Text className="text-gray-600 font-PoppinsMedium">Close</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {invalidHousehold && (
                    <Text style={{ fontSize: smallTextSize }} className="text-red-500 mt-1">
                      Household is required
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Building Occupancy */}
          <View style={{ marginBottom: marginBottom }}>
            <FormSelect
              control={form.control}
              name="demographicInfo.building"
              label="Building Occupancy"
              options={BUILDING_OPTIONS}
              placeholder="Select Building Occupancy"
            />
          </View>

          {/* Indigenous People */}
          <View style={{ marginBottom: marginBottom }}>
            <FormSelect
              control={form.control}
              name="demographicInfo.indigenous"
              label="Indigenous People"
              options={INDIGENOUS_OPTIONS}
              placeholder="Select Indigenous Status"
            />
          </View>

          {/* Navigation Buttons */}
          <View style={{ marginTop: sectionMargin }} className="flex-row gap-3">
            {/* Back Button */}
            <View className="flex-1">
              <Button
                onPress={onBack}
                disabled={isLoadingData}
                variant="outline"
              >
                <Text className="text-gray-700 font-semibold">Back</Text>
              </Button>
            </View>

            {/* Next Button */}
            <View className="flex-1">
              <Button
                onPress={validateAndNext}
                disabled={isLoadingData}
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
