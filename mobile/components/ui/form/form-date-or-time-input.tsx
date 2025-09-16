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
  minimumDate?: Date;
  maximumDate?: Date;
  restrictToCurrentAndPast?: boolean; // New prop to enable past-only restriction
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
  restrictToCurrentAndPast = false,
}: FormDateTimeInputProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDisplayValue = (value: string | undefined) => {
    if (!value) return placeholder || `${type === 'date' ? 'mm/dd/yyy' : '00:00 PM'}`;

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

  // Function to check if selected time is in the future
  const isTimeInFuture = (selectedTime: string): boolean => {
    if (type !== 'time' || !restrictToCurrentAndPast) return false;
    
    const now = new Date();
    const [hours, minutes] = selectedTime.split(':');
    const selectedDate = new Date();
    selectedDate.setHours(parseInt(hours || '0', 10));
    selectedDate.setMinutes(parseInt(minutes || '0', 10));
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);

    const currentTime = new Date();
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    return selectedDate.getTime() > currentTime.getTime();
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        validate: restrictToCurrentAndPast && type === 'time' ? {
          notFuture: (value: string) => 
            !isTimeInFuture(value) || 'Time cannot be in the future'
        } : undefined
      }}
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
              const timeString = `${hours}:${minutes}`;
              
              // Additional validation for future time
              if (restrictToCurrentAndPast && isTimeInFuture(timeString)) {
                // You could show an alert here or handle it differently
                return;
              }
              
              onChange(timeString);
            }
          }
        };

        // Set maximum date/time for picker
        const getMaximumDate = () => {
          if (type === 'time' && restrictToCurrentAndPast) {
            return new Date(); // Current date/time as maximum
          }
          return maximumDate;
        };

        return (
          <View className="mb-4">
            {label && <Text className="text-sm mb-2">{label}</Text>}
            <TouchableOpacity
              className={`
                h-[45px]
                px-3
                bg-white
                border
                rounded-xl
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
                  text-sm
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
                minimumDate={minimumDate}
                maximumDate={getMaximumDate()}
              />
            )}
          </View>
        );
      }}
    />
  );
};