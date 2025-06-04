import { View, Text, TextInputProps } from 'react-native';
import { Controller, Control, FieldError } from 'react-hook-form';
import { Input } from '../input';

interface FormTimeInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  error?: FieldError;
  mode?: '24h' | '12h';
  returnKeyType?: TextInputProps['returnKeyType'];
}

export const FormTimeInput = ({
  control,
  name,
  label,
  placeholder = 'HH:MM',
  mode = '24h',
  returnKeyType = 'done',
}: FormTimeInputProps) => {
  const validateTime = (value: string) => {
    if (!value) return true; // Let required validation handle empty values

    const timeRegex = mode === '24h'
      ? /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      : /^(0?[1-9]|1[0-2]):[0-5][0-9] [AP]M$/;

    if (!timeRegex.test(value)) {
      return mode === '24h'
        ? 'Please enter time in 24h format (HH:MM)'
        : 'Please enter time in 12h format (HH:MM AM/PM)';
    }
    return true;
  };

  const formatTime = (text: string) => {
    if (mode === '24h') {
      if (text.length === 2 && !text.includes(':')) {
        return `${text}:`;
      }
      if (text.length > 5) {
        return text.substring(0, 5);
      }
      return text;
    } else {
      // 12h mode: auto-insert colon and uppercase AM/PM
      let formatted = text.replace(/[^0-9:apmAPM ]/g, '');

      // Auto-insert colon after 2 digits if not present
      if (/^\d{2}$/.test(formatted)) {
        formatted = `${formatted}:`;
      }
      // Auto-uppercase AM/PM
      formatted = formatted.replace(/\s?(am|pm)$/i, (match) => ` ${match.trim().toUpperCase()}`);

      // Limit to 8 chars (e.g., "12:34 AM")
      if (formatted.length > 8) {
        formatted = formatted.substring(0, 8);
      }
      return formatted;
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ validate: validateTime }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="mb-4">
          {label && <Text className="text-base font-normal mb-2 font-['PoppinsRegular']">{label}</Text>}
          <Input
            className={`h-[57px] border rounded px-3 text-[15px] font-['PoppinsRegular'] ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={mode === '24h' ? 'HH:MM' : 'HH:MM AM/PM'}
            value={value}
            onChangeText={(text) => onChange(formatTime(text))}
            onBlur={onBlur}
            keyboardType="default"
            returnKeyType={returnKeyType}
            maxLength={mode === '24h' ? 5 : 8}
          />
          {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
        </View>
      )}
    />
  );
};