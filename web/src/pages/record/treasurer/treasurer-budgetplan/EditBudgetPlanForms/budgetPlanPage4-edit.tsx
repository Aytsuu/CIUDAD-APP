import { Button } from "@/components/ui/button/button"
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { FormInput } from "@/components/ui/form/form-input"
import { EditCapitalOutlayAndNonOfficeSchema } from "@/form-schema/treasurer/budgetplan-edit-schema"
import { Form } from "@/components/ui/form/form"

type Page4FormData = z.infer<typeof EditCapitalOutlayAndNonOfficeSchema>


function BudgetPlanPage4Edit({onPrevious3, updateFormData, formData, onSubmit}: {
    onPrevious3: () => void,
    updateFormData: (data: Partial<Page4FormData>) => void,
    formData: Page4FormData,
    onSubmit: () => void,
}) {
   const form = useForm<z.infer<typeof EditCapitalOutlayAndNonOfficeSchema>>({
            resolver: zodResolver(EditCapitalOutlayAndNonOfficeSchema),
            defaultValues: {
                capitalOutlays: "",
                cleanAndGreen: "",
                streetLighting: "",
                rehabMultPurpose: "",
                skFund: "",
                qrfFund: "",
                disasterTraining: "",
                disasterSupplies: "",
            }
    })

    const handleSubmit = (value: Page4FormData) => {
        console.log('Submitting data for page 4:', value)
        updateFormData(value);
        onSubmit();
    };

   
    const handlePrevious = () => {
        updateFormData(form.getValues()); 
        onPrevious3(); 
    };

   return(
    <>
        <Form {...form}>
            <form>
                <div className="grid gap-4">
                    
                    <FormInput control = {form.control} name="capitalOutlays" label="Total Capital Outlays" type="number"/>
                    <FormInput control = {form.control} name="cleanAndGreen" label="Cleand & Green Environmental" type="number"/>
                    <FormInput control = {form.control} name="streetLighting" label="Street Lighting Project" type="number"/>
                    <FormInput control = {form.control} name="rehabMultPurpose" label="Rehabilitation of Multi-Purpose" type="number"/>
                    <FormInput control = {form.control} name="skFund" label="Subsidy to Sangguniang Kabataan (SK) Fund" type="number"/>
                    <FormInput control = {form.control} name="qrfFund" label="Quick Response Fund (QRF)" type="number"/>
                    <FormInput control = {form.control} name="disasterTraining" label="Disaster Training" type="number"/>
                    <FormInput control = {form.control} name="disasterSupplies" label="Disaster Supplies" type="number"/>
                </div>

                <div>
                    <Button onClick={handlePrevious}>Previous</Button>
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    </>
   )
}

export default BudgetPlanPage4Edit