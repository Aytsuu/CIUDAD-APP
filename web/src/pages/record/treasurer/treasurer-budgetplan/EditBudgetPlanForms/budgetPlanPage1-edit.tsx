import { Button } from "@/components/ui/button/button"
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { FormInput } from "@/components/ui/form/form-input"
import { EditPersonalServicesSchema } from "@/form-schema/treasurer/budgetplan-edit-schema"
import { Form } from "@/components/ui/form/form"

type Page1FormData = z.infer<typeof EditPersonalServicesSchema>

function BudgetPlanPage1Edit({onNext2, updateFormData, formData}:{
    onNext2: () => void,
    updateFormData: (data: Partial<Page1FormData>) => void,
    formData: Page1FormData
}) {
   const form = useForm<z.infer<typeof EditPersonalServicesSchema>>({
        resolver: zodResolver(EditPersonalServicesSchema),
        defaultValues: {
            honorariaOfficials: "",
            cashOfficials: "",
            midBonusOfficials: "",
            endBonusOfficials: "",
            honorariaTanods: "",
            honorariaLupon: "",
            honorariaBarangay: "",
            prodEnhancement: "",
            leaveCredits: "",
        }
   })

    const onSubmit = (value: Page1FormData) => {
        console.log("Submitting Page 1 Data:", value);
        updateFormData(value);
        onNext2();
    };

   return(
    <>
        <div className="grid gap-4">
            <Form {...form}>
                <form>
                    <FormInput control = {form.control} name="honorariaOfficials" label="Honoraria for Officials" type="number"/>
                    <FormInput control = {form.control} name="cashOfficials" label="Cash Gift for Officials" type="number"/>
                    <FormInput control = {form.control} name="midBonusOfficials" label="Mid-Year Bonus for Officials" type="number"/>
                    <FormInput control = {form.control} name="endBonusOfficials" label="Year-End Bonus for Officials" type="number"/>
                    <FormInput control = {form.control} name="honorariaTanods" label="Honoraria for Tanods" type="number"/>
                    <FormInput control = {form.control} name="honorariaLupon" label="Honoraria for Lupon Members" type="number"/>
                    <FormInput control = {form.control} name="honorariaBarangay" label="Honoraria for Barangay Workers" type="number"/>
                    <FormInput control = {form.control} name="prodEnhancement" label="Productivity Enhancement Incentive" type="number"/>
                    <FormInput control = {form.control} name="leaveCredits" label="Commutation of Leave Credits" type="number"/>
                </form>
            </Form>
        </div>

        <div>
            <Button type="submit">Next</Button>
        </div>
    </>
   )

}

export default BudgetPlanPage1Edit