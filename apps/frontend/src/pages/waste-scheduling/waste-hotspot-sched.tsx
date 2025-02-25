// import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectLayout } from '@/components/ui/select/select-layout';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FilterAccordion } from '@/components/ui/filter-accordion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import WasteHotspotSchema from '@/form-schema/waste-hots-form-schema';

// Define the options for sitios and announcements
const sitioOptions = [
    { id: "sitio1", label: "Sitio 1" },
    { id: "sitio2", label: "Sitio 2" },
];

const announcementOptions = [
    { id: "all", label: "All" },
    { id: "allbrgystaff", label: "All Barangay Staff" },
    { id: "residents", label: "Residents" },
    { id: "wmstaff", label: "Waste Management Staff" },
    { id: "drivers", label: "Drivers" },
    { id: "collectors", label: "Collectors" },
    { id: "watchmen", label: "Watchmen" },
];

function WasteHotSched() {
    const form = useForm<z.infer<typeof WasteHotspotSchema>>({
        resolver: zodResolver(WasteHotspotSchema),
        defaultValues: {
            date: '',
            time: '',
            additionalInstructions: '',
            selectedSitios: [], // Ensure this is an array of strings
            selectedAnnouncements: [], // Ensure this is an array of strings
            watchman: '',
        },
    });

    const onSubmit = (values: z.infer<typeof WasteHotspotSchema>) => {
        console.log(values);
        // Handle form submission
    };

    const handleResetSitios = () => {
        form.setValue('selectedSitios', []);
    };

    const handleResetAnnouncements = () => {
        form.setValue('selectedAnnouncements', []);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto">
                <Label className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">WATCHMAN FOR HOTSPOT</Label>

                <FormField
                    control={form.control}
                    name="selectedSitios"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Sitio:</Label>
                            <FilterAccordion
                                title="Select Sitio"
                                options={sitioOptions.map((option) => ({
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
                                onReset={handleResetSitios} // Pass the reset function here
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="watchman"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Watchman:</Label>
                            <FormControl>
                                <SelectLayout className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    label="Watchman"
                                    placeholder="Assign Watchman"
                                    options={[
                                        { id: '1', name: 'Watchman 1' },
                                        { id: '2', name: 'Watchman 2' }
                                    ]}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
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
                                    <Input type="date" {...field} />
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
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div><br/>

                <FormField
                    control={form.control}
                    name="additionalInstructions"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Additional Instructions:</Label>
                            <FormControl>
                                <Textarea placeholder='Enter additional instructions (if there is any)' {...field} />
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
                    <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[95%">Schedule</Button>
                </div>
            </form>
        </Form>
    );
}

export default WasteHotSched;