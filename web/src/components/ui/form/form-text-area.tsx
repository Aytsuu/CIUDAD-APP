import React from "react";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form/form";
import { Textarea } from "../textarea";

// Reusable Form Input Component
export const FormTextArea = React.memo(({ control, name, label, placeholder, readOnly, className }: 
    { control: any; name: string; label: string; placeholder?: string; readOnly?: boolean; className?: string }
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-black/70">{label}</FormLabel>
          <FormControl>
            <Textarea placeholder={placeholder} {...field} readOnly={readOnly} rows={5}/>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ));