import React from "react";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form/form";
import { Input } from "@/components/ui/input";

// Reusable Form Input Component
export const FormInput = React.memo(({ control, name, label,type="text" , placeholder, readOnly, className }: 
    { control: any; name: string; label: string; type?: string; placeholder?: string; readOnly?: boolean; className?: string }
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-black/70">{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} readOnly={readOnly}
            onKeyDown={(e) => {
              // Prevent non-numeric key presses (except Backspace, Tab, etc.)
              if (
                !/[0-9]/.test(e.key) && 
                !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key) && 
                type === 'number'
              ) {
                e.preventDefault();
              }
            }}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ));