import React from 'react';
import { View, Text } from 'react-native';
import { Control, Controller } from 'react-hook-form';
import { Calendar } from '@/lib/icons/Calendar'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../button';

interface DatePickerProps { 
    control: Control<any>;
    name: string;
    label?: string;
}

export const FormDateInput = ({ control, name, label }: DatePickerProps) => {
  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          {label && (
            <Text className="text-[16px] font-PoppinsRegular mb-2">
              {label}
            </Text>
          )}
          
          <View className="flex relative">
            <Button
              onPress={() => setShowPicker(true)}
              className={`h-[45px] font-PoppinsRegular border bg-white items-start ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            >
              <Text className="text-[16px]">
                {value ? new Date(value).toLocaleDateString() : "Select Date"}
              </Text>
            </Button>
            
            {/* Fix icon to specific pixel position instead of percentage */}
            <View className="absolute right-5 top-[12px]">
              <Calendar size={20} className="text-gray-700" />
            </View>
            
            {showPicker && (
              <DateTimePicker
                testID="datePicker"
                value={value ? new Date(value) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) {
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    onChange(dateStr); 
                  }
                }}
              />
            )}
            
            <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
              <Calendar className="text-gray-700" />
            </View>
          </View>
          
          {error && (
            <Text className="text-red-500 text-sm mt-1">
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};