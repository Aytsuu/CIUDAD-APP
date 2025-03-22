    import { Input } from "@/components/ui/input";
    import { SelectLayout } from "@/components/ui/select/select-layout";
    import { Button } from "@/components/ui/button";
    import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
    import { zodResolver } from "@hookform/resolvers/zod";
    import { z } from "zod";
    import { useForm } from "react-hook-form";
    import IncomeExpenseEditFormSchema from "@/form-schema/income-expense-tracker-edit-schema";
    import { Textarea } from "@/components/ui/textarea";
    import { useState } from "react";
    import { updateIncomeExpense } from "./request/income-ExpenseTrackingPutRequest";

    interface IncomeandExpenseEditProps{
        iet_num: number;
        iet_serial_num: string;
        iet_entryType: string;
        iet_particulars: string;
        iet_amount: string;
        iet_receiver: string;
        iet_additional_notes: string;
    }

    function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_entryType, iet_particulars, iet_amount, iet_receiver, iet_additional_notes} : IncomeandExpenseEditProps) {    

        const entrytypeSelector = [
            { id: "0", name: "Income"},
            { id: "1", name: "Expense"}
        ];

        const [isEditing, setIsEditing] = useState(false);

        const onSubmit =  async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {
            console.log(values)
            try{
                await updateIncomeExpense(iet_num, values)
            }
            catch (err){
                console.error("Error updating expense or income:", err);
            }
            setIsEditing(false);
        };

        const form = useForm<z.infer<typeof IncomeExpenseEditFormSchema>>({
            resolver: zodResolver(IncomeExpenseEditFormSchema),
            defaultValues: {
                iet_serial_num: String(iet_serial_num),
                iet_entryType: iet_entryType === "Income" ? '0' : '1',
                iet_particulars: iet_particulars,
                iet_amount: iet_amount,
                iet_receiver: iet_receiver,
                iet_additional_notes: iet_additional_notes,
                iet_receipt_image: undefined
            }
        });


        return (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="pb-5">
                            <FormField
                                control={form.control}
                                name="iet_serial_num"
                                render={({field }) =>(
                                    <FormItem>
                                        <FormLabel>Serial No.</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="(e.g. 123456)" type="number" readOnly={!isEditing} ></Input>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}>
                            </FormField>
                        </div>

                        <div className="pb-5">
                            <FormField
                            control={form.control}
                            name="iet_entryType"
                            render={({field }) =>(
                                <FormItem>
                                    <FormLabel>Entry Type</FormLabel>
                                    <FormControl>   
                                        <SelectLayout {...field} options={entrytypeSelector} value={field.value || ""} onChange={field.onChange} label="Select Entry Type" placeholder="Select Entry Type" className="w-full"></SelectLayout>                                 
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}></FormField>
                        </div>

                        <div className="pb-5">
                            <FormField
                            control={form.control}
                            name="iet_particulars"
                            render={({field }) => (
                                <FormItem>
                                    <FormLabel>Particulars</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter particulars" readOnly={!isEditing} ></Input>
                                        </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}></FormField>
                        </div>

                        <div className="pb-5">
                            <FormField
                            control={form.control}
                            name="iet_amount"
                            render={({field })=>(
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" placeholder="Enter amount" readOnly={!isEditing}></Input>
                                        </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}></FormField>
                        </div>

                        <div className="pb-5">
                            <FormField
                            control={form.control}
                            name="iet_receiver"
                            render={({field }) =>(
                                <FormItem>
                                    <FormLabel>Receiver</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter receiver name" readOnly={!isEditing}></Input>
                                        </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}></FormField>
                        </div>

                        <div className="pb-5">
                            <FormField
                            control={form.control}
                            name="iet_additional_notes"
                            render={({field}) =>(
                                <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Add more details (Optional)" readOnly={!isEditing} ></Textarea>
                                        </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}></FormField>
                        </div>


                        <div className="pb-5">
                            <FormField
                            control={form.control}
                            name="iet_receipt_image"
                            render={({field}) =>(
                                <FormItem>
                                    <FormLabel>Receipt</FormLabel>
                                        <FormControl>
                                            <input
                                                className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
                                                type="file"
                                                accept="image/*" // This restricts the file types to images only
                                                onChange={(e) => {
                                                    const files = e.target.files; // Get the files
                                                    if (files && files.length > 0) { // Check if files is not null and has at least one file
                                                        const file = files[0]; // Get the first file
                                                        field.onChange(file); // Set the file to the form state
                                                    }                              
                                                }}
                                                disabled={!isEditing}
                                            />
                                        </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}></FormField>
                        </div>
                        
                        <div className="mt-6 flex justify-end">

                            {!isEditing ? (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent form submission
                                        setIsEditing(true); // Toggle editing mode
                                    }}
                                >
                                    Edit
                                </Button>
                            ) : (
                                <Button type="submit">Save</Button>
                            )}

                        </div>
                    </form>
                </Form>
        );
    }

    export default IncomeandExpenseEditForm;
