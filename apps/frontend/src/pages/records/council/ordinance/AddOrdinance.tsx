"use client"
import { useState } from 'react';
import {Input} from '../../../../components/ui/input.tsx';
import {Label} from '../../../../components/ui/label.tsx';
import {DatePicker} from '../../../../components/ui/datepicker.tsx';
import {Textarea} from '../../../../components/ui/textarea.tsx';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,SelectLabel,SelectSeparator,SelectGroup} from "../../../../components/ui/select/select.tsx";
import {Button} from '../../../../components/ui/button.tsx';
import {FilterAccordion} from '../../../../components/ui/filter-accordion.tsx'
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ordinanceFormSchema from '@/form-schema/ordinanceForm-schema.ts';
import Tiptap from '@/components/ui/tiptap/tiptap.tsx';

// function AddOrdinancePage(){

//     //css for the 1st modal of adding the event
//     const inputlabelcss = "block text-sm font-medium text-gray-700 mb-1";
//     const inputcss = "mt-[12px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]";
//     const textbuttoncss = "text-[#394360] text-lg font-medium cursor-pointer";

//     //css for the checkbox part
//     const labelText = "block text-xs font-medium text-gray-700";
//     const checkboxcss = "size-5";
//     const checkboxclass = "inline-flex items-center gap-2";



//     const form = useForm<z.infer<typeof ordinanceFormSchema>>({
//         resolver: zodResolver(ordinanceFormSchema),
//         mode: 'onChange',
//         defaultValues: {
//             ordTitle: "",        
//             ordDate: "",
//             ordDescription: "",
//         },
//     });

//     function onSubmit(values: z.infer<typeof ordinanceFormSchema>) {
//         // Do something with the form values.
//         // ✅ This will be type-safe and validated.
//         console.log("Values",values)
//     }


//     return(
//         <div>
//             <div className="flex p-5 w-full mx-auto h-full justify-center">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <div className="text-center font-bold text-[#394360] text-[30px]">
//                             <h1>Create Ordinance</h1>
//                         </div>
                        

//                         <FormField
//                             control={form.control}
//                             name="ordDescription"
//                             render={({ field }) => (
//                                 <FormItem>
//                                 <FormLabel></FormLabel>
//                                 <FormControl>
//                                         <Tiptap description={field.value} onChange={field.onChange}/>
//                                 </FormControl>
//                                 <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

                        
//                         <div className="flex items-center justify-end p-[40px]">
//                             {/* <Button type="submit" className="w-[100px]">
//                                 Create                                                                                                                          
//                             </Button>   */}
//                             <DialogLayout
//                                 trigger={<div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor -pointer flex items-center"> Next </div>}
//                                 className="max-w-[55%] h-[340px] flex flex-col overflow-auto scrollbar-custom"
//                                 title="Ordinance Details"
//                                 description="Add details."
//                                 mainContent={
//                                     <div>
//                                         <div>
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordTitle"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                     <FormLabel>Ordinance Title</FormLabel>
//                                                     <FormControl>
//                                                         <Input placeholder="Enter Event Title" className={inputcss} {...field}></Input>
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                         </div>
//                                         <div className="mt-[20px]">
//                                             <FormField
//                                                 control={form.control}
//                                                 name="ordDate"
//                                                 render={({ field }) => (
//                                                     <FormItem>
//                                                     <FormLabel>Date Approved</FormLabel>
//                                                     <FormControl>
//                                                         <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
//                                                     </FormControl>
//                                                     <FormMessage />
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                         </div>
//                                         <div className="flex items-center justify-end pt-8">
//                                         <Button type="submit" className="w-[100px]">
//                                             Create                                                                                                                          
//                                         </Button>                                              
//                                         </div>                                        
//                                     </div>
//                                 }
//                             />                                                  
//                         </div>                                                                                
//                    </form>
//                 </Form>                
//             </div>
//         </div>
//     );
// }
// export default AddOrdinancePage


function AddOrdinancePage() {
    const form = useForm<z.infer<typeof ordinanceFormSchema>>({
        resolver: zodResolver(ordinanceFormSchema),
        mode: 'onChange',
        defaultValues: {
            ordTitle: "",        
            ordDate: "",
            ordDescription: "",
        },
    });

    function onSubmit(values: z.infer<typeof ordinanceFormSchema>) {
        console.log("Values", values);
    }

    return (
        <div className="flex p-5 w-full mx-auto h-full justify-center">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="text-center font-bold text-[#394360] text-[30px]">
                        <h1>Create Ordinance</h1>
                    </div>

                    {/* Ordinance Description Field */}
                    <FormField
                        control={form.control}
                        name="ordDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel></FormLabel>
                                <FormControl>
                                    <Tiptap description={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-end p-[40px]">
                        {/* Dialog with Form Inside */}
                        <DialogLayout
                            trigger={
                                <div className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-6 py-2 rounded-md cursor-pointer flex items-center">
                                    Next
                                </div>
                            }
                            className="max-w-[30%] h-[380px] flex flex-col"
                            title="Ordinance Details"
                            description="Add details."
                            mainContent={
                                <div>
                                    {/* Form Inside Dialog */}
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            {/* Ordinance Title Field */}
                                            <FormField
                                                control={form.control}
                                                name="ordTitle"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ordinance Title</FormLabel>
                                                        <FormControl>
                                                            {/* <Input placeholder="Enter Event Title" {...field} /> */}
                                                            <Textarea
                                                                className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
                                                                placeholder="Enter Ordinance Title"
                                                                {...field}>
                                                            </Textarea>                                                            
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Date Approved Field */}
                                            <FormField
                                                control={form.control}
                                                name="ordDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Date Approved</FormLabel>
                                                        <FormControl>
                                                            <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Submit Button (Inside Dialog) */}
                                            <div className="flex items-center justify-end pt-4">
                                                <Button type="submit" className="w-[100px]">
                                                    Create
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>
                            }
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddOrdinancePage;
