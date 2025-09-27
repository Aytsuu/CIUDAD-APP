import { View, Text } from 'react-native';
import { Input } from '../input';
import { Controller, Control } from 'react-hook-form';
import { capitalize } from '@/helpers/capitalize';

interface FormInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  submitBehavior?: 'submit' | 'newline' | 'blurAndSubmit';
  editable?: boolean;
  maxInput?: number;
  upper?: boolean
}

export const FormInput = ({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  returnKeyType = 'next',
  submitBehavior = 'newline',
  editable = true,
  maxInput,
  upper = false
}: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        // Handle maxInput logic
        const handleChange = (text: string) => {
          if (maxInput !== undefined && text.length > maxInput) {
            return; // Don't update if exceeds max length
          }
          onChange(text);
        };

        return (
          <View className="mb-4">
            {label && <Text className="text-sm mb-2">{label}</Text>}
            <Input
              className={`
                h-[45px]
                bg-white
                text-black
                native:text-sm
                native:font-normal
                rounded-xl
                ${error ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder={placeholder}
              placeholderTextColor="#888"
              value={value != null ? upper ? String(value).toUpperCase() : String(value) : ''}
              onChangeText={handleChange} // Use the custom handler
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              returnKeyType={returnKeyType}
              submitBehavior={submitBehavior}
              editable={editable}
              maxLength={maxInput} // Pass to native input
            />
            {maxInput && (
              <Text className="text-xs text-gray-500 mt-1 text-right">
                {value?.length || 0}/{maxInput}
              </Text>
            )}
            {error && (
              <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
};