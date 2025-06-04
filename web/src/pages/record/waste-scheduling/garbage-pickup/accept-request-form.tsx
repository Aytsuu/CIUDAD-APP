import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect } from "@/components/ui/form/form-select";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod"
import { AcceptPickupRequestSchema } from "@/form-schema/garbage-pickup-schema";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { useGetDrivers, type Drivers } from "./queries/GarbageRequestFetchQueries";
import { useGetTrucks } from "./queries/GarbageRequestFetchQueries";

function AcceptPickupRequest(){

    const { data: drivers = [] } = useGetDrivers();
    const { data: trucks = [] } = useGetTrucks();

    const driverOptions = drivers.map(driver => ({
        id: driver.id,  
        name: `${driver.firstname} ${driver.lastname}`  
    }));

    const truckOptions = trucks.filter(truck => truck.truck_status == "Operational").map(truck => ({
        id: truck.truck_id,
        name: `Model: ${truck.truck_model}, Plate Number: ${truck.truck_plate_num}`,
    }));
    
    console.log("Trucks:", truckOptions)

    const onSubmit = (values: z.infer<typeof AcceptPickupRequestSchema>) => {
        console.log(values)
    }

    const form = useForm<z.infer<typeof AcceptPickupRequestSchema>>({
        resolver: zodResolver(AcceptPickupRequestSchema),
        defaultValues: {
            driver: "",
            collectors: [],
            truck: "",
            date: "",
            time: "",
        }
    })

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
                        options={[
                            {id: "Collector 1", name: "Collector 1"},
                            {id: "Collector 2", name: "Collector 2"},
                        ]}
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
                        <Button type="submit">Confirm</Button>  
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default AcceptPickupRequest