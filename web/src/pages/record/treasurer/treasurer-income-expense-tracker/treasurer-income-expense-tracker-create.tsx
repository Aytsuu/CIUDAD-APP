
// import { Input } from "@/components/ui/input";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import IncomeExpenseFormSchema from "@/form-schema/income-expense-tracker-schema";
// import { Textarea } from "@/components/ui/textarea";
// import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";
// import { useState } from "react";

// function IncomeandExpenseCreateForm() {
//     const entrytypeSelector = [
//         { id: "0", name: "Income" },
//         { id: "1", name: "Expense" },
//     ];

//     const [currentStep, setCurrentStep] = useState(1); // Track the current step

//     const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
//         resolver: zodResolver(IncomeExpenseFormSchema),
//         defaultValues: {
//             iet_serial_num: "",
//             iet_entryType: "",
//             iet_particulars: "",
//             iet_amount: "",
//             iet_receiver: "",
//             iet_additional_notes: "",
//             iet_receipt_image: undefined,
//         },
//     });

//     const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//         try {
//             await income_expense_tracking(values);
//         } catch (err) {
//             console.error("Error submitting expense or income:", err);
//             alert("Failed to submit income or expense. Please check the input data and try again.");
//         }
//     };

//     const handleProceed = () => {
//         // Validate the first step's fields before proceeding
//         const amount = form.getValues("iet_amount");
//         const entryType = form.getValues("iet_entryType");
//         const particulars = form.getValues("iet_particulars");

//         if (!amount || !entryType || !particulars) {
//             alert("Please fill out all fields before proceeding.");
//             return;
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
//                                     <FormItem>
//                                         <FormLabel>Particulars</FormLabel>
//                                         <FormControl>
//                                             <Input {...field} placeholder="Enter particulars" />
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
//                                 name="iet_serial_num"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Serial No.</FormLabel>
//                                         <FormControl>
//                                             <Input {...field} placeholder="(e.g. 123456)" type="number" />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>

//                         <div className="pb-5">
//                             <FormField
//                                 control={form.control}
//                                 name="iet_receiver"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Receiver</FormLabel>
//                                         <FormControl>
//                                             <Input {...field} placeholder="Enter receiver name" />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>

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
//                                             <input
//                                                 className="mt-[8px] w-full border p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
//                                                 type="file"
//                                                 accept="image/*"
//                                                 onChange={(e) => {
//                                                     const files = e.target.files;
//                                                     if (files && files.length > 0) {
//                                                         const file = files[0];
//                                                         field.onChange(file);
//                                                     }
//                                                 }}
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
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import IncomeExpenseFormSchema from "@/form-schema/income-expense-tracker-schema";
import { Textarea } from "@/components/ui/textarea";
import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";
import { useEffect, useState } from "react";
import { getParticulars } from "./request/particularsGetRequest";
import { Combobox } from "@/components/ui/combobox";


interface IncomeandExpenseCreateFormProps {
    onSuccess?: () => void; // Add this prop type
}


interface BudgetItem {
    id: string;
    name: string;
    proposedBudget: number;
}


function IncomeandExpenseCreateForm( { onSuccess }: IncomeandExpenseCreateFormProps) {

    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

    const entrytypeSelector = [
        { id: "0", name: "Income" },
        { id: "1", name: "Expense" },
    ];

    useEffect(() => {
        const fetchBudgetItems = async () => {
            try {
                const data = await getParticulars();
                // Transform the API data to match your selector format
                const items = data.map((item: any) => ({
                    id: item.dtl_id.toString(),
                    name: item.dtl_budget_item,
                    proposedBudget: parseFloat(item.dtl_proposed_budget)
                }));
                setBudgetItems(items);
            } catch (error) {
                console.error("Failed to load current year budget items:", error);
                setBudgetItems([]); // Return empty array if error occurs
            } 
        };

        fetchBudgetItems();
    }, []);


    const particularSelector = budgetItems.map(item => ({
        id: `${item.id} ${item.name}`,
        name: item.name,
        proposedBudget: item.proposedBudget
    }));

    const [currentStep, setCurrentStep] = useState(1); // Track the current step

    const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
        resolver: zodResolver(IncomeExpenseFormSchema),
        defaultValues: {
            iet_entryType: "",
            iet_particulars: "",
            iet_amount: "",
            iet_additional_notes: "",
            iet_receipt_image: undefined,
        },
    });

    const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
        try {
            await income_expense_tracking(values);
            if (onSuccess) onSuccess(); 
        } catch (err) {
            console.error("Error submitting expense or income:", err);
            alert("Failed to submit income or expense. Please check the input data and try again.");
        }
    };


    const selectedParticularId = form.watch("iet_particulars");
    const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);

    const handleProceed = () => {
        // Validate the first step's fields before proceeding
        const amount = form.getValues("iet_amount");
        const entryType = form.getValues("iet_entryType");
        const particulars = form.getValues("iet_particulars");
    
        if (!amount || !entryType || !particulars) {
            alert("Please fill out all fields before proceeding.");
            return;
        }
    
        // Check if selectedParticular exists
        if (!selectedParticular) {
            alert("Please select a valid particular.");
            return;
        }
    
        if(entryType === "1"){ // only validates when the entry type is Expense
            
            const particularAccBudget = selectedParticular.proposedBudget;
            const subtractedAmount = particularAccBudget - parseFloat(amount);
        
            if (subtractedAmount < 0) {
                alert("Insufficient Budget");
                return;
            }            
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
                        {selectedParticular && form.watch("iet_entryType") === "1" && (
                            <div className="pb-5">
                                <div className="flex w-full h-9 bg-buttonBlue justify-center items-center rounded-md text-white">
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
                                            {/* <SelectLayout
                                                {...field}
                                                options={particularSelector}
                                                value={field.value}
                                                onChange={field.onChange}
                                                label="Particulars"
                                                placeholder="Select Particulars"
                                                className="w-full"
                                            /> */}
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
                                name="iet_entryType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entry Type</FormLabel>
                                        <FormControl>
                                            <SelectLayout
                                                {...field}
                                                options={entrytypeSelector}
                                                value={field.value}
                                                onChange={field.onChange}
                                                label="Select Entry Type"
                                                placeholder="Select Entry Type"
                                                className="w-full"
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
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="Enter amount" />
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
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Receipt</FormLabel>
                                        <FormControl>
                                            <input
                                                className="mt-[8px] w-full border p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const files = e.target.files;
                                                    if (files && files.length > 0) {
                                                        const file = files[0];
                                                        field.onChange(file);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end mt-[20px]">
                            <Button type="submit">Save Entry</Button>
                        </div>
                    </>
                )}
            </form>
        </Form>
    );
}

export default IncomeandExpenseCreateForm;