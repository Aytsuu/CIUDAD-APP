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


// interface IncomeEditFormProps {
//     inc_num: number;
//     inc_particulars: string;
//     inc_amount: string;
//     inc_additional_notes: string;
//     inc_receipt_image: string;    
//     onSuccess?: () => void; // Add this prop type
// }




// function IncomeEditForm( { inc_num, inc_particulars, inc_amount, inc_additional_notes, inc_receipt_image, onSuccess }: IncomeEditFormProps) {

//     const [mediaFiles, setMediaFiles] = useState<any[]>([]);
//     const [activeVideoId, setActiveVideoId] = useState<string>("");

//     const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";
    
//     const { data: budgetItems = [] } = useBudgetItems();

//     const particularSelector = budgetItems.map(item => ({
//         id: `${item.id} ${item.name}`,
//         name: item.name,
//         proposedBudget: item.proposedBudget
//     }));


//     const form = useForm<z.infer<typeof IncomeEditFormSchema>>({
//         resolver: zodResolver(IncomeEditFormSchema),
//         defaultValues: {
//             inc_entryType: "",
//             inc_particulars: inc_particulars,
//             inc_amount: inc_amount,
//             inc_additional_notes: inc_additional_notes,
//             inc_receipt_image: undefined,
//         },
//     });


//     const { mutate: updateIncome } = useUpdateIncome(inc_num, onSuccess);

//     const onSubmit = (values: z.infer<typeof IncomeEditFormSchema>) => {
//         updateIncome(values)
//     };


//     // const selectedParticularId = form.watch("iet_particulars");
//     // const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);



//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)}>
//                 {/* Step 1: Amount, Entry Type, and Particulars */}
                       
//                 <div className="pb-5">
//                     <FormField
//                         control={form.control}
//                         name="inc_particulars"
//                         render={({ field }) => (
//                         <FormItem>  
//                             <FormLabel>Particulars</FormLabel>
//                             <FormControl>
//                                 <Input 
//                                     placeholder="Enter Event Title" 
//                                     className={inputcss} 
//                                     {...field} 
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

// export default IncomeEditForm;



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
import { useUpdateIncome } from "./queries/treasurerIncomeExpenseUpdateQueries";
import IncomeEditFormSchema from "@/form-schema/treasurer/income-tracker-edit-schema";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";



interface IncomeEditFormProps {
    inc_num: number;
    inc_particulars: string;
    inc_amount: string;
    inc_additional_notes: string;
    inc_receipt_image: string;    
    onSuccess?: () => void;
}

function IncomeEditForm({ inc_num, inc_particulars, inc_amount, inc_additional_notes, inc_receipt_image, onSuccess }: IncomeEditFormProps) {
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formValues, setFormValues] = useState<z.infer<typeof IncomeEditFormSchema>>();

    const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";
    
    const { data: budgetItems = [] } = useBudgetItems();

    const particularSelector = budgetItems.map(item => ({
        id: `${item.id} ${item.name}`,
        name: item.name,
        proposedBudget: item.proposedBudget
    }));

    const form = useForm<z.infer<typeof IncomeEditFormSchema>>({
        resolver: zodResolver(IncomeEditFormSchema),
        defaultValues: {
            inc_entryType: "",
            inc_particulars: inc_particulars,
            inc_amount: inc_amount,
            inc_additional_notes: inc_additional_notes,
            inc_receipt_image: undefined,
        },
    });

    const { mutate: updateIncome } = useUpdateIncome(inc_num, onSuccess);

    const onSubmit = (values: z.infer<typeof IncomeEditFormSchema>) => {
        updateIncome(values);
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
                <div className="pb-5">
                    <FormField
                        control={form.control}
                        name="inc_particulars"
                        render={({ field }) => (
                        <FormItem>  
                            <FormLabel>Particulars</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Enter Particular " 
                                    className={inputcss} 
                                    {...field}
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
        </Form>
    );
}

export default IncomeEditForm;