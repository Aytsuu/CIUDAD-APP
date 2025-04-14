import { Button } from "@/components/ui/button/button"
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { FormInput } from "@/components/ui/form/form-input"
import { EditOtherExpenseSchema1 } from "@/form-schema/treasurer/budgetplan-edit-schema"
import { Form } from "@/components/ui/form/form"

type Page2FormData = z.infer<typeof EditOtherExpenseSchema1>

function BudgetPlanPage2Edit({onPrevious1, updateFormData, formData, onNext3}: {
    onPrevious1: () => void,
    updateFormData: (data: Partial<Page2FormData>) => void,
    formData: Page2FormData,
    onNext3: () => void,
}) {
   const form = useForm<z.infer<typeof EditOtherExpenseSchema1>>({
        resolver: zodResolver(EditOtherExpenseSchema1),
        defaultValues: {
            travelingExpenses: "",
            trainingExpenses: "",
            officeExpenses: "",
            accountableExpenses: "",
            medExpenses: "",
            waterExpenses: "",
            electricityExpenses: "",
            telephoneExpenses: "",
            memDues: "",
            officeMaintenance: "",
            vehicleMaintenance: "",
        }
   })

   
    const onSubmit = (value: Page2FormData) => {
        console.log("Submitting Page 2 Data:", value);
        updateFormData(value);
        onNext3();
    };

    const handlePrevious = () => {
        updateFormData(form.getValues()); 
        onPrevious1(); 
    };

   return(
    <>
        <div className="grid gap-4">
            <Form {...form}>
                <form>
                    <FormInput control = {form.control} name="travelingExpenses" label="Traveling Expense" type="number"/>
                    <FormInput control = {form.control} name="trainingExpenses" label="Training Expenses" type="number"/>
                    <FormInput control = {form.control} name="officeExpenses" label="Office Supplies Expenses" type="number"/>
                    <FormInput control = {form.control} name="accountableExpenses" label="Accountable Forms Expenses" type="number"/>
                    <FormInput control = {form.control} name="medExpenses" label="Drugs and Medicine Expense" type="number"/>
                    <FormInput control = {form.control} name="waterExpenses" label="Water Expenses" type="number"/>
                    <FormInput control = {form.control} name="electricityExpenses" label="Electricity Expenses" type="number"/>
                    <FormInput control = {form.control} name="telephoneExpenses" label="Telephone Expenses" type="number"/>
                    <FormInput control = {form.control} name="memDues" label="Membership Dues/ Contribution to Organization" type="number"/>
                    <FormInput control = {form.control} name="officeMaintenance" label="Repair and Maintenance of Office Equipment" type="number"/>
                    <FormInput control = {form.control} name="vehicleMaintenance" label="Repair and Maintenance of Motor Vehicle" type="number"/>
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

export default BudgetPlanPage2Edit