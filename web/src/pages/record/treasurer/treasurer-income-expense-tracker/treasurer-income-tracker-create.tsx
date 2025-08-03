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

// interface IncomeCreateFormProps {
//     onSuccess?: () => void;
// }


// function IncomeCreateForm( { onSuccess }: IncomeCreateFormProps) {

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

    
//     const { data: IncomeParticularItems = [] } = useIncomeParticular();

//     const IncomeParticulars = IncomeParticularItems
//             .filter(item => item.id && item.name)
//             .map(item => ({
//                 id: item.id,
//                 name: item.name,
//     }));


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
//                                     options={IncomeParticulars}
//                                     value={field.value}
//                                     onChange={field.onChange}
//                                     onAdd={(newParticular) => {
//                                         handleAddParticular(newParticular, (newId) => {
//                                             console.log('New ID:', newId);
//                                             field.onChange(newId);
//                                             console.log('Current form value:', form.getValues('inc_particulars'));
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
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { MediaUploadType } from "@/components/ui/media-upload";
import { useIncomeParticular } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useCreateIncome } from "./queries/treasurerIncomeExpenseAddQueries";
import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useAddParticular } from "./request/particularsPostRequest";
import { useDeleteParticular } from "./request/particularsDeleteRequest";
import { useIncomeExpenseMainCard } from "./queries/treasurerIncomeExpenseFetchQueries";


interface IncomeCreateFormProps {
    onSuccess?: () => void;
    year: number;
    totInc: number;
}

function IncomeCreateForm({ year, onSuccess }: IncomeCreateFormProps) {
    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
    const [activeVideoId, setActiveVideoId] = useState<string>("");
    const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";
    const inputCss = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
    
    const { handleAddParticular } = useAddParticular();
    const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();

    console.log("INCOMMMME YEEAAARRRRRRR: ", year)
    console.log("INCOMMMME  TYPEE  YEEAAARRRRRRR: ", typeof year)

    const form = useForm<z.infer<typeof IncomeFormSchema>>({
        resolver: zodResolver(IncomeFormSchema),
        defaultValues: {
            inc_datetime: "",
            inc_entryType: "",
            inc_particulars: "",
            inc_amount: "",
            inc_additional_notes: "",
            // inc_receipt_image: "",
        },
    });

    //Fetch mutation
    const { data: IncomeParticularItems = [] } = useIncomeParticular();
    const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

    //Post mutation
    const { mutate: createIncome } = useCreateIncome(onSuccess);

    const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === Number(year));
    const totInc = matchedYearData?.ie_main_inc ?? 0;

    
    const onSubmit = async (values: z.infer<typeof IncomeFormSchema>) => {
        const inputDate = new Date(values.inc_datetime);
        const inputYear = inputDate.getFullYear();
        const yearIncome = Number(year)
        let totalIncome = 0.0

        console.log("YEAR NUMBERRRR: ", typeof inputYear)

        const totIncome = Number(totInc);
        const inc_amount = Number(values.inc_amount)

        totalIncome = totIncome + inc_amount;

        if (inputYear !== yearIncome) {
            form.setError('inc_datetime', {
                type: 'manual',
                message: `Date must be in the year ${year}`
            });
            return; 
        }
        
        const AllValues = {
            ...values,
            totalIncome,
            year
        }

        createIncome(AllValues)
    };

    //setting url to the inc_receipt_image
    // useEffect(() => {
    //     if (mediaFiles.length > 0 && mediaFiles[0].publicUrl) {
    //         form.setValue('inc_receipt_image', mediaFiles[0].publicUrl);
    //     } else {
    //         form.setValue('inc_receipt_image', 'no-image-url-fetched');
    //     }
    // }, [mediaFiles, form]);

    //fetching Income Particulars

    const IncomeParticulars = IncomeParticularItems
        .filter(item => item.id && item.name)
        .map(item => ({
            id: item.id,
            name: item.name,
        }));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>


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
                                            console.log('New ID:', newId);
                                            field.onChange(newId);
                                            console.log('Current form value:', form.getValues('inc_particulars'));
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

                {/* <div className="pb-5">
                    <FormField
                        control={form.control}
                        name="inc_receipt_image"
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
                </div> */}

                <div className="flex justify-end mt-[20px] space-x-2">
                    <Button type="submit">Save Entry</Button>
                </div>
            </form>
            {ConfirmationDialogs()}
        </Form>
    );
}

export default IncomeCreateForm;



