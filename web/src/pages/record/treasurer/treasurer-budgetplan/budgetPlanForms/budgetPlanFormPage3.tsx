import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { FormData, CurrentExpenditureMaintandOtherExpensesSchema2 } from "@/form-schema/treasurer/budgetplan-create-schema";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from "react";
import { formatNumber } from "@/helpers/currencynumberformatter";
import { toast } from "sonner";

const styles = {
    fieldStyle: "flex flex-cols-2 gap-5 items-center p-2",
    tabledata: "w-[18rem] flex justify-center items-center",
    formfooter: "font-bold text-blue w-[18rem] justify-center flex ",
};

type BudgetPlanPage3FormData = z.infer<typeof CurrentExpenditureMaintandOtherExpensesSchema2>;

function CreateBudgetPlanPage3({ onPrevious2, onNext4, updateFormData, formData, actualRPT, miscExpenseLimit, isBeyondLimit }: {
    onPrevious2: () => void,
    onNext4: () => void,
    updateFormData: (data: Partial<BudgetPlanPage3FormData>) => void,
    formData: BudgetPlanPage3FormData,
    actualRPT: number,
    miscExpenseLimit: number,
    isBeyondLimit: boolean,
}) {
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
        { name: "miscExpense", label: `Extraordinary & Miscellaneous Expense (${miscExpenseLimit}%)` },
    ]

    const [total, setTotal] = useState(0.00);
    const [balance, setBalance] = useState(0);
    const [isOverLimit, setOverLimit] = useState(false);

    const budgetLimitValue = actualRPT * (miscExpenseLimit/100);

    const form = useForm<BudgetPlanPage3FormData>({
        resolver: zodResolver(CurrentExpenditureMaintandOtherExpensesSchema2),
        defaultValues: formData,
    });

    const { watch } = form;
    const formValues = watch();
    const miscExpenseVal = watch("miscExpense");
    const miscExpenseToast = useRef<string | number | null> (null);

    useEffect(() => {
        updateFormData(formValues);
    }, [formValues, updateFormData]);

    useEffect(() => {
        const calculatedTotal = Object.values(formValues).reduce((acc, val) => acc + (Number(val) || 0), 0);
        setTotal(calculatedTotal);
    }, [formValues]);

    useEffect(() => {
        const MiscExpenseNum = Number(miscExpenseVal) || 0;
        let remainingBal = budgetLimitValue - MiscExpenseNum;
    
        if (Math.abs(remainingBal) < 0.01) {
            remainingBal = 0;
        }
        
        setBalance(remainingBal);
            if (remainingBal < 0) {
                    setOverLimit(true);
                    // Only show toast if one isn't already showing
                    if (!miscExpenseToast.current) {
                        miscExpenseToast.current = toast.error("Input exceeds the allocated budget. Please enter a lower amount.", {
                            duration: Infinity, 
                            style: {
                                border: '1px solid #f87171',
                                padding: '16px',
                                color: '#b91c1c',
                                background: '#fef2f2',
                            },
                        });
                    }
                } else {
                    if(miscExpenseToast.current !== null){
                        setOverLimit(false);
                        toast.dismiss(miscExpenseToast.current);
                        miscExpenseToast.current = null;
                    }
                }
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
                    <div className="mb-5 bg-white p-5 w-full">
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
                                                <FormLabel className={name.startsWith("gadProg") || name.startsWith("seniorProg") || name.startsWith("juvJustice") || name.startsWith("badacProg") || name.startsWith("nutritionProg") || name.startsWith("aidsProg") || name.startsWith("assemblyExpenses") || name.startsWith("disasterProg") ? "w-[18rem] ml-8 text-black" : "w-[20rem] text-black"}>
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
                        <Button type="button" onClick={handlePrevious} className="w-[100px]" disabled={isOverLimit || isBeyondLimit}>
                            Previous
                        </Button>
                        <Button type="submit" className="w-[100px]" disabled={isOverLimit || isBeyondLimit}>
                            Next
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}

export default CreateBudgetPlanPage3;