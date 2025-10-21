import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { useGetResidents } from '@/screens/health/admin/health-profiling/queries/healthProfilingQueries';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import { Plus, Trash2 } from 'lucide-react-native';

interface HealthRecordsStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
  familyId: string | null;
}

const RISK_CLASS_OPTIONS = [
  { label: 'Low Risk', value: 'Low Risk' },
  { label: 'Moderate Risk', value: 'Moderate Risk' },
  { label: 'High Risk', value: 'High Risk' },
];

const COMORBIDITIES_OPTIONS = [
  { label: 'Hypertension', value: 'Hypertension' },
  { label: 'Diabetes', value: 'Diabetes' },
  { label: 'Heart Disease', value: 'Heart Disease' },
  { label: 'Asthma', value: 'Asthma' },
  { label: 'Cancer', value: 'Cancer' },
  { label: 'Others', value: 'Others' },
  { label: 'None', value: 'None' },
];

const LIFESTYLE_RISK_OPTIONS = [
  { label: 'Smoking', value: 'Smoking' },
  { label: 'Alcohol Drinking', value: 'Alcohol Drinking' },
  { label: 'Sedentary Lifestyle', value: 'Sedentary Lifestyle' },
  { label: 'Poor Diet', value: 'Poor Diet' },
  { label: 'Others', value: 'Others' },
  { label: 'None', value: 'None' },
];

const MAINTENANCE_OPTIONS = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
];

const TB_STATUS_OPTIONS = [
  { label: 'Active TB', value: 'Active TB' },
  { label: 'TB Treatment', value: 'TB Treatment' },
  { label: 'Completed Treatment', value: 'Completed Treatment' },
  { label: 'Suspected TB', value: 'Suspected TB' },
];

const TB_MEDS_SOURCE_OPTIONS = [
  { label: 'Health Center', value: 'Health Center' },
  { label: 'Hospital', value: 'Hospital' },
  { label: 'Private Clinic', value: 'Private Clinic' },
  { label: 'Others', value: 'Others' },
];

export const HealthRecordsStep: React.FC<HealthRecordsStepProps> = ({ form, familyId }) => {
  const [activeTab, setActiveTab] = useState<'ncd' | 'tb'>('ncd');
  const [showNCDForm, setShowNCDForm] = useState(false);
  const [showTBForm, setShowTBForm] = useState(false);

  const ncdList = form.watch('ncdRecords.list') || [];
  const tbList = form.watch('tbRecords.list') || [];

  // Fetch residents excluding family members
  const { data: residents = [], isLoading } = useGetResidents(
    familyId ? { exclude_family: familyId } : undefined
  );

  const residentOptions = residents.map((resident: any) => {
    const personal = resident.personal_info || resident;
    const fullName = `${personal.per_fname} ${personal.per_mname || ''} ${personal.per_lname}`.trim();
    return {
      label: `${resident.rp_id} - ${fullName}`,
      value: resident.rp_id,
      resident: resident,
    };
  });

  const handleNCDResidentSelect = (rpId: string) => {
    const selected = residents.find((r: any) => r.rp_id === rpId);
    if (selected) {
      const personal = selected.personal_info || selected;
      form.setValue('ncdRecords.new.id', rpId);
      form.setValue('ncdRecords.new.lastName', personal.per_lname || '');
      form.setValue('ncdRecords.new.firstName', personal.per_fname || '');
      form.setValue('ncdRecords.new.middleName', personal.per_mname || '');
      form.setValue('ncdRecords.new.suffix', personal.per_suffix || '');
      form.setValue('ncdRecords.new.sex', personal.per_sex || '');
      form.setValue('ncdRecords.new.dateOfBirth', personal.per_dob || '');
      form.setValue('ncdRecords.new.contact', personal.per_contact || '');
    }
  };

  const handleTBResidentSelect = (rpId: string) => {
    const selected = residents.find((r: any) => r.rp_id === rpId);
    if (selected) {
      const personal = selected.personal_info || selected;
      form.setValue('tbRecords.new.id', rpId);
      form.setValue('tbRecords.new.lastName', personal.per_lname || '');
      form.setValue('tbRecords.new.firstName', personal.per_fname || '');
      form.setValue('tbRecords.new.middleName', personal.per_mname || '');
      form.setValue('tbRecords.new.suffix', personal.per_suffix || '');
      form.setValue('tbRecords.new.sex', personal.per_sex || '');
      form.setValue('tbRecords.new.dateOfBirth', personal.per_dob || '');
      form.setValue('tbRecords.new.contact', personal.per_contact || '');
    }
  };

  const addNCDRecord = () => {
    const newRecord = form.getValues('ncdRecords.new');
    
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

    const currentList = form.getValues('ncdRecords.list') || [];
    // Cast to the correct type since we've validated all required fields are present
    form.setValue('ncdRecords.list', [...currentList, newRecord as any]);
    
    // Reset form
    form.setValue('ncdRecords.new', {
      id: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      sex: '',
      dateOfBirth: '',
      contact: '',
      ncdFormSchema: undefined,
    });
    
    setShowNCDForm(false);
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

    const currentList = form.getValues('tbRecords.list') || [];
    // Cast to the correct type since we've validated all required fields are present
    form.setValue('tbRecords.list', [...currentList, newRecord as any]);
    
    // Reset form
    form.setValue('tbRecords.new', {
      id: '',
      lastName: '',
      firstName: '',
      middleName: '',
      suffix: '',
      sex: '',
      dateOfBirth: '',
      contact: '',
      tbSurveilanceSchema: undefined,
    });
    
    setShowTBForm(false);
  };

  const removeTBRecord = (index: number) => {
    const updated = tbList.filter((_, i) => i !== index);
    form.setValue('tbRecords.list', updated);
  };

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-6 pb-6">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Health Records
          </Text>
          <Text className="text-sm text-gray-600">
            Add NCD and TB surveillance records (Optional)
          </Text>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-gray-100 p-1 rounded-lg">
          <TouchableOpacity
            onPress={() => setActiveTab('ncd')}
            className={`flex-1 py-3 rounded-lg ${activeTab === 'ncd' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-semibold ${activeTab === 'ncd' ? 'text-blue-600' : 'text-gray-600'}`}>
              NCD Records ({ncdList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('tb')}
            className={`flex-1 py-3 rounded-lg ${activeTab === 'tb' ? 'bg-white' : ''}`}
          >
            <Text className={`text-center font-semibold ${activeTab === 'tb' ? 'text-blue-600' : 'text-gray-600'}`}>
              TB Records ({tbList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* NCD Tab Content */}
        {activeTab === 'ncd' && (
          <View>
            {/* NCD List */}
            {ncdList.length > 0 && (
              <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  NCD Records ({ncdList.length})
                </Text>
                <FlatList
                  data={ncdList}
                  keyExtractor={(item, index) => `ncd-${index}`}
                  renderItem={({ item, index }) => (
                    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">
                          {item.firstName} {item.lastName}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {item.ncdFormSchema?.riskClassAgeGroup || 'No risk class specified'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeNCDRecord(index)} className="p-2">
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Add NCD Button */}
            {!showNCDForm && (
              <TouchableOpacity
                onPress={() => setShowNCDForm(true)}
                className="bg-blue-600 rounded-lg p-4 flex-row items-center justify-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Add NCD Record</Text>
              </TouchableOpacity>
            )}

            {/* NCD Form */}
            {showNCDForm && (
              <View className="bg-white rounded-lg border border-blue-200 p-4">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Add NCD Record</Text>

                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Select Resident *</Text>
                    <Controller
                      control={form.control}
                      name="ncdRecords.new.id"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={residentOptions}
                          value={value || ''}
                          onSelect={(val: string) => {
                            onChange(val);
                            handleNCDResidentSelect(val);
                          }}
                          placeholder="Select Resident"
                          searchPlaceholder="Search..."
                          loading={isLoading}
                        />
                      )}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Risk Class Age Group</Text>
                    <Controller
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.riskClassAgeGroup"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={RISK_CLASS_OPTIONS}
                          value={value || ''}
                          onSelect={onChange}
                          placeholder="Select Risk Class"
                          searchPlaceholder="Search..."
                        />
                      )}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Comorbidities</Text>
                    <Controller
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.comorbidities"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={COMORBIDITIES_OPTIONS}
                          value={value || ''}
                          onSelect={onChange}
                          placeholder="Select Comorbidities"
                          searchPlaceholder="Search..."
                        />
                      )}
                    />
                  </View>

                  {form.watch('ncdRecords.new.ncdFormSchema.comorbidities') === 'Others' && (
                    <View>
                      <Text className="text-sm font-medium text-gray-700 mb-2">Specify Comorbidities</Text>
                      <Controller
                        control={form.control}
                        name="ncdRecords.new.ncdFormSchema.comorbiditiesOthers"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                            placeholder="Specify comorbidities"
                            value={value}
                            onChangeText={onChange}
                          />
                        )}
                      />
                    </View>
                  )}

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Lifestyle Risk</Text>
                    <Controller
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.lifestyleRisk"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={LIFESTYLE_RISK_OPTIONS}
                          value={value || ''}
                          onSelect={onChange}
                          placeholder="Select Lifestyle Risk"
                          searchPlaceholder="Search..."
                        />
                      )}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">In Maintenance</Text>
                    <Controller
                      control={form.control}
                      name="ncdRecords.new.ncdFormSchema.inMaintenance"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={MAINTENANCE_OPTIONS}
                          value={value || ''}
                          onSelect={onChange}
                          placeholder="Select Maintenance Status"
                          searchPlaceholder="Search..."
                        />
                      )}
                    />
                  </View>

                  <View className="flex-row gap-2 mt-4">
                    <TouchableOpacity
                      onPress={() => setShowNCDForm(false)}
                      className="flex-1 bg-gray-200 rounded-lg p-3"
                    >
                      <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={addNCDRecord}
                      className="flex-1 bg-blue-600 rounded-lg p-3"
                    >
                      <Text className="text-white font-semibold text-center">Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TB Tab Content */}
        {activeTab === 'tb' && (
          <View>
            {/* TB List */}
            {tbList.length > 0 && (
              <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  TB Records ({tbList.length})
                </Text>
                <FlatList
                  data={tbList}
                  keyExtractor={(item, index) => `tb-${index}`}
                  renderItem={({ item, index }) => (
                    <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900">
                          {item.firstName} {item.lastName}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {item.tbSurveilanceSchema?.tbStatus || 'No status specified'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeTBRecord(index)} className="p-2">
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Add TB Button */}
            {!showTBForm && (
              <TouchableOpacity
                onPress={() => setShowTBForm(true)}
                className="bg-blue-600 rounded-lg p-4 flex-row items-center justify-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Add TB Record</Text>
              </TouchableOpacity>
            )}

            {/* TB Form */}
            {showTBForm && (
              <View className="bg-white rounded-lg border border-blue-200 p-4">
                <Text className="text-lg font-semibold text-gray-900 mb-4">Add TB Record</Text>

                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Select Resident *</Text>
                    <Controller
                      control={form.control}
                      name="tbRecords.new.id"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={residentOptions}
                          value={value || ''}
                          onSelect={(val: string) => {
                            onChange(val);
                            handleTBResidentSelect(val);
                          }}
                          placeholder="Select Resident"
                          searchPlaceholder="Search..."
                          loading={isLoading}
                        />
                      )}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Source of Anti-TB Meds</Text>
                    <Controller
                      control={form.control}
                      name="tbRecords.new.tbSurveilanceSchema.srcAntiTBmeds"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={TB_MEDS_SOURCE_OPTIONS}
                          value={value || ''}
                          onSelect={onChange}
                          placeholder="Select Meds Source"
                          searchPlaceholder="Search..."
                        />
                      )}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">Number of Days Taking Meds</Text>
                    <Controller
                      control={form.control}
                      name="tbRecords.new.tbSurveilanceSchema.noOfDaysTakingMeds"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                          placeholder="Enter number of days"
                          value={value || ''}
                          onChangeText={onChange}
                          keyboardType="numeric"
                        />
                      )}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">TB Status</Text>
                    <Controller
                      control={form.control}
                      name="tbRecords.new.tbSurveilanceSchema.tbStatus"
                      render={({ field: { onChange, value } }) => (
                        <CustomDropdown
                          data={TB_STATUS_OPTIONS}
                          value={value || ''}
                          onSelect={onChange}
                          placeholder="Select TB Status"
                          searchPlaceholder="Search..."
                        />
                      )}
                    />
                  </View>

                  <View className="flex-row gap-2 mt-4">
                    <TouchableOpacity
                      onPress={() => setShowTBForm(false)}
                      className="flex-1 bg-gray-200 rounded-lg p-3"
                    >
                      <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={addTBRecord}
                      className="flex-1 bg-blue-600 rounded-lg p-3"
                    >
                      <Text className="text-white font-semibold text-center">Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
