import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import PersonalClearanceFormSchema from "@/form-schema/personalClearance-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { SelectLayout } from "@/components/ui/select/select-layout";

const purposeOptions = [
    { id: "1", name: "Employment" },
    { id: "2", name: "NSO/SSS/GSIS" },
    { id: "3", name: "Hospitalization/ CHAMP" },
    { id: "4", name: "Birth Certificate" },
    { id: "5", name: "Medical Assistance" },
    { id: "6", name: "Residency" },
];

function PersonalClearanceForm() {
    const form = useForm<z.infer<typeof PersonalClearanceFormSchema>>({
        resolver: zodResolver(PersonalClearanceFormSchema),
        defaultValues: {
            serialNo: "",
            requester: "",
            purposes: "",
        },
    });

    const onSubmit = (values: z.infer<typeof PersonalClearanceFormSchema>) => {
        console.log(values)
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
                                <FormLabel>Select purpose(s):</FormLabel>
                                <FormControl>
                                    <SelectLayout
                                        {...field}
                                        className="w-full"
                                        options={purposeOptions}
                                        label=""
                                        placeholder="Select purpose(s)"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
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
}

export default PersonalClearanceForm;