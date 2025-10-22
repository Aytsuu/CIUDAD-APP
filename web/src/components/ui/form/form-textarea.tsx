import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
}

export const FormTextarea = React.memo(({ 
  control, 
  name, 
  label, 
  placeholder, 
  readOnly, 
  className,
  rows = 3,
  maxLength
}: FormTextareaProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        {label && <FormLabel className="text-black/70">{label}</FormLabel>}
        <FormControl>
          <Textarea 
            className={cn("", className)} 
            placeholder={readOnly ? "" : placeholder} 
            rows={rows}
            {...field}
            value={field.value ?? ''}
            readOnly={readOnly}
            maxLength={maxLength}
            onChange={(e) => {
              let value = e.target.value;
              
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
