import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectLayout } from '@/components/ui/select/select-layout';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import WasteColSchedSchema from '@/form-schema/waste-col-form-schema';

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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-6 max-w-4xl mx-auto">
                <Label className="text-lg font-semibold leading-none tracking-tight text-darkBlue1">SCHEDULE WASTE COLLECTION</Label>

                {/* Sitio Selection */}
                <FormField
                    control={form.control}
                    name="selectedSitios"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Sitio:</Label>
                            <Accordion type="multiple" className="w-full">
                                <AccordionItem value="sitios">
                                    <AccordionTrigger>Select Sitio</AccordionTrigger>
                                    <AccordionContent className='flex flex-col gap-3'>
                                        {sitioOptions.map((option) => (
                                            <div key={option.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={option.id}
                                                    checked={field.value.includes(option.id)}
                                                    onCheckedChange={(checked) => {
                                                        const newSelected = checked
                                                            ? [...field.value, option.id]
                                                            : field.value.filter((id) => id !== option.id);
                                                        field.onChange(newSelected);
                                                    }}
                                                />
                                                <Label htmlFor={option.id}>{option.label}</Label>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Collectors Selection */}
                <FormField
                    control={form.control}
                    name="selectedCollectors"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Collectors:</Label>
                            <Accordion type="multiple" className="w-full">
                                <AccordionItem value="collectors">
                                    <AccordionTrigger>Select Collectors</AccordionTrigger>
                                    <AccordionContent className='flex flex-col gap-3'>
                                        {collectorsOptions.map((option) => (
                                            <div key={option.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={option.id}
                                                    checked={field.value.includes(option.id)}
                                                    onCheckedChange={(checked) => {
                                                        const newSelected = checked
                                                            ? [...field.value, option.id]
                                                            : field.value.filter((id) => id !== option.id);
                                                        field.onChange(newSelected);
                                                    }}
                                                />
                                                <Label htmlFor={option.id}>{option.label}</Label>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Driver Selection */}
                <FormField
                    control={form.control}
                    name="driver"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Driver:</Label>
                            <FormControl>
                                <SelectLayout
                                    className="w-full"
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
                                    <input type="date" {...field} className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md" />
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
                                    <input type="time" {...field} className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Additional Instructions */}
                <FormField
                    control={form.control}
                    name="additionalInstructions"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <Label>Additional Instructions:</Label>
                            <FormControl>
                                <Textarea placeholder="Enter additional instructions (if there is any)" {...field} className="w-full" />
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
                            <Accordion type="multiple" className="w-full">
                                <AccordionItem value="announcements">
                                    <AccordionTrigger>Select Audience</AccordionTrigger>
                                    <AccordionContent className='flex flex-col gap-3'>
                                        {announcementOptions.map((option) => (
                                            <div key={option.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={option.id}
                                                    checked={field.value?.includes(option.id) || false}
                                                    onCheckedChange={(checked) => {
                                                        const newSelected = checked
                                                        ? [...(field.value || []), option.id]
                                                        : (field.value || []).filter((id) => id !== option.id);
                                                        field.onChange(newSelected);
                                                    }}
                                                />
                                                <Label htmlFor={option.id}>{option.label}</Label>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
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

export default WasteColSched;