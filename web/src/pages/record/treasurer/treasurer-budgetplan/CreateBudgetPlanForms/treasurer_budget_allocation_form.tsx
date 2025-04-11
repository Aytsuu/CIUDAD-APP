import { FormField, Form, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import BudgetAllocationSchema from "@/form-schema/budget-allocation-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import BudgetHeaderSchema from "@/form-schema/budgetplan-header-schema";

interface BudgetAllocationFormProps {
    headerValues: z.infer<typeof BudgetHeaderSchema>; // Just pass them as props
    onFinalSubmit: (allocationValues: z.infer<typeof BudgetAllocationSchema>) => void;
    setIsDialogOpen: (isOpen: boolean) => void;
}

function BudgetAllocationForm({ headerValues, onFinalSubmit, setIsDialogOpen}: BudgetAllocationFormProps) {
    const form = useForm<z.infer<typeof BudgetAllocationSchema>>({
        resolver: zodResolver(BudgetAllocationSchema),
        defaultValues: {
            personalServicesLimit: "",
            miscExpenseLimit: "",
            localDevLimit: "",
            skFundLimit: "",
            calamityFundLimit: "",
        }
    });

    const onSubmit = (values: z.infer<typeof BudgetAllocationSchema>) => {
        onFinalSubmit(values);
        setIsDialogOpen(false);
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="personalServicesLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Personal Services</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="miscExpenseLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Extraordinary & Miscellaneous Expense</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="localDevLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Local Development Fund</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="skFundLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sangguniang Kabataan (SK) Fund</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="calamityFundLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Calamity Fund</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" placeholder="0" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end mt-[20px]">
                            <Button type="submit">Proceed</Button>
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
}

export default BudgetAllocationForm;
