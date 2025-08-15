import { Label } from '@/components/ui/label';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Button } from '@/components/ui/button/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
import { WasteHotspotSchema } from '@/form-schema/waste-hots-form-schema';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input';
import { useGetWatchman } from './queries/hotspotFetchQueries';
import { useGetSitio } from './queries/hotspotFetchQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddHotspot } from './queries/hotspotInsertQueries';

const announcementOptions = [
    { id: "all", label: "All" },
    { id: "allbrgystaff", label: "All Barangay Staff" },
    { id: "residents", label: "Residents" },
    { id: "wmstaff", label: "Waste Management Staff" },
    { id: "drivers", label: "Drivers" },
    { id: "collectors", label: "Collectors" },
    { id: "watchmen", label: "Watchmen" },
];

function WasteHotSched({onSuccess}: {
    onSuccess?: () => void;
}) {
    const {mutate: addHotspotAssignment} = useAddHotspot(onSuccess);
    const {data : fetchedWatchman = [], isLoading: isLoadingWatchman} = useGetWatchman();
    const {data: fetchedSitio = [], isLoading: isLoadingSitio} = useGetSitio();
    const watchmanOptions = fetchedWatchman.map(watchman => ({
        id: watchman.id,  
        name: `${watchman.firstname} ${watchman.lastname}`  
    }));
    const sitioOptions = fetchedSitio.map(sitio => ({
        id: sitio.sitio_id,  
        name: sitio.sitio_name 
    }));


    const form = useForm<z.infer<typeof WasteHotspotSchema>>({
        resolver: zodResolver(WasteHotspotSchema),
        defaultValues: {
            date: '',
            start_time: '',
            end_time: '',
            additionalInstructions: '',
            sitio: '', 
            selectedAnnouncements: [], 
            watchman: '',
        },
    });

    const onSubmit = (values: z.infer<typeof WasteHotspotSchema>) => {
        console.log('Values:', values)
        addHotspotAssignment(values)    
    };

    // const handleResetAnnouncements = () => {
    //     form.setValue('selectedAnnouncements', []);
    // };

    if(isLoadingSitio || isLoadingWatchman){
         return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
                {/* Watchman Selection */}
                <FormSelect
                    control={form.control}
                    name="watchman"
                    label="Watchman"
                    options={watchmanOptions}
                />

                {/* Sitio Selection */}
                <FormSelect
                    control={form.control}
                    name="sitio"
                    label="Sitio"
                    options={sitioOptions}
                />

                {/* Date and Time */}
                <FormDateTimeInput
                    control={form.control}
                    name="date"
                    type="date"
                    label="Date"
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} 
                />


                <FormDateTimeInput
                    control={form.control}
                    name="start_time"
                    type="time"
                    label="Start Time"
                />

                <FormDateTimeInput
                    control={form.control}
                    name="end_time"
                    type="time"
                    label="End Time"
                />
    
                {/* Additional Instructions */}
                <FormTextArea
                    control={form.control}
                    name="additionalInstructions"
                    label="Additional Instructions"
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
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Form>
    );
}

export default WasteHotSched;