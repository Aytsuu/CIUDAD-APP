import React from "react";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { householdSchema } from "@/form-schema/profiling-schema";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router";
import { household } from "../restful-api/profiingPostAPI";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { LoadButton } from "@/components/ui/button/load-button";

export default function HouseholdProfileForm({ sitio, residents, onHouseholdRegistered }: { 
    sitio: any[]; residents: any[]; onHouseholdRegistered: (newHousehold: any) => void;
}) {

    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const defaultValues = React.useRef(generateDefaultValues(householdSchema));
    const form = useForm<z.infer<typeof householdSchema>>({
        resolver: zodResolver(householdSchema),
        defaultValues: defaultValues.current,
    });

    const submit = async () => {
        setIsSubmitting(true);
        const formIsValid = await form.trigger();
        
        if (!formIsValid) {
            setIsSubmitting(false);
            toast("Please fill out all required fields", {
                icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
            });
            return;
        }
    
        const data = form.getValues();
        const res = await household(data);

        if (res) {
            onHouseholdRegistered(res); // Update residents in the parent component
            toast('Record added successfully', {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                action: {
                    label: "View",
                    onClick: () => navigate(-1)
                }
            });
            setIsSubmitting(false);
            form.reset(defaultValues.current);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
                className="grid gap-4"
            >
                <div className="grid gap-4">
                    <Combobox
                        options={residents}
                        value={form.watch("householdHead")}
                        onChange={(value) => form.setValue("householdHead", value)}
                        placeholder="Search for household head (by resident #)"
                        emptyMessage="No household found"
                    />
                    <div className="flex gap-2 items-center">
                        <Label className="font-normal">Resident not found?</Label>
                        <Link to="/resident-form" state={{ params: { origin: "household", householdInfo: form.getValues() } }}>
                            <Label className="font-normal text-teal cursor-pointer hover:underline">
                                Redirect to Registration
                            </Label>
                        </Link>
                    </div>
                </div>
                <FormSelect control={form.control} name="nhts" label="NHTS Household"
                    options={[
                        { id: "no", name: "No" },
                        { id: "yes", name: "Yes" },
                    ]}
                    readOnly={false}
                />
                <FormSelect control={form.control} name="sitio" label="Sitio" options={sitio} readOnly={false} />
                <FormInput control={form.control} name="street" label="House Street Address" placeholder="Enter your house's street address" readOnly={false} />
                <div className="flex justify-end">
                    {!isSubmitting ? (<Button type="submit" className="mt-5">
                        Register
                    </Button>) : (
                        <LoadButton>
                            Registering...
                        </LoadButton>
                    )}
                </div>
            </form>
        </Form>
    );
}