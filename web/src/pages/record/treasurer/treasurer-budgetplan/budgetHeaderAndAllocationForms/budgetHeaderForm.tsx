import { Form } from "@/components/ui/form/form";
import BudgetHeaderSchema from "@/form-schema/treasurer/budgetplan-header-schema";
import { z } from "zod"
import { FormInput } from "@/components/ui/form/form-input";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";

function BudgetHeaderForm({form, onSubmit}: {
    form: UseFormReturn<z.infer<typeof BudgetHeaderSchema>>;
    onSubmit: () => void;
}){
    const handleSubmit = (values: z.infer<typeof BudgetHeaderSchema>) => {
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
                        Budget Header Form
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-4">
                            <FormInput control={form.control} name="balance" label="Balance From Previous Year" type="number" placeholder="0.00" />
                            <FormInput control={form.control} name="realtyTaxShare" label="Realty Tax Share" type="number" placeholder="0.00" />
                            <FormInput control={form.control} name="taxAllotment" label="National Tax Allotment" type="number" placeholder="0.00" />
                            <FormInput control={form.control} name="clearanceAndCertFees" label="Clearance & Certification Fees" type="number" placeholder="0.00" />
                            <FormInput control={form.control} name="otherSpecificIncome" label="Other Specific Income" type="number" placeholder="0.00" />
                        </div>

                        <div className="space-y-4">
                            <FormInput control={form.control} name="actualIncome" label="Actual Income" type="number" placeholder="0.00" />
                            <FormInput control={form.control} name="actualRPT" label="Actual RPT Income" type="number" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit">Next</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default BudgetHeaderForm