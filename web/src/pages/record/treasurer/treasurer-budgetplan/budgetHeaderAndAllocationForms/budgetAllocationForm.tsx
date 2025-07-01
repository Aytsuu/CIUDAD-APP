import { Form } from "@/components/ui/form/form";
import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { Button } from "@/components/ui/button/button";

function BudgetAllocationForm({ form, onBack, onSubmit }: {
    form: UseFormReturn<z.infer<typeof BudgetAllocationSchema>>;
    onBack: () => void;
    onSubmit: () => void;
}) {
    
    const handleSubmit = (values: z.infer<typeof BudgetAllocationSchema>) => {
        onSubmit();
    };
    return (
         <div className="flex items-center justify-center">
            <Form {...form}>
                <form 
                    onSubmit={form.handleSubmit(handleSubmit)} 
                    className="w-full max-w-md bg-white p-5 rounded-md shadow-md"
                >
                    <div className="text-xl font-semibold text-darkBlue2 pb-2 border-b border-gray-200 mb-3">
                        Budget Allocation Form
                    </div>

                    <div className="flex flex-col gap-3">
                        <FormInput 
                            control={form.control} 
                            name="personalServicesLimit" 
                            label="Personal Services (% of Actual Income)" 
                            type="number" 
                            placeholder="0.00" 
                        />
                        <FormInput 
                            control={form.control} 
                            name="miscExpenseLimit" 
                            label="Extraordinary & Miscellaneous Expense (% of Actual RPT Income)" 
                            type="number" 
                            placeholder="0.00" 
                        />
                        <FormInput 
                            control={form.control} 
                            name="localDevLimit" 
                            label="Local Development Fund (% of National Tax Allotment)" 
                            type="number" 
                            placeholder="0.00" 
                        />
                        <FormInput 
                            control={form.control} 
                            name="skFundLimit" 
                            label="Sangguniang Kabataan Fund (% of Net Available Resources)" 
                            type="number" 
                            placeholder="0.00" 
                        />
                        <FormInput 
                            control={form.control} 
                            name="calamityFundLimit" 
                            label="Calamity Fund (% of Net Available Resources)" 
                            type="number" 
                            placeholder="0.00" 
                        />
                    </div>

                    <div className="mt-4 flex justify-between">
                        <Button onClick={onBack}>Back</Button>
                        <Button type="submit">Next</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default BudgetAllocationForm;