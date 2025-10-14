import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { 
  useGetResidents, 
  useCreateFamily, 
  useCreateFamilyCompositionBulk, 
  useCreateRespondent, 
  useCreateHealthRelatedDetails, 
  useCreateMotherHealthInfo, 
  useCreateDependentUnderFive 
} from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { HealthFamilyProfilingFormData, DependentData } from '@/form-schema/health-family-profiling-schema';
import { Plus, Trash2, UserPlus, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DependentsStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
  onFamilyCreated: (famId: string) => void;
  staffId: string;
}

const RELATIONSHIP_OPTIONS = [
  { label: 'Son', value: 'Son' },
  { label: 'Daughter', value: 'Daughter' },
  { label: 'Grandson', value: 'Grandson' },
  { label: 'Granddaughter', value: 'Granddaughter' },
  { label: 'Nephew', value: 'Nephew' },
  { label: 'Niece', value: 'Niece' },
  { label: 'Other Relative', value: 'Other Relative' },
];

const SEX_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

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
  { label: 'Fully Vaccinated', value: 'Fully Vaccinated' },
  { label: 'Partially Vaccinated', value: 'Partially Vaccinated' },
  { label: 'Not Vaccinated', value: 'Not Vaccinated' },
];

const FIC_OPTIONS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const NUTRITIONAL_STATUS_OPTIONS = [
  { label: 'Normal', value: 'Normal' },
  { label: 'Underweight', value: 'Underweight' },
  { label: 'Overweight', value: 'Overweight' },
  { label: 'Severely Underweight', value: 'Severely Underweight' },
];

const EXCLUSIVE_BF_OPTIONS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const DependentsStep: React.FC<DependentsStepProps> = ({ form, onFamilyCreated, staffId }) => {
  const [dependentsList, setDependentsList] = useState<DependentData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch residents for dependent selection
  const { data: residents = [], isLoading } = useGetResidents({ exclude_independent: true });

  // Mutation hooks
  const createFamilyMut = useCreateFamily();
  const createCompositionMut = useCreateFamilyCompositionBulk();
  const createRespondentMut = useCreateRespondent();
  const createHealthDetailsMut = useCreateHealthRelatedDetails();
  const createMotherHealthMut = useCreateMotherHealthInfo();
  const createDependentUnderFiveMut = useCreateDependentUnderFive();

  const residentOptions = residents.map((resident: any) => {
    const personal = resident.personal_info || resident;
    const fullName = `${personal.per_fname} ${personal.per_mname || ''} ${personal.per_lname}`.trim();
    return {
      label: `${resident.rp_id} - ${fullName}`,
      value: resident.rp_id,
      resident: resident,
    };
  });

  const handleResidentSelect = (rpId: string) => {
    const selected = residents.find((r: any) => r.rp_id === rpId);
    if (selected) {
      const personal = selected.personal_info || selected;
      form.setValue('dependentsInfo.new.id', rpId);
      form.setValue('dependentsInfo.new.lastName', personal.per_lname || '');
      form.setValue('dependentsInfo.new.firstName', personal.per_fname || '');
      form.setValue('dependentsInfo.new.middleName', personal.per_mname || '');
      form.setValue('dependentsInfo.new.suffix', personal.per_suffix || '');
      form.setValue('dependentsInfo.new.dateOfBirth', personal.per_dob || '');
      form.setValue('dependentsInfo.new.sex', personal.per_sex || '');
    }
  };

  const addDependent = () => {
    const newDependent = form.getValues('dependentsInfo.new');
    
    if (!newDependent.id || !newDependent.firstName || !newDependent.lastName) {
      Alert.alert('Error', 'Please select a resident and fill required fields');
      return;
    }

    if (editingIndex !== null) {
      const updated = [...dependentsList];
      updated[editingIndex] = newDependent;
      setDependentsList(updated);
      setEditingIndex(null);
    } else {
      setDependentsList([...dependentsList, newDependent]);
    }

    // Reset form
    form.reset({
      ...form.getValues(),
      dependentsInfo: {
        list: dependentsList,
        new: {
          id: '',
          lastName: '',
          firstName: '',
          middleName: '',
          suffix: '',
          dateOfBirth: '',
          sex: '',
          relationshipToHead: '',
        },
      },
    });
    
    setShowAddForm(false);
  };

  const removeDependent = (index: number) => {
    Alert.alert(
      'Remove Dependent',
      'Are you sure you want to remove this dependent?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = dependentsList.filter((_, i) => i !== index);
            setDependentsList(updated);
          },
        },
      ]
    );
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const newDependentDOB = form.watch('dependentsInfo.new.dateOfBirth');
  const isUnderFive = calculateAge(newDependentDOB) < 5;

  // Handle family creation
  const handleCreateFamily = async () => {
    try {
      const formData = form.getValues();
      const householdId = formData.demographicInfo.householdNo;

      console.log('Creating family with data:', {
        fam_indigenous: formData.demographicInfo.indigenous,
        fam_building: formData.demographicInfo.building,
        hh: householdId,
        staff: staffId,
      });

      // Step 1: Create Family
      const familyResponse = await createFamilyMut.mutateAsync({
        fam_indigenous: formData.demographicInfo.indigenous,
        fam_building: formData.demographicInfo.building,
        hh: householdId,
        staff: staffId,
      });

      const famId = familyResponse.fam_id;
      console.log('Family created with ID:', famId);

      // Step 2: Create Family Composition (parents + dependents)
      const familyMembers = [];
      
      // Add respondent
      if (formData.respondentInfo.id) {
        familyMembers.push({
          fc_role: 'Respondent',
          fam: famId,
          rp: formData.respondentInfo.id.split(' ')[0],
        });
      }

      // Add mother
      if (formData.motherInfo.id) {
        familyMembers.push({
          fc_role: 'Mother',
          fam: famId,
          rp: formData.motherInfo.id.split(' ')[0],
        });
      }

      // Add father
      if (formData.fatherInfo.id) {
        familyMembers.push({
          fc_role: 'Father',
          fam: famId,
          rp: formData.fatherInfo.id.split(' ')[0],
        });
      }

      // Add dependents
      dependentsList.forEach((dependent) => {
        familyMembers.push({
          fc_role: dependent.relationshipToHead || 'Child',
          fam: famId,
          rp: dependent.id!.split(' ')[0],
        });
      });

      console.log('Creating family composition:', familyMembers);
      await createCompositionMut.mutateAsync({ members: familyMembers });

      // Step 3: Create Respondent Info
      if (formData.respondentInfo.id) {
        await createRespondentMut.mutateAsync({
          rp: formData.respondentInfo.id.split(' ')[0],
          fam: famId,
        });
      }

      // Step 4: Create Health Related Details for parents and dependents
      const createHealthDetails = async (person: any, rpId: string) => {
        if (person.perAddDetails && (person.perAddDetails.bloodType || person.perAddDetails.philHealthId || person.perAddDetails.covidVaxStatus)) {
          await createHealthDetailsMut.mutateAsync({
            per_add_bloodType: person.perAddDetails.bloodType || null,
            per_add_philhealth_id: person.perAddDetails.philHealthId || null,
            per_add_covid_vax_status: person.perAddDetails.covidVaxStatus || null,
            rp: rpId,
          });
        }
      };

      // Parents health details
      if (formData.respondentInfo.id) {
        await createHealthDetails(formData.respondentInfo, formData.respondentInfo.id.split(' ')[0]);
      }
      if (formData.motherInfo.id) {
        await createHealthDetails(formData.motherInfo, formData.motherInfo.id.split(' ')[0]);
      }
      if (formData.fatherInfo.id) {
        await createHealthDetails(formData.fatherInfo, formData.fatherInfo.id.split(' ')[0]);
      }

      // Dependents health details
      for (const dependent of dependentsList) {
        if (dependent.id) {
          await createHealthDetails(dependent, dependent.id.split(' ')[0]);
        }
      }

      // Step 5: Create Mother Health Info
      if (formData.motherInfo.id && formData.motherInfo.motherHealthInfo) {
        const mhi = formData.motherInfo.motherHealthInfo;
        if (mhi.healthRiskClass || mhi.immunizationStatus || mhi.method || mhi.source || mhi.lmpDate) {
          await createMotherHealthMut.mutateAsync({
            mhi_healthRisk_class: mhi.healthRiskClass || null,
            mhi_immun_status: mhi.immunizationStatus || null,
            mhi_famPlan_method: mhi.method ? mhi.method.join(', ') : null,
            mhi_famPlan_source: mhi.source || null,
            mhi_lmp_date: mhi.lmpDate || null,
            rp: formData.motherInfo.id.split(' ')[0],
            fam: famId,
          });
        }
      }

      // Step 6: Create Dependent Under Five records
      for (const dependent of dependentsList) {
        if (dependent.id && calculateAge(dependent.dateOfBirth) < 5 && dependent.dependentUnderFiveSchema) {
          const duf = dependent.dependentUnderFiveSchema;
          if (duf.fic || duf.nutritionalStatus || duf.exclusiveBf) {
            await createDependentUnderFiveMut.mutateAsync({
              duf_fic: duf.fic || null,
              nutritional_status: duf.nutritionalStatus || null,
              exclusive_bf: duf.exclusiveBf || null,
              fc: `${famId}_${dependent.id.split(' ')[0]}`, // This might need adjustment based on actual FC ID
              rp: dependent.id.split(' ')[0],
            });
          }
        }
      }

      console.log('Family profiling Step 3 completed, family ID:', famId);
      queryClient.invalidateQueries({ queryKey: ['healthFamilyList'] });
      onFamilyCreated(famId);
      return famId;
    } catch (error: any) {
      console.error('Family creation error:', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create family. Please try again.');
      throw error;
    }
  };

  const isCreatingFamily = createFamilyMut.isPending || createCompositionMut.isPending || 
    createRespondentMut.isPending || createHealthDetailsMut.isPending || 
    createMotherHealthMut.isPending || createDependentUnderFiveMut.isPending;

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-6 pb-6">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Dependents Information
          </Text>
          <Text className="text-sm text-gray-600">
            Add family dependents and complete family registration
          </Text>
        </View>

        {/* Dependents List */}
        {dependentsList.length > 0 && (
          <View className="bg-white rounded-lg border border-gray-200 p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Added Dependents ({dependentsList.length})
            </Text>
            <FlatList
              data={dependentsList}
              keyExtractor={(item, index) => `dependent-${index}`}
              renderItem={({ item, index }) => (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {item.firstName} {item.middleName} {item.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {item.relationshipToHead || 'Child'} • Age: {calculateAge(item.dateOfBirth)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeDependent(index)}
                    className="p-2"
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* Add Dependent Button */}
        {!showAddForm && (
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            className="bg-blue-600 rounded-lg p-4 flex-row items-center justify-center"
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Add Dependent</Text>
          </TouchableOpacity>
        )}

        {/* Add Dependent Form */}
        {showAddForm && (
          <View className="bg-white rounded-lg border border-blue-200 p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              {editingIndex !== null ? 'Edit' : 'Add'} Dependent
            </Text>

            {/* Resident Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Select Resident <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={form.control}
                name="dependentsInfo.new.id"
                render={({ field: { onChange, value } }) => (
                  <CustomDropdown
                    data={residentOptions}
                    value={value || ''}
                    onSelect={(val: string) => {
                      onChange(val);
                      handleResidentSelect(val);
                    }}
                    placeholder="Select Resident"
                    searchPlaceholder="Search residents..."
                    loading={isLoading}
                  />
                )}
              />
            </View>

            {/* Relationship to Head */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Relationship to Household Head
              </Text>
              <Controller
                control={form.control}
                name="dependentsInfo.new.relationshipToHead"
                render={({ field: { onChange, value } }) => (
                  <CustomDropdown
                    data={RELATIONSHIP_OPTIONS}
                    value={value || ''}
                    onSelect={onChange}
                    placeholder="Select Relationship"
                    searchPlaceholder="Search..."
                  />
                )}
              />
            </View>

            {/* Health Details Section */}
            <View className="mb-4 p-3 bg-gray-50 rounded">
              <Text className="text-sm font-semibold text-gray-900 mb-3">
                Health Information (Optional)
              </Text>

              {/* Blood Type */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">Blood Type</Text>
                <Controller
                  control={form.control}
                  name="dependentsInfo.new.perAddDetails.bloodType"
                  render={({ field: { onChange, value } }) => (
                    <CustomDropdown
                      data={BLOOD_TYPE_OPTIONS}
                      value={value || ''}
                      onSelect={onChange}
                      placeholder="Select Blood Type"
                      searchPlaceholder="Search..."
                    />
                  )}
                />
              </View>

              {/* PhilHealth ID */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">PhilHealth ID</Text>
                <Controller
                  control={form.control}
                  name="dependentsInfo.new.perAddDetails.philHealthId"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                      placeholder="Enter PhilHealth ID"
                      value={value || ''}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>

              {/* COVID Vaccination Status */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">COVID Vaccination Status</Text>
                <Controller
                  control={form.control}
                  name="dependentsInfo.new.perAddDetails.covidVaxStatus"
                  render={({ field: { onChange, value } }) => (
                    <CustomDropdown
                      data={COVID_VAX_OPTIONS}
                      value={value || ''}
                      onSelect={onChange}
                      placeholder="Select Vaccination Status"
                      searchPlaceholder="Search..."
                    />
                  )}
                />
              </View>
            </View>

            {/* Under 5 Section */}
            {isUnderFive && (
              <View className="mb-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <Text className="text-sm font-semibold text-yellow-900 mb-3">
                  Dependent Under 5 Years Information
                </Text>

                {/* FIC */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Fully Immunized Child (FIC)
                  </Text>
                  <Controller
                    control={form.control}
                    name="dependentsInfo.new.dependentUnderFiveSchema.fic"
                    render={({ field: { onChange, value } }) => (
                      <CustomDropdown
                        data={FIC_OPTIONS}
                        value={value || ''}
                        onSelect={onChange}
                        placeholder="Select FIC Status"
                        searchPlaceholder="Search..."
                      />
                    )}
                  />
                </View>

                {/* Nutritional Status */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Nutritional Status
                  </Text>
                  <Controller
                    control={form.control}
                    name="dependentsInfo.new.dependentUnderFiveSchema.nutritionalStatus"
                    render={({ field: { onChange, value } }) => (
                      <CustomDropdown
                        data={NUTRITIONAL_STATUS_OPTIONS}
                        value={value || ''}
                        onSelect={onChange}
                        placeholder="Select Nutritional Status"
                        searchPlaceholder="Search..."
                      />
                    )}
                  />
                </View>

                {/* Exclusive Breastfeeding */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Exclusive Breastfeeding
                  </Text>
                  <Controller
                    control={form.control}
                    name="dependentsInfo.new.dependentUnderFiveSchema.exclusiveBf"
                    render={({ field: { onChange, value } }) => (
                      <CustomDropdown
                        data={EXCLUSIVE_BF_OPTIONS}
                        value={value || ''}
                        onSelect={onChange}
                        placeholder="Select Breastfeeding Status"
                        searchPlaceholder="Search..."
                      />
                    )}
                  />
                </View>
              </View>
            )}

            {/* Form Actions */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  setShowAddForm(false);
                  setEditingIndex(null);
                }}
                className="flex-1 bg-gray-200 rounded-lg p-3"
              >
                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addDependent}
                className="flex-1 bg-blue-600 rounded-lg p-3"
              >
                <Text className="text-white font-semibold text-center">
                  {editingIndex !== null ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Create Family Button */}
        {!showAddForm && (
          <TouchableOpacity
            onPress={handleCreateFamily}
            disabled={isCreatingFamily}
            className={`rounded-lg p-4 flex-row items-center justify-center ${
              isCreatingFamily ? 'bg-green-400' : 'bg-green-600'
            }`}
          >
            <UserPlus size={20} color="white" />
            <Text className="text-white font-bold ml-2">
              {isCreatingFamily ? 'Creating Family...' : 'Create Family & Continue'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
