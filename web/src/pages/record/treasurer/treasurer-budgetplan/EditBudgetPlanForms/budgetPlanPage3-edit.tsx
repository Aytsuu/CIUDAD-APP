import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { FormInput } from "@/components/ui/form/form-input"
import { EditOtherExpenseSchema2 } from "@/form-schema/treasurer/budgetplan-edit-schema"
import { Form } from "@/components/ui/form/form"

type Page3FormData = z.infer<typeof EditOtherExpenseSchema2>

function BudgetPlanPage3Edit({onNext4, updateFormData, formData, onPrevious2}: {
    onNext4: () => void,
    onPrevious2: () => void,
    updateFormData: (data: Partial<Page3FormData>) => void,
    formData: Page3FormData
}) {

   const form = useForm<z.infer<typeof EditOtherExpenseSchema2>>({
        resolver: zodResolver(EditOtherExpenseSchema2),
        defaultValues: {
            fidelityBond: "",
            insuranceExpense: "",
            gadProg: "",
            seniorProg: "",
            juvJustice: "",
            badacProg: "",
            nutritionProg: "",
            aidsProg: "",
            assemblyExpenses: "",
            disasterProg: "",
            miscExpense: "",
        }
   })

   const onSubmit = (value: Page3FormData) => {
        console.log("Submitting Page 3 Data:", value);
        updateFormData(value);
        onNext4();
    };

    const handlePrevious = () => {
        updateFormData(form.getValues()); 
        onPrevious2(); 
    };

   return(
    <>
        <div className="grid gap-4">
            <Form {...form}>
                <form>
                    <FormInput control = {form.control} name="fidelityBond" label="Fidelity Bond Premiums" type="number"/>
                    <FormInput control = {form.control} name="insuranceExpense" label="Insurance Expenses" type="number"/>
                    <FormInput control = {form.control} name="gadProg" label="GAD Program" type="number"/>
                    <FormInput control = {form.control} name="seniorProg" label="Senior Citizen/ PWD Program" type="number"/>
                    <FormInput control = {form.control} name="juvJustice" label="BCPC (Juvenile Justice System)" type="number"/>
                    <FormInput control = {form.control} name="badacProg" label="BADAC Program" type="number"/>
                    <FormInput control = {form.control} name="nutritionProg" label="Nutrition Program" type="number"/>
                    <FormInput control = {form.control} name="aidsProg" label="Combating AIDS Program" type="number"/>
                    <FormInput control = {form.control} name="assemblyExpenses" label="Barangay Assembly Expenses" type="number"/>
                    <FormInput control = {form.control} name="disasterProg" label="Disaster Response Program" type="number"/>
                    <FormInput control = {form.control} name="miscExpense" label="Extraordinary & Miscellaneous Expense" type="number"/>
                </form>
            </Form>
        </div>

        <div>
            <Button onClick={handlePrevious}>Previous</Button>
            <Button type="submit">Next</Button>
        </div>
    </>
   )
}

export default BudgetPlanPage3Edit