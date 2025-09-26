import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import IncomeExpenseEditFormSchema from "@/form-schema/treasurer/expense-tracker-edit-schema";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useBudgetItems } from "./queries/treasurerIncomeExpenseFetchQueries";
import { useUpdateIncomeExpense } from "./queries/treasurerIncomeExpenseUpdateQueries";
import { useIncomeExpenseMainCard } from "./queries/treasurerIncomeExpenseFetchQueries";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


interface IncomeandExpenseEditProps{
    iet_num: number;
    iet_serial_num: string;
    iet_check_num: string;
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



function IncomeandExpenseEditForm({iet_num, iet_serial_num, iet_check_num, iet_datetime, iet_entryType, iet_particulars_name, iet_particular_id, iet_amount, iet_actual_amount, iet_additional_notes, year, files, onSuccess} : IncomeandExpenseEditProps) {    
    
    const { user } = useAuth();
    const inputCss = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";
    const years = Number(year)
    const [_isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [_formValues, setFormValues] = useState<z.infer<typeof IncomeExpenseEditFormSchema>>();

    const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => {
        return files?.map(file => ({
            id: `existing-${file.ief_id}`,
            name: `file-${file.ief_id}`, 
            type: 'image/jpeg', 
            url: file.ief_url 
        })) || [];
    });    

    const [activeVideoId, setActiveVideoId] = useState<string>("");


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
            iet_check_num: String(iet_check_num),
            iet_datetime: new Date(iet_datetime).toISOString().slice(0, 16),
            iet_entryType: iet_entryType === "Income" ? '0' : '1',
            iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
            iet_amount: iet_amount,
            iet_actual_amount: iet_actual_amount,
            iet_additional_notes: iet_additional_notes,
        }
    });

    const selectedParticularId = form.watch("iet_particulars");
    const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);


    const { mutate: updateEntry, isPending } = useUpdateIncomeExpense(iet_num, onSuccess);

    const onSubmit = async (values: z.infer<typeof IncomeExpenseEditFormSchema>) => {

        let totalBudget = 0.00;
        let totalExpense = 0.00;
        let proposedBud = 0.00;
        let returnAmount = 0.00;

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

        if(!values.iet_serial_num && !values.iet_check_num){
            form.setError('iet_serial_num', {
                type: 'manual',
                message: "Please enter a data either on this field"
            });

            form.setError('iet_check_num', {
                type: 'manual',
                message: "Please enter a data either on this field"
            });
            return; 
        }        
    
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
        // const subtractedAmount = particularAccBudget - parseFloat(values.iet_amount);
        // const subtractedActualAmount = particularAccBudget - actualAmount;

        if(Number(values.iet_actual_amount) > 0){

            if(prevActualAmount == 0){ // if bag o pa mag add og actual expense
                let budget = prevAmount + particularAccBudget;
                let subtractedActualAMT = budget - Number(values.iet_actual_amount);

                if (subtractedActualAMT < 0) {
                    form.setError("iet_actual_amount", {
                        type: "manual",
                        message: `Insufficient Balance`,
                    });
                    return
                }  
            }            
            else{ // if mo update sa actual expense
                let budget = prevActualAmount + particularAccBudget;                
                let subtractedActualAMT = budget - Number(values.iet_actual_amount);            
                
                if (subtractedActualAMT < 0) {
                    form.setError("iet_actual_amount", {
                        type: "manual",
                        message: `Insufficient Balance`,
                    });
                    return
                }              
            }
        }
        else{
            let budget = prevAmount + particularAccBudget;
            let subtractAMT = budget - parseFloat(values.iet_amount);

            if (subtractAMT < 0) {
                form.setError("iet_amount", {
                    type: "manual",
                    message: `Insufficient Balance`,
                });
                return
            }
        }
    
        // if (subtractedAmount < 0) {
        //     form.setError("iet_amount", {
        //         type: "manual",
        //         message: `Insufficient Balance`,
        //     });
        //     return
        // }
        
        // if (subtractedActualAmount < 0) {
        //     form.setError("iet_actual_amount", {
        //         type: "manual",
        //         message: `Insufficient Balance`,
        //     });
        //     return
        // }     

        if(!values.iet_additional_notes){
            values.iet_additional_notes = "None";
        }        

        const files = mediaFiles.map((media) => ({
            'id': media.id,
            'name': media.name,
            'type': media.type,
            'file': media.file
        }))        

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
                        if(actualAmount == prevActualAmount)
                        {
                            if(amount != prevAmount){
                                totalBudget = totBUDGET;      
                                totalExpense = totEXP;   
                                proposedBud = propBudget;  

                                returnAmount = Math.abs(amount - actualAmount);  
                            }else{
                                totalBudget = totBUDGET;      
                                totalExpense = totEXP;   
                                proposedBud = propBudget;   
                            }                           
                        }
                        else{
                            if(actualAmount != prevActualAmount && prevActualAmount != 0){ // if the user updates the actual amount
                                totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
                                totalExpense = (totEXP - prevActualAmount) + actualAmount; 
                                proposedBud = (propBudget + prevActualAmount) - actualAmount;  
                                
                                returnAmount = Math.abs(amount - actualAmount);
                            }
                            else{// if new added actual amount
                                if(amount != prevAmount){  // if theres changes in the amount value
                                    totalBudget = (totBUDGET + prevAmount) - actualAmount;
                                    totalExpense = (totEXP - prevAmount) + actualAmount; 
                                    proposedBud = (propBudget + prevAmount) - actualAmount;   
                                                                    
                                    returnAmount = Math.abs(amount - actualAmount);
                                }
                                else{ // if no changes in amount value
                                    totalBudget = (totBUDGET + amount) - actualAmount;
                                    totalExpense = (totEXP - amount) + actualAmount; 
                                    proposedBud = (propBudget + amount) - actualAmount;
                                                                    
                                    returnAmount = Math.abs(amount - actualAmount);
                                }
                            }                           
                        }                
                    }
                    else{ // if no actual amount cuz it will go here if the value is 0
                        if(actualAmount != prevActualAmount){ // checks if the user changes actual amount to 0
                            totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
                            totalExpense = (totEXP - prevActualAmount) + actualAmount; 
                            proposedBud = (propBudget + prevActualAmount) - actualAmount;    
                                                          
                            returnAmount = Math.abs(amount - actualAmount);
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

        
        updateEntry({ ...values, files, years, totalBudget, totalExpense, proposedBud, returnAmount, particularId, staff: user?.staff?.staff_id });
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
                                    <Input {...field} placeholder="(e.g. 11-231-12)" type="text" readOnly={!isEditing} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pb-5">
                    <FormField
                        control={form.control}
                        name="iet_check_num"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Check No.</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="(e.g. 11-231-12)" type="text" readOnly={!isEditing} />
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
                    <MediaUpload
                        title=""
                        description="Upload/Edit supporting document as proof of transaction"
                        mediaFiles={mediaFiles}
                        activeVideoId={activeVideoId}
                        setMediaFiles={setMediaFiles}
                        setActiveVideoId={setActiveVideoId}
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
                            disabled={ isPending }
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Edit"
                            )}
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