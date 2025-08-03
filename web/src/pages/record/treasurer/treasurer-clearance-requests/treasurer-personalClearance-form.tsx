import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import PersonalClearanceFormSchema from "@/form-schema/personalClearance-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";




function PersonalClearanceForm(){
    const { user } = useAuth();

    const onSubmit = (values: z.infer<typeof PersonalClearanceFormSchema>) => {
        try {
            // Get staff_id from current user using the correct pattern
            const staffId = user?.staff?.staff_id;
            
            if (!staffId) {
                toast.error("Staff information not available. Please log in again.");
                return;
            }

            const payload = {
                ...values,
                staff: staffId  // Use the current user's staff_id
            };
            
            console.log("Personal Clearance Data:", payload);
            // TODO: Add API call here
        } catch (error) {
            console.error('Error creating personal clearance:', error);
            toast.error("Failed to create personal clearance. Please try again.");
        }
    };

    const form = useForm<z.infer<typeof PersonalClearanceFormSchema>>({
        resolver: zodResolver(PersonalClearanceFormSchema),
            defaultValues: {
                serialNo: "",
                requester: "",
                purposes: [], 
            },
        });

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
                            <FormItem>
                                <FormLabel>Requester:</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g.(Juan Dela Cruz)" type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div>
                    <FormField
                        control={form.control}
                        name="purposes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select a purpose:</FormLabel>

                                {/* Bordered box for checkboxes */}
                                <div className="flex flex-col gap-3 border border-gray-300 p-2">
                                    {[
                                        "Employment",
                                        "NSO/SSS/GSIS",
                                        "Hospitalization/ CHAMP",
                                        "Birth Certificate",
                                        "Medical Assistance",
                                        "Residency",
                                    ].map((purpose) => (
                                        <div key={purpose} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={field.value?.includes(purpose)}
                                                onCheckedChange={(checked: boolean) => {
                                                    field.onChange(
                                                        checked
                                                            ? [...field.value, purpose] // Add selected purpose
                                                            : field.value.filter((p: string) => p !== purpose) // Remove unselected purpose
                                                    );
                                                }}
                                            />
                                            <FormLabel>{purpose}</FormLabel>
                                        </div>
                                    ))}
                                </div>
                                <FormMessage className="mt-2" />
                            </FormItem>
                        )}
                    />
                </div>


                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button>Proceed</Button>
                </div>
            </form>
        </Form>
        );
};

export default PersonalClearanceForm;
