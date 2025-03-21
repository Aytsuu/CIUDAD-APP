import { Input } from "@/components/ui/input"
import { Form, FormLabel, FormItem, FormField, FormControl, FormMessage } from "@/components/ui/form/form"
import { Button } from "@/components/ui/button"
import { ClearanceForPermitRatesSchema } from "@/form-schema/rates-form-schema"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";


function RatesFormPage1(){

    const form = useForm<z.infer<typeof ClearanceForPermitRatesSchema>>({
        resolver: zodResolver(ClearanceForPermitRatesSchema),
        defaultValues:{
            maxRange: "",
            minRange: "",
            amount: ""
        }
    })

    const onSubmit = (value: z.infer<typeof ClearanceForPermitRatesSchema>) => {
        console.log(value); 
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
                                <Input {...field} type='number' placeholder="0.00"></Input>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}></FormField>

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

                    <div className="flex justify-end">
                        <Button type="submit" className="w-[100px]">Save</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default RatesFormPage1