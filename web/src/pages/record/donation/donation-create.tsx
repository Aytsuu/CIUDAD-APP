import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form/form';
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from '@/components/ui/form/form-select';
import { FormDateInput } from '@/components/ui/form/form-date-input'; 
import ClerkDonateCreateSchema from '@/form-schema/donate-create-form-schema';

function ClerkDonateCreate() {
    const form = useForm<z.infer<typeof ClerkDonateCreateSchema>>({
        resolver: zodResolver(ClerkDonateCreateSchema),
        defaultValues: {
            don_donorfname: '', 
            don_donorlname: '',
            don_item_name: '',
            don_qty: '', 
            don_description: '',
            don_category: '',
            don_receiver: '', 
            don_date: new Date().toISOString().split('T')[0], 
        },
    });

    const onSubmit = (values: z.infer<typeof ClerkDonateCreateSchema>) => {
        console.log(values);
        // Handle form submission
    };

    return (
        <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
            <div className="pb-2">
                <h2 className="text-lg font-semibold">ADD DONATION</h2>
                <p className="text-xs text-black/50">Fill out all necessary fields</p>
            </div>
            <div className="grid gap-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* Donor First Name */}
                        <FormInput
                            control={form.control}
                            name="don_donorfname"
                            label="Donor First Name"
                            placeholder="Enter donor's first name"
                            readOnly={false}
                        />

                        {/* Donor Last Name */}
                        <FormInput
                            control={form.control}
                            name="don_donorlname"
                            label="Donor Last Name"
                            placeholder="Enter donor's last name"
                            readOnly={false}
                        />

                        {/* Item Name */}
                        <FormInput
                            control={form.control}
                            name="don_item_name"
                            label="Item Name"
                            placeholder="Enter item name"
                            readOnly={false}
                        />

                        {/* Quantity */}
                        <FormInput
                            control={form.control}
                            name="don_qty"
                            label="Quantity"
                            placeholder="Enter quantity"
                            readOnly={false}
                        />

                        {/* Category */}
                        <FormSelect
                            control={form.control}
                            name="don_category"
                            label="Category"
                            options={[
                                { id: 'Category 1', name: 'Category 1' },
                                { id: 'Category 2', name: 'Category 2' },
                            ]}
                            readOnly={false}
                        />

                        {/* Receiver */}
                        <FormSelect
                            control={form.control}
                            name="don_receiver"
                            label="Receiver"
                            options={[
                                { id: 'Employee 1', name: 'Employee 1' },
                                { id: 'Employee 2', name: 'Employee 2' },
                            ]}
                            readOnly={false}
                        />

                        {/* Item Description */}
                        <FormInput
                            control={form.control}
                            name="don_description"
                            label="Item Description"
                            placeholder="Enter item description"
                            readOnly={false}
                        />

                        {/* Donation Date */}
                        <FormDateInput
                            control={form.control}
                            name="don_date"
                            label="Donation Date"
                            readOnly={false}
                        />

                        {/* Submit Button */}
                        <div className="mt-8 flex justify-end gap-3">
                            <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[95%]">
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default ClerkDonateCreate;