import React from 'react';
import { View, Text } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import SelectLayout from '../select/select-layout';

interface FormCustomDropdownProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  options: DropdownOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  maxHeight?: number
  className?: string
  isInModal?: boolean
}

export const FormSelect = <T extends FieldValues>({
  control,
  name,
  options,
  label,
  placeholder = "Select...",
  disabled = false,
  maxHeight = 300,
  className,
  isInModal
}: FormCustomDropdownProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <SelectLayout
            options={options}
            selectedValue={value}
            onSelect={(option: any) => onChange(option.value)}
            label={label}
            placeholder={placeholder}
            error={error?.message}
            disabled={disabled}
            maxHeight={maxHeight}
            className={className}
          />
        </View>
      )}
    />
  )
}
