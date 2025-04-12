
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





// mao ni ang latest working



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
// import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";
// import { useEffect, useState } from "react";
// import { getParticulars } from "./request/particularsGetRequest";
// import { Combobox } from "@/components/ui/combobox";
// import { CircleCheck } from "lucide-react";
// import { toast } from "sonner";
// import { MediaUpload } from "@/components/ui/media-upload";


// interface IncomeandExpenseCreateFormProps {
//     onSuccess?: () => void; // Add this prop type
// }


// interface BudgetItem {
//     id: string;
//     name: string;
//     proposedBudget: number;
// }


// function IncomeandExpenseCreateForm( { onSuccess }: IncomeandExpenseCreateFormProps) {

//     const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

//     const entrytypeSelector = [
//         { id: "0", name: "Income" },
//         { id: "1", name: "Expense" },
//     ];

//     useEffect(() => {
//         const fetchBudgetItems = async () => {
//             try {
//                 const data = await getParticulars();
//                 // Transform the API data to match your selector format
//                 const items = data.map((item: any) => ({
//                     id: item.dtl_id.toString(),
//                     name: item.dtl_budget_item,
//                     proposedBudget: parseFloat(item.dtl_proposed_budget)
//                 }));
//                 setBudgetItems(items);
//             } catch (error) {
//                 console.error("Failed to load current year budget items:", error);
//                 setBudgetItems([]); // Return empty array if error occurs
//             } 
//         };

//         fetchBudgetItems();
//     }, []);


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

//     // const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//     //     try {
//     //         await income_expense_tracking(values);
//     //         if (onSuccess) onSuccess(); 

//     //     } catch (err) {
//     //         console.error("Error submitting expense or income:", err);
//     //         alert("Failed to submit income or expense. Please check the input data and try again.");
//     //     }
//     // };

//     const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {

//         const toastId = toast.loading('Submitting entry...', {
//             duration: Infinity  
//         });

//         try {
//             await income_expense_tracking(values);

//             toast.success(
//                 form.watch("iet_entryType") === "0" 
//                     ? "Income submitted successfully" 
//                     : "Expense submitted successfully",
//                 {
//                     id: toastId,
//                     icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//                     duration: 2000,
//                     onAutoClose: () => {
//                         window.location.reload(); // This will reload the page when toast closes
//                     }
//                 }
//             );

//             if (onSuccess) onSuccess(); 

//         } catch (err) {
//             console.error("Error submitting expense or income:", err);
//             toast.error(
//                 "Failed to submit income or expense. Please check the input data and try again.",
//                 {
//                     id: toastId,
//                     duration: 2000
//                 }
//             );
//         }
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
//                                 name="iet_particulars"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Particulars</FormLabel>
//                                         <FormControl>
//                                             <Combobox
//                                                 options={particularSelector}
//                                                 value={field.value}
//                                                 onChange={field.onChange}
//                                                 placeholder="Select Particulars"
//                                                 emptyMessage="No particulars found"
//                                                 contentClassName="w-full"
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
// import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";
// import { useEffect, useState } from "react";
// import { getParticulars } from "./request/particularsGetRequest";
// import { Combobox } from "@/components/ui/combobox";
// import { CircleCheck } from "lucide-react";
// import { toast } from "sonner";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { SetStateAction } from "react";
// import { useQuery } from '@tanstack/react-query';


// interface IncomeandExpenseCreateFormProps {
//     onSuccess?: () => void; // Add this prop type
// }


// interface BudgetItem {
//     id: string;
//     name: string;
//     proposedBudget: number;
// }


// function IncomeandExpenseCreateForm( { onSuccess }: IncomeandExpenseCreateFormProps) {

//     const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
//     const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");

//     const entrytypeSelector = [
//         { id: "0", name: "Income" },
//         { id: "1", name: "Expense" },
//     ];


//     useEffect(() => {
//         const fetchBudgetItems = async () => {
//             try {
//                 const data = await getParticulars();
//                 // Transform the API data to match your selector format
//                 const items = data.map((item: any) => ({
//                     id: item.dtl_id.toString(),
//                     name: item.dtl_budget_item,
//                     proposedBudget: parseFloat(item.dtl_proposed_budget)
//                 }));
//                 setBudgetItems(items);
//             } catch (error) {
//                 console.error("Failed to load current year budget items:", error);
//                 setBudgetItems([]); // Return empty array if error occurs
//             } 
//         };

//         fetchBudgetItems();
//     }, []);




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

//     // const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//     //     try {
//     //         await income_expense_tracking(values);
//     //         if (onSuccess) onSuccess(); 

//     //     } catch (err) {
//     //         console.error("Error submitting expense or income:", err);
//     //         alert("Failed to submit income or expense. Please check the input data and try again.");
//     //     }
//     // };

//     const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {

//         const toastId = toast.loading('Submitting entry...', {
//             duration: Infinity  
//         });

//         try {
//             await income_expense_tracking(values);

//             toast.success(
//                 form.watch("iet_entryType") === "0" 
//                     ? "Income submitted successfully" 
//                     : "Expense submitted successfully",
//                 {
//                     id: toastId,
//                     icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//                     duration: 2000,
//                     onAutoClose: () => {
//                         window.location.reload(); // This will reload the page when toast closes
//                     }
//                 }
//             );

//             if (onSuccess) onSuccess(); 

//         } catch (err) {
//             console.error("Error submitting expense or income:", err);
//             toast.error(
//                 "Failed to submit income or expense. Please check the input data and try again.",
//                 {
//                     id: toastId,
//                     duration: 2000
//                 }
//             );
//         }
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







//LATEST WORKING W/ QUERY

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
// import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";
// import { useEffect, useState } from "react";
// import { getParticulars } from "./request/particularsGetRequest";
// import { Combobox } from "@/components/ui/combobox";
// import { CircleCheck } from "lucide-react";
// import { toast } from "sonner";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { SetStateAction } from "react";
// import { useQuery } from '@tanstack/react-query';


// interface IncomeandExpenseCreateFormProps {
//     onSuccess?: () => void; // Add this prop type
// }


// interface BudgetItem {
//     id: string;
//     name: string;
//     proposedBudget: number;
// }


// function IncomeandExpenseCreateForm( { onSuccess }: IncomeandExpenseCreateFormProps) {

//     const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");

//     const entrytypeSelector = [
//         { id: "0", name: "Income" },
//         { id: "1", name: "Expense" },
//     ];

    
//     const { data: budgetItems = [] } = useQuery<BudgetItem[]>({
//         queryKey: ['budgetItems'],
//         queryFn: async () => {
//             const data = await getParticulars();
//             // Transform the API data to match your selector format
//             return data.map((item: any) => ({
//                 id: item.dtl_id.toString(),
//                 name: item.dtl_budget_item,
//                 proposedBudget: parseFloat(item.dtl_proposed_budget)
//             }));
//         },
//     });


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


//     const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {

//         const toastId = toast.loading('Submitting entry...', {
//             duration: Infinity  
//         });

//         try {
//             await income_expense_tracking(values);

//             toast.success(
//                 form.watch("iet_entryType") === "0" 
//                     ? "Income submitted successfully" 
//                     : "Expense submitted successfully",
//                 {
//                     id: toastId,
//                     icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//                     duration: 2000,
//                     onAutoClose: () => {
//                         window.location.reload(); // This will reload the page when toast closes
//                     }
//                 }
//             );

//             if (onSuccess) onSuccess(); 

//         } catch (err) {
//             console.error("Error submitting expense or income:", err);
//             toast.error(
//                 "Failed to submit income or expense. Please check the input data and try again.",
//                 {
//                     id: toastId,
//                     duration: 2000
//                 }
//             );
//         }
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







//LATEST SEPARATE THE BUDGETITEM QUERY 

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
// import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";
// import { useState } from "react";
// import { Combobox } from "@/components/ui/combobox";
// import { CircleCheck } from "lucide-react";
// import { toast } from "sonner";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { SetStateAction } from "react";
// import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";


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


//     const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {

//         const toastId = toast.loading('Submitting entry...', {
//             duration: Infinity  
//         });

//         try {
//             await income_expense_tracking(values);

//             toast.success(
//                 form.watch("iet_entryType") === "0" 
//                     ? "Income submitted successfully" 
//                     : "Expense submitted successfully",
//                 {
//                     id: toastId,
//                     icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//                     duration: 2000,
//                     onAutoClose: () => {
//                         window.location.reload(); // This will reload the page when toast closes
//                     }
//                 }
//             );

//             if (onSuccess) onSuccess(); 

//         } catch (err) {
//             console.error("Error submitting expense or income:", err);
//             toast.error(
//                 "Failed to submit income or expense. Please check the input data and try again.",
//                 {
//                     id: toastId,
//                     duration: 2000
//                 }
//             );
//         }
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








//PINAKA LATESTTTTT WORKINGGGG

// import { Input } from "@/components/ui/input";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { Textarea } from "@/components/ui/textarea";
// import { useState } from "react";
// import { Combobox } from "@/components/ui/combobox";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { SetStateAction } from "react";
// import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
// import { useIncomeParticular, type IncomeParticular } from "./queries/treasurerIncomeExpenseFetchQueries";
// import { useCreateIncome } from "./queries/treasurerIncomeExpenseAddQueries";
// import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
// import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";


// interface IncomeCreateFormProps {
//     onSuccess?: () => void; // Add this prop type
// }


// function IncomeCreateForm( { onSuccess }: IncomeCreateFormProps) {

//     const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     const { data: IncomeParticularItems = [], isLoading } = useIncomeParticular();

//     const IncomeParticularSelector = IncomeParticularItems
//             .filter(item => item.id && item.name)
//             .map(item => ({
//                 id: item.id,
//                 name: item.name,
//     }));

//     const form = useForm<z.infer<typeof IncomeFormSchema>>({
//         resolver: zodResolver(IncomeFormSchema),
//         defaultValues: {
//             inc_entryType: "",
//             inc_particulars: "",
//             inc_amount: "",
//             inc_additional_notes: "",
//             inc_receipt_image: undefined,
//         },
//     });


//     const { mutate: createIncome } = useCreateIncome(onSuccess);

//     const onSubmit = (values: z.infer<typeof IncomeFormSchema>) => {
//         createIncome(values)
//     };


//     if(isLoading){
//         return <div>Loading...</div>
//     }
//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//                 {/* Step 1: Amount, Entry Type, and Particulars */}
                       
//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_particulars"
//                         render={({ field }) => (
//                             <FormItem>
//                             <FormLabel>Particulars</FormLabel>
//                             <FormControl>
//                                 <SelectLayoutWithAdd
//                                     placeholder="Select a particular"
//                                     label="Particulars"
//                                     options={IncomeParticularSelector}
//                                     value={field.value}
//                                     onChange={field.onChange}
//                                     className={inputcss}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>                                             

//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_amount"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Amount</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type="number" placeholder="Enter amount" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_additional_notes"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Additional Notes</FormLabel>
//                                 <FormControl>
//                                     <Textarea {...field} placeholder="Add more details (Optional)" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_receipt_image"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Receipt</FormLabel>
//                                 <FormControl>
//                                     <MediaUpload
//                                         title="Receipt Image"
//                                         description="Upload an image of your receipt as proof of transaction"
//                                         mediaFiles={mediaFiles}
//                                         activeVideoId={activeVideoId}
//                                         setMediaFiles={(value: SetStateAction<any[]>) => {
//                                             // Handle both direct value and functional update
//                                             const newFiles = typeof value === 'function' 
//                                                 ? value(mediaFiles) 
//                                                 : value;
//                                             setMediaFiles(newFiles);
//                                             field.onChange(newFiles.length > 0 ? newFiles[0] : undefined);
//                                         }}
//                                         setActiveVideoId={setActiveVideoId}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>

//                 <div className="flex justify-end mt-[20px] space-x-2">
//                     <Button type="submit">Save Entry</Button>
//                 </div>
//             </form>
//         </Form>
//     );
// }

// export default IncomeCreateForm;








// WORKING NI SIYA LASTEST GYUDD

// import { Input } from "@/components/ui/input";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { Textarea } from "@/components/ui/textarea";
// import { useState } from "react";
// import { Combobox } from "@/components/ui/combobox";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { SetStateAction } from "react";
// import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
// import { useIncomeParticular, type IncomeParticular } from "./queries/treasurerIncomeExpenseFetchQueries";
// import { useCreateIncome } from "./queries/treasurerIncomeExpenseAddQueries";
// import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
// import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
// import { useAddParticular } from "./request/particularsPostRequest";
// import { useDeleteParticular } from "./request/particularsDeleteRequest";



// interface IncomeParticularItem {
//     id: string;
//     name: string;
// }

// interface IncomeCreateFormProps {
//     onSuccess?: () => void;
//     IncomeParticularSelector: IncomeParticularItem[];
// }


// function IncomeCreateForm( { onSuccess, IncomeParticularSelector  }: IncomeCreateFormProps) {

//     const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

//     const { handleAddParticular } = useAddParticular();
//     const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();


//     const form = useForm<z.infer<typeof IncomeFormSchema>>({
//         resolver: zodResolver(IncomeFormSchema),
//         defaultValues: {
//             inc_entryType: "",
//             inc_particulars: "",
//             inc_amount: "",
//             inc_additional_notes: "",
//             inc_receipt_image: undefined,
//         },
//     });


//     const { mutate: createIncome } = useCreateIncome(onSuccess);

//     const onSubmit = (values: z.infer<typeof IncomeFormSchema>) => {
//         createIncome(values)
//     };


//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//                 {/* Step 1: Amount, Entry Type, and Particulars */}
                       
//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_particulars"
//                         render={({ field }) => (
//                             <FormItem>
//                             <FormLabel>Particulars</FormLabel>
//                             <FormControl>
//                                 <SelectLayoutWithAdd
//                                     placeholder="Select a particular"
//                                     label="Particulars"
//                                     options={IncomeParticularSelector}
//                                     value={field.value}
//                                     onChange={field.onChange}
//                                     onAdd={(newParticular) => {
//                                         handleAddParticular(newParticular, (newId) => {
//                                             field.onChange(newId); // This updates the form value
//                                         });
//                                     }}
//                                     onDelete={(id) => handleDeleteConfirmation(Number(id))}
//                                     className={inputcss}
//                                 />
//                             </FormControl>
//                             <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>                                             

//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_amount"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Amount</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type="number" placeholder="Enter amount" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_additional_notes"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Additional Notes</FormLabel>
//                                 <FormControl>
//                                     <Textarea {...field} placeholder="Add more details (Optional)" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_receipt_image"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Receipt</FormLabel>
//                                 <FormControl>
//                                     <MediaUpload
//                                         title="Receipt Image"
//                                         description="Upload an image of your receipt as proof of transaction"
//                                         mediaFiles={mediaFiles}
//                                         activeVideoId={activeVideoId}
//                                         setMediaFiles={(value: SetStateAction<any[]>) => {
//                                             // Handle both direct value and functional update
//                                             const newFiles = typeof value === 'function' 
//                                                 ? value(mediaFiles) 
//                                                 : value;
//                                             setMediaFiles(newFiles);
//                                             field.onChange(newFiles.length > 0 ? newFiles[0] : undefined);
//                                         }}
//                                         setActiveVideoId={setActiveVideoId}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>

//                 <div className="flex justify-end mt-[20px] space-x-2">
//                     <Button type="submit">Save Entry</Button>
//                 </div>
//             </form>
//             {ConfirmationDialogs()}
//         </Form>
//     );
// }

// export default IncomeCreateForm;




import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { MediaUpload } from "@/components/ui/media-upload";
import { SetStateAction } from "react";
import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useIncomeParticular, type IncomeParticular } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useCreateIncome } from "./queries/treasurerIncomeExpenseAddQueries";
import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useAddParticular } from "./request/particularsPostRequest";
import { useDeleteParticular } from "./request/particularsDeleteRequest";

interface IncomeCreateFormProps {
    onSuccess?: () => void;
}


function IncomeCreateForm( { onSuccess }: IncomeCreateFormProps) {

    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

    const { handleAddParticular } = useAddParticular();
    const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();


    const form = useForm<z.infer<typeof IncomeFormSchema>>({
        resolver: zodResolver(IncomeFormSchema),
        defaultValues: {
            inc_entryType: "",
            inc_particulars: "",
            inc_amount: "",
            inc_additional_notes: "",
            inc_receipt_image: undefined,
        },
    });


    const { mutate: createIncome } = useCreateIncome(onSuccess);

    const onSubmit = (values: z.infer<typeof IncomeFormSchema>) => {
        createIncome(values)
    };

    
    const { data: IncomeParticularItems = [] } = useIncomeParticular();

    const IncomeParticulars = IncomeParticularItems
            .filter(item => item.id && item.name)
            .map(item => ({
                id: item.id,
                name: item.name,
    }));


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Step 1: Amount, Entry Type, and Particulars */}
                       
                <div className="pb-5">
                    <FormField
                        control={form.control}
                        name="inc_particulars"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Particulars</FormLabel>
                            <FormControl>
                                <SelectLayoutWithAdd
                                    placeholder="Select a particular"
                                    label="Particulars"
                                    options={IncomeParticulars}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onAdd={(newParticular) => {
                                        handleAddParticular(newParticular, (newId) => {
                                            field.onChange(newId); // This updates the form value
                                        });
                                    }}
                                    onDelete={(id) => handleDeleteConfirmation(Number(id))}
                                    className={inputcss}
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
                        name="inc_amount"
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

                <div className="pb-5">
                    <FormField
                        control={form.control}
                        name="inc_additional_notes"
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
                        name="inc_receipt_image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Receipt</FormLabel>
                                <FormControl>
                                    <MediaUpload
                                        title="Receipt Image"
                                        description="Upload an image of your receipt as proof of transaction"
                                        mediaFiles={mediaFiles}
                                        activeVideoId={activeVideoId}
                                        setMediaFiles={(value: SetStateAction<any[]>) => {
                                            // Handle both direct value and functional update
                                            const newFiles = typeof value === 'function' 
                                                ? value(mediaFiles) 
                                                : value;
                                            setMediaFiles(newFiles);
                                            field.onChange(newFiles.length > 0 ? newFiles[0] : undefined);
                                        }}
                                        setActiveVideoId={setActiveVideoId}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end mt-[20px] space-x-2">
                    <Button type="submit">Save Entry</Button>
                </div>
            </form>
            {ConfirmationDialogs()}
        </Form>
    );
}

export default IncomeCreateForm;

