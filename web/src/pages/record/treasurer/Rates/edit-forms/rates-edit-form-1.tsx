import { Input } from "@/components/ui/input"
import { Form, FormLabel, FormItem, FormField, FormControl, FormMessage } from "@/components/ui/form/form"
import { Button } from "@/components/ui/button/button"
import { AnnualGrossSalesEditSchema } from "@/form-schema/treasurer/rates-edit-form-schema"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { useEditAnnualGrossSales } from "../queries/RatesUpdateQueries"


function RatesEditFormPage1({ags_id, ags_minimum, ags_maximum, ags_rate, onSuccess} : {
    ags_id: string;
    ags_minimum: number;
    ags_maximum: number;
    ags_rate: number;
    onSuccess: () => void;
}){

    const form = useForm<z.infer<typeof AnnualGrossSalesEditSchema>>({
        resolver: zodResolver(AnnualGrossSalesEditSchema),
        defaultValues:{
            maxRange: ags_maximum.toString(),
            minRange: ags_minimum.toString(),
            amount: ags_rate.toString()
        }
    })
    
    const {mutate: editAnnualGrossSales, isPending} = useEditAnnualGrossSales(onSuccess)

    const onSubmit = (value: z.infer<typeof AnnualGrossSalesEditSchema>) => {
        console.log("Values:", value); 
        editAnnualGrossSales({
            ...value, 
            ags_id: ags_id  
        }) 
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
                                <Input {...field} type='number' placeholder="0.00" readOnly></Input>
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
                                <Input {...field} type='number' placeholder="0.00" readOnly></Input>
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
                        <Button type="submit" className="w-[100px]" disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default RatesEditFormPage1