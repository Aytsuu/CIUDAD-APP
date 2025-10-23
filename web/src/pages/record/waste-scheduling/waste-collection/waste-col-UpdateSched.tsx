

import { useState } from "react";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button/button';
import { Loader2 } from "lucide-react";
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Form } from '@/components/ui/form/form';
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
import { useGetWasteTrucks, type Trucks  } from './queries/wasteColFetchQueries';
import { useGetWasteSitio } from './queries/wasteColFetchQueries';
import { useUpdateWasteSchedule } from './queries/wasteColUpdateQueries';
import { useUpdateCollectors } from './queries/wasteColUpdateQueries';
import { useGetWasteCollectionSchedFull } from './queries/wasteColFetchQueries';
import { useAuth } from "@/context/AuthContext";



interface UpdateWasteColProps {
    wc_num: number;
    wc_day: string;
    wc_time: string;
    wc_add_info: string;
    wc_is_archive: boolean;
    sitio_id: string;
    truck_id: string;
    driver_id: string;
    collector_ids: string[];
    onSuccess?: () => void; 
}



const dayOptions = [
    { id: "Monday", name: "Monday" },
    { id: "Tuesday", name: "Tuesday" },
    { id: "Wednesday", name: "Wednesday" },
    { id: "Thursday", name: "Thursday" },
    { id: "Friday", name: "Friday" },
    { id: "Saturday", name: "Saturday" },
    { id: "Sunday", name: "Sunday" },
]


function UpdateWasteColSched({wc_num, wc_day, wc_time, wc_add_info, sitio_id, truck_id, driver_id, collector_ids, onSuccess } : UpdateWasteColProps) {
    
    const { user } = useAuth();

    //FETCH QUERY MUTATIONS
    const { data: collectors = [], isLoading: isLoadingCollectors } = useGetWasteCollectors();
    const { data: drivers = [], isLoading: isLoadingDrivers } = useGetWasteDrivers();
    const { data: trucks = [], isLoading: isLoadingTrucks } = useGetWasteTrucks();
    const { data: sitios = [], isLoading: isLoadingSitios } = useGetWasteSitio();
    const { data: wasteCollectionData = { results: [], count: 0 } } = useGetWasteCollectionSchedFull();

    const isLoading = isLoadingCollectors || isLoadingDrivers || isLoadingTrucks || isLoadingSitios;


    // Extract the actual data array
    const wasteSchedules = wasteCollectionData.results || [];    

    //UPDATE QUERY MUTATIONS
    const { mutate: updateSchedule } = useUpdateWasteSchedule();
    const { mutate: updateCollectors } = useUpdateCollectors();


    const collectorOptions = collectors.map(collector => ({
        id: collector.id,  
        name: `${collector.firstname} ${collector.lastname}`  
    }));

    const driverOptions = drivers.map(driver => ({
        id: driver.id,  
        name: `${driver.firstname} ${driver.lastname}`  
    }));

    const truckOptions = (trucks as Trucks[])
        .filter(truck => truck.truck_status === "Operational")
        .map(truck => ({
            id: String(truck.truck_id),
            name: `Model: ${truck.truck_model}, Plate Number: ${truck.truck_plate_num}`
    }));

    const sitioOptions = sitios.map(sitio => ({
        id: String(sitio.sitio_id),  
        name: sitio.sitio_name  
    }));


    const form = useForm<z.infer<typeof WasteColSchedSchema>>({
        resolver: zodResolver(WasteColSchedSchema),
        defaultValues: {
            day: wc_day,
            time: wc_time,
            additionalInstructions: wc_add_info,
            selectedSitios: String(sitio_id),
            selectedCollectors: collector_ids.map(String),
            driver: String(driver_id),
            collectionTruck: String(truck_id),
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (values: z.infer<typeof WasteColSchedSchema>) => {
        setIsSubmitting(true);
        try {
            const [hour, minute] = values.time.split(":");
            const formattedTime = `${hour}:${minute}:00`;

            //checks for sitio with the same day
            const selectedSitioName = sitioOptions.find(sitio => sitio.id === values.selectedSitios)?.name;    
            

            const hasSameSitioSameDay = wasteSchedules.some(schedule => 
                schedule.wc_day === values.day &&
                schedule.sitio_name === selectedSitioName &&
                schedule.wc_num !== Number(wc_num)   
            );            

            //checks for overlapping day and time
            const hasDuplicateSchedule = wasteSchedules.some(schedule => 
                schedule.wc_day === values.day && 
                schedule.wc_time === formattedTime &&
                schedule.wc_num !== Number(wc_num)   
            );  
            
            //return if there is overlapping schedule
            if (hasDuplicateSchedule) {
                
                form.setError("day", {
                    type: "manual",
                    message: `There is already a schedule for ${values.day} at ${values.time}.`,
                });          
                
                form.setError("time", {
                    type: "manual",
                    message: `There is already a schedule for ${values.day} at ${values.time}.`,
                });  

                return; 
            }           

            //return if the sitio has already a schedule for that day
            if (hasSameSitioSameDay) {
                form.setError("day", {
                    type: "manual",
                    message: `${selectedSitioName} already has a schedule on ${values.day}.`,
                });

                form.setError("selectedSitios", {
                    type: "manual",
                    message: `${selectedSitioName} already has a schedule on ${values.day}.`,
                });
                return;
            }        
      
      
            if(!values.additionalInstructions){
                values.additionalInstructions = "None";
            }

            await new Promise<void>((resolve, reject) => {
                updateSchedule({
                    wc_num,
                    values: {
                        ...values,
                        time: formattedTime,
                        staff: user?.staff?.staff_id 
                    }
                }, {
                    onSuccess: () => {
                        updateCollectors({
                            wc_num,
                            newCollectorIds: values.selectedCollectors.map(String),
                            existingCollectorIds: collector_ids.map(String)
                        }, {
                            onSuccess: () => {
                                onSuccess?.();
                                resolve();
                            },
                            onError: reject
                        });
                    },
                    onError: reject
                });
            });
        } catch (error) {
            console.error("Update failed:", error);
        } finally {
            setIsSubmitting(false);
        }
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
            <form onSubmit={(e) => e.preventDefault()}>

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
                    <FormSelect
                        control={form.control}
                        name="day"
                        label="Collection Day"
                        options={dayOptions}
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


                {/* Submit Button */}
                <div className="flex items-center justify-end mt-6">
                    <ConfirmationModal
                        trigger={
                            <Button 
                                type="button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update"
                                )}
                            </Button>
                        }
                        title="Confirm Update"
                        description="Are you sure you want to update this waste collection schedule?"
                        actionLabel={isSubmitting ? "Updating..." : "Confirm"}
                        onClick={() => form.handleSubmit(onSubmit)()}
                    />
                </div>
            </form>
        </Form>
    );
}

export default UpdateWasteColSched;