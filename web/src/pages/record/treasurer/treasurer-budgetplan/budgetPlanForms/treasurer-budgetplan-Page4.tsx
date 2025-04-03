import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { FormData, CapitalOutlaysAndNonOfficeSchema } from "@/form-schema/budgetplan-create-schema";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { formatNumber } from "@/helpers/currencynumberformatter";

const styles = {
    fieldStyle: "flex flex-cols-2 gap-5 items-center p-2",
    tabledata: "w-[18rem] flex justify-center items-center",
    formfooter: "font-bold text-blue w-[18rem] justify-center flex ",
};

type BudgetPlanPage4FormData = z.infer<typeof CapitalOutlaysAndNonOfficeSchema>;

type Props = {
    onPrevious3: () => void;
    onSubmit: () => void;
    updateFormData: (data: Partial<BudgetPlanPage4FormData>) => void;
    formData: BudgetPlanPage4FormData;
};

function CreateBudgetPlanPage4({ onPrevious3, onSubmit, updateFormData, formData }: Props) {
    // page 4 budget items
    const budgetItems = [
        { name: "capitalOutlays", label: "Total Capital Outlays" },
        { name: "cleanAndGreen", label: "Clean & Green Environmental" },
        { name: "streetLighting", label: "Street Lighting Project" },
        { name: "rehabMultPurpose", label: "Rehabilitation of Multi-Purpose" },
        { name: "skFund", label: "Subsidy to Sangguniang Kabataan (SK) FUnd" },
        { name: "qrfFund", label: "Quick Response Fund (QRF)" },
        { name: "disasterTraining", label: "Disaster Training" },
        { name: "disasterSupplies", label: "Disaster Supplies" },
    ];

    const location = useLocation();
    const { balance, realtyTaxShare, taxAllotment, clearanceAndCertFees, otherSpecificIncome} = location.state

    const availableResources =
    (parseFloat(balance) || 0) +
    (parseFloat(realtyTaxShare) || 0) +
    (parseFloat(taxAllotment) || 0) +
    (parseFloat(clearanceAndCertFees) || 0) +
    (parseFloat(otherSpecificIncome) || 0);

    const [totalOutlays, setTotalOutlays] = useState(0.00);
    const [totalDevFund, settotalDevFund] = useState(0.00);
    const [totalCalamityFund, settotalCalamityFund] = useState(0.00);
    const [skFundBalance, setskFundBalance] = useState(0.00);
    const [calamityFundBalance ,setcalamityFundBalance] = useState(0.00);
    const [localDevBalance, setlocalDevBalance] = useState(0.00);

    const localDevBudgetLimit = taxAllotment * 0.20;
    const skBudgetLimit = availableResources * 0.10;
    const calamityFundBudgetLimit = availableResources* 0.05;



    const form = useForm<BudgetPlanPage4FormData>({
        resolver: zodResolver(CapitalOutlaysAndNonOfficeSchema),
        defaultValues: formData,
    });

    const { watch } = form;
    const formValues = watch();
    const capitalOutlaysVal = watch("capitalOutlays");
    const localDevVal = watch(["cleanAndGreen", "streetLighting", "rehabMultPurpose"]);
    const calamityFundVal = watch(["qrfFund", "disasterTraining", "disasterSupplies"]);
    const skVal = watch("skFund");

    useEffect(() => {
        updateFormData(formValues);
    }, [formValues, updateFormData]);

    // localDev
    useEffect(() => {
        const calculatedTotal = Object.values(localDevVal).reduce((acc, val) => acc + (Number(val) || 0), 0);
        const remainingBal = localDevBudgetLimit - calculatedTotal;
        settotalDevFund(calculatedTotal);
        setlocalDevBalance(remainingBal);
    }, [localDevVal, localDevBudgetLimit]);
    

    // Calamity Fund
    useEffect(() => {
        const calculatedTotal = Object.values(calamityFundVal).reduce((acc, val) => acc + (Number(val) || 0), 0);
        const remainingBal = calamityFundBudgetLimit - calculatedTotal;
        settotalCalamityFund(calculatedTotal);
        setcalamityFundBalance(remainingBal);
    }, [calamityFundVal, calamityFundBudgetLimit]);


    // SkFund
    useEffect(() => {
        const remainingBal = skBudgetLimit - (Number(skVal) || 0)
        setskFundBalance(remainingBal)
    }, [skVal, skBudgetLimit])

    // Capital Outlays
    useEffect(() => {
        const calculatedTotal = Number(capitalOutlaysVal) || 0;
        setTotalOutlays(calculatedTotal);
    }, [capitalOutlaysVal])


    // next and previous handlers
    const handleSubmit = (value: BudgetPlanPage4FormData) => {
        console.log('Submitting data for page 4:', value)
        updateFormData(value);
        onSubmit();
    };

    const handlePrevious = () => {
        updateFormData(form.getValues()); 
        onPrevious3(); 
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="mb-4">
                    <div className="mb-5 bg-white p-5 w-full max-h-[21rem] overflow-x-auto">
                        <div className='p-2 flex flex-col gap-1'>
                            <h1 className='font-bold flex justify-center w-[21rem]'>CAPITAL OUTLAYS</h1>
                        </div>
                        {budgetItems.map(({ name, label }) => (
                            <div key={name}>
                                <FormField
                                    control={form.control}
                                    name={name as keyof BudgetPlanPage4FormData}
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className={styles.fieldStyle}>
                                                <FormLabel className="w-[20rem]">{label}</FormLabel>
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

                                                {name == "skFund" && (
                                                    <>
                                                        <div className="justify-end flex ml-4">
                                                            <div className="flex flex-row gap-[3.5rem] justify-center">
                                                                <Label className={styles.tabledata}>
                                                                    {formatNumber(skBudgetLimit)}
                                                                </Label>
                                                                <Label className={styles.tabledata}>
                                                                    {formatNumber(skFundBalance)}
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
                                
                                {["rehabMultPurpose", "disasterSupplies"].includes(name) && (
                                    <div className="flex justify-end p-2">
                                        <div className="flex flex-row justify-center gap-[3rem]">
                                            <Label className={styles.formfooter}>
                                                Total: Php {name === "rehabMultPurpose" ? formatNumber(totalDevFund) : formatNumber(totalCalamityFund)}
                                            </Label>
                                            <Label className={styles.formfooter}>
                                                {name === "rehabMultPurpose" ? formatNumber(localDevBudgetLimit) : formatNumber(calamityFundBudgetLimit)}
                                            </Label> 
                                            <Label className={styles.formfooter}>
                                                {name === "rehabMultPurpose" ? formatNumber(localDevBalance) : formatNumber(calamityFundBalance)}
                                            </Label> 
                                        </div>
                                    </div>
                                )}


                                {name == "capitalOutlays" && (
                                    <div>
                                        <div className="flex justify-start p-2 ml-[21rem]">
                                            <div className="flex flex-row justify-center">
                                                <Label className={styles.formfooter}>Total: {formatNumber(totalOutlays)}</Label>
                                            </div>
                                        </div>
                                        <div className='p-2 flex flex-col gap-1'>
                                            <h1 className='font-bold flex justify-center w-[21rem]'>NON-OFFICE</h1>
                                            <h3 className='font-semibold text-blue flex justify-center w-[21rem]'>Local Development Fund</h3>
                                        </div>
                                    </div>
                                )}

                                {name === "rehabMultPurpose" && (
                                    <div className='p-2 flex flex-col gap-1'>
                                        <h3 className='font-semibold text-blue flex justify-center w-[21rem]'>Sangguniang Kabataan Fund</h3>
                                    </div>
                                )}

                                {name === "skFund" && (
                                    <div className='p-2 flex flex-col gap-1'>
                                        <h3 className='font-semibold text-blue flex justify-center w-[21rem]'>LDRRM Fund (Calamity Fund)</h3>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between">
                        <Button type="button" onClick={handlePrevious} className="w-[100px]">
                            Previous
                        </Button>
                        <Button type="submit" className="w-[100px]">
                            Submit
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}

export default CreateBudgetPlanPage4;