import React from 'react';
import { View, Text } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import SelectLayout from '../select/select-layout';
import { cn } from '@/lib/utils';

interface FormSelectProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    options: { label: string; value: string }[];
    label?: string;
    placeholder?: string;
    className?: string;
    contentClassName?: string;
  }
  
  export const FormSelect = <T extends FieldValues>({
    control,
    name,
    options,
    label,
    placeholder = 'Select...',
    className,
    contentClassName,
  }: FormSelectProps<T>) => {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-4">
            {label && (
              <Text className="text-[ 16px] font-PoppinsRegular mb-2">
                {label}
              </Text>
            )}
            
            <SelectLayout
              className={error ? cn('border border-red-500', contentClassName) : className}
              contentClassName={contentClassName}
              placeholder={placeholder}
              options={options}
              selected={options.find(opt => opt.value === value) || {label: 'Select', value: 'select'}}
              onValueChange={(selectedOption) => {
                // Handle both the case where selectedOption might be undefined
                onChange(selectedOption?.value ?? null);
              }}
            />
            
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