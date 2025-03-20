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
export const FormInput = React.memo(({ control, name, label, placeholder, readOnly, className }: 
    { control: any; name: string; label: string; placeholder: string; readOnly: boolean; className?: string }
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} readOnly={readOnly}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ));