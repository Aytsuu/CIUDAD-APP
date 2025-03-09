import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BudgetHeaderSchema from "@/form-schema/budgetplan-header-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import { useForm } from "react-hook-form";
import {useNavigate } from "react-router";

function CreateBudgetPlanHeader(){

    const navigate = useNavigate();
    const form = useForm<z.infer<typeof BudgetHeaderSchema>>({
        resolver: zodResolver(BudgetHeaderSchema),
        defaultValues:{
            availableResources: "",
            actualIncome: "",
            actualRPT: ""
        }
    })

    const onSubmit = (values: z.infer<typeof BudgetHeaderSchema>) => {
        console.log(values)
        navigate("/treasurer-budgetplan-form")
    }
    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                    <FormField
                    control={form.control}
                    name="availableResources"
                    render={({field}) =>(
                        <FormItem>
                            <FormLabel>NET Available Resources</FormLabel>
                            <FormControl>
                                <Input {...field} type='number' placeholder="Enter NET Available Resources"></Input>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}></FormField>

                    <FormField
                    control={form.control}
                    name="actualIncome"
                    render={({field}) =>(
                        <FormItem>
                            <FormLabel>Actual Income</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" placeholder="Enter Actual Income" ></Input>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}></FormField>

                    <FormField
                    control={form.control}
                    name="actualRPT"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Actual RPT Income</FormLabel>
                            <FormControl>
                                <Input {...field} type='number' placeholder="Enter Actual RPT Income"></Input>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}></FormField>
                    
                    <div className="flex justify-end mt-[20px]">
                        <Button>Proceed</Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default CreateBudgetPlanHeader