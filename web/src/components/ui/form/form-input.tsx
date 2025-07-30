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

// Reusable Form Input Component
export const FormInput = React.memo(({ control, name, label, placeholder, type="text", readOnly, className }: 
    { control: any; name: string; label?: string; placeholder?: string; type?:string; readOnly?: boolean; className?: string }
) => (
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
                        readOnly={readOnly}
                        onKeyDown={(e) => {
                            // Allow numbers, decimal point, and control keys
                            if (type === 'number') {
                                const allowedKeys = [
                                    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                                    '.', // Allow decimal point
                                    'Backspace', 'Delete', 'Tab', 
                                    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                    'Home', 'End'
                                ];
                                
                                // Also allow Ctrl/Command + A, C, V, X, Z
                                const isCtrlCombination = (
                                    e.ctrlKey || e.metaKey
                                ) && (
                                    e.key === 'a' || 
                                    e.key === 'c' || 
                                    e.key === 'v' || 
                                    e.key === 'x' ||
                                    e.key === 'z'
                                );
                                
                                if (!allowedKeys.includes(e.key) && !isCtrlCombination) {
                                    e.preventDefault();
                                }
                                
                                // Prevent multiple decimal points
                                if (e.key === '.' && field.value?.includes?.('.')) {
                                    e.preventDefault();
                                }
                            }
                        }}
                        onChange={(e) => {
                            if (type === 'number') {
                                // Ensure the value is a valid number or empty string
                                const value = e.target.value;
                                if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                                    field.onChange(value);
                                }
                            } else {
                                field.onChange(e);
                            }
                        }}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
));