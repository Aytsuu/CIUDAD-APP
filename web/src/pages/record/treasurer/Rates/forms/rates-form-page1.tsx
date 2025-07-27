import { Input } from "@/components/ui/input"
import { Form, FormLabel, FormItem, FormField, FormControl, FormMessage } from "@/components/ui/form/form"
import { Button } from "@/components/ui/button/button"
import { AnnualGrossSalesSchema } from "@/form-schema/treasurer/rates-form-schema"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { useAddAnnualGrossSales } from "../queries/RatesInsertQueries"
import { toast } from "sonner"


function RatesFormPage1({onSuccess, lastMaxRange} : {
    lastMaxRange: number | string;
    onSuccess?: () => void;
}){

    const shouldLockMinRange = Number(lastMaxRange) > 0;
    const initialMinRange = shouldLockMinRange ? (Number(lastMaxRange) + 1).toString() : "";

    const form = useForm<z.infer<typeof AnnualGrossSalesSchema>>({
        resolver: zodResolver(AnnualGrossSalesSchema),
        defaultValues:{
            maxRange: "",
            minRange: initialMinRange,
            amount: ""
        }
    })
    
    const {mutate: createAnnualGrossSales} = useAddAnnualGrossSales(onSuccess)

    const onSubmit = (value: z.infer<typeof AnnualGrossSalesSchema>) => {
        console.log("Values:", value); 
         if (parseFloat(value.maxRange) <= parseFloat(value.minRange)) {
            toast.error("Validation Error", {
            description: "The maximum range must be greater than the minimum range",
            action: {
                label: "OK",
                onClick: () => {}
            },
            });
            return;
        } else {
            createAnnualGrossSales(value);
        }
    };

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}> 
                <div>
                    <FormField
                        control={form.control}
                        name="minRange"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Minimum Annual Gross Sales</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type='number' 
                                        placeholder="0.00"
                                        readOnly={shouldLockMinRange}
                                        className={shouldLockMinRange ? "bg-gray-100" : ""}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                    control={form.control}
                    name = "maxRange"
                    render = {({field}) => (
                        <FormItem>
                            <FormLabel>Maximum Annual Gross Sales</FormLabel>
                            <FormControl>
                                <Input {...field} type='number' placeholder="0.00"></Input>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}></FormField>

                    <FormField
                    control = {form.control}
                    name="amount"
                    render = {({field}) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input {...field} type='number' placeholder = "0.00"></Input>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}></FormField>

                    <div className="flex justify-end mt-[20px]">
                        <Button type="submit" className="w-[100px]">Save</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default RatesFormPage1