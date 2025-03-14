import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { profilingFormSchema } from '@/form-schema/profiling-schema';
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
import api from '@/api/api';



export default function DemographicInfo(
    {form, onSubmit}: {
        form: UseFormReturn<z.infer<typeof profilingFormSchema>>,
        onSubmit: () => void,
}){
    
    const [sitio, setSitio] = React.useState<{id: string, name: string}[]>([])
    const hasFetchData = React.useRef(false)

    React.useEffect(()=>{
        if(!hasFetchData.current){
            getSitio()
            hasFetchData.current = true
        }
    }, [])

    const getSitio = React.useCallback(() => {

        api
            .get('profiling/sitio/')
            .then((res) => res.data)
            .then((data) => {
                
                const sitioList = data.map((item: { sitio_id: string, sitio_name: string }) => ({ 
                    id: String(item.sitio_id), 
                    name: item.sitio_name 
                }));

                setSitio(sitioList);
            })
    }, []);

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
                        e.preventDefault(); // Prevent default form submission
                        submit(); // Manually handle submission
                      }}
                    className="flex flex-col gap-4 px-2 sm:px-6 md:px-12 lg:px-24"
                >
                    <div className='grid grid-cols-4 gap-4'>
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
                                            {id: "0", name: "Owner"},
                                            {id: "1", name: "Renter"},
                                            {id: "2", name: "Other"},
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
                            name='demographicInfo.householdNo'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    Household No.
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='' {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='demographicInfo.familyNo'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    Family No.
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='' {...field}/>
                                </FormControl>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='demographicInfo.nhts'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    NHTS Household
                                </FormLabel>
                                <FormControl>
                                    <SelectLayout
                                        placeholder='Select'
                                        className='w-full'
                                        options={[
                                            {id: "0", name: "No"},
                                            {id: "1", name: "Yes"}
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
                
                    <div className='grid grid-cols-4 gap-4 mb-6'>
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
                                            {id: "0", name: "No"},
                                            {id: "1", name: "Yes"}
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
                            name='demographicInfo.sitio'
                            render={({field}) => (
                                <FormItem>
                                <FormLabel className="font-medium text-black/65">
                                    Sitio
                                </FormLabel>
                                <FormControl>
                                    <SelectLayout
                                        placeholder='Select'
                                        className='w-full'
                                        options={sitio}
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
                        <Button type="submit" className="w-full sm:w-32" onClick={onSubmit}>
                            Next
                        </Button>
                    </div>
                </form>
            </Form>
        </div> 
    )
}