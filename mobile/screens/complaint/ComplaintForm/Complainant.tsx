import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { Plus, X, User } from 'lucide-react-native';

interface ComplainantStepProps {
  form: UseFormReturn<ComplaintFormData>;
}

export const Complainant: React.FC<ComplainantStepProps> = ({ form }) => {
  const { control, watch, setValue, getValues } = form;
  const [showAddForm, setShowAddForm] = useState(false);
  
  const complainants = watch('complainant') || [];

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
  ];

  const addComplainant = () => {
    const newComplainant = {
      fullName: '',
      gender: 'Male' as const,
      age: '',
      relation_to_respondent: '',
      contactNumber: '',
      address: {
        street: '',
        barangay: '',
        city: '',
        province: '',
        sitio: '',
      },
    };
    
    setValue('complainant', [...complainants, newComplainant]);
    setShowAddForm(true);
  };

  const removeComplainant = (index: number) => {
    const updated = complainants.filter((_, i) => i !== index);
    setValue('complainant', updated);
    if (updated.length === 0) {
      setShowAddForm(false);
    }
  };

  return (
    <View className="space-y-4">
      {/* Header */}
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <View className="flex-row items-center mb-2 gap-x-2">
          <User size={20} className="text-blue-600 mr-2" color={"#111111"} />
          <Text className="text-lg font-semibold text-gray-900">
            Complainant Information
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Provide details about the person filing this complaint
        </Text>
      </View>

      {/* Existing Complainants */}
      {complainants.map((complainant, index) => (
        <View key={index} className="bg-white rounded-lg p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-md font-medium text-gray-900">
              Complainant {index + 1}
            </Text>
            {complainants.length > 1 && (
              <TouchableOpacity
                onPress={() => removeComplainant(index)}
                className="p-2"
              >
                <X size={18} className="text-red-500" />
              </TouchableOpacity>
            )}
          </View>

          <View className="space-y-4">
            <FormInput
              control={control}
              name={`complainant.${index}.fullName`}
              label="Full Name"
              placeholder="Enter full name"
            />

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <FormSelect
                  control={control}
                  name={`complainant.${index}.gender`}
                  label="Gender"
                  options={genderOptions}
                />
              </View>
              <View className="flex-1">
                <FormInput
                  control={control}
                  name={`complainant.${index}.age`}
                  label="Age"
                  placeholder="Age"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <FormInput
              control={control}
              name={`complainant.${index}.relation_to_respondent`}
              label="Relation to Accused"
              placeholder="e.g., Neighbor, Colleague, etc."
            />

            <FormInput
              control={control}
              name={`complainant.${index}.contactNumber`}
              label="Contact Number"
              placeholder="09XXXXXXXXX"
              keyboardType="phone-pad"
            />

            {/* Address Section */}
            <View className="border-t border-gray-100 pt-4">
              <Text className="text-sm font-medium text-gray-900 mb-3">Address</Text>
              
              <View className="space-y-3">
                <FormInput
                  control={control}
                  name={`complainant.${index}.address.street`}
                  label="Street/House No."
                  placeholder="Street address"
                />
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`complainant.${index}.address.barangay`}
                      label="Barangay"
                      placeholder="Barangay"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`complainant.${index}.address.sitio`}
                      label="Sitio (Optional)"
                      placeholder="Sitio"
                    />
                  </View>
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`complainant.${index}.address.city`}
                      label="City"
                      placeholder="City"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`complainant.${index}.address.province`}
                      label="Province"
                      placeholder="Province"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}

      {/* Add Complainant Button */}
      <TouchableOpacity
        onPress={addComplainant}
        className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 flex-row items-center justify-center"
      >
        <Plus size={20} className="text-blue-600 mr-2" />
        <Text className="text-blue-600 font-medium">Add Another Complainant</Text>
      </TouchableOpacity>
    </View>
  );
};