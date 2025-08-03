// components/ui/form/form-checkbox.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Check } from 'lucide-react-native';

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const FormSingleCheckbox = <T extends FieldValues>({
  control,
  name,
  label,
  disabled = false,
  className,
}: FormCheckboxProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className={`mb-4 ${className}`}>
          <TouchableOpacity
            onPress={() => onChange(!value)}
            disabled={disabled}
            className="flex-row items-center"
          >
            <View
              className={`w-5 h-5 border rounded-md mr-2 items-center justify-center 
                ${value ? 'bg-primaryBlue border-primaryBlue' : 'bg-white border-gray-300'}
                ${disabled ? 'opacity-50' : ''}`}
            >
              {value && <Check size={14} color="white" />}
            </View>
            {label && (
              <Text className={`text-base ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                {label}
              </Text>
            )}
          </TouchableOpacity>
          {error?.message && (
            <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};