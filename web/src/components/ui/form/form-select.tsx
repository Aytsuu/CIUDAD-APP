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

<<<<<<< HEAD
// Reusable Form Select Component with integrated loading/empty states
export const FormSelect = React.memo(({ 
    control, 
    name, 
    label, 
    options, 
    readOnly,
    isLoading = false,
    emptyMessage = "No options available"
}: { 
    control: any; 
    name: string; 
    label?: string; 
    options: { id: string; name: string }[]; 
    readOnly?: boolean;
    isLoading?: boolean;
    emptyMessage?: string;
}) => {
    // Combine loading and empty states into the options
    const selectOptions = React.useMemo(() => {
        if (isLoading) {
            return [{ id: "__loading__", name: "Loading vaccines..." }];
        }
        if (options.length === 0) {
            return [{ id: "__empty__", name: emptyMessage }];
        }
        return options;
    }, [options, isLoading, emptyMessage]);

    // Determine if the select should be disabled
    const isDisabled = readOnly || isLoading || options.length === 0;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-black/70">{label}</FormLabel>
                    <FormControl>
                        {!readOnly ? (
                            <SelectLayout
                                placeholder="Select "
                                className="w-full"
                                options={selectOptions}
                                value={field.value}
                                onChange={(value) => {
                                    // Prevent selection of loading/empty messages
                                    if (value !== "__loading__" && value !== "__empty__") {
                                        field.onChange(value);
                                    }
                                }}
                            />
                        ) : (
                            <Input {...field} readOnly />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
});
=======
// Reusable Form Select Component
export const FormSelect = React.memo(({ control, name, label, options, readOnly }: 
  { control: any; name: string; label?: string; options: { id: string; name: string }[]; readOnly?: boolean }
) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
        <FormItem>
          <FormLabel className="text-black/70">{label}</FormLabel>
          <FormControl>
            {!readOnly ? (
              <SelectLayout
                placeholder="Select"
                className="w-full"
                options={options}
                value={field.value?.toLowerCase() ?? ""}
                onChange={field.onChange}
              />
            ) : (
              <Input {...field} readOnly />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
  />
));
>>>>>>> a89fc25e6a5ac2c76e6cd07efb80cabc48b09f0a
