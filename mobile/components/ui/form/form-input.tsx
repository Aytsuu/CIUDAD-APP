import { View, Text } from 'react-native';
import { Input } from '../input';
import { Controller, Control, FieldError } from 'react-hook-form';

interface FormInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  submitBehavior?: 'submit' | 'newline' | 'blurAndSubmit';
}

export const FormInput = ({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType='default',
  returnKeyType='next',
  submitBehavior='newline',
}: FormInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } ,  fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="text-[16px] font-PoppinsRegular">{label}</Text>
          <Input
            className={`h-[57px] font-PoppinsRegular text-[15px] ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            submitBehavior={submitBehavior}
          />
          {error && (
            <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};