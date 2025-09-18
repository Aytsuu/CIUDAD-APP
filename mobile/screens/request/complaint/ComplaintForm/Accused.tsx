import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Plus, X, UserX } from 'lucide-react-native';

interface AccusedStepProps {
  form: UseFormReturn<ComplaintFormData>;
}

// Memoized header component
const AccusedHeader = memo(() => (
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
));

AccusedHeader.displayName = 'AccusedHeader';

// Memoized individual accused form section
const AccusedFormSection = memo(({ 
  control, 
  index, 
  onRemove,
  showRemoveButton,
  id // Add unique ID for better memoization
}: { 
  control: any;
  index: number;
  onRemove: () => void;
  showRemoveButton: boolean;
  id: string;
}) => {
  // Memoize gender options to prevent recreation on every render
  const genderOptions = useMemo(() => [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ], []);

  // Watch only the specific gender field we need
  const currentGender = control._formValues?.accused?.[index]?.acsd_gender;

  // Memoize the custom gender input to only re-render when gender changes
  const CustomGenderInput = useMemo(() => {
    if (currentGender === 'Other') {
      return (
        <FormInput
          control={control}
          name={`accused.${index}.acsd_custom_gender`}
          label="Specify Gender"
          placeholder="Please specify your gender"
        />
      );
    }
    return null;
  }, [currentGender, control, index]);

  return (
    <View className="bg-white rounded-lg p-4 border border-gray-100">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-md font-medium text-gray-900">
          Accused {index + 1}
        </Text>
        {showRemoveButton && (
          <TouchableOpacity onPress={onRemove} className="p-2">
            <X size={18} className="text-red-500" />
          </TouchableOpacity>
        )}
      </View>

      <View className="space-y-4">
        <FormInput
          control={control}
          name={`accused.${index}.acsd_name`}
          label="Name/Alias"
          placeholder="Full name or known alias"
        />

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <FormSelect
              control={control}
              name={`accused.${index}.acsd_gender`}
              label="Gender"
              options={genderOptions}
            />
          </View>
          <View className="flex-1">
            <FormInput
              control={control}
              name={`accused.${index}.acsd_age`}
              label="Age"
              placeholder="Age"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Custom Gender Input */}
        {CustomGenderInput}

        <FormTextArea
          control={control}
          name={`accused.${index}.acsd_description`}
          label="Physical Description"
          placeholder="Describe physical appearance, clothing, distinguishing features..."
          numberOfLines={3}
        />

        <FormTextArea
          control={control}
          name={`accused.${index}.acsd_address`}
          label="Known Address"
          placeholder="Enter complete address (Street, Barangay, City, Province)"
          numberOfLines={2}
        />

        <FormInput
          control={control}
          name={`accused.${index}.rp_id`}
          label="Resident ID (Optional)"
          placeholder="If known resident, enter ID"
          keyboardType="numeric"
        />
      </View>
    </View>
  );
});

AccusedFormSection.displayName = 'AccusedFormSection';

// Memoized add button component
const AddAccusedButton = memo(({ onAdd }: { onAdd: () => void }) => (
  <TouchableOpacity
    onPress={onAdd}
    className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 flex-row items-center justify-center"
  >
    <Plus size={20} className="text-red-600 mr-2" />
    <Text className="text-red-600 font-medium">Add Another Accused</Text>
  </TouchableOpacity>
));

AddAccusedButton.displayName = 'AddAccusedButton';

export const Accused: React.FC<AccusedStepProps> = memo(({ form }) => {
  const { control } = form;
  
  // Use useFieldArray instead of watch for better performance
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'accused',
  });

  // Memoize the add accused function
  const addAccused = useCallback(() => {
    const newAccused = {
      acsd_name: '',
      acsd_age: '',
      acsd_gender: 'Male' as const,
      acsd_description: '',
      acsd_address: '',
      rp_id: null,
    };
    
    append(newAccused);
  }, [append]);

  // Memoize the remove accused function
  const removeAccused = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  // Memoize the list of accused forms with stable keys
  const AccusedForms = useMemo(() => (
    fields.map((field, index) => (
      <AccusedFormSection
        key={field.id} // Use field.id instead of index for stable keys
        control={control}
        index={index}
        onRemove={() => removeAccused(index)}
        showRemoveButton={fields.length > 1}
        id={field.id}
      />
    ))
  ), [fields, control, removeAccused]);

  return (
    <View className="space-y-4">
      <AccusedHeader />
      
      {AccusedForms}
      
      <AddAccusedButton onAdd={addAccused} />
    </View>
  );
});

Accused.displayName = 'Accused';