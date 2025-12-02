import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form/form";
import { Textarea } from "../textarea";

interface FormTextAreaProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}

export const FormTextArea = React.memo(({ 
  control, 
  name, 
  label, 
  placeholder, 
  readOnly, 
  className,
  rows = 2,
  onChange,
  required = false
}: FormTextAreaProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        {label && <FormLabel className="text-black/70">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </FormLabel>}
        <FormControl>
          <Textarea 
            placeholder={placeholder} 
            {...field}
            onChange={(e) => {
              field.onChange(e); 
              if (onChange) {
                onChange(e); 
              }
            }}
            readOnly={readOnly}
            rows={rows}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));

