import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { Controller, Control } from 'react-hook-form';

interface FormDateTimeInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  type: 'date' | 'time';
  placeholder?: string;
  editable?: boolean;
  minimumDate?: Date;  // Changed to Date type
  maximumDate?: Date;  // Changed to Date type
}

export const FormDateTimeInput = ({
  control,
  name,
  label,
  type,
  placeholder,
  editable = true,
  minimumDate,
  maximumDate,
}: FormDateTimeInputProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDisplayValue = (value: string | undefined) => {
    if (!value) return placeholder || `Select ${type === 'date' ? 'Date' : 'Time'}`;

    if (type === 'date') {
      const dateObj = new Date(value);
      return isNaN(dateObj.getTime()) ? value : dateObj.toLocaleDateString();
    } else {
      const [hours, minutes] = value.split(':');
      if (!hours || !minutes) return value;
      const tempDate = new Date();
      tempDate.setHours(Number(hours));
      tempDate.setMinutes(Number(minutes));
      return tempDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const dateValue = type === 'date' && value ? new Date(value) : 
                         type === 'time' && value ? (() => {
                           const [hours, minutes] = value.split(':');
                           const date = new Date();
                           date.setHours(parseInt(hours || '0', 10));
                           date.setMinutes(parseInt(minutes || '0', 10));
                           return date;
                         })() : new Date();

        const handlePickerChange = (_: any, selectedDate?: Date) => {
          setShowPicker(false);
          if (selectedDate) {
            if (type === 'date') {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              onChange(`${year}-${month}-${day}`);
            } else {
              const hours = String(selectedDate.getHours()).padStart(2, '0');
              const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
              onChange(`${hours}:${minutes}`);
            }
          }
        };

        return (
          <View className="mb-4">
            {label && (
              <Text className="text-[12px] font-PoppinsRegular mb-2">{label}</Text>
            )}
            <TouchableOpacity
              className={`
                h-[45px]
                px-3
                bg-white
                border
                rounded-md
                flex-row
                items-center
                justify-between
                ${error ? 'border-red-500' : 'border-gray-300'}
              `}
              onPress={() => editable && setShowPicker(true)}
              activeOpacity={editable ? 0.7 : 1}
              disabled={!editable}
            >
              <Text
                className={`
                  font-PoppinsRegular
                  ${!value ? 'text-[#888]' : 'text-black'}
                `}
              >
                {formatDisplayValue(value)}
              </Text>
              {type === 'date' ? (
                <Calendar size={20} color={error ? '#ef4444' : '#888'} />
              ) : (
                <Clock size={20} color={error ? '#ef4444' : '#888'} />
              )}
            </TouchableOpacity>
            {error && (
              <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
            )}
            {showPicker && (
              <DateTimePicker
                value={dateValue}
                mode={type}
                display="default"
                onChange={handlePickerChange}
                minimumDate={minimumDate}  // Now properly typed as Date
                maximumDate={maximumDate}  // Now properly typed as Date
              />
            )}
          </View>
        );
      }}
    />
  );
};