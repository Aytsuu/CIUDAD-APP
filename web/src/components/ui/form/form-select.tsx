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
export const FormSelect = React.memo(({  control, name, label, options, readOnly, className 
}: { 
    control: any; 
    name: string; 
    label?: string; 
    options: { id: string; name: string }[]; 
    readOnly?: boolean;
    className?: string;
}) => (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className={className}>
                {label && <FormLabel className="text-black/70">{label}</FormLabel>}
                <FormControl>
                    {!readOnly ? (
                        <SelectLayout
                            placeholder="Select"
                            className="w-full"
                            options={options}
                            value={field.value}
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
