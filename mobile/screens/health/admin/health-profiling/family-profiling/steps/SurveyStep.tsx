import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { UseFormReturn, Controller } from 'react-hook-form';
import { HealthFamilyProfilingFormData } from '@/form-schema/health-family-profiling-schema';
import { SignaturePad } from '@/components/ui/signature-pad';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface SurveyStepProps {
  form: UseFormReturn<HealthFamilyProfilingFormData>;
}

export const SurveyStep: React.FC<SurveyStepProps> = ({ form }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <View className="space-y-6 pb-6">
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Survey Identification
          </Text>
          <Text className="text-sm text-gray-600">
            Provide surveyor information and signature
          </Text>
        </View>

        {/* Filled By */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Filled By <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.filledBy"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter name of person who filled the form"
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Informant */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Informant/Conforme <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.informant"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter informant name"
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Checked By */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Checked By <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.checkedBy"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                  placeholder="Enter checker name"
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Survey Date */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Survey Date <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.date"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-white"
                >
                  <Calendar size={20} color="#6B7280" />
                  <Text className="ml-2 text-gray-900">
                    {value ? new Date(value).toLocaleDateString() : 'Select Survey Date'}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        onChange(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
                
                {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Signature */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Signature <Text className="text-red-500">*</Text>
          </Text>
          <Controller
            control={form.control}
            name="surveyForm.signature"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <SignaturePad
                  onSignatureChange={onChange}
                  value={value}
                />
                {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Info Note */}
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Text className="text-sm text-blue-900">
            <Text className="font-semibold">Note:</Text> This information will be used to identify
            the survey and the person responsible for data collection. Please ensure all fields are
            accurately filled.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
