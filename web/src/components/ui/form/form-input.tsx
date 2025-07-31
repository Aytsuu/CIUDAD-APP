// import React from "react";
// import {
//     FormField,
//     FormItem,
//     FormLabel,
//     FormControl,
//     FormMessage,
//   } from "@/components/ui/form/form";
// import { Input } from "@/components/ui/input";
// import { Control, FieldValues, Path } from "react-hook-form";

// // Reusable Form Input Component
// export const FormInput = React.memo(({ control, name, label, placeholder, type="text", readOnly, className }: 
//     { control: any; name: string; label?: string; placeholder?: string; type?:string; readOnly?: boolean; className?: string }
//   ) => (
//     <FormField
//       control={control}
//       name={name}
//       render={({ field }) => (
//         <FormItem className={className}>
//           {label && <FormLabel className="text-black/70">{label}</FormLabel>}
//           <FormControl>
//             <Input className={className} type={type} placeholder={placeholder} {...field} readOnly={readOnly}
//             onKeyDown={(e) => {
//               // Prevent non-numeric key presses (except Backspace, Tab, etc.)
//               if (
//                 !/[0-9]/.test(e.key) && 
//                 !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) && 
//                 type === 'number'
//               ) {
//                 e.preventDefault();
//               }
//             }}/>
//           </FormControl>
//           <FormMessage />
//         </FormItem>
//       )}
//     />
//   ));

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

interface FormInputProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  className?: string;
  // Number input specific props
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
}

// Reusable Form Input Component
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
  maxLength
}: FormInputProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        {label && <FormLabel className="text-black/70">{label}</FormLabel>}
        <FormControl>
          <Input 
            className={className} 
            type={type} 
            placeholder={placeholder} 
            {...field}
            value={field.value ?? ''}
            readOnly={readOnly}
            min={type === 'number' ? min : undefined}
            max={type === 'number' ? max : undefined}
            step={type === 'number' ? step : undefined}
            maxLength={maxLength}
            onKeyDown={(e) => {
              // For number inputs, prevent non-numeric key presses (except control keys)
              if (type === 'number') {
                const allowedKeys = [
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End'
                ];
                
                const isNumber = /[0-9]/.test(e.key);
                const isDecimal = e.key === '.' && !field.value?.toString().includes('.');
                const isMinus = e.key === '-' && (!field.value || field.value.toString().length === 0);
                const isControlKey = allowedKeys.includes(e.key);
                const isCtrlA = e.ctrlKey && e.key === 'a';
                const isCtrlC = e.ctrlKey && e.key === 'c';
                const isCtrlV = e.ctrlKey && e.key === 'v';
                const isCtrlX = e.ctrlKey && e.key === 'x';
                const isCtrlZ = e.ctrlKey && e.key === 'z';
                
                if (!(isNumber || isDecimal || isMinus || isControlKey || isCtrlA || isCtrlC || isCtrlV || isCtrlX || isCtrlZ)) {
                  e.preventDefault();
                }
              }
            }}
            onChange={(e) => {
              let value = e.target.value;
              
              // Handle number type validation
              if (type === 'number') {
                // Remove any non-numeric characters except decimal point and minus
                value = value.replace(/[^0-9.-]/g, '');
                
                // Ensure only one decimal point
                const parts = value.split('.');
                if (parts.length > 2) {
                  value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                // Ensure minus only at the beginning
                if (value.includes('-')) {
                  const minusCount = (value.match(/-/g) || []).length;
                  if (minusCount > 1 || (value.indexOf('-') > 0)) {
                    value = value.replace(/-/g, '');
                    if (field.value?.toString().startsWith('-')) {
                      value = '-' + value;
                    }
                  }
                }
                
                // Apply min/max constraints
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  if (min !== undefined && numValue < min) {
                    value = min.toString();
                  } else if (max !== undefined && numValue > max) {
                    value = max.toString();
                  }
                }
              }
              
              // Apply maxLength constraint
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

FormInput.displayName = 'FormInput';