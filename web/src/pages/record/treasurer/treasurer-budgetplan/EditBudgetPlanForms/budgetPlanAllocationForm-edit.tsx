import { FormInput } from "@/components/ui/form/form-input";
import { AllocationEditSchema } from "@/form-schema/budgetplanheaderandallocation-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useLocation } from "react-router";

function AllocationFormEdit(){
    const location = useLocation();
    const {id} = location.state

    const form = useForm<z.infer<typeof AllocationEditSchema>>({
        resolver: zodResolver(AllocationEditSchema),
        defaultValues: {
           personalServicesLimitEdit: "",
           miscExpenseLimitEdit: "",
           localDevLimitEdit: "",
           skFundLimitEdit: "",
           calamityFundLimitEdit: "",
        }
    })

    
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

export default AllocationFormEdit

