import React from "react";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
  } from "@/components/ui/form/form";
import { SelectLayout } from "../select/select-layout";
import { Input } from "@/components/ui/input";

// Reusable Form Select Component
export const FormSelect = React.memo(({ control, name, label, options, readOnly }: 
<<<<<<< HEAD
    { control: any; name: string; label?: string; options: { id: string; name: string }[]; readOnly?: boolean }
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-black/70">{label}</FormLabel>
=======
  { control: any; name: string; label?: string; options: { id: string; name: string }[]; readOnly?: boolean }
) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => {
      // Add the console.log here
      console.log('Current field value:', field.value, 'for field:', name);
      
      return (
        <FormItem> 
          <FormLabel>{label}</FormLabel>
>>>>>>> backend/feature/healthinventory
          <FormControl>
            {!readOnly ? (
              <SelectLayout
                placeholder="Select"
                className="w-full"
                options={options}
<<<<<<< HEAD
                value={field.value.toLowerCase()}
=======
                value={field.value ? field.value.toLowerCase() : ''}
>>>>>>> backend/feature/healthinventory
                onChange={field.onChange}
              />
            ) : (
              <Input {...field} readOnly />
            )}
          </FormControl>
<<<<<<< HEAD
          <FormMessage />
        </FormItem>
      )}
    />
  ));
=======
        </FormItem>
      );
    }}
  />
));
>>>>>>> backend/feature/healthinventory
