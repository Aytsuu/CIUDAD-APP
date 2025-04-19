import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import BudgetHeaderSchema from "@/form-schema/treasurer/budgetplan-header-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
import BudgetAllocationForm from "./budgetAllocationForm";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

function BudgetHeaderForm({form}: {
    form: UseFormReturn<z.infer<typeof BudgetHeaderSchema>>
}){
    // const navigate = useNavigate();
    // const [isDialogOpen, setIsDialogOpen] = useState(false);
    // const [showHeaderForm, setShowHeaderForm] = useState(true);
    // const [ formValues, setFormValues] = useState<z.infer<typeof BudgetHeaderSchema>>();

    // const form = useForm<z.infer<typeof BudgetHeaderSchema>>({
    //     resolver: zodResolver(BudgetHeaderSchema),
    //     defaultValues:{
    //         balance: "",
    //         realtyTaxShare: "",
    //         taxAllotment: "",
    //         clearanceAndCertFees: "",
    //         otherSpecificIncome: "",
    //         actualIncome: "",
    //         actualRPT: ""
    //     }
    // })

    const onSubmit = (values: z.infer<typeof BudgetHeaderSchema>) => {
        // setFormValues(values);
        // setShowHeaderForm(false);
        // setIsDialogOpen(true); 
    }

    const handleFinalSubmit = (allocationValues: z.infer<typeof BudgetAllocationSchema>) => {
        // if (!formValues) return;
        
        // const completeData = {
        //   ...formValues,
        //   ...allocationValues,
        //   isEdit: false,
        //   id: "",
        // };

        // navigate("/treasurer-budgetplan-form", {state : completeData});
        
        // console.log("Complete submission:", completeData);
        // setIsDialogOpen(false);
        // setShowHeaderForm(false); 
      };

    const handleDialogClose = () => {
        // setIsDialogOpen(false);
        // setShowHeaderForm(true); 
    };
    
    return(
        <>
         {/* {showHeaderForm && ( */}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="balance"
                            render={({field}) =>(
                                <FormItem>
                                    <FormLabel className="text-black">Balance From Previous Year</FormLabel>
                                    <FormControl>
                                        <Input {...field} type='number' placeholder="0.00"></Input>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                        )}></FormField>

                        <FormField
                            control={form.control}
                            name="realtyTaxShare"
                            render={({field}) =>(
                                <FormItem>
                                    <FormLabel className="text-black">Realty Tax Share</FormLabel>
                                    <FormControl>
                                        <Input {...field} type='number' placeholder="0.00"></Input>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                        )}></FormField>

                        <FormField
                        control={form.control}
                        name="taxAllotment"
                        render={({field}) =>(
                            <FormItem>
                                <FormLabel className="text-black">National Tax Allotment</FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder="0.00"></Input>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}></FormField>

                        <FormField
                        control={form.control}
                        name="clearanceAndCertFees"
                        render={({field}) =>(
                            <FormItem>
                                <FormLabel className="text-black">Clearance & Certification Fees</FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder="0.00"></Input>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}></FormField>

                        <FormField
                        control={form.control}
                        name="otherSpecificIncome"
                        render={({field}) =>(
                            <FormItem>
                                <FormLabel className="text-black">Other Specific Income</FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder="0.00"></Input>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}></FormField>
                    </div>

                    <div className="space-y-4">
                        <FormField
                        control={form.control}
                        name="actualIncome"
                        render={({field}) =>(
                            <FormItem>
                                <FormLabel className="text-black">Actual Income</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" placeholder="0.00" ></Input>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}></FormField>

                        <FormField
                        control={form.control}
                        name="actualRPT"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="text-black">Actual RPT Income</FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder="0.00"></Input>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}></FormField>
                    </div>
                </div>

                    {/* <div className="flex justify-end mt-[20px]"> 
                        <Button type="submit">Proceed</Button>
                    </div> */}
            </form>
        </Form>
            {/* )} */}
        
            {/* <DialogLayout
            isOpen={isDialogOpen}
            onOpenChange={(open) => {
                if (!open) handleDialogClose();
                else setIsDialogOpen(open);
            }}
            title="Budget Allocation Form"
            description="Allocate percentages for each budget category, ensuring the total does not exceed 100%."
            mainContent={
                formValues ? ( 
                <div> 
                    <BudgetAllocationForm headerValues={formValues} onFinalSubmit={handleFinalSubmit} setIsDialogOpen = {setIsDialogOpen} />
                </div>
                ) : (
                <div /> 
                )
            }
            /> */}

        </>
    )
}

export default BudgetHeaderForm