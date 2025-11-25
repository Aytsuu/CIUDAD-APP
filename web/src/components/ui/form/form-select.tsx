

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

    // Reusable Form Select Component with integrated loading/empty states
    export const FormSelect = React.memo(({ 
        control, 
        name, 
        label, 
        options, 
        readOnly,
        isLoading = false,
        placeholder,
        emptyMessage = "No options available",
        required = false
    }: { 
        control: any; 
        name: string; 
        label?: string; 
        options: { id: string; name: string }[]; 
        placeholder?: string
        readOnly?: boolean;
        isLoading?: boolean;
        emptyMessage?: string;
        required?: boolean
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

        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem>
                        {label && <FormLabel className="text-black/70">
                            {label}
                            {required && <span className="ml-1 text-red-500">*</span>}
                        </FormLabel>}
                        <FormControl>
                            {!readOnly ? (
                                <SelectLayout
                                    placeholder={placeholder || "Select"}
                                    className="w-full"
                                    options={selectOptions}
                                    value={(field.value ?? '') as string}
                                    onChange={(value) => {
                                        // Prevent selection of loading/empty messages
                                        if (value !== "__loading__" && value !== "__empty__") {
                                            field.onChange(value ?? "");
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