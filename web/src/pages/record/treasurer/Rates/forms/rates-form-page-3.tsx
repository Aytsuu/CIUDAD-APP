import { Input } from "@/components/ui/input"
import { Form, FormLabel, FormItem, FormField, FormControl, FormMessage } from "@/components/ui/form/form"
import { Button } from "@/components/ui/button/button"
import { PurposeAndRatesSchema } from "@/form-schema/treasurer/rates-form-schema"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { useAddPurposeAndRate } from "../queries/RatesInsertQueries"

function RatesFormPage3({onSuccess}: {onSuccess?: () => void}){

    const form = useForm<z.infer<typeof PurposeAndRatesSchema>>({
        resolver: zodResolver(PurposeAndRatesSchema),
        defaultValues: {
            purpose: "",
            amount: "",
            category: "Service Charge"
        }
    })

    const {mutate: addPurposeRate} = useAddPurposeAndRate(onSuccess)

    const onSubmit = (value: z.infer<typeof PurposeAndRatesSchema>) => {
        console.log('Values:', value); 
        addPurposeRate(value)
    };

    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}> 
                <div>
                    <FormField
                    control={form.control}
                    name="purpose"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Purpose</FormLabel>
                            <FormControl>
                                <Input {...field} type='text' placeholder="e.g. Employment"></Input>
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

export default RatesFormPage3