
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form/form';
import { FormComboCheckbox } from '@/components/ui/form/form-combo-checkbox';
import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input';
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormSelect } from "@/components/ui/form/form-select";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import WasteColSchedSchema from '@/form-schema/waste-col-form-schema';
import { useGetWasteCollectors } from './queries/wasteColFetchQueries';
import { useGetWasteDrivers } from './queries/wasteColFetchQueries';
import { useGetWasteTrucks } from './queries/wasteColFetchQueries';
import { useGetWasteSitio } from './queries/wasteColFetchQueries';
import { useCreateWasteSchedule } from './queries/wasteColAddQueries';
import { useAssignCollectors } from './queries/wasteColAddQueries';
import { useAuth } from "@/context/AuthContext";



interface WasteColSchedProps {
    onSuccess?: () => void;
}

const announcementOptions = [
    { id: "all", label: "All" },
    { id: "allbrgystaff", label: "All Barangay Staff" },
    { id: "residents", label: "Residents" },
    { id: "wmstaff", label: "Waste Management Staff" },
    { id: "drivers", label: "Drivers" },
    { id: "collectors", label: "Collectors" },
    { id: "watchmen", label: "Watchmen" },
];


function WasteColSched({ onSuccess }: WasteColSchedProps) {

    const { user } = useAuth();

    //ADD QUERY MUTATIONS
    const { mutate: createSchedule } = useCreateWasteSchedule();
    const { mutate: assignCollectors, isPending } = useAssignCollectors();



    //FETCH QUERY MUTATIONS
    const { data: collectors = [], isLoading: isLoadingCollectors } = useGetWasteCollectors();
    const { data: drivers = [], isLoading: isLoadingDrivers } = useGetWasteDrivers();
    const { data: trucks = [], isLoading: isLoadingTrucks } = useGetWasteTrucks();
    const { data: sitios = [], isLoading: isLoadingSitios } = useGetWasteSitio();

    const isLoading = isLoadingCollectors || isLoadingDrivers || isLoadingTrucks || isLoadingSitios;


    const collectorOptions = collectors.map(collector => ({
        id: collector.id,  
        name: `${collector.firstname} ${collector.lastname}`  
    }));

    const driverOptions = drivers.map(driver => ({
        id: driver.id,  
        name: `${driver.firstname} ${driver.lastname}`  
    }));

    const truckOptions = trucks.filter(truck => truck.truck_status == "Operational").map(truck => ({
        id: String(truck.truck_id),
        name: `Model: ${truck.truck_model}, Plate Number: ${truck.truck_plate_num}`,
    }));

    const sitioOptions = sitios.map(sitio => ({
        id: String(sitio.sitio_id),  
        name: sitio.sitio_name  
    }));


    const form = useForm<z.infer<typeof WasteColSchedSchema>>({
        resolver: zodResolver(WasteColSchedSchema),
        defaultValues: {
            date: '',
            time: '',
            additionalInstructions: '',
            selectedSitios: '',
            selectedCollectors: [],
            driver: '',
            collectionTruck: '',
            selectedAnnouncements: [],
        },
    });

    const onSubmit = (values: z.infer<typeof WasteColSchedSchema>) => {
        const [hour, minute] = values.time.split(":");
        const formattedTime = `${hour}:${minute}:00`;

        if(!values.additionalInstructions){
            values.additionalInstructions = "None";
        }

        createSchedule({
            ...values,
            time: formattedTime,
            staff: user?.staff?.staff_id
        }, {
            onSuccess: (wc_num) => {
                assignCollectors({
                    wc_num: wc_num,
                    collectorIds: values.selectedCollectors
                });
                onSuccess?.();
            }
        });
    };


    if (isLoading) {
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
            <form onSubmit={form.handleSubmit(onSubmit)}>

                <div className="grid grid-cols-2 gap-4 pt-5">
                    {/* Sitio Selection */}

                    <FormSelect
                        control={form.control}
                        name="selectedSitios"
                        label="Sitio"
                        options={sitioOptions}
                    />

                    {/* Collectors Selection */}
                    <FormComboCheckbox
                        control={form.control}
                        name="selectedCollectors"
                        label="Collectors"
                        options={collectorOptions}
                    />


                    {/* Driver Selection */}
                    <FormSelect
                        control={form.control}
                        name="driver"
                        label="Driver"
                        options={driverOptions}
                    />


                    {/* Truck Selection */}
                    <FormSelect
                        control={form.control}
                        name="collectionTruck"
                        label="Collection Truck"
                        options={truckOptions}
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
                        name="time"
                        type="time"
                        label="Time"
                    />

                </div>
               

                {/* Additional Instructions */}
                <div className="pt-4">
                    <FormTextArea
                        control={form.control}
                        name="additionalInstructions"
                        label="Additional Instructions"
                        placeholder="Enter additional instructions (if there is any)"
                    />
                </div>



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
                    <Button type="submit" className="hover:bg-blue hover:opacity-[95%] w-full sm:w-auto" disabled={isPending}>
                        {isPending ? "Submitting..." : "Schedule"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default WasteColSched;