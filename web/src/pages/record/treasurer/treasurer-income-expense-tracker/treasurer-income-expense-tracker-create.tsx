// // import { Input } from "@/components/ui/input";
// // import { SelectLayout } from "@/components/ui/select/select-layout";
// // import { Button } from "@/components/ui/button";
// // import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { z } from "zod";
// // import { useForm } from "react-hook-form";
// // import IncomeExpenseFormSchema from "@/form-schema/income-expense-tracker-schema";
// // import { Textarea } from "@/components/ui/textarea";


// // function IncomeandExpenseCreateForm() {
// //     const entrytypeSelector = [
// //         { id: "0", name: "Income"},
// //         { id: "1", name: "Expense"}
// //     ];

// //     const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
// //         resolver: zodResolver(IncomeExpenseFormSchema),
// //         defaultValues: {
// //             serialNo: "",
// //             entryType: "",
// //             particulars: "",
// //             amount: "",
// //             receiver: "",
// //             addNotes: ""
// //         }
// //     });

// //     const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
// //         console.log(values);
// //     }


// //     return (
// //     <Form {...form}>
// //             <form onSubmit={form.handleSubmit(onSubmit)}>
// //                 <div>
// //                     <FormField
// //                         control={form.control}
// //                         name="serialNo"
// //                         render={({field }) =>(
// //                             <FormItem>
// //                                 <FormLabel>Serial No.</FormLabel>
// //                                 <FormControl>
// //                                     <Input {...field} placeholder="(e.g. 123456)" type="number"></Input>
// //                                 </FormControl>
// //                                 <FormMessage/>
// //                             </FormItem>
// //                         )}>
// //                     </FormField>
// //                 </div>

// //                 <div>
// //                     <FormField
// //                     control={form.control}
// //                     name="entryType"
// //                     render={({field }) =>(
// //                         <FormItem>
// //                             <FormLabel>Entry Type</FormLabel>
// //                             <FormControl>
// //                                 <SelectLayout {...field} options={entrytypeSelector} value={field.value } onChange={field.onChange} label="Select Entry Type" placeholder="Select Entry Type" className="w-full"></SelectLayout>
// //                             </FormControl>
// //                             <FormMessage/>
// //                         </FormItem>
// //                     )}></FormField>
// //                 </div>

// //                 <div>
// //                     <FormField
// //                     control={form.control}
// //                     name="particulars"
// //                     render={({field }) => (
// //                         <FormItem>
// //                             <FormLabel>Particulars</FormLabel>
// //                                 <FormControl>
// //                                     <Input {...field} placeholder="Enter particulars"></Input>
// //                                 </FormControl>
// //                             <FormMessage/>
// //                         </FormItem>
// //                     )}></FormField>
// //                 </div>

// //                 <div>
// //                     <FormField
// //                     control={form.control}
// //                     name="amount"
// //                     render={({field })=>(
// //                         <FormItem>
// //                             <FormLabel>Amount</FormLabel>
// //                                 <FormControl>
// //                                     <Input {...field} type="number" placeholder="Enter amount"></Input>
// //                                 </FormControl>
// //                             <FormMessage/>
// //                         </FormItem>
// //                     )}></FormField>
// //                 </div>

// //                 <div>
// //                     <FormField
// //                     control={form.control}
// //                     name="receiver"
// //                     render={({field }) =>(
// //                         <FormItem>
// //                             <FormLabel>Receiver</FormLabel>
// //                                 <FormControl>
// //                                     <Input {...field} placeholder="Enter receiver name"></Input>
// //                                 </FormControl>
// //                             <FormMessage/>
// //                         </FormItem>
// //                     )}></FormField>
// //                 </div>

// //                 <div>
// //                     <FormField
// //                     control={form.control}
// //                     name="addNotes"
// //                     render={({field}) =>(
// //                         <FormItem>
// //                             <FormLabel>Additional Notes</FormLabel>
// //                                 <FormControl>
// //                                     <Textarea {...field} placeholder="Add more details (Optional)"></Textarea>
// //                                 </FormControl>
// //                             <FormMessage/>
// //                         </FormItem>
// //                     )}></FormField>
// //                 </div>


// //                 <div className="flex justify-end mt-[20px]">
// //                     <Button>Save Entry</Button>       
// //                 </div> 
// //             </form>
// //     </Form>
// //     );
// // }

// // export default IncomeandExpenseCreateForm;


// import { Input } from "@/components/ui/input";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import IncomeExpenseFormSchema from "@/form-schema/income-expense-tracker-schema";
// import { Textarea } from "@/components/ui/textarea";
// import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";


// function IncomeandExpenseCreateForm() {
//     const entrytypeSelector = [
//         { id: "0", name: "Income"},
//         { id: "1", name: "Expense"}
//     ];

//     const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
//         resolver: zodResolver(IncomeExpenseFormSchema),
//         defaultValues: {
//             iet_serial_num: "",
//             iet_entryType: "",
//             iet_particulars: "",
//             iet_amount: "",
//             iet_receiver: "",
//             iet_additional_notes: "",
//             iet_receipt_image: undefined
//         }
//     });

//     const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//         try{
//             await income_expense_tracking(values)

//         }
//         catch(err){
//             console.error("Error submitting expense or income:", err);
//             alert("Failed to submit income or expense. Please check the input data and try again.");
//         }
//     };


//     return (
//     <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="iet_serial_num"
//                         render={({field }) =>(
//                             <FormItem>
//                                 <FormLabel>Serial No.</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="(e.g. 123456)" type="number"></Input>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}>
//                     </FormField>
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                     control={form.control}
//                     name="iet_entryType"
//                     render={({field }) =>(
//                         <FormItem>
//                             <FormLabel>Entry Type</FormLabel>
//                             <FormControl>
//                                 <SelectLayout {...field} options={entrytypeSelector} value={field.value } onChange={field.onChange} label="Select Entry Type" placeholder="Select Entry Type" className="w-full"></SelectLayout>
//                             </FormControl>
//                             <FormMessage/>
//                         </FormItem>
//                     )}></FormField>
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                     control={form.control}
//                     name="iet_particulars"
//                     render={({field }) => (
//                         <FormItem>
//                             <FormLabel>Particulars</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Enter particulars"></Input>
//                                 </FormControl>
//                             <FormMessage/>
//                         </FormItem>
//                     )}></FormField>
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                     control={form.control}
//                     name="iet_amount"
//                     render={({field })=>(
//                         <FormItem>
//                             <FormLabel>Amount</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type="number" placeholder="Enter amount"></Input>
//                                 </FormControl>
//                             <FormMessage/>
//                         </FormItem>
//                     )}></FormField>
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                     control={form.control}
//                     name="iet_receiver"
//                     render={({field }) =>(
//                         <FormItem>
//                             <FormLabel>Receiver</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Enter receiver name"></Input>
//                                 </FormControl>
//                             <FormMessage/>
//                         </FormItem>
//                     )}></FormField>
//                 </div>

//                 <div className="pb-5">
//                     <FormField
//                     control={form.control}
//                     name="iet_additional_notes"
//                     render={({field}) =>(
//                         <FormItem>
//                             <FormLabel>Additional Notes</FormLabel>
//                                 <FormControl>
//                                     <Textarea {...field} placeholder="Add more details (Optional)"></Textarea>
//                                 </FormControl>
//                             <FormMessage/>
//                         </FormItem>
//                     )}></FormField>
//                 </div>


//                 <div className="pb-5">
//                     <FormField
//                     control={form.control}
//                     name="iet_receipt_image"
//                     render={({field}) =>(
//                         <FormItem>
//                             <FormLabel>Receipt</FormLabel>
//                                 <FormControl>
//                                     <input
//                                         className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
//                                         type="file"
//                                         accept="image/*" // This restricts the file types to images only
//                                         onChange={(e) => {
//                                             const files = e.target.files; // Get the files
//                                             if (files && files.length > 0) { // Check if files is not null and has at least one file
//                                                 const file = files[0]; // Get the first file
//                                                 field.onChange(file); // Set the file to the form state
//                                             }
//                                         }}
//                                     />
//                                 </FormControl>
//                             <FormMessage/>
//                         </FormItem>
//                     )}></FormField>
//                 </div>


//                 <div className="flex justify-end mt-[20px]">
//                     <Button>Save Entry</Button>       
//                 </div> 
//             </form>
//     </Form>
//     );
// }

// export default IncomeandExpenseCreateForm;





import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import IncomeExpenseFormSchema from "@/form-schema/income-expense-tracker-schema";
import { Textarea } from "@/components/ui/textarea";
import { income_expense_tracking } from "./request/income-ExpenseTrackingPostRequest";
import { useState } from "react";

function IncomeandExpenseCreateForm() {
    const entrytypeSelector = [
        { id: "0", name: "Income" },
        { id: "1", name: "Expense" },
    ];

    const [currentStep, setCurrentStep] = useState(1); // Track the current step

    const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
        resolver: zodResolver(IncomeExpenseFormSchema),
        defaultValues: {
            iet_serial_num: "",
            iet_entryType: "",
            iet_particulars: "",
            iet_amount: "",
            iet_receiver: "",
            iet_additional_notes: "",
            iet_receipt_image: undefined,
        },
    });

    const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
        try {
            await income_expense_tracking(values);
        } catch (err) {
            console.error("Error submitting expense or income:", err);
            alert("Failed to submit income or expense. Please check the input data and try again.");
        }
    };

    const handleProceed = () => {
        // Validate the first step's fields before proceeding
        const amount = form.getValues("iet_amount");
        const entryType = form.getValues("iet_entryType");
        const particulars = form.getValues("iet_particulars");

        if (!amount || !entryType || !particulars) {
            alert("Please fill out all fields before proceeding.");
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
                                name="iet_particulars"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Particulars</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter particulars" />
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
                                            <Input {...field} placeholder="(e.g. 123456)" type="number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_receiver"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Receiver</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter receiver name" />
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