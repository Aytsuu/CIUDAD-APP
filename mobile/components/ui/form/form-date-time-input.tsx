import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { Controller, Control } from 'react-hook-form';

interface FormDateAndTimeInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  editable?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const FormDateAndTimeInput = ({
  control,
  name,
  label,
  placeholder,
  editable = true,
  minimumDate,
  maximumDate,
}: FormDateAndTimeInputProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDisplayValue = (date: Date | undefined) => {
    if (!date) return placeholder || 'Select Date & Time';
    
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const dateValue = value ? new Date(value) : undefined;

        const handleDateChange = (_: any, selectedDate?: Date) => {
          setShowDatePicker(false);
          if (selectedDate) {
            // Combine new date with existing time
            const newDateTime = new Date(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
              dateValue?.getHours() || 0,
              dateValue?.getMinutes() || 0
            );
            onChange(newDateTime.toISOString());
          }
        };

        const handleTimeChange = (_: any, selectedTime?: Date) => {
          setShowTimePicker(false);
          if (selectedTime) {
            // Combine new time with existing date
            const newDateTime = new Date(
              dateValue?.getFullYear() || new Date().getFullYear(),
              dateValue?.getMonth() || new Date().getMonth(),
              dateValue?.getDate() || new Date().getDate(),
              selectedTime.getHours(),
              selectedTime.getMinutes()
            );
            onChange(newDateTime.toISOString());
          }
        };

        return (
          <View className="mb-4">
            {label && (
              <Text className="text-sm mb-2">{label}</Text>
            )}
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                className={`
                  flex-1
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
                onPress={() => editable && setShowDatePicker(true)}
                activeOpacity={editable ? 0.7 : 1}
                disabled={!editable}
              >
                <Text 
                  className={`native:text-sm
                    ${!dateValue ? 'text-[#888]' : 'text-black'}
                  `}
                >
                  {dateValue ? dateValue.toLocaleDateString() : 'Select Date'}
                </Text>
                <Calendar size={18} color={error ? '#ef4444' : '#888'} />
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`
                  flex-1
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
                onPress={() => editable && setShowTimePicker(true)}
                activeOpacity={editable ? 0.7 : 1}
                disabled={!editable}
              >
                <Text 
                  className={`native:text-sm
                    ${!dateValue ? 'text-[#888]' : 'text-black'}
                  `}
                >
                  {dateValue ? dateValue.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : 'Select Time'}
                </Text>
                <Clock size={18} color={error ? '#ef4444' : '#888'} />
              </TouchableOpacity>
            </View>
            
            {error && (
              <Text className="text-red-500 text-xs mt-1">{error.message}</Text>
            )}
            
            {showDatePicker && (
              <DateTimePicker
                value={dateValue || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={dateValue || new Date()}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        );
      }}
    />
  );
};