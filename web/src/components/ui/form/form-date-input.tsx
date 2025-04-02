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
    { control: any; name: string; label: string; readOnly?: boolean;}
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
              className="bg-white border w-full py-1.5 px-2 rounded-md text-[14px] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...field}
              readOnly={readOnly}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ));