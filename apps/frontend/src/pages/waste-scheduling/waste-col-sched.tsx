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
import WasteColSchedSchema from '@/form-schema/waste-col-form-schema';

// Define the options for sitios, collectors, and announcements
const sitioOptions = [
    { id: "sitio1", label: "Sitio 1" },
    { id: "sitio2", label: "Sitio 2" },
];

const collectorsOptions = [
    { id: "col1", label: "Collector 1" },
    { id: "col2", label: "Collector 2" },
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

function WasteColSched() {
    const form = useForm<z.infer<typeof WasteColSchedSchema>>({
        resolver: zodResolver(WasteColSchedSchema),
        defaultValues: {
            date: '',
            time: '',
            additionalInstructions: '',
            selectedSitios: [],
            selectedCollectors: [],
            driver: '',
            selectedAnnouncements: [],
        },
    });

    const onSubmit = (values: z.infer<typeof WasteColSchedSchema>) => {
        console.log(values);
        // Handle form submission
    };

    const handleResetSitios = () => {
        form.setValue('selectedSitios', []);
    };

    const handleResetCollectors = () => {
        form.setValue('selectedCollectors', []);
    };

    const handleResetAnnouncements = () => {
        form.setValue('selectedAnnouncements', []);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto">
                <Label className="block text-center text-[30px] font-medium text-[#263D67]">SCHEDULE WASTE COLLECTION</Label>

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
                                    checked: field.value?.includes(option.id) || false,
                                }))}
                                selectedCount={field.value?.length || 0}
                                onChange={(id: string, checked: boolean) => {
                                    const newSelected = checked
                                        ? [...(field.value || []), id]
                                        : (field.value || []).filter((category) => category !== id);
                                    field.onChange(newSelected);
                                }}
                                onReset={handleResetSitios}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="selectedCollectors"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Collectors:</Label>
                            <FilterAccordion
                                title="Select Collectors"
                                options={collectorsOptions.map((option) => ({
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
                                onReset={handleResetCollectors}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                /><br/>

                <FormField
                    control={form.control}
                    name="driver"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Driver:</Label>
                            <FormControl>
                                <SelectLayout className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    label="Select Driver"
                                    placeholder="Select Driver"
                                    options={[
                                        { id: 'Driver 1', name: 'Driver 1' },
                                        { id: 'Driver 2', name: 'Driver 2' }
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
                /><br/>

                <div className="flex items-center justify-end">
                    <Button type="submit" className="bg-blue hover:bg-blue hover:opacity-[95%">Schedule</Button>
                </div>
            </form>
        </Form>
    );
}

export default WasteColSched;