import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  upper?: boolean;
  noSpecialChars?: boolean;
}

export const FormInput = React.memo(({ 
  control, 
  name, 
  label, 
  placeholder, 
  type = "text", 
  readOnly, 
  className,
  min,
  max,
  step,
  maxLength,
  upper = false,
  noSpecialChars = false
}: FormInputProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        {label && <FormLabel className="text-black/70">{label}</FormLabel>}
        <FormControl>
          <Input 
            className={cn("", className)} 
            type={type} 
            placeholder={readOnly ? "" : placeholder} 
            {...field}
            value={field.value ? upper ? field.value.toUpperCase() : field.value : ''}
            readOnly={readOnly}
            min={type === 'number' ? min : undefined}
            max={type === 'number' ? max : undefined}
            step={type === 'number' ? step : undefined}
            maxLength={maxLength}
            onKeyDown={(e) => {
              if (type === 'number') {
                const allowedKeys = [
                  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                
                const isDecimal = e.key === '.' && !field.value?.toString().includes('.');
                const isMinus = e.key === '-' && (!field.value || field.value.toString().length === 0);
                const isControlKey = allowedKeys.includes(e.key);
                const isCtrlCombination = (e.ctrlKey || e.metaKey) && 
                  ['a', 'c', 'v', 'x', 'z'].includes(e.key);
                
                if (!(isDecimal || isMinus || isControlKey || isCtrlCombination)) {
                  e.preventDefault();
                }
              } else {
                if (!noSpecialChars) return;
                
                const allowedKeys = 'qwertyuiopasdfghjklzxcvbnm'.split('')
                allowedKeys.push('Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End')

                if (!allowedKeys.includes(e.key)) {
                  e.preventDefault();
                }
              }
            }}
            onChange={(e) => {
              let value = e.target.value;
              
              if (type === 'number') {
                value = value.replace(/[^0-9.]/g, '');
                
                const parts = value.split('.');
                if (parts.length > 2) {
                  value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                if (value.includes('-') && value.indexOf('-') > 0) {
                  value = value.replace(/-/g, '');
                }
                
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  if (min !== undefined && numValue < min) {
                    value = min.toString();
                  } else if (max !== undefined && numValue > max) {
                    value = max.toString();
                  }
                }
              }
              
              if (maxLength && value.length > maxLength) {
                value = value.slice(0, maxLength);
              }
              
              field.onChange(value);
            }}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

