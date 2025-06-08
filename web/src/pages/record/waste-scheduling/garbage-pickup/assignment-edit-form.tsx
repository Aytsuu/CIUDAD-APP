import { FormSelect } from "@/components/ui/form/form-select";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"
import { EditAcceptPickupRequestSchema } from "@/form-schema/garbage-pickup-schema";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { useGetDrivers } from "./queries/GarbageRequestFetchQueries";
import { useGetTrucks } from "./queries/GarbageRequestFetchQueries";
import { useGetCollectors } from "./queries/GarbageRequestFetchQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpdateAssignmentCollectorsAndSchedule } from "./queries/GarbageRequestUpdateQueries";


function EditAcceptPickupRequest({pick_id, acl_id, onSuccess,assignment
}: {
    pick_id: string;
    acl_id: string[];
    onSuccess?: () => void;
    assignment?: {
        driver?: string;
        truck?: string;
        pick_date?: string;
        pick_time?: string;
        collectors?: string[];
    };
}){

    const { mutate: updateAssignmentAndSchedule, isPending} = useUpdateAssignmentCollectorsAndSchedule()
    const { data: drivers = [], isLoading: isLoadingDrivers } = useGetDrivers();
    const { data: trucks = [], isLoading: isLoadingTrucks } = useGetTrucks();
    const { data: collectors = [], isLoading: isLoadingCollectors } = useGetCollectors();
    const isLoading = isLoadingDrivers || isLoadingTrucks || isLoadingCollectors;

    const driverOptions = drivers.map(driver => ({
        id: driver.id,  
        name: `${driver.firstname} ${driver.lastname}`  
    }));

    const truckOptions = trucks.filter(truck => truck.truck_status == "Operational").map(truck => ({
        id: String(truck.truck_id),
        name: `Model: ${truck.truck_model}, Plate Number: ${truck.truck_plate_num}`,
    }));

    const collectorOptions = collectors.map(collector => ({
        id: collector.id,  
        name: `${collector.firstname} ${collector.lastname}`  
    }));

    const onSubmit = (values: z.infer<typeof EditAcceptPickupRequestSchema>) => {
        updateAssignmentAndSchedule({
        pick_id,
        acl_ids: acl_id,
        values: {
            driver: values.driver,  
            truck: values.truck,
            date: values.date,
            time: values.time,
            collectors: values.collectors
        }
        });
    };

   const form = useForm<z.infer<typeof EditAcceptPickupRequestSchema>>({
        resolver: zodResolver(EditAcceptPickupRequestSchema),
        defaultValues: {
            driver: assignment?.driver ? String(assignment.driver) : "",
            collectors: assignment?.collectors?.map(id => String(id)) || [],
            truck: assignment?.truck ? String(assignment.truck) : "",
            date: assignment?.pick_date || "",
            time: assignment?.pick_time || "",
        }
    })

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

    return(
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormSelect
                        control={form.control}
                        name="driver"
                        label="Driver"
                        options={driverOptions}
                    />

                    <FormComboCheckbox
                        control={form.control}
                        name="collectors"
                        label="Collector(s)"
                        options={collectorOptions}
                    />

                    <FormSelect
                        control={form.control}
                        name="truck"
                        label="Truck"
                        options={truckOptions}
                    />

                    <FormDateTimeInput
                        control={form.control}
                        name="date"
                        type="date"
                        label="Date"
                    />

                    <FormDateTimeInput
                        control={form.control}
                        name="time"
                        type="time"
                        label="Time"
                    />

                    <div className="flex justify-end mt-[20px]">
                        <Button type="submit" disabled={isPending} >{isPending ? "Updating..." : "Confirm"}</Button>  
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default EditAcceptPickupRequest;