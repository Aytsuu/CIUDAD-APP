import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { Textarea } from "../textarea";

export const FormTextArea = React.memo(({ 
  control, 
  name, 
  label, 
  placeholder, 
  readOnly, 
  className,
  rows = 2 // Default rows if not specified
}: { 
  control: any; 
  name: string; 
  label: string; 
  placeholder?: string; 
  readOnly?: boolean; 
  className?: string;
  rows?: number;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="text-black/70">{label}</FormLabel>
        <FormControl>
          <Textarea 
            placeholder={placeholder} 
            {...field} 
            readOnly={readOnly}
            rows={rows}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));