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

