import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { familyFormSchema } from '@/form-schema/profiling-schema';
import { Form } from '@/components/ui/form/form';
import { FormSelect } from '@/components/ui/form/form-select';
import { Button } from '@/components/ui/button/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { LoadButton } from '@/components/ui/button/load-button';

export default function DemographicInfo(
    {form, households, onSubmit}: {
    form: UseFormReturn<z.infer<typeof familyFormSchema>>;
    households: any[]
    onSubmit: () => void
}){

    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)

    const submit = async () => {

        setIsSubmitting(true)
        const formIsValid = await form.trigger('demographicInfo');

        if (formIsValid) {
          onSubmit();
        } else {
          toast("Please fill out all required fields", {
            icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
          });
          setIsSubmitting(false)
        }
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
                        <div className='grid items-end col-span-1'>
                            <Label className="mb-1">Household</Label>
                            <Combobox 
                                options={households}
                                value={form.watch('demographicInfo.householdNo')}
                                onChange={(value) => form.setValue('demographicInfo.householdNo', value)}
                                placeholder='Search for household...'
                                contentClassName='w-[22rem]'
                            />
                        </div>
                        <FormSelect control={form.control} name='demographicInfo.building' label='Building' options={[
                            {id: "owner", name: "Owner"},
                            {id: "renter", name: "Renter"},
                            {id: "other", name: "Other"},
                        ]} readOnly={false}/>
                        
                        <FormSelect control={form.control} name='demographicInfo.indigenous' label='Inigenous People' options={[
                            {id: "no", name: "No"},
                            {id: "yes", name: "Yes"}
                        ]} readOnly={false}/>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 sm:mt-auto flex justify-end">
                        {!isSubmitting ? (<Button type="submit" className="w-full sm:w-32">
                            Next
                        </Button>) : (
                            <LoadButton>
                                Saving...
                            </LoadButton>
                        )}
                    </div>
                </form>
            </Form>
        </div> 
    )
}