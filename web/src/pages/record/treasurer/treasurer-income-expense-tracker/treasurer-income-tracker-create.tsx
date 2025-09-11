import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useIncomeParticular } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useCreateIncome } from "./queries/treasurerIncomeExpenseAddQueries";
import IncomeFormSchema from "@/form-schema/treasurer/income-tracker-schema";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useAddParticular } from "./request/particularsPostRequest";
import { useDeleteParticular } from "./request/particularsDeleteRequest";
import { useIncomeExpenseMainCard } from "./queries/treasurerIncomeExpenseFetchQueries";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


interface IncomeCreateFormProps {
    onSuccess?: () => void;
    year: number;
    totInc: number;
}

function IncomeCreateForm({ year, onSuccess }: IncomeCreateFormProps) {

    const { user } = useAuth();
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
        },
    });

    //Fetch mutation
    const { data: IncomeParticularItems = [] } = useIncomeParticular();
    const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

    //Post mutation
    const { mutate: createIncome, isPending } = useCreateIncome(onSuccess);

    const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === Number(year));
    const totInc = matchedYearData?.ie_main_inc ?? 0;

    
    const onSubmit = async (values: z.infer<typeof IncomeFormSchema>) => {
        const inputDate = new Date(values.inc_datetime);
        const inputYear = inputDate.getFullYear();
        const yearIncome = Number(year)
        let totalIncome = 0.0

        console.log("YEAR NUMBERRRR: ", typeof inputYear)

        let totIncome = Number(totInc);
        let inc_amount = Number(values.inc_amount)

        totalIncome = totIncome + inc_amount;

        if (inputYear !== yearIncome) {
            form.setError('inc_datetime', {
                type: 'manual',
                message: `Date must be in the year ${year}`
            });
            return; 
        }

        if(!values.inc_additional_notes){
            values.inc_additional_notes = "None";
        }
        
        const AllValues = {
            ...values,
            totalIncome,
            year,
            staff: user?.staff?.staff_id
        }

        createIncome(AllValues)
    };

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


                <div className="flex justify-end mt-[20px] space-x-2">
                    <Button type="submit" disabled={ isPending }>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Save Entry"
                        )}
                    </Button>
                </div>
            </form>
            {ConfirmationDialogs()}
        </Form>
    );
}

export default IncomeCreateForm;