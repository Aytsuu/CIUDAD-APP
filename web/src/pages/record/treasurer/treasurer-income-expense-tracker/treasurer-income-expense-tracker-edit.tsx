// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import IncomeExpenseEditFormSchema from "@/form-schema/income-expense-tracker-edit-schema";
// import { Textarea } from "@/components/ui/textarea";
// import { useEffect, useState } from "react";
// import { updateIncomeExpense } from "./request/income-ExpenseTrackingPutRequest";
// import { Combobox } from "@/components/ui/combobox";
// import { getParticulars } from "./request/particularsGetRequest";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";

// interface IncomeandExpenseEditProps{
//     iet_num: number;
//     iet_serial_num: string;
//     iet_entryType: string;
//     iet_particular_id: number;
//     iet_particulars_name: string;
//     iet_amount: string;
//     iet_additional_notes: string;
//     inv_num: string;
//     onSuccess?: () => void; 
// }

// interface BudgetItem {
//     id: string;
//     name: string;
//     proposedBudget: number;
// }


// function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_entryType, iet_particulars_name, iet_particular_id, iet_amount, iet_additional_notes, inv_num, onSuccess} : IncomeandExpenseEditProps) {    

//     const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
//     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
//     const [formValues, setFormValues] = useState<z.infer<typeof IncomeExpenseEditFormSchema>>();


//     const entrytypeSelector = [
//         { id: "0", name: "Income"},
//         { id: "1", name: "Expense"}
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


//     const [isEditing, setIsEditing] = useState(false);


//     const form = useForm<z.infer<typeof IncomeExpenseEditFormSchema>>({
//         resolver: zodResolver(IncomeExpenseEditFormSchema),
//         defaultValues: {
//             iet_serial_num: String(iet_serial_num),
//             iet_entryType: iet_entryType === "Income" ? '0' : '1',
//             iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
//             iet_amount: iet_amount,
//             iet_additional_notes: iet_additional_notes,
//             iet_receipt_image: undefined
//         }
//     });

//     const selectedParticularId = form.watch("iet_particulars");
//     const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);



//     const onSubmit =  async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {

//         const submissionValues = {
//             ...values,
//             iet_particulars: values.iet_particulars.split(' ')[0] // Get just the ID part
//         };

//         if(values.iet_entryType === "1"){ // only validates when the entry type is Expense

//             if (!selectedParticular) {
//                 alert("Please select a valid particular");
//                 return;
//             }
        
//             const particularAccBudget = selectedParticular.proposedBudget;
//             const subtractedAmount = particularAccBudget - parseFloat(values.iet_amount);
        
//             if (subtractedAmount < 0) { 
//                 alert("Insufficient Budget");
//                 return;
//             }            
//         }
        
//         try{
//             await updateIncomeExpense(iet_num, submissionValues)
//             if (onSuccess) onSuccess(); 
//         }
//         catch (err){
//             console.error("Error updating expense or income:", err);
//         }
//         setIsEditing(false);
//     };


//     return (
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}>

//                     {selectedParticular && form.watch("iet_entryType") === "1" && (
//                         <div className="pb-5">
//                             <div className="flex w-full h-9 bg-buttonBlue justify-center items-center rounded-md text-white">
//                                 <Label>Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}</Label>
//                             </div>
//                         </div>
//                     )}


//                     {inv_num !== "None" && (
//                         <div className="pb-5">
//                             <FormField
//                                 control={form.control}
//                                 name="iet_serial_num"
//                                 render={({field}) => (
//                                     <FormItem>
//                                         <FormLabel>Serial No.</FormLabel>
//                                         <FormControl>
//                                             <Input {...field} placeholder="(e.g. 123456)" type="text" readOnly />
//                                         </FormControl>
//                                         <FormMessage/>
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>
//                     )}

//                     <div className="pb-5">
//                         <FormField
//                         control={form.control}
//                         name="iet_entryType"
//                         render={({field }) =>(
//                             <FormItem>
//                                 <FormLabel>Entry Type</FormLabel>
//                                 <FormControl>   
//                                     <SelectLayout {...field} options={entrytypeSelector} value={field.value || ""} onChange={field.onChange} label="Select Entry Type" placeholder="Select Entry Type" className="w-full"></SelectLayout>                                 
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>
//                     </div>

//                     <div className="pb-5">
//                         <FormField
//                         control={form.control}
//                         name="iet_particulars"
//                         render={({field }) => (
//                             <FormItem>
//                                 <FormLabel>Particulars</FormLabel>
//                                     <FormControl>
//                                         <Combobox
//                                             options={particularSelector}
//                                             value={field.value || ""}
//                                             onChange={field.onChange}
//                                             placeholder="Select Particulars"
//                                             emptyMessage="No particulars found"
//                                             contentClassName="w-full"
//                                         />
//                                     </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>
//                     </div>

//                     <div className="pb-5">
//                         <FormField
//                         control={form.control}
//                         name="iet_amount"
//                         render={({field })=>(
//                             <FormItem>
//                                 <FormLabel>Amount</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} type="number" placeholder="Enter amount" readOnly={!isEditing}></Input>
//                                     </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>
//                     </div>

//                     <div className="pb-5">
//                         <FormField
//                         control={form.control}
//                         name="iet_additional_notes"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>Additional Notes</FormLabel>
//                                     <FormControl>
//                                         <Textarea {...field} placeholder="Add more details (Optional)" readOnly={!isEditing} ></Textarea>
//                                     </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>
//                     </div>


//                     <div className="pb-5">
//                         <FormField
//                         control={form.control}
//                         name="iet_receipt_image"
//                         render={({field}) =>(
//                             <FormItem>
//                                 <FormLabel>Receipt</FormLabel>
//                                     <FormControl>
//                                         <input
//                                             className="mt-[8px] w-full border  p-1.5 shadow-sm sm:text-sm focus:outline-none rounded-md"
//                                             type="file"
//                                             accept="image/*" // This restricts the file types to images only
//                                             onChange={(e) => {
//                                                 const files = e.target.files; // Get the files
//                                                 if (files && files.length > 0) { // Check if files is not null and has at least one file
//                                                     const file = files[0]; // Get the first file
//                                                     field.onChange(file); // Set the file to the form state
//                                                 }                              
//                                             }}
//                                             disabled={!isEditing}
//                                         />
//                                     </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}></FormField>
//                     </div>
                    
//                     <div className="mt-6 flex justify-end">

//                         {!isEditing ? (
//                             <Button
//                                 type="button"
//                                 onClick={(e) => {
//                                     e.preventDefault(); // Prevent form submission
//                                     setIsEditing(true); // Toggle editing mode
//                                 }}
//                             >
//                                 Edit
//                             </Button>
//                         ) : (

//                             <Button type="submit">Save</Button>

//                         )}

//                     </div>
//                 </form>
//             </Form>
//     );
// }

// export default IncomeandExpenseEditForm;










import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import IncomeExpenseEditFormSchema from "@/form-schema/income-expense-tracker-edit-schema";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { updateIncomeExpense } from "./request/income-ExpenseTrackingPutRequest";
import { Combobox } from "@/components/ui/combobox";
import { CircleCheck } from "lucide-react";
import { getParticulars } from "./request/particularsGetRequest";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { toast } from "sonner";

interface IncomeandExpenseEditProps{
    iet_num: number;
    iet_serial_num: string;
    iet_entryType: string;
    iet_particular_id: number;
    iet_particulars_name: string;
    iet_amount: string;
    iet_additional_notes: string;
    inv_num: string;
    onSuccess?: () => void; 
}

interface BudgetItem {
    id: string;
    name: string;
    proposedBudget: number;
}


function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_entryType, iet_particulars_name, iet_particular_id, iet_amount, iet_additional_notes, inv_num, onSuccess} : IncomeandExpenseEditProps) {    

    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formValues, setFormValues] = useState<z.infer<typeof IncomeExpenseEditFormSchema>>();


    const entrytypeSelector = [
        { id: "0", name: "Income"},
        { id: "1", name: "Expense"}
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


    const [isEditing, setIsEditing] = useState(false);


    const form = useForm<z.infer<typeof IncomeExpenseEditFormSchema>>({
        resolver: zodResolver(IncomeExpenseEditFormSchema),
        defaultValues: {
            iet_serial_num: String(iet_serial_num),
            iet_entryType: iet_entryType === "Income" ? '0' : '1',
            iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
            iet_amount: iet_amount,
            iet_additional_notes: iet_additional_notes,
            iet_receipt_image: undefined
        }
    });

    const selectedParticularId = form.watch("iet_particulars");
    const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);



    const onSubmit =  async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {

        const submissionValues = {
            ...values,
            iet_particulars: values.iet_particulars.split(' ')[0] // Get just the ID part
        };

        if(values.iet_entryType === "1"){ // only validates when the entry type is Expense

            if (!selectedParticular) {
                alert("Please select a valid particular");
                return;
            }
        
            const particularAccBudget = selectedParticular.proposedBudget;
            const subtractedAmount = particularAccBudget - parseFloat(values.iet_amount);
        
            if (subtractedAmount < 0) { 
                alert("Insufficient Budget");
                return;
            }            
        }
        
        const toastId = toast.loading('Updating entry...', {
            duration: Infinity  
        });

        try{
            await updateIncomeExpense(iet_num, submissionValues)

            toast.success('Entry updated', {
                id: toastId, 
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000,
                onAutoClose: () => {
                    window.location.reload(); // This will reload the page when toast closes
                }
            });

            if (onSuccess) onSuccess(); 
        }
        catch (err){
            console.error("Error updating expense or income:", err);
        }
        setIsEditing(false);
    };


    const handleSaveClick = () => {
        setFormValues(form.getValues()); // Store current form values
        setIsConfirmOpen(true); // Open confirmation modal
    };

    const handleConfirmSave = () => {
        setIsConfirmOpen(false); // Close confirmation modal
        form.handleSubmit(onSubmit)(); // Call the submit function
    };    


    return (

        <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>

                {selectedParticular && form.watch("iet_entryType") === "1" && (
                    <div className="pb-5">
                        <div className="flex w-full h-9 bg-buttonBlue justify-center items-center rounded-md text-white">
                            <Label>Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}</Label>
                        </div>
                    </div>
                )}


                {(inv_num !== "None" && form.watch("iet_entryType") === "1") && (
                    <div className="pb-5">
                        <FormField
                            control={form.control}
                            name="iet_serial_num"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Serial No.</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="(e.g. 123456)" type="text" readOnly />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

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
                                    <Combobox
                                        options={particularSelector}
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        placeholder="Select Particulars"
                                        emptyMessage="No particulars found"
                                        contentClassName="w-full"
                                    />
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

                        <ConfirmationModal
                            trigger={
                                <Button onClick={handleSaveClick}>Save</Button>
                            }
                            title="Confirm Save"
                            description="Are you sure you want to save the changes?"
                            actionLabel="Confirm"
                            onClick={handleConfirmSave} // This will be called when the user confirms
                        />    

                    )}

                </div>      
            </form>
        </Form>             

    );
}

export default IncomeandExpenseEditForm;







