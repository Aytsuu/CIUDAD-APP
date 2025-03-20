"use client"
import { useState } from 'react';
import {Input} from '../../../../components/ui/input.tsx';
import {Label} from '../../../../components/ui/label.tsx';
import {DatePicker} from '../../../../components/ui/datepicker.tsx';
import {Textarea} from '../../../../components/ui/textarea.tsx';
import {Button} from '../../../../components/ui/button/button.tsx';
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft } from 'lucide-react';

import { Link } from 'react-router';


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import minutesOfMeetingFormSchema from '@/form-schema/minutesOfMeetingSchema.ts';
import Tiptap from '@/components/ui/tiptap/tiptap.tsx';


function AddMinutesOfMeeting() {
    const form = useForm<z.infer<typeof minutesOfMeetingFormSchema>>({
        resolver: zodResolver(minutesOfMeetingFormSchema),
        mode: 'onChange',
        defaultValues: {
            meetingTitle: "",        
            meetingAgenda: "",
            meetingDate: "",
            meetingDescription: "",
            meetingAreaOfFocus: [],
        },
    });

    let meetingAreaOfFocus = [
        "Council", "GAD", 
        "Waste Committee", "Finance"
    ];

    function onSubmit(values: z.infer<typeof minutesOfMeetingFormSchema>) {
        console.log("Values", values);
    }


    return (
        <div className="flex p-5 w-full mx-auto h-full justify-center">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="text-[#394360] pb-2">
                        <Link to="/mom-page">
                            <Button 
                                className="text-black p-2 self-start"
                                variant={"outline"}
                            >
                                <ChevronLeft />
                            </Button>                              
                        </Link>
                    </div>

                    {/* Ordinance Description Field */}
                    <FormField
                        control={form.control}
                        name="meetingDescription"
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
                            className="max-w-[30%] h-[460px] flex flex-col overflow-auto scrollbar-custom"
                            title="Meeting Details"
                            description="Add details."
                            mainContent={
                                <div>
                                    {/* Form Inside Dialog */}
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            {/* Ordinance Title Field */}
                                            <FormField
                                                control={form.control}
                                                name="meetingTitle"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Meeting Title</FormLabel>
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

                                            {/* Ordinance Meeting Agenda */}
                                            <FormField
                                                control={form.control}
                                                name="meetingAgenda"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Meeting Agenda</FormLabel>
                                                        <FormControl>
                                                            {/* <Input placeholder="Enter Event Title" {...field} /> */}
                                                            <Textarea
                                                                className="w-full p-2 shadow-sm h-20 mt-[12px] rounded-[5px] resize-none"
                                                                placeholder="Enter Meeting Agenda"
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
                                                name="meetingDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Date</FormLabel>
                                                        <FormControl>
                                                            <input type="date" {...field} className="mt-[8px] w-full border border-[#B3B7BD] p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-[3px]" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Categories Field */}
                                            <Accordion type="single" collapsible>
                                                <AccordionItem value="category-list">
                                                    <AccordionTrigger>Select Area of Focus</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-2">
                                                            {meetingAreaOfFocus.map((area, index) => (
                                                                <FormField
                                                                    key={index}
                                                                    control={form.control}
                                                                    name="meetingAreaOfFocus"
                                                                    render={({ field }) => {
                                                                        const selectedCategory = field.value ?? [];
                                                                        return (
                                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0.5">
                                                                                <FormControl>
                                                                                    <Checkbox
                                                                                        id={`area-${index}`}
                                                                                        className="h-5 w-5"
                                                                                        checked={selectedCategory.includes(area)}
                                                                                        onCheckedChange={(checked) => {
                                                                                            field.onChange(
                                                                                                checked
                                                                                                    ? [...selectedCategory, area]
                                                                                                    : selectedCategory.filter((name: string) => name !== area)
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormLabel
                                                                                    htmlFor={`area-${index}`}
                                                                                    className="cursor-pointer whitespace-normal break-words flex-1"
                                                                                    style={{ wordBreak: "break-all" }} // Ensures long words break
                                                                                >
                                                                                    {area}
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        );
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>                                            

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

export default AddMinutesOfMeeting;
