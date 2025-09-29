import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import IncomeExpenseFormSchema from "@/form-schema/treasurer/expense-tracker-schema";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { MediaUpload } from "@/components/ui/media-upload";
import { useBudgetItems } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useCreateIncomeExpense } from "./queries/treasurerIncomeExpenseAddQueries";
import { useIncomeExpenseMainCard, type IncomeExpenseCard } from "./queries/treasurerIncomeExpenseFetchQueries";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


interface IncomeandExpenseCreateFormProps {
    onSuccess?: () => void; // Add this prop type
    year: string;
    totBud: number;
    totExp: number;
}



function IncomeandExpenseCreateForm( { onSuccess, year}: IncomeandExpenseCreateFormProps) {
    
    const { user } = useAuth();
    const inputCss = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
    const years = Number(year)
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");


    const { data: budgetItems = [] } = useBudgetItems(years);


    const particularSelector = budgetItems.map(item => ({
        id: `${item.id} ${item.name}`,
        name: item.name,
        proposedBudget: item.proposedBudget
    }));

    const [currentStep, setCurrentStep] = useState(1); // Track the current step

    const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
        resolver: zodResolver(IncomeExpenseFormSchema),
        defaultValues: {
            iet_serial_num: "",
            iet_check_num: "",
            iet_entryType: "",
            iet_datetime: "",
            iet_particulars: "",
            iet_amount: "",
            iet_actual_amount: "",
            iet_additional_notes: "",
        },
    });


    const { mutate: createExpense, isPending } = useCreateIncomeExpense(onSuccess);
    const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

    const matchedYearData = fetchedData.find((item: IncomeExpenseCard) => Number(item.ie_main_year) === Number(year));
    const totBud = matchedYearData?.ie_remaining_bal ?? 0;
    const totExp = matchedYearData?.ie_main_exp ?? 0;

    console.log("EXP REMAIN BAL CREATE: ", totBud)


    const selectedParticularId = form.watch("iet_particulars");
    const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);


    const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
        const inputDate = new Date(values.iet_datetime);
        const inputYear = inputDate.getFullYear();
        let totalBudget = 0.00;
        let totalExpense = 0.00;
        let proposedBud = 0.00;
        let returnAmount = 0.00;

        //proposed budget
        const proposedBudget = selectedParticular?.proposedBudget;
        const propBudget = Number(proposedBudget);

        //amount
        const amount = Number(values.iet_amount);
        const actualAmount = values.iet_actual_amount ? Number(values.iet_actual_amount) : 0;

        //current Expenses and Total Budget
        const totEXP = Number(totExp);
        const totBUDGET = Number(totBud);

        console.log("CURRENT EXPENSEEEEE: ", totEXP)
        console.log("CURRENT BUDGETTTTTTTT: ", totBUDGET)        

        //dtl_id
        const particularid = selectedParticularId?.split(' ')[0] || '';
        const particularId = Number(particularid);

        const files = mediaFiles.map((media) => ({
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))

        if(!values.iet_serial_num && !values.iet_check_num){
            form.setError('iet_serial_num', {
                type: 'manual',
                message: "Please enter a data either on this field"
            });

            form.setError('iet_check_num', {
                type: 'manual',
                message: "Please enter a data either on this field"
            });
            return; 
        }

        if (inputYear !== years) {
            form.setError('iet_datetime', {
                type: 'manual',
                message: `Date must be in the year ${years}`
            });
            return; 
        }

        
        if(!values.iet_additional_notes){
            values.iet_additional_notes = "None";
        }

        if(amount && actualAmount){
            totalBudget = totBUDGET - actualAmount;
            totalExpense = totEXP + actualAmount;
            proposedBud = propBudget - actualAmount;
            returnAmount = Math.abs(amount - actualAmount);
        }
        else{
            if(amount){
                console.log("HERRRRRRRRRRRRRREEEEEEEEEEEEEERRRRRRR ONLLLYY AMOUNTTT")
                totalBudget = totBUDGET - amount;
                totalExpense = totEXP + amount;
                proposedBud = propBudget - amount;                
            }
            else{ // incase, if ever makasulosot w/o value sa proposed amount
                totalBudget = totBUDGET - actualAmount;
                totalExpense = totEXP + actualAmount;
                proposedBud = propBudget - actualAmount;                
            }
        }

        console.log("TOTAL EXPENSEEEEEEEEEEEEEEEEE: ", totalExpense);   
        const allValues = {
            ...values,
            years,
            returnAmount,
            totalBudget,
            totalExpense,
            proposedBud,
            particularId,
            files,
            staff: user?.staff?.staff_id
        };
        console.log("TANANNNNNNNNNNNNNNNN: ", allValues)

        createExpense(allValues);
    };


    const handleProceed = () => {
        // Validate the first step's fields before proceeding
        const amount = Number(form.getValues("iet_amount"));
        const actual_amount = Number(form.getValues("iet_actual_amount")) || 0;
    
        //Checks for amount
        if (!amount || amount <= 0) {
            form.setError("iet_amount", {
                type: "manual",
                message: `Enter a valid amount`,
            });
            return;
        }

        if(actual_amount < 0){
            form.setError("iet_actual_amount", {
                type: "manual",
                message: `Enter a valid actual amount`,
            });
            return;            
        }
    
        // Check if selectedParticular exists
        if (!selectedParticular) {
            form.setError("iet_particulars", {
                type: "manual",
                message: `Select a valid particular`,
            });
            return;
        }
                
        const particularAccBudget = selectedParticular.proposedBudget;
        const subtractedAmount = particularAccBudget - amount;
        const subtractedActualAmount = particularAccBudget - actual_amount;

    
        if (subtractedAmount < 0) {
            form.setError("iet_amount", {
                type: "manual",
                message: `Insufficient Balance`,
            });
            return
        }
        
        if (subtractedActualAmount < 0) {
            form.setError("iet_actual_amount", {
                type: "manual",
                message: `Insufficient Balance`,
            });
            return
        }         

   
        // Move to the next step
        setCurrentStep(2);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Step 1: Amount, Entry Type, and Particulars */}
                {currentStep === 1 && (
                    <>                    
                        {selectedParticular && (
                            <div className="pb-5">
                                <div className="flex w-full h-9 bg-primary justify-center items-center rounded-md text-white">
                                    <Label>Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}</Label>
                                </div>
                            </div>
                        )}
                        
                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_particulars"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Particulars</FormLabel>
                                    <FormControl>
                                        <Combobox
                                            options={particularSelector}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select Particulars"
                                            emptyMessage="No particulars found"
                                            contentClassName="w-full"
                                        />                                 
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>                                             

                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proposed Amount</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="Enter proposed amount" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_actual_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Actual Amount</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="Enter actual amount (optional)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end mt-[20px]">
                            <Button type="button" onClick={handleProceed}>
                                Proceed
                            </Button>
                        </div>
                    </>
                )}

                {/* Step 2: Remaining Fields */}
                {currentStep === 2 && (
                    <>

                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_serial_num"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Serial No.</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter serial number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_check_num"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Check No.</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter check number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>                        

                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_datetime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <input 
                                                type="datetime-local" {...field} 
                                                placeholder={`Date (${years} only)`} 
                                                className={inputCss}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_additional_notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Additional Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Add more details (Optional)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pb-5">
                            <MediaUpload
                                title=""
                                description="Upload supporting document as proof of transaction"
                                mediaFiles={mediaFiles}
                                activeVideoId={activeVideoId}
                                setMediaFiles={setMediaFiles}
                                setActiveVideoId={setActiveVideoId}
                            />   
                        </div>

                        <div className="flex justify-end mt-[20px] space-x-2">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                Back
                            </Button>
                            <Button type="submit" disabled={ isPending }>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Save Entry"
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </Form>
    );
}

export default IncomeandExpenseCreateForm;