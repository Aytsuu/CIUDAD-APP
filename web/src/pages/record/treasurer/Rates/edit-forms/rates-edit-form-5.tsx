import { Input } from "@/components/ui/input"
import { Form, FormLabel, FormItem, FormField, FormControl, FormMessage } from "@/components/ui/form/form"
import { Button } from "@/components/ui/button/button"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { useEditPurposeAndRate } from "../queries/RatesUpdateQueries"
import { PurposeAndRatesEditSchema } from "@/form-schema/treasurer/rates-edit-form-schema"


function RatesEditFormPage5({pr_id, pr_purpose, pr_rate, onSuccess}: {
    pr_id: string;
    pr_purpose: string;
    pr_rate: number;
    onSuccess?: () => void;
}){
    
    const form = useForm<z.infer<typeof PurposeAndRatesEditSchema>>({
        resolver: zodResolver(PurposeAndRatesEditSchema),
        defaultValues: {
            purpose: pr_purpose,
            amount: pr_rate.toString(),
            category: "Barangay Service"
        }
    })

    const {mutate: editPurposeRate} = useEditPurposeAndRate(onSuccess)

    const onSubmit = (value: z.infer<typeof PurposeAndRatesEditSchema> ) => {
        console.log(value); 
        editPurposeRate({
            ...value,
            pr_id: pr_id
        })
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
                                <Input {...field} type='text' placeholder="e.g. Employment" readOnly></Input>
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

export default RatesEditFormPage5