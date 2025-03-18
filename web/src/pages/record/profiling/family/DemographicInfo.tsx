import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { familyFormSchema } from '@/form-schema/profiling-schema';
import {
    Form, 
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from '@/components/ui/form';
import { SelectLayout } from '@/components/ui/select/select-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DemographicInfo(
    {form, onSubmit}: {
    form: UseFormReturn<z.infer<typeof familyFormSchema>>,
    onSubmit: () => void,
}){

    const submit = () => {
        // Validate only the demographicInfo fields
        form.trigger("demographicInfo").then((isValid) => {
            if (isValid) {
                onSubmit(); // Proceed to the next step
            } 
        })
    };


    return (
        <div className='flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto'>
            <div className="pb-4">
                <h2 className="text-lg font-semibold">Demographic Information</h2>
                <p className="text-xs text-black/50">Fill out all necessary fields</p>
            </div>
            <Form {...form}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        submit()
                    }}
                    className="flex flex-col gap-4"
                >
                    <div className='grid grid-cols-4 gap-4'>
                        <FormField
                            control={form.control}
                            name='demographicInfo.householdNo'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    Household Number
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter your household # (e.g.,H04123)' {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='demographicInfo.building'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    Building
                                </FormLabel>
                                <FormControl>
                                    <SelectLayout
                                        placeholder='Select'
                                        className='w-full'
                                        options={[
                                            {id: "owner", name: "Owner"},
                                            {id: "renter", name: "Renter"},
                                            {id: "other", name: "Other"},
                                        ]}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='demographicInfo.indigenous'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65"> 
                                    Indigenous People
                                </FormLabel>
                                <FormControl>
                                    <SelectLayout
                                        placeholder='Select'
                                        className='w-full'
                                        options={[
                                            {id: "no", name: "No"},
                                            {id: "yes", name: "Yes"}
                                        ]}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 sm:mt-auto flex justify-end">
                        <Button type="submit" className="w-full sm:w-32">
                            Next
                        </Button>
                    </div>
                </form>
            </Form>
        </div> 
    )
}