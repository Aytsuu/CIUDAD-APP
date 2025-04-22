
//LATEST NAA TANAN

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
// import { useState } from "react";
// import { Combobox } from "@/components/ui/combobox";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
// import { useUpdateIncomeExpense } from "./queries/treasurerIncomeExpenseUpdateQueries";


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



// function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_entryType, iet_particulars_name, iet_particular_id, iet_amount, iet_additional_notes, inv_num, onSuccess} : IncomeandExpenseEditProps) {    

//     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
//     const [formValues, setFormValues] = useState<z.infer<typeof IncomeExpenseEditFormSchema>>();


//     const entrytypeSelector = [
//         { id: "0", name: "Income"},
//         { id: "1", name: "Expense"}
//     ];


//     const { data: budgetItems = [] } = useBudgetItems();
    

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


//     const { mutate: updateEntry } = useUpdateIncomeExpense(iet_num, onSuccess);

//     const onSubmit = async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {
//         if(values.iet_entryType === "1") { // only validates when the entry type is Expense
//           if (!selectedParticular) {
//             alert("Please select a valid particular");
//             return;
//           }
          
//           const particularAccBudget = selectedParticular.proposedBudget;
//           const subtractedAmount = particularAccBudget - parseFloat(values.iet_amount);
          
//           if (subtractedAmount < 0) { 
//             alert("Insufficient Budget");
//             return;
//           }            
//         }
        
//         updateEntry(values);
//         setIsEditing(false);
//       };

//     const handleSaveClick = () => {
//         setFormValues(form.getValues()); // Store current form values
//         setIsConfirmOpen(true); // Open confirmation modal
//     };

//     const handleConfirmSave = () => {
//         setIsConfirmOpen(false); // Close confirmation modal
//         form.handleSubmit(onSubmit)(); // Call the submit function
//     };    


//     return (

//         <Form {...form}>
//             <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>

//                 {selectedParticular && form.watch("iet_entryType") === "1" && (
//                     <div className="pb-5">
//                         <div className="flex w-full h-9 bg-buttonBlue justify-center items-center rounded-md text-white">
//                             <Label>Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}</Label>
//                         </div>
//                     </div>
//                 )}


//                 {(inv_num !== "None" && form.watch("iet_entryType") === "1") && (
//                     <div className="pb-5">
//                         <FormField
//                             control={form.control}
//                             name="iet_serial_num"
//                             render={({field}) => (
//                                 <FormItem>
//                                     <FormLabel>Serial No.</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} placeholder="(e.g. 123456)" type="text" readOnly />
//                                     </FormControl>
//                                     <FormMessage/>
//                                 </FormItem>
//                             )}
//                         />
//                     </div>
//                 )}

//                 <div className="pb-5">
//                     <FormField
//                     control={form.control}
//                     name="iet_entryType"
//                     render={({field }) =>(
//                         <FormItem>
//                             <FormLabel>Entry Type</FormLabel>
//                             <FormControl>   
//                                 <SelectLayout {...field} options={entrytypeSelector} value={field.value || ""} onChange={field.onChange} label="Select Entry Type" placeholder="Select Entry Type" className="w-full"></SelectLayout>                                 
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
//                                     <Combobox
//                                         options={particularSelector}
//                                         value={field.value || ""}
//                                         onChange={field.onChange}
//                                         placeholder="Select Particulars"
//                                         emptyMessage="No particulars found"
//                                         contentClassName="w-full"
//                                     />
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
//                                     <Input {...field} type="number" placeholder="Enter amount" readOnly={!isEditing}></Input>
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
//                                     <Textarea {...field} placeholder="Add more details (Optional)" readOnly={!isEditing} ></Textarea>
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
//                                         disabled={!isEditing}
//                                     />
//                                 </FormControl>
//                             <FormMessage/>
//                         </FormItem>
//                     )}></FormField>
//                 </div>
                
//                 <div className="mt-6 flex justify-end">

//                     {!isEditing ? (
//                         <Button
//                             type="button"
//                             onClick={(e) => {
//                                 e.preventDefault(); // Prevent form submission
//                                 setIsEditing(true); // Toggle editing mode
//                             }}
//                         >
//                             Edit
//                         </Button>
//                     ) : (

//                         <ConfirmationModal
//                             trigger={
//                                 <Button onClick={handleSaveClick}>Save</Button>
//                             }
//                             title="Confirm Save"
//                             description="Are you sure you want to save the changes?"
//                             actionLabel="Confirm"
//                             onClick={handleConfirmSave} // This will be called when the user confirms
//                         />    

//                     )}

//                 </div>      
//             </form>
//         </Form>             

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
import IncomeExpenseEditFormSchema from "@/form-schema/treasurer/expense-tracker-edit-schema";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { MediaUpload } from "@/components/ui/media-upload";
import { SetStateAction } from "react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useUpdateIncomeExpense } from "./queries/treasurerIncomeExpenseUpdateQueries";


interface IncomeandExpenseEditProps{
    iet_num: number;
    iet_serial_num: string;
    iet_entryType: string;
    iet_particular_id: number;
    iet_particulars_name: string;
    iet_amount: string;
    iet_additional_notes: string;
    iet_receipt_image: string;
    inv_num: string;
    year: string;
    onSuccess?: () => void; 
}



function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_entryType, iet_particulars_name, iet_particular_id, iet_amount, iet_additional_notes, iet_receipt_image, inv_num, year, onSuccess} : IncomeandExpenseEditProps) {    

    const years = Number(year)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formValues, setFormValues] = useState<z.infer<typeof IncomeExpenseEditFormSchema>>();

    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");


    const entrytypeSelector = [
        { id: "0", name: "Income"},
        { id: "1", name: "Expense"}
    ];


    const { data: budgetItems = [] } = useBudgetItems(years);
    

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


    const { mutate: updateEntry } = useUpdateIncomeExpense(iet_num, onSuccess);

    const onSubmit = async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {

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
        
        updateEntry(values);
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


    useEffect(() => {
        if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
            form.setValue('iet_receipt_image', mediaFiles[0].publicUrl);
        } else {
            form.setValue('iet_receipt_image', 'no-image-url-fetched');
        }
    }, [mediaFiles, form]);


    return (

        <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>

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
                <div className="flex flex-col gap-4 border p-5 rounded-md">
                    <div>
                        <img src={iet_receipt_image} className="w-52 h-52 border shadow-sm"/>
                    </div>
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