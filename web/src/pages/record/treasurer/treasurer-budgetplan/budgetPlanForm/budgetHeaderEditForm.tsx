import { Form } from "@/components/ui/form/form";
import { BudgetPlanStep1Schema } from "@/form-schema/treasurer/budgetplan-schema";
import { z } from "zod"
import { FormInput } from "@/components/ui/form/form-input";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUpdateBudgetHeader } from "../queries/budgetPlanUpdateQueries";

function BudgetHeaderEditForm({balance, realtyTaxShare, taxAllotment, clearanceAndCertFees, otherSpecificIncome, actualIncome, actualRPT, planId, budgetaryObligations, onSuccess}: {
    balance: number;
    realtyTaxShare: number;
    taxAllotment: number;
    clearanceAndCertFees: number;
    otherSpecificIncome: number;
    actualIncome: number;
    actualRPT: number;
    planId: number;
    budgetaryObligations: number;
    onSuccess: () => void;
}) {
    const {mutate: updateHeader, isPending} = useUpdateBudgetHeader(onSuccess);
    
    const form = useForm<z.infer<typeof BudgetPlanStep1Schema>>({
        resolver: zodResolver(BudgetPlanStep1Schema),
        defaultValues: {
            balance: balance.toString(),
            realtyTaxShare: realtyTaxShare.toString(),
            taxAllotment: taxAllotment.toString(),
            clearanceAndCertFees: clearanceAndCertFees.toString(),
            otherSpecificIncome: otherSpecificIncome.toString(),
            actualIncome: actualIncome.toString(),
            actualRPT: actualRPT.toString(),
            planId: planId,
            budgetaryObligations: budgetaryObligations.toString()
        }
    })

    const onSubmit = (values: z.infer<typeof BudgetPlanStep1Schema>) => {
        updateHeader(values)
    }
    return (
        <div className="flex items-center justify-center">
            <Form {...form}> <form   onSubmit={form.handleSubmit(onSubmit)} >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-4">
                            <FormInput 
                                control={form.control} 
                                name="balance" 
                                label="Balance From Previous Year" 
                                type="number" 
                                placeholder="0.00" 
                            />
                            <FormInput 
                                control={form.control} 
                                name="realtyTaxShare" 
                                label="Realty Tax Share" 
                                type="number" 
                                placeholder="0.00" 
                            />
                            <FormInput 
                                control={form.control} 
                                name="taxAllotment" 
                                label="National Tax Allotment" 
                                type="number" 
                                placeholder="0.00" 
                            />
                            <FormInput 
                                control={form.control} 
                                name="clearanceAndCertFees" 
                                label="Clearance & Certification Fees" 
                                type="number" 
                                placeholder="0.00" 
                            />
                            <FormInput 
                                control={form.control} 
                                name="otherSpecificIncome" 
                                label="Other Specific Income" 
                                type="number" 
                                placeholder="0.00" 
                            />
                        </div>

                        <div className="space-y-4">
                            <FormInput 
                                control={form.control} 
                                name="actualIncome" 
                                label="Actual Income" 
                                type="number" 
                                placeholder="0.00" 
                            />
                            <FormInput 
                                control={form.control} 
                                name="actualRPT" 
                                label="Actual RPT Income" 
                                type="number" 
                                placeholder="0.00" 
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Updating..." : "Update"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default BudgetHeaderEditForm;