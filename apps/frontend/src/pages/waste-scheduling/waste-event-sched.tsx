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
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 max-w-4xl mx-auto">
                <Label className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">SCHEDULE EVENT</Label>

                {/* Event Name */}
                <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Calendar Event Name:</Label>
                            <FormControl>
                                <Input placeholder="Enter Event Name" {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Location */}
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Location:</Label>
                            <FormControl>
                                <Input placeholder="Enter location/venue" {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <Label>Date:</Label>
                                <FormControl>
                                    <Input type="date" placeholder="Date of the event" {...field} className="w-full" />
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
                                    <Input type="time" placeholder="Time of the event" {...field} className="w-full" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Organizer */}
                <FormField
                    control={form.control}
                    name="organizer"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Organizer:</Label>
                            <FormControl>
                                <Input placeholder="Enter event organizer" {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Invitees */}
                <FormField
                    control={form.control}
                    name="invitees"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Invitees:</Label>
                            <FormControl>
                                <Input placeholder="Enter invitees, participants, collaborators, etc." {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Event Description */}
                <FormField
                    control={form.control}
                    name="eventDescription"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Event Description:</Label>
                            <FormControl>
                                <Textarea placeholder="Enter event description (if there is any)" {...field} className="w-full" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Announcement Audience Selection */}
                <FormField
                    control={form.control}
                    name="selectedAnnouncements"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Do you want to post this schedule to the mobile app’s ANNOUNCEMENT page? If yes, select intended audience:</Label>
                            <FilterAccordion
                                title="Select Audience"
                                options={announcementOptions.map((option) => ({
                                    ...option,
                                    checked: field.value?.includes(option.id) || false,
                                }))}
                                selectedCount={field.value?.length || 0}
                                onChange={(id: string, checked: boolean) => {
                                    const newSelected = checked
                                        ? [...(field.value || []), id]
                                        : (field.value || []).filter((category) => category !== id);
                                    field.onChange(newSelected);
                                }}
                                onReset={handleResetAnnouncements}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <div className="flex items-center justify-end mt-6">
                    <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[95%] w-full sm:w-auto">
                        Schedule
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default WasteEventSched;