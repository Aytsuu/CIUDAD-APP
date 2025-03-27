import { View, Text } from 'react-native';
import { Input } from '../input';
import { Controller, Control, FieldError } from 'react-hook-form';

interface FormInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: FieldError;
}

export const FormInput = ({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  error,
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
          />
          {error && (
            <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};