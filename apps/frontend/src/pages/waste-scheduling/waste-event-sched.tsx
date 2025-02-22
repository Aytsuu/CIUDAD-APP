// import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FilterAccordion } from '@/components/ui/filter-accordion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import WasteEventSchedSchema from '@/form-schema/waste-event-form-schema';

const announcementOptions = [
    { id: "all", label: "All", checked: false },
    { id: "allbrgystaff", label: "All Barangay Staff", checked: false },
    { id: "residents", label: "Residents", checked: false },
    { id: "wmstaff", label: "Waste Management Staff", checked: false },
    { id: "drivers", label: "Drivers", checked: false },
    { id: "collectors", label: "Collectors", checked: false },
    { id: "watchmen", label: "Watchmen", checked: false },
];

function WasteEventSched() {

    const form = useForm<z.infer<typeof WasteEventSchedSchema>>({
        resolver: zodResolver(WasteEventSchedSchema),
        defaultValues: {
            eventName: '',
            location: '',
            date: '',
            time: '',
            organizer: '',
            invitees: '',
            eventDescription: '',
            selectedAnnouncements: [],
        },
    });

    const handleResetAnnouncements = () => {
        form.setValue('selectedAnnouncements', []);
    };

    const onSubmit = (values: z.infer<typeof WasteEventSchedSchema>) => {
        console.log(values);
        // Handle form submission
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto">
                <Label className="block text-center text-[30px] font-medium text-[#263D67]">SCHEDULE EVENT</Label>

                <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Calendar Event Name:</Label>
                            <FormControl>
                                <Input placeholder='Enter Event Name' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Location:</Label>
                            <FormControl>
                                <Input placeholder='Enter location/venue' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <div className="grid grid-cols-2 gap-2">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Date:</Label>
                                <FormControl>
                                    <Input type="date" placeholder="Date of the event" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Time:</Label>
                                <FormControl>
                                    <Input type="time" placeholder="Time of the event" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div><br/>

                <FormField
                    control={form.control}
                    name="organizer"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Organizer:</Label>
                            <FormControl>
                                <Input placeholder='Enter event organizer' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="invitees"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Invitees:</Label>
                            <FormControl>
                                <Input placeholder='Enter invitees, participants, collaborators, etc.' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="eventDescription"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Event Description:</Label>
                            <FormControl>
                                <Textarea placeholder='Enter event description (if there is any)' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                 <FormField
                                    control={form.control}
                                    name="selectedAnnouncements"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Label>Do you want to post this schedule to the mobile app’s ANNOUNCEMENT page? If yes, select intended audience:</Label>
                                            <FilterAccordion
                                                title="Select Audience"
                                                options={announcementOptions.map((option) => ({
                                                    ...option,
                                                    checked: field.value?.includes(option.id) || false, // Use optional chaining
                                                }))}
                                                selectedCount={field.value?.length || 0} // Use optional chaining
                                                onChange={(id: string, checked: boolean) => {
                                                    const newSelected = checked
                                                        ? [...(field.value || []), id] // Provide a fallback
                                                        : (field.value || []).filter((category) => category !== id); // Provide a fallback
                                                    field.onChange(newSelected);
                                                }}
                                                onReset={handleResetAnnouncements} // Pass the reset function here
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> <br/>

                <div className="flex items-center justify-end">
                    <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[95%]">Schedule</Button>
                </div>
            </form>
        </Form>
    );
}
export default WasteEventSched;
