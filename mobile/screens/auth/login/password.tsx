import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { FormInput } from "@/components/ui/form/form-input";

export default function Password(){
    const { control } = useRegistrationFormContext();

    return(
        <FormInput
        control={control}
        name="accountSchema.password"
        label="Password"
        secureTextEntry={true}
        />
    )
}