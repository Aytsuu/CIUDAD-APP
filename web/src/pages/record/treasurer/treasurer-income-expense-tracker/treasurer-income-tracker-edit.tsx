
//PINAKA LATEST WORKINGGG
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
// import { useUpdateIncome } from "./queries/treasurerIncomeExpenseUpdateQueries";
// import IncomeEditFormSchema from "@/form-schema/treasurer/income-tracker-edit-schema";
// import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";



// interface IncomeEditFormProps {
//     inc_num: number;
//     inc_serial_num: string;
//     incp_id: number;
//     inc_particulars: string;
//     inc_amount: string;
//     inc_additional_notes: string;
//     inc_receipt_image: string;    
//     onSuccess?: () => void;
// }

// function IncomeEditForm({ inc_num, inc_serial_num, incp_id, inc_particulars, inc_amount, inc_additional_notes, inc_receipt_image, onSuccess }: IncomeEditFormProps) {
//     const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");
//     const [isEditing, setIsEditing] = useState(false);
//     const [isConfirmOpen, setIsConfirmOpen] = useState(false);
//     const [formValues, setFormValues] = useState<z.infer<typeof IncomeEditFormSchema>>();

//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";
    

//     const form = useForm<z.infer<typeof IncomeEditFormSchema>>({
//         resolver: zodResolver(IncomeEditFormSchema),
//         defaultValues: {
//             inc_entryType: "",
//             inc_serial_num: inc_serial_num,
//             inc_particulars: `${incp_id} ${inc_particulars}`,
//             inc_amount: inc_amount,
//             inc_additional_notes: inc_additional_notes,
//             inc_receipt_image: undefined,
//         },
//     });

//     const { mutate: updateIncome } = useUpdateIncome(inc_num, onSuccess);

//     const onSubmit = (values: z.infer<typeof IncomeEditFormSchema>) => {
//         updateIncome(values);
//         setIsEditing(false);
//     };

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

//                 {inc_serial_num !== "None" && ( 

//                     <div className="pb-5">
//                         <FormField
//                             control={form.control}
//                             name="inc_serial_num"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Serial Number</FormLabel>
//                                     <FormControl>
//                                         <Input {...field} placeholder="Enter serial number" readOnly/>
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     </div>    
//                 )}     
                

//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_particulars"
//                         render={({ field }) => (
//                         <FormItem>  
//                             <FormLabel>Particulars</FormLabel>
//                             <FormControl>
//                                 <Input 
//                                     placeholder="Enter Particular " 
//                                     className={inputcss} 
//                                     {...field}
//                                     readOnly={!isEditing}
//                                 />                           
//                             </FormControl>
//                             <FormMessage />
//                         </FormItem>
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
//                                     <Input 
//                                         {...field} 
//                                         type="number" 
//                                         placeholder="Enter amount" 
//                                         readOnly={!isEditing}
//                                     />
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
//                                     <Textarea 
//                                         {...field} 
//                                         placeholder="Add more details (Optional)" 
//                                         readOnly={!isEditing}
//                                     />
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
//                     {!isEditing ? (
//                         <Button
//                             type="button"
//                             onClick={(e) => {
//                                 e.preventDefault();
//                                 setIsEditing(true);
//                             }}
//                         >
//                             Edit
//                         </Button>
//                     ) : (
//                         <ConfirmationModal
//                             trigger={
//                                 <Button type="button" onClick={handleSaveClick}>
//                                     Save
//                                 </Button>
//                             }
//                             title="Confirm Save"
//                             description="Are you sure you want to save the changes?"
//                             actionLabel="Confirm"
//                             onClick={handleConfirmSave}
//                         />
//                     )}
//                 </div>
//             </form>
//         </Form>
//     );
// }

// export default IncomeEditForm;












import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useUpdateIncome } from "./queries/treasurerIncomeExpenseUpdateQueries";
import IncomeEditFormSchema from "@/form-schema/treasurer/income-tracker-edit-schema";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useIncomeExpenseMainCard } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useIncomeParticular } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useAddParticular } from "./request/particularsPostRequest";
import { useDeleteParticular } from "./request/particularsDeleteRequest";



interface IncomeEditFormProps {
    inc_num: number;
    inc_datetime: string;
    inc_serial_num: string;
    inc_transac_num: string;
    incp_id: number;
    inc_particulars: string;
    inc_amount: string;
    inc_additional_notes: string;
    inc_receipt_image: string;    
    year: number;
    totInc: number;
    onSuccess?: () => void;
}

function IncomeEditForm({ inc_datetime, inc_num, inc_serial_num, inc_transac_num, incp_id, inc_particulars, inc_amount, inc_additional_notes, inc_receipt_image, year, onSuccess }: IncomeEditFormProps) {
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formValues, setFormValues] = useState<z.infer<typeof IncomeEditFormSchema>>();

    const inputCss = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
    const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";
    

    const form = useForm<z.infer<typeof IncomeEditFormSchema>>({
        resolver: zodResolver(IncomeEditFormSchema),
        defaultValues: {
            inc_entryType: "",
            inc_datetime: new Date(inc_datetime).toISOString().slice(0, 16),
            inc_serial_num: inc_serial_num || "None",
            inc_transac_num: inc_transac_num || "None",
            inc_particulars: String(incp_id),
            inc_amount: inc_amount,
            inc_additional_notes: inc_additional_notes
        },
    });




    //Handling the Income Particular
    const { handleAddParticular } = useAddParticular();
    const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();

    //Fetch mutation
    const { data: IncomeParticularItems = [] } = useIncomeParticular();
    const {  data: fetchedData = [] } = useIncomeExpenseMainCard();  

    //Put mutation
    const { mutate: updateIncome } = useUpdateIncome(inc_num, onSuccess);


    const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === Number(year));
    const totInc = matchedYearData?.ie_main_inc ?? 0;


    const IncomeParticulars = IncomeParticularItems
            .filter(item => item.id && item.name)
            .map(item => ({
                id: item.id,
                name: item.name,
    }));


    const onSubmit = (values: z.infer<typeof IncomeEditFormSchema>) => {
        const inputDate = new Date(values.inc_datetime);
        const inputYear = inputDate.getFullYear();
        let totalIncome = 0.0

        const totIncome = Number(totInc);
        const prev_amount = Number(inc_amount);
        const current_amount = Number(values.inc_amount);

        if (inputYear !== Number(year)) {
            form.setError('inc_datetime', {
                type: 'manual',
                message: `Date must be in the year ${year}`
            });
            return; 
        }

        if(prev_amount != current_amount){
            totalIncome = (totIncome - prev_amount) + current_amount;           
        }
        else{
            totalIncome = current_amount;
        }

        const allValues = {
            ...values,
            totalIncome,
            year,
        }
        
        updateIncome(allValues);
        setIsEditing(false);
        console.log("VALUES: ", allValues)
    };

    const handleSaveClick = () => {
        setFormValues(form.getValues()); // Store current form values
        setIsConfirmOpen(true); // Open confirmation modal
    };

    const handleConfirmSave = () => {
        setIsConfirmOpen(false); 
        form.handleSubmit(onSubmit)(); 
    };

    return (
        <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>

                {inc_serial_num && ( 

                    <div className="pb-5">
                        <FormField
                            control={form.control}
                            name="inc_serial_num"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Serial Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter serial number" readOnly/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>    
                )}     


                {inc_transac_num && ( 

                    <div className="pb-5">
                        <FormField
                            control={form.control}
                            name="inc_transac_num"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transaction Number</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter transaction number" readOnly/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>    
                )}   

                <div className="pb-5">
                    <FormField
                        control={form.control}
                        name="inc_datetime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <input 
                                        type="datetime-local" {...field} 
                                        placeholder={`Date (${year} only)`} 
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
                                    <Input 
                                        {...field} 
                                        type="number" 
                                        placeholder="Enter amount" 
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
                        name="inc_additional_notes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Additional Notes</FormLabel>
                                <FormControl>
                                    <Textarea 
                                        {...field} 
                                        placeholder="Add more details (Optional)" 
                                        readOnly={!isEditing}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>


                <div className="flex justify-end mt-[20px] space-x-2">
                    {!isEditing ? (
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsEditing(true);
                            }}
                        >
                            Edit
                        </Button>
                    ) : (
                        <ConfirmationModal
                            trigger={
                                <Button type="button" onClick={handleSaveClick}>
                                    Save
                                </Button>
                            }
                            title="Confirm Save"
                            description="Are you sure you want to save the changes?"
                            actionLabel="Confirm"
                            onClick={handleConfirmSave}
                        />
                    )}
                </div>
            </form>
            {ConfirmationDialogs()}
        </Form>
    );
}

export default IncomeEditForm;