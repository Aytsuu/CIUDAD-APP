//LATEST WITH EVERYTHING

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import IncomeExpenseFormSchema from "@/form-schema/income-expense-tracker-schema";
// import { Textarea } from "@/components/ui/textarea";
// import { useState } from "react";
// import { Combobox } from "@/components/ui/combobox";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { SetStateAction } from "react";
// import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
// import { useCreateIncomeExpense } from "./queries/treasurerIncomeExpenseAddQueries";


// interface IncomeandExpenseCreateFormProps {
//     onSuccess?: () => void; // Add this prop type
// }



// function IncomeandExpenseCreateForm( { onSuccess }: IncomeandExpenseCreateFormProps) {

//     const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");

//     const entrytypeSelector = [
//         { id: "0", name: "Income" },
//         { id: "1", name: "Expense" },
//     ];

    
//     const { data: budgetItems = [] } = useBudgetItems();

//     const particularSelector = budgetItems.map(item => ({
//         id: `${item.id} ${item.name}`,
//         name: item.name,
//         proposedBudget: item.proposedBudget
//     }));

//     const [currentStep, setCurrentStep] = useState(1); // Track the current step

//     const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
//         resolver: zodResolver(IncomeExpenseFormSchema),
//         defaultValues: {
//             iet_entryType: "",
//             iet_particulars: "",
//             iet_amount: "",
//             iet_additional_notes: "",
//             iet_receipt_image: undefined,
//         },
//     });


//     const { mutate: createEntry } = useCreateIncomeExpense(onSuccess);

//     const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//       createEntry(values);
//     };


//     const selectedParticularId = form.watch("iet_particulars");
//     const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);

//     const handleProceed = () => {
//         // Validate the first step's fields before proceeding
//         const amount = form.getValues("iet_amount");
//         const entryType = form.getValues("iet_entryType");
//         const particulars = form.getValues("iet_particulars");
    
//         if (!amount || !entryType || !particulars) {
//             alert("Please fill out all fields before proceeding.");
//             return;
//         }
    
//         // Check if selectedParticular exists
//         if (!selectedParticular) {
//             alert("Please select a valid particular.");
//             return;
//         }
    
//         if(entryType === "1"){ // only validates when the entry type is Expense
            
//             const particularAccBudget = selectedParticular.proposedBudget;
//             const subtractedAmount = particularAccBudget - parseFloat(amount);
        
//             if (subtractedAmount < 0) {
//                 alert("Insufficient Budget");
//                 return;
//             }            
//         }
   
//         // Move to the next step
//         setCurrentStep(2);
//     };

//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//                 {/* Step 1: Amount, Entry Type, and Particulars */}
//                 {currentStep === 1 && (
//                     <>                    
//                         {selectedParticular && form.watch("iet_entryType") === "1" && (
//                             <div className="pb-5">
//                                 <div className="flex w-full h-9 bg-buttonBlue justify-center items-center rounded-md text-white">
//                                     <Label>Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}</Label>
//                                 </div>
//                             </div>
//                         )}


//                         <div className="pb-5">
//                             <FormField
//                                 control={form.control}
//                                 name="iet_entryType"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Entry Type</FormLabel>
//                                         <FormControl>
//                                             <SelectLayout
//                                                 {...field}
//                                                 options={entrytypeSelector}
//                                                 value={field.value}
//                                                 onChange={field.onChange}
//                                                 label="Select Entry Type"
//                                                 placeholder="Select Entry Type"
//                                                 className="w-full"
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>
                        
//                         <div className="pb-5">
//                             <FormField
//                                 control={form.control}
//                                 name="iet_particulars"
//                                 render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Particulars</FormLabel>
//                                     <FormControl>
//                                     {form.watch("iet_entryType") === "1" ? (
//                                         <Combobox
//                                         options={particularSelector}
//                                         value={field.value}
//                                         onChange={field.onChange}
//                                         placeholder="Select Particulars"
//                                         emptyMessage="No particulars found"
//                                         contentClassName="w-full"
//                                         />
//                                     ) : (
//                                         <Input type="text" {...field} />
//                                     )}
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                                 )}
//                             />
//                         </div>                                             

//                         <div className="pb-5">
//                             <FormField
//                                 control={form.control}
//                                 name="iet_amount"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Amount</FormLabel>
//                                         <FormControl>
//                                             <Input {...field} type="number" placeholder="Enter amount" />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>

//                         <div className="flex justify-end mt-[20px]">
//                             <Button type="button" onClick={handleProceed}>
//                                 Proceed
//                             </Button>
//                         </div>
//                     </>
//                 )}

//                 {/* Step 2: Remaining Fields */}
//                 {currentStep === 2 && (
//                     <>

//                         <div className="pb-5">
//                             <FormField
//                                 control={form.control}
//                                 name="iet_additional_notes"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Additional Notes</FormLabel>
//                                         <FormControl>
//                                             <Textarea {...field} placeholder="Add more details (Optional)" />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>

//                         <div className="pb-5">
//                             <FormField
//                                 control={form.control}
//                                 name="iet_receipt_image"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Receipt</FormLabel>
//                                         <FormControl>
//                                             <MediaUpload
//                                                 title="Receipt Image"
//                                                 description="Upload an image of your receipt as proof of transaction"
//                                                 mediaFiles={mediaFiles}
//                                                 activeVideoId={activeVideoId}
//                                                 setMediaFiles={(value: SetStateAction<any[]>) => {
//                                                     // Handle both direct value and functional update
//                                                     const newFiles = typeof value === 'function' 
//                                                         ? value(mediaFiles) 
//                                                         : value;
//                                                     setMediaFiles(newFiles);
//                                                     field.onChange(newFiles.length > 0 ? newFiles[0] : undefined);
//                                                 }}
//                                                 setActiveVideoId={setActiveVideoId}
//                                             />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>

//                         <div className="flex justify-end mt-[20px]">
//                             <Button type="submit">Save Entry</Button>
//                         </div>
//                     </>
//                 )}
//             </form>
//         </Form>
//     );
// }

// export default IncomeandExpenseCreateForm;




import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import IncomeExpenseFormSchema from "@/form-schema/treasurer/expense-tracker-schema";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { MediaUpload } from "@/components/ui/media-upload";
import { SetStateAction } from "react";
import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useCreateIncomeExpense } from "./queries/treasurerIncomeExpenseAddQueries";
import { useIncomeExpenseMainCard } from "./queries/treasurerIncomeExpenseFetchQueries";



interface IncomeandExpenseCreateFormProps {
    onSuccess?: () => void; // Add this prop type
    year: string;
    totBud: number;
    totExp: number;
}



function IncomeandExpenseCreateForm( { onSuccess, year}: IncomeandExpenseCreateFormProps) {

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
            iet_entryType: "",
            iet_datetime: "",
            iet_particulars: "",
            iet_amount: "",
            iet_actual_amount: "",
            iet_additional_notes: "",
            iet_receipt_image: undefined,
        },
    });


    const { mutate: createExpense } = useCreateIncomeExpense(onSuccess);
    const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

    const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === years);
    const totBud = matchedYearData?.ie_remaining_bal ?? 0;
    const totExp = matchedYearData?.ie_main_exp ?? 0;

    console.log("EXP REMAIN BAL CREATE: ", totBud)

    // const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {


    //     let totalBudget = 0.00
    //     let totalExpense = 0.00

    //     console.log("Raw iet_amount:", values.iet_amount); // Log the raw form value
    //     console.log("Type of iet_amount:", typeof values.iet_amount);

    //     const amount = Number(values.iet_amount); 
    //     const actualAmount = values.iet_actual_amount ? Number(values.iet_actual_amount) : 0;
        
    //     const selectedDate = new Date(values.iet_datetime);
    //     const selectedYear = selectedDate.getFullYear().toString();
        
    //     // Validate that the selected date is in the correct year
    //     // if (selectedYear !== year) {
    //     //     form.setError("iet_datetime", {
    //     //         type: "manual",
    //     //         message: `Please select a date from ${year}`,
    //     //     });
    //     //     return;
    //     // }
    //     if (!values.iet_actual_amount) {
    //         totalBudget = totBud - amount;
    //         totalExpense = totExp + amount;
    //     } else {
    //         totalBudget = (totBud + amount) - actualAmount;
    //         totalExpense = (totExp - amount) + actualAmount; // Simplified logic
    //     }

    //     console.log("TOTAL EXPENSE: ", totalExpense)
    //     const allValues = {
    //         ...values,
    //         years,
    //         totalBudget,
    //         totalExpense
    //     }

    //     createExpense(allValues);
       
    // };

    useEffect(() => {
        if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
            form.setValue('iet_receipt_image', mediaFiles.map(file => ({
                name: file.file.name,
                type: file.file.type,
                path: file.storagePath || '',
                url: file.publicUrl || ''
            })));
        } else {
            form.setValue('iet_receipt_image', []);
        }
    }, [mediaFiles, form]);


    const selectedParticularId = form.watch("iet_particulars");
    const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);


    const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
        const inputDate = new Date(values.iet_datetime);
        const inputYear = inputDate.getFullYear();
        let totalBudget = 0.00;
        let totalExpense = 0.00;
        let proposedBud = 0.00;

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
            totalBudget,
            totalExpense,
            proposedBud,
            particularId,
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
                                        <FormLabel>Serial Number</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="iet_receipt_image"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Supporting Document</FormLabel>
                                        <FormControl>
                                            <MediaUpload
                                                title=""
                                                description="Upload supporting document as proof of transaction"
                                                mediaFiles={mediaFiles}
                                                activeVideoId={activeVideoId}
                                                setMediaFiles={setMediaFiles}
                                                setActiveVideoId={setActiveVideoId}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end mt-[20px] space-x-2">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                Back
                            </Button>
                            <Button type="submit">Save Entry</Button>
                        </div>
                    </>
                )}
            </form>
        </Form>
    );
}

export default IncomeandExpenseCreateForm;