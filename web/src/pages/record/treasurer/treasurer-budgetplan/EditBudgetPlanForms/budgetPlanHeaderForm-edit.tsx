import { FormInput } from "@/components/ui/form/form-input";
import { HeaderEditSchema } from "@/form-schema/budgetplanheaderandallocation-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useLocation } from "react-router";



function HeaderFormEdit(){
    const location = useLocation();
    const {id} = location.state

    const form = useForm<z.infer<typeof HeaderEditSchema>>({
        resolver: zodResolver(HeaderEditSchema),
        defaultValues: {
            balanceEdit: "",
            realtyTaxShareEdit: "",
            taxAllotmentEdit: "",
            clearanceAndCertFeesEdit: "",
            otherSpecificIncomeEdit: "",
            actualIncomeEdit: "",
            actualRPTEdit: "",
        }
    })

    
    return(
        <>
            <div className="grid gap-4">
                <FormInput control={form.control} name="balanceEdit" label="Balance" type="number"/>
                <FormInput control={form.control} name="realtyTaxShareEdit" label="Realty Tax Share" type="number"/>
                <FormInput control={form.control} name="taxAllotmentEdit" label="National Tax Allotment" type="number"/>
                <FormInput control={form.control} name="clearanceAndCertFeesEdit" label="Clearance & Certification Fees" type="number"/>
                <FormInput control={form.control} name="otherSpecificIncomeEdit" label="Other Specific Income" type="number"/>
                <FormInput control={form.control} name="actualIncomeEdit" label="Actual Income" type="number"/>
                <FormInput control={form.control} name="actualRPTEdit" label="Actual RPT Income" type="number"/>
            </div>
        </>
    )

}

export default HeaderFormEdit

