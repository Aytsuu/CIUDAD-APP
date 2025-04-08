import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { CurrentExpendituresPersonalServicesSchema, FormData } from "@/form-schema/budgetplan-create-schema";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { formatNumber } from "@/helpers/currencynumberformatter";

const styles = {
    fieldStyle: "flex flex-cols-2 gap-5 items-center p-2",
    formfooter: "font-bold text-blue w-[18rem] justify-center flex ",
};

type BudgetPlanPage1FormData = z.infer<typeof CurrentExpendituresPersonalServicesSchema>;

type Props = {
    onNext2: () => void;
    updateFormData: (data: Partial<BudgetPlanPage1FormData>) => void;
    formData: BudgetPlanPage1FormData;
};

function CreateBudgetPlanPage1({ onNext2, updateFormData, formData }: Props) {
    const location = useLocation();
    const { actualIncome } = location.state;

    const [total, setTotal] = useState(0);
    const [Balance, setBalance] = useState(0);
    const personalServicesBudgetLimit = actualIncome * 0.55;

    const form = useForm<BudgetPlanPage1FormData>({
        resolver: zodResolver(CurrentExpendituresPersonalServicesSchema),
        defaultValues: formData, 
    });

    const { watch } = form;
    const formValues = watch();

    useEffect(() => {
        updateFormData(formValues);
    }, [formValues, updateFormData]);

    useEffect(() => {
        const calculatedTotal = Object.values(formValues).reduce((acc, val) => acc + (Number(val) || 0), 0);
        setTotal(calculatedTotal);
    }, [formValues]);

    useEffect(() => {
        const calculatedBalance = personalServicesBudgetLimit - total;
        setBalance(calculatedBalance);
    }, [total, personalServicesBudgetLimit]);

    const onSubmit = (value: BudgetPlanPage1FormData) => {
        console.log("Submitting Page 1 Data:", value);
        updateFormData(value); 
        onNext2(); 
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}> 
                <div className="mb-4">
                    <div className="mb-5 bg-white p-5 w-full max-h-[21rem] overflow-x-auto">
                        <div className='p-2 flex flex-col gap-1'>
                            <h1 className='font-bold flex justify-center w-[21rem]'>CURRENT OPERATING EXPENDITURES</h1>
                            <h3 className='font-semibold text-blue flex justify-center w-[21rem]'>Personal Services</h3>
                        </div>
                        {[
                            { name: "honorariaOfficials", label: "Honoraria for Officials" },
                            { name: "cashOfficials", label: "Cash Gift for Officials" },
                            { name: "midBonusOfficials", label: "Mid-Year Bonus for Officials" },
                            { name: "endBonusOfficials", label: "Year-End Bonus for Officials" },
                            { name: "honorariaTanods", label: "Honoraria for Tanods" },
                            { name: "honorariaLupon", label: "Honoraria for Lupon Members" },
                            { name: "honorariaBarangay", label: "Honoraria for Barangay Workers" },
                            { name: "prodEnhancement", label: "Productivity Enhancement Incentive" },
                            { name: "leaveCredits", label: "Commutation of Leave Credits" },
                        ].map(({ name, label }) => (
                            <FormField
                                key={name}
                                control={form.control}
                                name={name as keyof BudgetPlanPage1FormData}
                                render={({ field }) => (
                                    <FormItem>
                                        <div className={styles.fieldStyle}>
                                            <FormLabel className="w-[20rem]">{label}</FormLabel>
                                            <FormControl>
                                                <Input {...field}  value={field.value || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value); 
                                                    }}
                                                    placeholder="0.00"
                                                    type="number" 
                                                    className="w-[18rem]"
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}

                        <div className="flex justify-end p-2">
                            <div className="flex flex-row justify-center gap-[2rem]">
                                <Label className={styles.formfooter}>Total: {formatNumber(total)}</Label>
                                <Label className={styles.formfooter}>{formatNumber(personalServicesBudgetLimit)}</Label> 
                                <Label className={styles.formfooter}>{formatNumber(Balance)}</Label> 
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="w-[100px]">Next</Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}

export default CreateBudgetPlanPage1;