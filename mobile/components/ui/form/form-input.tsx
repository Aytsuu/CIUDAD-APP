import { View, Text } from 'react-native';
import { Input } from '../input';
import { Controller, Control } from 'react-hook-form';

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
}: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
        const handleChange = (text: string) => {       
          onChange(text);
        };

        // No transformation needed here since it's done in handleChange
        const displayValue = value != null ? String(value) : '';

        return (
          <View className="mb-4">
            {label && <Text className="text-sm mb-2">{label}</Text>}
            <Input
              autoCapitalize={'characters'}
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
              value={displayValue}
              onChangeText={handleChange}
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              returnKeyType={returnKeyType}
              submitBehavior={submitBehavior}
              editable={editable}
              maxLength={maxInput}
              
            />
            {maxInput && (
              <Text className="text-xs text-gray-500 mt-1 text-right">
                {displayValue.length || 0}/{maxInput}
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