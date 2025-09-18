import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { Plus, X, User } from 'lucide-react-native';

interface ComplainantStepProps {
  form: UseFormReturn<ComplaintFormData>;
}

// Memoized header component
const ComplainantHeader = memo(() => (
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
));

ComplainantHeader.displayName = 'ComplainantHeader';

// Memoized individual complainant form section
const ComplainantFormSection = memo(({ 
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
  const currentGender = control._formValues?.complainant?.[index]?.cpnt_gender;

  // Memoize the custom gender input to only re-render when gender changes
  const CustomGenderInput = useMemo(() => {
    if (currentGender === 'Other') {
      return (
        <FormInput
          control={control}
          name={`complainant.${index}.cpnt_custom_gender`}
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
          Complainant {index + 1}
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
          name={`complainant.${index}.cpnt_name`}
          label="Full Name"
          placeholder="Enter full name"
        />

        <View className="flex-row space-x-3">
          <View className="flex-1">
            <FormSelect
              control={control}
              name={`complainant.${index}.cpnt_gender`}
              label="Gender"
              options={genderOptions}
            />
          </View>
          <View className="flex-1">
            <FormInput
              control={control}
              name={`complainant.${index}.cpnt_age`}
              label="Age"
              placeholder="Age"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Custom Gender Input */}
        {CustomGenderInput}

        <FormInput
          control={control}
          name={`complainant.${index}.cpnt_relation_to_respondent`}
          label="Relation to Accused"
          placeholder="e.g., Neighbor, Colleague, etc."
        />

        <FormInput
          control={control}
          name={`complainant.${index}.cpnt_number`}
          label="Contact Number"
          placeholder="09XXXXXXXXX"
          keyboardType="phone-pad"
        />

        <FormInput
          control={control}
          name={`complainant.${index}.cpnt_address`}
          label="Address"
          placeholder="Enter complete address (Street, Barangay, City, Province)"
        />

        <FormInput
          control={control}
          name={`complainant.${index}.rp_id`}
          label="Resident ID (Optional)"
          placeholder="If known resident, enter ID"
          keyboardType="numeric"
        />
      </View>
    </View>
  );
});

ComplainantFormSection.displayName = 'ComplainantFormSection';

// Memoized add button component
const AddComplainantButton = memo(({ onAdd }: { onAdd: () => void }) => (
  <TouchableOpacity
    onPress={onAdd}
    className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300 flex-row items-center justify-center"
  >
    <Plus size={20} className="text-blue-600 mr-2" />
    <Text className="text-blue-600 font-medium">Add Another Complainant</Text>
  </TouchableOpacity>
));

AddComplainantButton.displayName = 'AddComplainantButton';

export const Complainant: React.FC<ComplainantStepProps> = memo(({ form }) => {
  const { control } = form;
  
  // Use useFieldArray instead of watch for better performance
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'complainant',
  });

  // Memoize the add complainant function
  const addComplainant = useCallback(() => {
    const newComplainant = {
      cpnt_name: '',
      cpnt_gender: 'Male' as const,
      cpnt_age: '',
      cpnt_relation_to_respondent: '',
      cpnt_number: '',
      cpnt_address: '',
      rp_id: null,
    };
    
    append(newComplainant);
  }, [append]);

  // Memoize the remove complainant function
  const removeComplainant = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  // Memoize the list of complainant forms with stable keys
  const ComplainantForms = useMemo(() => (
    fields.map((field, index) => (
      <ComplainantFormSection
        key={field.id} // Use field.id instead of index for stable keys
        control={control}
        index={index}
        onRemove={() => removeComplainant(index)}
        showRemoveButton={fields.length > 1}
        id={field.id}
      />
    ))
  ), [fields, control, removeComplainant]);

  return (
    <View className="space-y-4">
      <ComplainantHeader />
      
      {ComplainantForms}
      
      <AddComplainantButton onAdd={addComplainant} />
    </View>
  );
});

Complainant.displayName = 'Complainant';