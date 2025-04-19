import { FormInput } from "@/components/ui/form/form-input";
import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
import { UseFormReturn } from "react-hook-form"
import z from "zod";
import { useLocation } from "react-router";

function BudgetAllocationForm({form}: {
    form:UseFormReturn<z.infer<typeof BudgetAllocationSchema>>
}) {

    
    return(
        <>
            <div className="grid gap-4">
                <FormInput control={form.control} name="personalServicesLimitEdit" label="Personal Service" type="number"/>
                <FormInput control={form.control} name="miscExpenseLimitEdit" label="Extraordinary & Miscellaneous Expense" type="number"/>
                <FormInput control={form.control} name="localDevLimitEdit" label="Local Development Fund" type="number"/>
                <FormInput control={form.control} name="skFundLimitEdit" label="Sangguniang Kabataan (SK) Fund" type="number"/>
                <FormInput control={form.control} name="calamityFundLimitEdit" label="Calamity Fund" type="number"/>
            </div>
        </>
    )

}

export default BudgetAllocationForm

