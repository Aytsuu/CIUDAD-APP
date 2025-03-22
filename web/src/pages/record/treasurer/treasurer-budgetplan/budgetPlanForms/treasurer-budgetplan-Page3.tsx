    import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
    import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { z } from "zod";
    import { Input } from "@/components/ui/input";
    import { FormData, CurrentExpenditureMaintandOtherExpensesSchema2 } from "@/form-schema/budgetplan-create-schema";
    import { Button } from "@/components/ui/button";
    import { Label } from "@/components/ui/label";
    import { useEffect, useState } from "react";
    import { useLocation } from "react-router";
    import { formatNumber } from "@/helpers/currencynumberformatter";

    const styles = {
        fieldStyle: "flex flex-cols-2 gap-5 items-center p-2",
        tabledata: "w-[18rem] flex justify-center items-center",
        formfooter: "font-bold text-blue w-[18rem] justify-center flex ",
    };

    type BudgetPlanPage3FormData = z.infer<typeof CurrentExpenditureMaintandOtherExpensesSchema2>;

    type Props = {
        onPrevious2: () => void;
        onNext4: () => void;
        updateFormData: (data: Partial<BudgetPlanPage3FormData>) => void;
        formData: BudgetPlanPage3FormData;
    };

    function CreateBudgetPlanPage3({ onPrevious2, onNext4, updateFormData, formData }: Props) {
        // page 3 budget items
        const budgetItems = [
            { name: "fidelityBond", label: "Fidelity Bond Premiums" },
            { name: "insuranceExpense", label: "Insurance Expenses" },
            { name: "gadProg", label: "GAD Program" },
            { name: "seniorProg", label: "Senior Citizen/ PWD Program" },
            { name: "juvJustice", label: "BCPC (Juvenile Justice System)" },
            { name: "badacProg", label: "BADAC Program" },
            { name: "nutritionProg", label: "Nutrition Program" },
            { name: "aidsProg", label: "Combating AIDS Program" },
            { name: "assemblyExpenses", label: "Barangay Assembly Expenses" },
            { name: "disasterProg", label: "Disaster Response Program" },
            { name: "miscExpense", label: "Extraordinary & Miscellaneous Expense" },
        ]

        const [total, setTotal] = useState(0.00);
        const [balance, setBalance] = useState(0);

        const location = useLocation();
        const { actualRPT } = location.state;

        const budgetLimitValue = actualRPT * 0.02;

        const form = useForm<BudgetPlanPage3FormData>({
            resolver: zodResolver(CurrentExpenditureMaintandOtherExpensesSchema2),
            defaultValues: formData,
        });

        const { watch } = form;
        const formValues = watch();
        const miscExpenseVal = watch("miscExpense");

        useEffect(() => {
            updateFormData(formValues);
        }, [formValues, updateFormData]);

        useEffect(() => {
            const calculatedTotal = Object.values(formValues).reduce((acc, val) => acc + (Number(val) || 0), 0);
            setTotal(calculatedTotal);
        }, [formValues]);

        useEffect(() => {
            const MiscExpenseNum = Number(miscExpenseVal) || 0;
            const remainingBal = budgetLimitValue - MiscExpenseNum;
            setBalance(remainingBal);
        },[miscExpenseVal, budgetLimitValue]);

        // Submit button function
        const onSubmit = (value: BudgetPlanPage3FormData) => {
            console.log('Submitting data for page 3:', value)
            updateFormData(value);
            onNext4();
        };

        // previous button function
        const handlePrevious = () => {
            updateFormData(form.getValues()); 
            onPrevious2(); 
        };


        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <div className="mb-5 bg-white p-5 w-full max-h-[21rem] overflow-x-auto">
                            <div className="p-2">
                                <h3 className="font-semibold text-blue w-[21rem] flex justify-center">
                                    Maint. & Other Operating Expenses
                                </h3>
                            </div>
                            {budgetItems.map(({ name, label }) => (
                                <div key={name}>
                                    <FormField
                                        control={form.control}
                                        name={name as keyof BudgetPlanPage3FormData}
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className={styles.fieldStyle}>
                                                    <FormLabel className={name.startsWith("gadProg") || name.startsWith("seniorProg") || name.startsWith("juvJustice") || name.startsWith("badacProg") || name.startsWith("nutritionProg") || name.startsWith("aidsProg") || name.startsWith("assemblyExpenses") || name.startsWith("disasterProg") ? "w-[18rem] ml-8" : "w-[20rem]"}>
                                                        {label}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value);
                                                            }}
                                                            placeholder="0.00"
                                                            type="number"
                                                            className="w-[18rem]"
                                                        />
                                                    </FormControl>

                                                    {name == "miscExpense" && (
                                                        <div className="flex justify-end p-2">
                                                                <div className="flex flex-row gap-[3.5rem] justify-center">
                                                                    <Label className={styles.tabledata}>{formatNumber(budgetLimitValue)}</Label>
                                                                    <Label className={styles.tabledata}>{formatNumber(balance)}</Label>
                                                                </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {name === "insuranceExpense" && (
                                        <div className="p-2">
                                            <Label className="font-semibold">Other Maint. & Operating Expenses</Label>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-start p-2 ml-[21rem]">
                                <Label className={styles.formfooter}>Total: {formatNumber(total)}</Label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between">
                            <Button type="button" onClick={handlePrevious} className="w-[100px]">
                                Previous
                            </Button>
                            <Button type="submit" className="w-[100px]">
                                Next
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        );
    }

    export default CreateBudgetPlanPage3;