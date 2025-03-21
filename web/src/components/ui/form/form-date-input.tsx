import React from "react";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form/form";

// Reusable Form Date Input Component
export const FormDateInput = React.memo(({ control, name, label, readOnly }: 
    { control: any; name: string; label: string; readOnly: boolean;}
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <input
              type="date"
              className="bg-white border w-full p-1.5 rounded-md text-[14px] shadow-sm"
              {...field}
              readOnly={readOnly}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ));