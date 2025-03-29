import React from "react";
import { Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { demographicInfoSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { family, familyComposition, building } from "../../restful-api/profiingPostAPI";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { LoadButton } from "@/components/ui/button/load-button";
import { useNavigate } from "react-router";

export default function LivingSoloForm({residents, households} : {
    residents: any[]; households: any[]
}) {

    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const defaultValues = React.useRef(generateDefaultValues(demographicInfoSchema));
    const form = useForm<z.infer<typeof demographicInfoSchema>>({
        resolver: zodResolver(demographicInfoSchema),
        defaultValues: defaultValues.current,
        mode: "onChange" 
    });

    const submit = async () => {
        setIsSubmitting(true)
        const formIsValid = await form.trigger();
        
        if (!formIsValid) {
            setIsSubmitting(false);
            toast("Please fill out all required fields", {
                icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
            });
            return;
        }

        const data = form.getValues()
        const familyNo = await family(data, null, null)
        familyComposition(familyNo, data.id.split(" ")[0])
        const buildId = await building(familyNo, data)

        if (buildId) {
            toast('Record added successfully', {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                action: {
                    label: "View",
                    onClick: () => navigate(-1)
                }
            });
            setIsSubmitting(false)
            form.reset(defaultValues.current)
        }

    }

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    submit()
                }}
                className="flex flex-col gap-10"
            >
                <div className="grid gap-3">
                    <Label className="mt-1">Resident</Label>
                    <Combobox 
                        options={residents}
                        value={form.watch('id')}
                        onChange={(value) => form.setValue('id', value)}
                        placeholder="Search for resident..."
                        triggerClassName="font-normal"
                        emptyMessage="No resident found"
                    />
                    <Label className="mt-1">Household</Label>
                    <Combobox 
                        options={households}
                        value={form.watch('householdNo')}
                        onChange={(value) => form.setValue('householdNo', value)}
                        placeholder="Search for household..."
                        triggerClassName="font-normal"
                        emptyMessage="No resident found"
                    />
                    <FormSelect control={form.control} name="building" label="Building" options={[
                        {id: "owner", name: "Owner"},
                        {id: "renter", name: "Renter"},
                        {id: "other", name: "Other"},
                    ]} readOnly={false}/>

                    <FormSelect control={form.control} name="indigenous" label="Indigenous People" options={[
                        {id: "no", name: "No"},
                        {id: "yes", name: "Yes"}
                    ]} readOnly={false}/>
                    
                </div>
                {/* Submit Button */}
                <div className="flex justify-end">
                    {!isSubmitting ? (<Button type="submit">
                        Register
                    </Button> ) : (
                        <LoadButton>
                            Registering...
                        </LoadButton>
                    )}
                </div>
            </form>
        </Form>
    )
}