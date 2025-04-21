import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { FormData, CurrentExpenditureMaintandOtherExpensesSchema1 } from "@/form-schema/treasurer/budgetplan-create-schema";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { formatNumber } from "@/helpers/currencynumberformatter";

const styles = {
    fieldStyle: "flex flex-cols-2 gap-5 items-center p-2",
    tabledata: "w-[18rem] flex justify-center items-center ",
    formfooter: "font-bold text-blue w-[18rem] justify-center flex ",
};

type BudgetPlanPage2FormData = z.infer<typeof CurrentExpenditureMaintandOtherExpensesSchema1>;

type Props = {
    onPrevious1: () => void;
    onNext3: () => void;
    updateFormData: (data: Partial<BudgetPlanPage2FormData>) => void;
    formData: BudgetPlanPage2FormData;
};

function CreateBudgetPlanPage2({ onPrevious1, onNext3, updateFormData, formData}: Props) {
    const budgetItems = [
        { name: "travelingExpenses", label: "Traveling Expense" },
        { name: "trainingExpenses", label: "Training Expenses" },
        { name: "officeExpenses", label: "Office Supplies Expenses" },
        { name: "accountableExpenses", label: "Accountable Forms Expenses" },
        { name: "medExpenses", label: "Drugs and Medicine Expense" },
        { name: "waterExpenses", label: "Water Expenses" },
        { name: "electricityExpenses", label: "Electricity Expenses" },
        { name: "telephoneExpenses", label: "Telephone Expenses" },
        { name: "memDues", label: "Membership Dues/Contribution to Organization" },
        { name: "officeMaintenance", label: "Repair and Maintenance of Office Equipment" },
        { name: "vehicleMaintenance", label: "Repair and Maintenance of Motor Vehicle" },
    ]
    
    const [total, setTotal] = useState(0);
    const [budgetLimit, setBudgetLimit] = useState(0.00); 

    const form = useForm<BudgetPlanPage2FormData>({
        resolver: zodResolver(CurrentExpenditureMaintandOtherExpensesSchema1),
        defaultValues: formData, 
    });
    

    const { watch } = form;
    const formValues = watch();
    const memDueVal = watch("memDues");

    useEffect(() => {
        updateFormData(formValues);
    }, [formValues, updateFormData]);

    useEffect(() => {
        const limit = Number(memDueVal) || 0;
        setBudgetLimit(limit)
    }, [memDueVal]);

    useEffect(() => {
        const calculatedTotal = Object.values(formValues).reduce((acc, val) => acc + (Number(val) || 0), 0);
        setTotal(calculatedTotal); 
    }, [formValues]);

    const onSubmit = (value: BudgetPlanPage2FormData) => {
        console.log("Submitting Page 2 Data:", value);
        updateFormData(value);
        onNext3();
    };

    const handlePrevious = () => {
        updateFormData(form.getValues()); 
        onPrevious1(); 
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <div className="mb-5 bg-white p-5 w-full">
                        <div className='p-2'>
                            <h3 className='font-semibold text-blue w-[21rem] flex justify-center'>Maint. & Other Operating Expenses</h3>
                        </div>
                        {budgetItems.map(({ name, label }) => (
                            <FormField
                                key={name}
                                control={form.control}
                                name={name as keyof BudgetPlanPage2FormData}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className={styles.fieldStyle}>
                                            <FormLabel className="w-[20rem] text-black">{label}</FormLabel>
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

                                            {name === "memDues" && (
                                                <>
                                                <div className='justify-end flex ml-4'>
                                                    <div className='flex flex-row gap-[3.5rem] justify-center'>
                                                        <Label className={styles.tabledata}>
                                                            {formatNumber(budgetLimit.toString())}
                                                        </Label>
                                                    </div>
                                                </div>
                                                </>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}

                        <div className="flex justify-start p-2 ml-[21rem]">
                            <Label className={styles.formfooter}>Total: {formatNumber(total.toString())}</Label>
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

export default CreateBudgetPlanPage2;