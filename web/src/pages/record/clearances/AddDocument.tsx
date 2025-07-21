// import { useState } from 'react';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label.tsx';
// import { DatePicker } from '@/components/ui/datepicker.tsx';
// import { Textarea } from '@/components/ui/textarea.tsx';
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup } from "@/components/ui/select/select.tsx";
import { Button } from '@/components/ui/button/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
// import { SelectLayout } from "@/components/ui/select/select-layout";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import CreateDocumentSchema from "@/form-schema/CreateDocumentSchema";
import Tiptap from '@/components/ui/tiptap/tiptap.tsx';

function AddDocument() {
    // CSS for the form inputs
    const inputcss = "mt-[12px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]";

    // Initialize the form
    const form = useForm<z.infer<typeof CreateDocumentSchema>>({
        resolver: zodResolver(CreateDocumentSchema),
        mode: 'onChange',
        defaultValues: {
            Title: "",
            Date: "",
            Description: "",
        },
    });

    // Handle form submission
    function onSubmit(values: z.infer<typeof CreateDocumentSchema>) {
        console.log(values); // Log the form values
    }

    return (
        <div>
            <div className="flex p-5 w-full mx-auto h-full justify-center">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="text-center font-bold text-[#394360] text-[30px] pt-10">
                            <h1>Create Document</h1>
                        </div>

                        {/* Title Field */}
                        <FormField
                            control={form.control}
                            name="Title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Ordinance Title" className="w-96" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        
                        {/* Description Field (Tiptap Editor) */}
                        <FormField
                            control={form.control}
                            name="Description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Document Details</FormLabel>
                                    <FormControl>
                                        <Tiptap
                                            description={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="flex items-center justify-end p-[40px]">
                            <Button type="submit" className="w-[100px]">
                                Create
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default AddDocument;