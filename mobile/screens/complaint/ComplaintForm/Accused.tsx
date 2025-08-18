import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Plus, X, UserX } from 'lucide-react-native';

interface AccusedStepProps {
  form: UseFormReturn<ComplaintFormData>;
}

export const Accused: React.FC<AccusedStepProps> = ({ form }) => {
  const { control, watch, setValue } = form;
  const accused = watch('accused') || [];

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  const addAccused = () => {
    const newAccused = {
      alias: '',
      age: '',
      gender: 'Male',
      description: '',
      address: {
        street: '',
        barangay: '',
        city: '',
        province: '',
        sitio: '',
      },
    };
    
    setValue('accused', [...accused, newAccused]);
  };

  const removeAccused = (index: number) => {
    const updated = accused.filter((_, i) => i !== index);
    setValue('accused', updated);
  };

  return (
    <View className="space-y-4">
      {/* Header */}
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <View className="flex-row items-center mb-2">
          <UserX size={20} className="text-red-600 mr-2" color={"#111111"}/>
          <Text className="text-lg font-semibold text-gray-900">
            Accused Information
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Provide details about the person(s) being accused
        </Text>
      </View>

      {/* Existing Accused */}
      {accused.map((accusedPerson, index) => (
        <View key={index} className="bg-white rounded-lg p-4 border border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-md font-medium text-gray-900">
              Accused {index + 1}
            </Text>
            {accused.length > 1 && (
              <TouchableOpacity
                onPress={() => removeAccused(index)}
                className="p-2"
              >
                <X size={18} className="text-red-500" />
              </TouchableOpacity>
            )}
          </View>

          <View className="space-y-4">
            <FormInput
              control={control}
              name={`accused.${index}.alias`}
              label="Name/Alias"
              placeholder="Full name or known alias"
            />

            <View className="flex-row space-x-3">
              <View className="flex-1">
                <FormSelect
                  control={control}
                  name={`accused.${index}.gender`}
                  label="Gender"
                  options={genderOptions}
                />
              </View>
              <View className="flex-1">
                <FormInput
                  control={control}
                  name={`accused.${index}.age`}
                  label="Age"
                  placeholder="Age"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <FormTextArea
              control={control}
              name={`accused.${index}.description`}
              label="Physical Description"
              placeholder="Describe physical appearance, clothing, distinguishing features..."
              numberOfLines={3}
            />

            {/* Address Section */}
            <View className="border-t border-gray-100 pt-4">
              <Text className="text-sm font-medium text-gray-900 mb-3">Known Address</Text>
              
              <View className="space-y-3">
                <FormInput
                  control={control}
                  name={`accused.${index}.address.street`}
                  label="Street/House No."
                  placeholder="Street address"
                />
                
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`accused.${index}.address.barangay`}
                      label="Barangay"
                      placeholder="Barangay"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`accused.${index}.address.sitio`}
                      label="Sitio (Optional)"
                      placeholder="Sitio"
                    />
                  </View>
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`accused.${index}.address.city`}
                      label="City"
                      placeholder="City"
                    />
                  </View>
                  <View className="flex-1">
                    <FormInput
                      control={control}
                      name={`accused.${index}.address.province`}
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

      {/* Add Accused Button */}
      <TouchableOpacity
        onPress={addAccused}
        className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 flex-row items-center justify-center"
      >
        <Plus size={20} className="text-red-600 mr-2" />
        <Text className="text-red-600 font-medium">Add Another Accused</Text>
      </TouchableOpacity>
    </View>
  );
};