import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { FormSelect } from '@/components/ui/form/form-select';
import { ResponsiveFormContainer, useResponsiveForm } from '@/components/healthcomponents/ResponsiveFormContainer';
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
import { Plus, Trash2, UserPlus, ChevronDown, ChevronUp, User } from 'lucide-react-native';

interface DependentsStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
  onFamilyCreated: (famId: string) => void;
  staffId: string;
}

const RELATIONSHIP_OPTIONS = [
  { label: 'Son', value: 'Son' },
  { label: 'Daughter', value: 'Daughter' },
  { label: 'Grandson', value: 'Grandson' },
  { label: 'Grand-daughter', value: 'Grand-daughter' },
  { label: 'Nephew', value: 'Nephew' },
  { label: 'Niece', value: 'Niece' },
  { label: 'Other Relative', value: 'Other Relative' },
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

const EXCLUSIVE_BF_OPTIONS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

export const DependentsStep: React.FC<DependentsStepProps> = ({ form, onFamilyCreated, staffId }) => {
  const [dependentsList, setDependentsList] = useState<DependentData[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedDependents, setExpandedDependents] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const {
    bodyTextSize,
    smallTextSize,
    marginBottom,
  } = useResponsiveForm();

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
    // Check if the same resident is already selected - if so, unselect
    const currentId = form.watch('dependentsInfo.new.id');
    if (currentId === rpId) {
      // Clear all fields
      form.setValue('dependentsInfo.new.id', '');
      form.setValue('dependentsInfo.new.lastName', '');
      form.setValue('dependentsInfo.new.firstName', '');
      form.setValue('dependentsInfo.new.middleName', '');
      form.setValue('dependentsInfo.new.suffix', '');
      form.setValue('dependentsInfo.new.dateOfBirth', '');
      form.setValue('dependentsInfo.new.sex', '');
      form.setValue('dependentsInfo.new.relationshipToHead', '');
      form.setValue('dependentsInfo.new.perAddDetails.bloodType', '');
      form.setValue('dependentsInfo.new.perAddDetails.philHealthId', '');
      form.setValue('dependentsInfo.new.perAddDetails.covidVaxStatus', '');
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.fic', '');
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.nutritionalStatus', '');
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.exclusiveBf', '');
      return;
    }
    
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
            // Remove from expanded list if it was expanded
            setExpandedDependents(prev => prev.filter(i => i !== index));
          },
        },
      ]
    );
  };

  const toggleDependentExpansion = (index: number) => {
    setExpandedDependents(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
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

  // Watch for date of birth changes to calculate age
  const newDependentDOB = form.watch('dependentsInfo.new.dateOfBirth');
  const newDependentId = form.watch('dependentsInfo.new.id');
  
  // Calculate age dynamically based on selected resident's DOB
  const age = React.useMemo(() => {
    if (!newDependentDOB) return null;
    const calculatedAge = calculateAge(newDependentDOB);
    return calculatedAge;
  }, [newDependentDOB]);

  // Clear age-specific fields when age changes or resident is unselected
  React.useEffect(() => {
    if (!newDependentId) {
      // Clear all dependent fields when unselected
      form.setValue('dependentsInfo.new.relationshipToHead', '');
      form.setValue('dependentsInfo.new.perAddDetails.bloodType', '');
      form.setValue('dependentsInfo.new.perAddDetails.philHealthId', '');
      form.setValue('dependentsInfo.new.perAddDetails.covidVaxStatus', '');
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.fic', '');
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.nutritionalStatus', '');
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.exclusiveBf', '');
      return;
    }

    if (typeof age !== 'number') return;
    
    if (age >= 0 && age < 5) {
      // Clear 6+ fields for under 5
      form.setValue('dependentsInfo.new.perAddDetails.bloodType', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.perAddDetails.philHealthId', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.perAddDetails.covidVaxStatus', '', { shouldDirty: false });
    } else if (age >= 5) {
      // Clear under-five fields for 5 and above
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.fic', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.nutritionalStatus', '', { shouldDirty: false });
      form.setValue('dependentsInfo.new.dependentUnderFiveSchema.exclusiveBf', '', { shouldDirty: false });
    }
  }, [age, newDependentId, form]);

  // Helper function to capitalize first letter (matching web implementation)
  const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Handle family creation - matches web DependentsInfoLayout exactly
  const handleCreateFamily = async () => {
    try {
      const formData = form.getValues();
      const householdId = formData.demographicInfo.householdNo;

      // Extract household ID (matching web - split on space to get first part)
      const extractedHouseholdId = householdId.includes(' ') 
        ? householdId.split(' ')[0] 
        : householdId;

      console.log('Creating family with data:', {
        fam_indigenous: capitalize(formData.demographicInfo.indigenous),
        fam_building: capitalize(formData.demographicInfo.building),
        hh: extractedHouseholdId,
        staff: staffId,
      });

      // Step 1: Create Family (matching web addFamily call)
      const familyResponse = await createFamilyMut.mutateAsync({
        fam_indigenous: capitalize(formData.demographicInfo.indigenous),
        fam_building: capitalize(formData.demographicInfo.building),
        hh: extractedHouseholdId,
        staff: staffId,
      });

      const famId = familyResponse.fam_id;
      console.log('Family created with ID:', famId);

      // Step 2: Create Family Composition (matching web - uses "Mother", "Father", "Dependent")
      const PARENT_ROLES = ["Mother", "Father", "Guardian"];
      const selectedParents = [
        formData.motherInfo.id ? formData.motherInfo.id.split(' ')[0] : '',
        formData.fatherInfo.id ? formData.fatherInfo.id.split(' ')[0] : '',
        formData.guardInfo.id ? formData.guardInfo.id.split(' ')[0] : ''
      ];

      // Create parent compositions (matching web structure)
      const parentCompositions = selectedParents
        .filter(parentId => parentId) // Filter out empty parent IDs
        .map((parentId, index) => ({
          fam: famId,
          rp: parentId,
          fc_role: PARENT_ROLES[index], // "Mother", "Father", "Guardian"
        }));

      // Create dependent compositions (matching web - uses 'Dependent' role)
      const dependentCompositions = dependentsList.map(dep => ({
        fam: famId,
        rp: dep.id!.split(' ')[0],
        fc_role: 'Dependent',
      }));

      // Combine all compositions (matching web)
      const allCompositions = [...parentCompositions, ...dependentCompositions];

      console.log('Creating family composition:', allCompositions);
      const createdComps = await createCompositionMut.mutateAsync(allCompositions);

      // Step 3: Submit parent health data (matching web submitParentHealthData)
      const parents = [
        { type: 'respondentInfo', data: formData.respondentInfo, isRespondent: true },
        { type: 'motherInfo', data: formData.motherInfo, isRespondent: false },
        { type: 'fatherInfo', data: formData.fatherInfo, isRespondent: false }
      ];

      for (const parent of parents) {
        const parentData = parent.data;
        
        if (parentData && parentData.id) {
          const residentId = parentData.id.split(' ')[0];
          
          // Submit Respondent Info if it's the respondent
          if (parent.isRespondent) {
            await createRespondentMut.mutateAsync({
              rp: residentId,
              fam: famId,
            });
          }
          
          // Submit Health Related Details if perAddDetails exists
          if (parentData.perAddDetails && (
            parentData.perAddDetails.bloodType || 
            parentData.perAddDetails.philHealthId || 
            parentData.perAddDetails.covidVaxStatus
          )) {
            await createHealthDetailsMut.mutateAsync({
              per_add_bloodType: parentData.perAddDetails.bloodType || null,
              per_add_philhealth_id: parentData.perAddDetails.philHealthId || null,
              per_add_covid_vax_status: parentData.perAddDetails.covidVaxStatus || null,
              rp: residentId,
            });
          }
          
          // Submit Mother Health Info if it's mother and motherHealthInfo exists
          if (parent.type === 'motherInfo') {
            // Type assertion since we know motherInfo has motherHealthInfo
            const motherData = parentData as typeof formData.motherInfo;
            if (motherData.motherHealthInfo && (
              motherData.motherHealthInfo.healthRiskClass ||
              motherData.motherHealthInfo.immunizationStatus ||
              (motherData.motherHealthInfo.method && motherData.motherHealthInfo.method.length > 0) ||
              motherData.motherHealthInfo.source ||
              motherData.motherHealthInfo.lmpDate
            )) {
              await createMotherHealthMut.mutateAsync({
                mhi_healthRisk_class: motherData.motherHealthInfo.healthRiskClass || null,
                mhi_immun_status: motherData.motherHealthInfo.immunizationStatus || null,
                mhi_famPlan_method: motherData.motherHealthInfo.method ? 
                  motherData.motherHealthInfo.method.join(', ') : null,
                mhi_famPlan_source: motherData.motherHealthInfo.source || null,
                mhi_lmp_date: motherData.motherHealthInfo.lmpDate || null,
                rp: residentId,
                fam: famId,
              });
            }
          }
        }
      }

      // Step 4: Map created family compositions for fc_id lookup (matching web)
      const fcByRp: Record<string, any> = {};
      if (Array.isArray(createdComps)) {
        createdComps.forEach((comp: any) => {
          fcByRp[comp.rp_id] = comp;
        });
      }

      // Step 5: Submit dependent-specific health data (matching web logic)
      for (const dep of dependentsList) {
        const rpId = dep.id!.split(' ')[0];
        const age = calculateAge(dep.dateOfBirth);

        if (typeof age === 'number' && age >= 0 && age <= 5) {
          // Create Dependents_Under_Five record - requires fc
          const fc = fcByRp[rpId];
          if (fc?.fc_id && dep.dependentUnderFiveSchema) {
            const underFive = dep.dependentUnderFiveSchema;
            if (underFive.fic || underFive.nutritionalStatus || underFive.exclusiveBf) {
              await createDependentUnderFiveMut.mutateAsync({
                duf_fic: underFive.fic || null,
                duf_nutritional_status: underFive.nutritionalStatus || null,
                duf_exclusive_bf: underFive.exclusiveBf || null,
                fc: fc.fc_id,
                rp: rpId,
              });
            }
          }
          // Save relationship to household head if provided
          if (dep.relationshipToHead) {
            await createHealthDetailsMut.mutateAsync({
              per_add_rel_to_hh_head: dep.relationshipToHead,
              rp: rpId,
            });
          }
        } else if (typeof age === 'number' && age >= 6) {
          // Combine relationship and additional details in one payload (matching web)
          const pad = dep.perAddDetails || {};
          const payload: Record<string, any> = { rp: rpId };
          if (dep.relationshipToHead) payload.per_add_rel_to_hh_head = dep.relationshipToHead;
          if (pad.bloodType) payload.per_add_bloodType = pad.bloodType;
          if (pad.philHealthId) payload.per_add_philhealth_id = pad.philHealthId;
          if (pad.covidVaxStatus) payload.per_add_covid_vax_status = pad.covidVaxStatus;
          const hasAny = Object.keys(payload).length > 1; // more than just rp
          if (hasAny) await createHealthDetailsMut.mutateAsync(payload);
        } else if (dep.relationshipToHead) {
          // Age unknown: still store relationship if provided
          await createHealthDetailsMut.mutateAsync({ 
            per_add_rel_to_hh_head: dep.relationshipToHead, 
            rp: rpId 
          });
        }
      }

      console.log('Family profiling Step 3 completed successfully, family ID:', famId);
      queryClient.invalidateQueries({ queryKey: ['healthFamilyList'] });
      Alert.alert('Success', 'Family and members registered successfully!');
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
    <ResponsiveFormContainer showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Dependents Information
        </Text>
        <Text className="text-sm text-gray-600">
          Add family dependents and complete family registration
        </Text>
      </View>

      {/* Dependents List */}
      {dependentsList.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Added Dependents
            </Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-semibold" style={{ fontSize: smallTextSize }}>
                {dependentsList.length} {dependentsList.length === 1 ? 'Dependent' : 'Dependents'}
              </Text>
            </View>
          </View>
          
          <View className="space-y-3">
            {dependentsList.map((item, index) => {
              const isExpanded = expandedDependents.includes(index);
              const dependentAge = calculateAge(item.dateOfBirth);
              
              return (
                <View 
                  key={`dependent-${index}`}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Accordion Header */}
                  <TouchableOpacity
                    onPress={() => toggleDependentExpansion(index)}
                    className="flex-row items-center justify-between p-4 bg-gray-50"
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                        <User size={20} color="#7C3AED" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900" style={{ fontSize: bodyTextSize }}>
                          {item.firstName} {item.middleName} {item.lastName}
                        </Text>
                        <View className="flex-row items-center mt-1 flex-wrap">
                          <View className="bg-gray-200 px-2 py-0.5 rounded mr-2">
                            <Text className="text-gray-700" style={{ fontSize: smallTextSize }}>
                              {item.relationshipToHead || 'Child'}
                            </Text>
                          </View>
                          <Text className="text-gray-600" style={{ fontSize: smallTextSize }}>
                            Age: {dependentAge} {dependentAge === 1 ? 'year' : 'years'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row items-center ml-2">
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          removeDependent(index);
                        }}
                        className="p-2 bg-red-50 rounded-lg mr-2"
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                      {isExpanded ? (
                        <ChevronUp size={20} color="#6B7280" />
                      ) : (
                        <ChevronDown size={20} color="#6B7280" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <View className="p-4 bg-white border-t border-gray-200">
                      {/* Personal Information */}
                      <View className="mb-4">
                        <Text className="font-semibold text-gray-900 mb-2" style={{ fontSize: bodyTextSize }}>
                          Personal Information
                        </Text>
                        <View className="space-y-2">
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                              Full Name:
                            </Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1 font-medium">
                              {item.firstName} {item.middleName} {item.lastName} {item.suffix}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                              Date of Birth:
                            </Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {item.dateOfBirth || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                              Sex:
                            </Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {item.sex || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row">
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                              Relationship:
                            </Text>
                            <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                              {item.relationshipToHead || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Health Information - For age >= 5 */}
                      {dependentAge >= 5 && item.perAddDetails && (
                        <View className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <Text className="font-semibold text-blue-900 mb-2" style={{ fontSize: bodyTextSize }}>
                            Health Information
                          </Text>
                          <View className="space-y-2">
                            {item.perAddDetails.bloodType && (
                              <View className="flex-row">
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                                  Blood Type:
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                  {item.perAddDetails.bloodType}
                                </Text>
                              </View>
                            )}
                            {item.perAddDetails.philHealthId && (
                              <View className="flex-row">
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                                  PhilHealth ID:
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                  {item.perAddDetails.philHealthId}
                                </Text>
                              </View>
                            )}
                            {item.perAddDetails.covidVaxStatus && (
                              <View className="flex-row">
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                                  COVID Vax:
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                  {item.perAddDetails.covidVaxStatus}
                                </Text>
                              </View>
                            )}
                            {!item.perAddDetails.bloodType && !item.perAddDetails.philHealthId && !item.perAddDetails.covidVaxStatus && (
                              <Text style={{ fontSize: smallTextSize }} className="text-gray-500 italic">
                                No health information provided
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Under 5 Information */}
                      {dependentAge < 5 && item.dependentUnderFiveSchema && (
                        <View className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <Text className="font-semibold text-yellow-900 mb-2" style={{ fontSize: bodyTextSize }}>
                            Under 5 Years Information
                          </Text>
                          <View className="space-y-2">
                            {item.dependentUnderFiveSchema.fic && (
                              <View className="flex-row">
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                                  FIC:
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                  {item.dependentUnderFiveSchema.fic}
                                </Text>
                              </View>
                            )}
                            {item.dependentUnderFiveSchema.nutritionalStatus && (
                              <View className="flex-row">
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                                  Nutritional Status:
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                  {item.dependentUnderFiveSchema.nutritionalStatus}
                                </Text>
                              </View>
                            )}
                            {item.dependentUnderFiveSchema.exclusiveBf && (
                              <View className="flex-row">
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-600 w-32">
                                  Exclusive BF:
                                </Text>
                                <Text style={{ fontSize: smallTextSize }} className="text-gray-900 flex-1">
                                  {item.dependentUnderFiveSchema.exclusiveBf}
                                </Text>
                              </View>
                            )}
                            {!item.dependentUnderFiveSchema.fic && !item.dependentUnderFiveSchema.nutritionalStatus && !item.dependentUnderFiveSchema.exclusiveBf && (
                              <Text style={{ fontSize: smallTextSize }} className="text-gray-500 italic">
                                No under 5 information provided
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Add Dependent Button */}
      {!showAddForm && (
        <TouchableOpacity
          onPress={() => setShowAddForm(true)}
          className="bg-blue-600 rounded-lg h-12 flex-row items-center justify-center mb-6 shadow-sm"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Dependent</Text>
        </TouchableOpacity>
      )}

      {/* Add Dependent Form */}
      {showAddForm && (
        <View className="bg-white rounded-lg border border-blue-200 p-5 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-5">
            {editingIndex !== null ? 'Edit' : 'Add'} Dependent
          </Text>

          {/* Resident Selection */}
          <View className="mb-5">
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
                    handleResidentSelect(val);
                    if (val !== value) {
                      onChange(val === value ? '' : val);
                    }
                  }}
                  placeholder="Select Resident"
                  searchPlaceholder="Search residents..."
                  loading={isLoading}
                />
              )}
            />
          </View>

          {/* Relationship to Head - Only show if resident is selected */}
          {newDependentId && (
            <FormSelect
              control={form.control}
              name="dependentsInfo.new.relationshipToHead"
              options={RELATIONSHIP_OPTIONS}
              label="Relationship to Family Head"
              placeholder="Select Relationship"
            />
          )}

          {/* Health Details Section - Only show if resident is selected and age >= 5 */}
          {newDependentId && typeof age === 'number' && age >= 5 && (
            <View className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Text className="text-base font-semibold text-blue-900 mb-4">
                Health Information (Optional)
              </Text>

              {/* Blood Type */}
              <FormSelect
                control={form.control}
                name="dependentsInfo.new.perAddDetails.bloodType"
                options={BLOOD_TYPE_OPTIONS}
                label="Blood Type"
                placeholder="Select Blood Type"
              />

              {/* PhilHealth ID */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">PhilHealth ID</Text>
                <Controller
                  control={form.control}
                  name="dependentsInfo.new.perAddDetails.philHealthId"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 h-12 bg-white"
                      placeholder="Enter PhilHealth ID"
                      value={value || ''}
                      onChangeText={onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>

              {/* COVID Vaccination Status */}
              <FormSelect
                control={form.control}
                name="dependentsInfo.new.perAddDetails.covidVaxStatus"
                options={COVID_VAX_OPTIONS}
                label="COVID Vaccination Status"
                placeholder="Select Vaccination Status"
              />
            </View>
          )}

          {/* Under 5 Section - Only show if resident is selected and age < 5 */}
          {newDependentId && typeof age === 'number' && age >= 0 && age < 5 && (
            <View className="mb-5 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Text className="text-base font-semibold text-yellow-900 mb-4">
                Dependent Under 5 Years Information
              </Text>

              {/* FIC */}
              <FormSelect
                control={form.control}
                name="dependentsInfo.new.dependentUnderFiveSchema.fic"
                options={FIC_OPTIONS}
                label="Fully Immunized Child (FIC)"
                placeholder="Select FIC Status"
              />

              {/* Nutritional Status */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Nutritional Status</Text>
                <Controller
                  control={form.control}
                  name="dependentsInfo.new.dependentUnderFiveSchema.nutritionalStatus"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 h-12 bg-white"
                      placeholder="Enter Nutritional Status"
                      value={value || ''}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>

              {/* Exclusive Breastfeeding */}
              <FormSelect
                control={form.control}
                name="dependentsInfo.new.dependentUnderFiveSchema.exclusiveBf"
                options={EXCLUSIVE_BF_OPTIONS}
                label="Exclusive Breastfeeding"
                placeholder="Select Breastfeeding Status"
              />
            </View>
          )}

          {/* Form Actions */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={() => {
                setShowAddForm(false);
                setEditingIndex(null);
              }}
              className="flex-1 bg-gray-100 rounded-lg h-12 items-center justify-center border border-gray-300"
            >
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addDependent}
              className="flex-1 bg-blue-600 rounded-lg h-12 items-center justify-center shadow-sm"
            >
              <Text className="text-white font-semibold">
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
          className={`rounded-lg h-12 flex-row items-center justify-center shadow-sm ${
            isCreatingFamily ? 'bg-green-400' : 'bg-green-600'
          }`}
        >
          <UserPlus size={20} color="white" />
          <Text className="text-white font-bold ml-2">
            {isCreatingFamily ? 'Creating Family...' : 'Register Family & Continue'}
          </Text>
        </TouchableOpacity>
      )}
    </ResponsiveFormContainer>
  );
};
