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


interface IncomeandExpenseCreateFormProps {
    onSuccess?: () => void; // Add this prop type
}



function IncomeandExpenseCreateForm( { onSuccess }: IncomeandExpenseCreateFormProps) {

    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");


    const { data: budgetItems = [] } = useBudgetItems(2025);

    console.log("FRONTEND: ", budgetItems)

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
            iet_particulars: "",
            iet_amount: "",
            iet_additional_notes: "",
            iet_receipt_image: undefined,
        },
    });


    const { mutate: createExpense } = useCreateIncomeExpense(onSuccess);

    const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
        createExpense(values);
    };

    useEffect(() => {
        if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
            form.setValue('iet_receipt_image', mediaFiles[0].publicUrl);
        } else {
            form.setValue('iet_receipt_image', 'no-image-url-fetched');
        }
    }, [mediaFiles, form]);


    const selectedParticularId = form.watch("iet_particulars");
    const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);

    const handleProceed = () => {
        // Validate the first step's fields before proceeding
        const amount = form.getValues("iet_amount");
        const particulars = form.getValues("iet_particulars");
    
        if (!amount || !particulars) {
            alert("Please fill out all fields before proceeding.");
            return;
        }
    
        // Check if selectedParticular exists
        if (!selectedParticular) {
            alert("Please select a valid particular.");
            return;
        }
                
        const particularAccBudget = selectedParticular.proposedBudget;
        const subtractedAmount = particularAccBudget - parseFloat(amount);
    
        if (subtractedAmount < 0) {
            alert("Insufficient Budget");
            return;
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
                                        <FormLabel>Receipt Image</FormLabel>
                                        <FormControl>
                                            <MediaUpload
                                                title="Receipt Image"
                                                description="Upload an image of your receipt as proof of transaction"
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