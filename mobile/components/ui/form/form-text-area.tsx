
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Controller, Control, FieldError } from 'react-hook-form';
import { Textarea } from '../textarea';

interface FormTextAreaProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  numberOfLines?: number;
  keyboardType?: TextInputProps['keyboardType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  submitBehavior?: 'submit' | 'newline' | 'blurAndSubmit';
}

export const FormTextArea = ({
  control,
  name,
  label,
  placeholder,
  returnKeyType
}: FormTextAreaProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="mb-4">
          {label && (
            <Text className="text-[16px] font-PoppinsRegular">{label}</Text>
          )}
          <Textarea
            className={`h-[200px] font-PoppinsRegular text-[15px] bg-white text-black ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            returnKeyType={returnKeyType}
            aria-labelledby='textareaLabel'
          />
          {error && (
            <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
};