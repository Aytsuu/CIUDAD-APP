import React from "react";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { Control, FieldValues, Path } from "react-hook-form";

// Reusable Form Input Component
export const FormInput = React.memo(({ 
    control, 
    name, 
    label, 
    placeholder, 
    type = "text", 
    readOnly, 
    className, 
    value, 
    onChange 
}: { 
    control: Control<any>; 
    name: Path<FieldValues>; 
    label: string; 
    placeholder?: string; 
    type?: string; 
    readOnly?: boolean; 
    className?: string; 
    value?: any; 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-black/70">{label}</FormLabel>
          <FormControl>
            <Input 
              type={type} 
              placeholder={placeholder} 
              {...field} 
              readOnly={readOnly}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
              }}
              onKeyDown={(e) => {
                // Prevent non-numeric key presses (except Backspace, Tab, etc.)
                if (
                  !/[0-9]/.test(e.key) && 
                  !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) && 
                  type === 'number'
                ) {
                  e.preventDefault();
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ));