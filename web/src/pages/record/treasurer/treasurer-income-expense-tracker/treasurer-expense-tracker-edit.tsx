
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








// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Button } from "@/components/ui/button/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import IncomeExpenseEditFormSchema from "@/form-schema/treasurer/expense-tracker-edit-schema";
// import { Textarea } from "@/components/ui/textarea";
// import { useState, useEffect } from "react";
// import { Combobox } from "@/components/ui/combobox";
// import { MediaUpload } from "@/components/ui/media-upload";
// import { SetStateAction } from "react";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { useBudgetItems, type BudgetItem } from "./queries/treasurerIncomeExpenseFetchQueries";
// import { useUpdateIncomeExpense } from "./queries/treasurerIncomeExpenseUpdateQueries";


// interface IncomeandExpenseEditProps{
//     iet_num: number;
//     iet_serial_num: string;
//     iet_datetime: string;
//     iet_entryType: string;
//     iet_particular_id: number;
//     iet_particulars_name: string;
//     iet_amount: string;
//     iet_actual_amount: string;
//     iet_additional_notes: string;
//     iet_receipt_image: string;
//     inv_num: string;
//     year: string;
//     files: {  
//         ief_id: number;
//         ief_url: string;
//     }[];
//     onSuccess?: () => void; 
// }



// function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_datetime, iet_entryType, iet_particulars_name, iet_particular_id, iet_amount, iet_actual_amount, iet_additional_notes, iet_receipt_image, inv_num, year, files, onSuccess} : IncomeandExpenseEditProps) {    
    
//     const inputCss = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
//     const years = Number(year)
//     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
//     const [formValues, setFormValues] = useState<z.infer<typeof IncomeExpenseEditFormSchema>>();

//     const [mediaFiles, setMediaFiles] = useState<any[]>(() => {
//         return files?.map(file => ({
//             id: `existing-${file.ief_id}`,
//             type: 'image',
//             status: 'uploaded' as const,
//             publicUrl: file.ief_url,
//             previewUrl: file.ief_url,
//             storagePath: '' 
//         })) || [];
//     });

//     const [activeVideoId, setActiveVideoId] = useState<string>("");



//     const entrytypeSelector = [
//         { id: "0", name: "Income"},
//         { id: "1", name: "Expense"}
//     ];


//     const { data: budgetItems = [] } = useBudgetItems(years);
    

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
//             iet_datetime: new Date(iet_datetime).toISOString().slice(0, 16),
//             iet_entryType: iet_entryType === "Income" ? '0' : '1',
//             iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
//             iet_amount: iet_amount,
//             iet_actual_amount: iet_actual_amount,
//             iet_additional_notes: iet_additional_notes,
//             iet_receipt_image: undefined
//         }
//     });

//     const selectedParticularId = form.watch("iet_particulars");
//     const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);


//     const { mutate: updateEntry } = useUpdateIncomeExpense(iet_num, onSuccess);

//     const onSubmit = async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {

//         const actual_amount = form.getValues("iet_actual_amount") || "0";;
//         const particulars = form.getValues("iet_particulars");
    
//         if (!values.iet_amount || !particulars) {

//             form.setError("iet_particulars", {
//                 type: "manual",
//                 message: `Particulars are required`,
//             });
//             form.setError("iet_amount", {
//                 type: "manual",
//                 message: `Amount is required`,
//             });
//         }
    
//         // Check if selectedParticular exists
//         if (!selectedParticular) {
//             form.setError("iet_particulars", {
//                 type: "manual",
//                 message: `Select a valid particular`,
//             });
//             return;
//         }
                
//         const particularAccBudget = selectedParticular.proposedBudget;
//         const subtractedAmount = particularAccBudget - parseFloat(values.iet_amount);
//         const subtractedActualAmount = particularAccBudget - parseFloat(actual_amount);

    
//         if (subtractedAmount < 0) {
//             form.setError("iet_amount", {
//                 type: "manual",
//                 message: `Insufficient Balance`,
//             });
//             return
//         }
        
//         if (subtractedActualAmount < 0) {
//             form.setError("iet_actual_amount", {
//                 type: "manual",
//                 message: `Insufficient Balance`,
//             });
//             return
//         }            
        
//         updateEntry({ ...values, mediaFiles });
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


//     useEffect(() => {
//         if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
//             form.setValue('iet_receipt_image', mediaFiles[0].publicUrl);
//         } else {
//             form.setValue('iet_receipt_image', 'no-image-url-fetched');
//         }
//     }, [mediaFiles, form]);


//     return (

//         <Form {...form}>
//             <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>

//                 {selectedParticular && (
//                     <div className="pb-5">
//                         <div className="flex w-full h-9 bg-primary justify-center items-center rounded-md text-white">
//                             <Label>Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}</Label>
//                         </div>
//                     </div>
//                 )}



//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="iet_serial_num"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Serial No.</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="(e.g. 123456)" type="text" readOnly={!isEditing} />
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//                 </div>


//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="iet_datetime"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Date</FormLabel>
//                                 <FormControl>
//                                     <input 
//                                         type="datetime-local" {...field} 
//                                         placeholder={`Date (${years} only)`} 
//                                         className={inputCss}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
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
//                         control={form.control}
//                         name="iet_actual_amount"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Proposed Amount</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type="number" placeholder="Enter proposed amount" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
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
//                         control={form.control}
//                         name="iet_receipt_image"
//                         render={() => (
//                             <FormItem>
//                                 <FormLabel>Receipt Image</FormLabel>
//                                 <FormControl>
//                                     <MediaUpload
//                                         title="Receipt Image"
//                                         description="Upload an image of your receipt as proof of transaction"
//                                         mediaFiles={mediaFiles}
//                                         activeVideoId={activeVideoId}
//                                         setMediaFiles={setMediaFiles}
//                                         setActiveVideoId={setActiveVideoId}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
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
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useBudgetItems } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useUpdateIncomeExpense } from "./queries/treasurerIncomeExpenseUpdateQueries";
import { useIncomeExpenseMainCard } from "./queries/treasurerIncomeExpenseFetchQueries";


interface IncomeandExpenseEditProps{
    iet_num: number;
    iet_serial_num: string;
    iet_datetime: string;
    iet_entryType: string;
    iet_particular_id: number;
    iet_particulars_name: string;
    iet_amount: string;
    iet_actual_amount: string;
    iet_additional_notes: string;
    iet_receipt_image: string;
    inv_num: string;
    year: string;
    totBud: string;
    totExp: string;
    files: {  
        ief_id: number;
        ief_url: string;
    }[];
    onSuccess?: () => void; 
}



function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_datetime, iet_entryType, iet_particulars_name, iet_particular_id, iet_amount, iet_actual_amount, iet_additional_notes, iet_receipt_image, inv_num, year, files, onSuccess} : IncomeandExpenseEditProps) {    
    
    const inputCss = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
    const years = Number(year)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formValues, setFormValues] = useState<z.infer<typeof IncomeExpenseEditFormSchema>>();

    const [mediaFiles, setMediaFiles] = useState<any[]>(() => {
        return files?.map(file => ({
            id: `existing-${file.ief_id}`,
            type: 'image',
            status: 'uploaded' as const,
            publicUrl: file.ief_url,
            previewUrl: file.ief_url,
            storagePath: '' 
        })) || [];
    });

    const [activeVideoId, setActiveVideoId] = useState<string>("");



    const entrytypeSelector = [
        { id: "0", name: "Income"},
        { id: "1", name: "Expense"}
    ];


    const { data: budgetItems = [] } = useBudgetItems(years);
    const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

    const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === years);
    const totBud = matchedYearData?.ie_remaining_bal ?? 0;
    const totExp = matchedYearData?.ie_main_exp ?? 0;    
    
    console.log("REMAINING BAL: ", totBud)
    console.log("TOWTAL EXP: ", totExp)

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
            iet_datetime: new Date(iet_datetime).toISOString().slice(0, 16),
            iet_entryType: iet_entryType === "Income" ? '0' : '1',
            iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
            iet_amount: iet_amount,
            iet_actual_amount: iet_actual_amount,
            iet_additional_notes: iet_additional_notes,
            iet_receipt_image: undefined
        }
    });

    const selectedParticularId = form.watch("iet_particulars");
    const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);


    const { mutate: updateEntry } = useUpdateIncomeExpense(iet_num, onSuccess);

    const onSubmit = async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {

        let totalBudget = 0.00;
        let totalExpense = 0.00;
        let proposedBud = 0.00;

        //current Expenses and Total Budget
        const totEXP = Number(totExp);
        const totBUDGET = Number(totBud);

        //amount
        const prevAmount = Number(iet_amount)
        const amount = Number(values.iet_amount);
        const prevActualAmount = Number(iet_actual_amount);
        const actualAmount = values.iet_actual_amount ? Number(values.iet_actual_amount) : 0;

        //proposed budget
        const proposedBudget = selectedParticular?.proposedBudget;
        const propBudget = Number(proposedBudget);

        //dtl_id
        const particularid = selectedParticularId?.split(' ')[0] || '';
        const particularId = Number(particularid);


        const particulars = form.getValues("iet_particulars");
    
        if (!values.iet_amount || !particulars) {

            form.setError("iet_particulars", {
                type: "manual",
                message: `Particulars are required`,
            });
            form.setError("iet_amount", {
                type: "manual",
                message: `Amount is required`,
            });
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
        const subtractedAmount = particularAccBudget - parseFloat(values.iet_amount);
        const subtractedActualAmount = particularAccBudget - actualAmount;

    
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


        if(amount < 0){ // not accepting negative value for amount
            form.setError("iet_amount", {
                type: "manual",
                message: `Enter valid amount.`,
            });
            return
        }else{
            if(actualAmount < 0){ // not accepting negative value for actual amount
                form.setError("iet_actual_amount", {
                    type: "manual",
                    message: `Enter valid actual amount.`,
                });
                return
            }
            else{
                if(amount){
                    if(actualAmount){ //checks if actual amount is also available
                        if(actualAmount != prevActualAmount && prevActualAmount != 0){ // if the user updates the actual amount
                            totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
                            totalExpense = (totEXP - prevActualAmount) + actualAmount; 
                            proposedBud = (propBudget + prevActualAmount) - actualAmount;                        
                        }
                        else{// if new added actual amount
                            if(amount != prevAmount){  // if theres changes in the amount value
                                totalBudget = (totBUDGET + prevAmount) - actualAmount;
                                totalExpense = (totEXP - prevAmount) + actualAmount; 
                                proposedBud = (propBudget + prevAmount) - actualAmount;   
                            }
                            else{ // if no changes in amount value
                                totalBudget = (totBUDGET + amount) - actualAmount;
                                totalExpense = (totEXP - amount) + actualAmount; 
                                proposedBud = (propBudget + amount) - actualAmount;
                            }
                        }
                    }
                    else{ // if no actual amount cuz it will go here if the value is 0
                        if(actualAmount != prevActualAmount){ // checks if the user changes actual amount to 0
                            totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
                            totalExpense = (totEXP - prevActualAmount) + actualAmount; 
                            proposedBud = (propBudget + prevActualAmount) - actualAmount;    
                        }
                        else{
                            if(amount != prevAmount){ // checks if theres difference between the value of amount
                                console.log("SAKTOOOO HEREER YEYEYSYS")
                                totalBudget = (totBUDGET + prevAmount) - amount;      
                                totalExpense = (totEXP - prevAmount) + amount;   
                                proposedBud = (propBudget + prevAmount) - amount;  
                            }            
                            else{ // no changes
                                totalBudget = totBUDGET;      
                                totalExpense = totEXP;   
                                proposedBud = propBudget;  
                            }    
                        }              
                    }
                }
                else{
                    form.setError("iet_amount", {
                        type: "manual",
                        message: `Not Allowed. Please provide proposed budget.`,
                    });
                    return          
                }                
            }
        }

        
        updateEntry({ ...values, mediaFiles, years, totalBudget, totalExpense, proposedBud, particularId });
        console.log("CONSOLE EXP: ", values,  totalExpense, totalBudget)
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
                        <div className="flex w-full h-9 bg-primary justify-center items-center rounded-md text-white">
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
                                    <Input {...field} placeholder="(e.g. 123456)" type="text" readOnly={!isEditing} />
                                </FormControl>
                                <FormMessage/>
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
                                        readOnly={!isEditing}
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
                            <FormLabel>Proposed Amount</FormLabel>
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
                        name="iet_actual_amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Actual Amount</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" placeholder="Enter proposed amount" readOnly={!isEditing}/>
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