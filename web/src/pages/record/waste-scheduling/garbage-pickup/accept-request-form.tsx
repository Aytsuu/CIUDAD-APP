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

function AcceptPickupRequest(){


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
                        options={[
                            {id: "Driver 1", name: "Driver 1"},
                            {id: "Driver 2", name: "Driver 2"},
                        ]}
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
                        options={[
                            {id: "Truck 1", name: "Truck 1"},
                            {id: "Truck 2", name: "Truck 2"},
                        ]}
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