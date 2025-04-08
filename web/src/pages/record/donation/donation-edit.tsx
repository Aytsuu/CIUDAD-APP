// import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SelectLayout } from '@/components/ui/select/select-layout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
import ClerkDonateCreateSchema from '@/form-schema/donate-create-form-schema';

function ClerkDonateEdit() {

    const form = useForm<z.infer<typeof ClerkDonateCreateSchema>>({
        resolver: zodResolver(ClerkDonateCreateSchema),
        defaultValues: {
            donorName: '',
            itemname: '',
            itemqty: '',
            itemcategory:'',
            receiver:'',
            itemDescription: '',
        },
    });

    const onSubmit = (values: z.infer<typeof ClerkDonateCreateSchema>) => {
        console.log(values);
        // Handle form submission
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto">
                <Label className="block text-center text-[30px] font-medium text-[#263D67]">ADD DONATION</Label>

                <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Donor:</Label>
                            <FormControl>
                                <Input placeholder="Enter donor's name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="itemname"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Item Name:</Label>
                            <FormControl>
                                <Input placeholder='Enter item name' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="itemqty"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Quantity:</Label>
                            <FormControl>
                                <Input placeholder='Enter quantity' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="itemcategory"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Category:</Label>
                            <FormControl>
                                <SelectLayout className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    label=""
                                    placeholder="Select Item Category"
                                    options={[
                                        { id: 'Category 1', name: 'Category 1' },
                                        { id: 'Category 2', name: 'Category 2' }
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="receiver"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Donation Received By:</Label>
                            <FormControl>
                                <SelectLayout className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    label=""
                                    placeholder="Select employee name who received the donation"
                                    options={[
                                        { id: 'Employee 1', name: 'Employee 1' },
                                        { id: 'Employee 2', name: 'Employee 2' }
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="itemDescription"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Item Description:</Label>
                            <FormControl>
                                <Textarea placeholder='Enter item description (if there is any)' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <div className="flex items-center justify-end">
                    <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[95%]">Save</Button>
                </div>
            </form>
        </Form>
    );
}
export default ClerkDonateEdit;