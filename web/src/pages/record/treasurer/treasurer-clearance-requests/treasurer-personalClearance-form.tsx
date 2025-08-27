import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import PersonalClearanceFormSchema from "@/form-schema/personalClearance-schema";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
// import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { createPersonalClearance } from "@/pages/record/treasurer/treasurer-clearance-requests/restful-api/personalClearancePostApi";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ComboboxInput } from "../../../../components/ui/form/form-combo-box-search"; 
import { useGetResidents } from "@/pages/record/treasurer/treasurer-clearance-requests/queries/CertClearanceFetchQueries";
import { useGetPurposeAndRate } from "../Rates/queries/RatesFetchQueries";
import { FormSelect } from "@/components/ui/form/form-select";

interface PersonalClearanceFormProps {
    onSuccess?: () => void;
}

function PersonalClearanceForm({ onSuccess }: PersonalClearanceFormProps) {
    // const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const { data: residents = [], isLoading: residentLoading} = useGetResidents()
    const { data: purposes = [], isLoading: purposesLoading} = useGetPurposeAndRate()

    const purposeOptions = purposes
    .filter(purposes => purposes.pr_is_archive === false)
    .filter(purposes => purposes.pr_category === 'Personal And Others')
    .map(purposes => ({
        id: purposes.pr_id.toString(),
        name: `${purposes.pr_purpose}`
    }));

    const form = useForm<z.infer<typeof PersonalClearanceFormSchema>>({
        resolver: zodResolver(PersonalClearanceFormSchema),
        defaultValues: {
            serialNo: "",
            requester: "",
            purpose: "", 
            rp_id: ""
        },
    });

    // Debounced search for residents
    const onSubmit = async (values: z.infer<typeof PersonalClearanceFormSchema>) => {
        try {   
            setIsSubmitting(true);
            
            const payload = {
                ...values,
            };
            
            console.log(payload)
            await createPersonalClearance(payload);
            toast.success("Personal clearance created successfully!");
            
            form.reset();
            await queryClient.invalidateQueries({ queryKey: ["personalClearances"] });
            
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error('Error creating personal clearance:', error);
            toast.error("Failed to create personal clearance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-7">
                <div className="flex flex-col gap-5">
                    <FormField
                        control={form.control}
                        name="serialNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Receipt Serial No.:</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g.(123456)" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="requester"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Requester:</FormLabel>
                                <FormControl>
                                  
                                    <ComboboxInput
                                         value={field.value}
                                         options={residents}
                                         isLoading={residentLoading}
                                         label=""
                                         placeholder="Search resident by name"
                                         emptyText="No residents found"
                                         onSelect={(value: string, item: any) => {
                                             field.onChange(value);
                                             form.setValue('rp_id', item?.rp_id || '');
                                         }}
                                         onCustomInput={(value: string) => {
                                             field.onChange(value);
                                             form.setValue('rp_id', '');
                                         }}
                                         displayKey="full_name"
                                         valueKey="full_name"
                                         additionalDataKey="rp_id" 
                                     />
                                
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div>
                    <FormSelect
                        control={form.control}
                        name="purpose"
                        label="Purpose"
                        options={purposeOptions}
                    />
                </div>

                <div className="flex justify-end">
                    <Button disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Proceed"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default PersonalClearanceForm;