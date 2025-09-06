import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { createReceiptSchema } from "@/form-schema/receipt-schema";
import { useAcceptRequest, useAcceptNonResRequest } from "./queries/personalClearanceUpdateQueries";
import { useAddPersonalReceipt } from "../Receipts/queries/receipts-insertQueries";
import { useMemo } from "react";

// function ReceiptForm({ certificateRequest, onSuccess }: ReceiptFormProps){
function ReceiptForm({
    id,
    purpose,
    rate,
    requester,
    pay_status,
    nat_col,
    is_resident,
    onSuccess,
    discountedAmount,
    discountReason
}: {
    id: string;
    purpose: string | undefined;
    rate: string | undefined;
    requester: string;
    pay_status: string;
    nat_col: string;
    is_resident: boolean;
    onSuccess: () => void;
    discountedAmount?: string;
    discountReason?: string;
}){
    const { mutate: receipt, isPending} = useAddPersonalReceipt(onSuccess)
    const { mutate: acceptReq, isPending: isAcceptPending} = useAcceptRequest()
    const { mutate: acceptNonResReq, isPending: isAcceptNonResPending} = useAcceptNonResRequest()

   console.log('stat', pay_status)
    const ReceiptSchema = useMemo(() => {
        return createReceiptSchema(discountedAmount || rate);
    }, [discountedAmount, rate]);


    const form = useForm<z.infer<typeof ReceiptSchema>>({
        resolver: zodResolver(ReceiptSchema),
        defaultValues: {
            inv_serial_num: is_resident ? "N/A" : "", 
            inv_amount: is_resident ? "150" : "",
            inv_nat_of_collection: nat_col,
            id: id.toString(), 
        }
    });

    const onSubmit = async () => {
        
        try {
            if (is_resident){
                await acceptReq(id)
            } else {
                // For non-resident requests, use the acceptNonResReq mutation
                await acceptNonResReq({nrc_id: id, discountReason: discountReason})
            }
            console.log('Receipt mutation called successfully');
        } catch (error) {
            console.error('Error in onSubmit:', error);
        }
    };

    // Debug form state
    console.log('Form errors:', form.formState.errors);
    console.log('Form is valid:', form.formState.isValid);
    console.log('Form values:', form.watch());

    const isAlreadyPaid = pay_status === "Paid";

    const isAmountInsufficient = () => {
        const amountPaid = form.watch("inv_amount");
        if (!amountPaid) return false;
        const amount = Number(amountPaid);
        
        const targetAmount = discountedAmount ? parseFloat(discountedAmount) : parseFloat(rate || "0");
        return amount > 0 && amount < targetAmount;
    };

    return(
        <>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Debug info */}
                <div className="text-xs text-red-500">
                {Object.keys(form.formState.errors).length > 0 && (
                    <div>
                    <strong>Form Errors:</strong>
                    {Object.entries(form.formState.errors).map(([field, error]) => (
                        <div key={field}>{field}: {error?.message}</div>
                    ))}
                    </div>
                )}
                </div>

                {/* Warning message if already paid */}
                {isAlreadyPaid && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-orange-800">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <p className="font-medium">This request is already paid..</p>
                    </div>
                    </CardContent>
                </Card>
                )}

                {/* Certificate details */}
                <Card>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-2">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Resident Name</label>
                        <p className="text-base text-gray-900 font-medium mt-1">{requester}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Request Type</label>
                        <p className="text-base text-gray-900 font-medium mt-1">{nat_col}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Purpose</label>
                        <p className="text-base text-gray-900 font-medium mt-1">{purpose}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Payment Status</label>
                        <p className="text-base text-green-600 font-semibold mt-1">{pay_status}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Amount</label>
                        <p className="text-base text-primary font-semibold mt-1">{`₱${rate}`}</p>
                    </div>
                    </div>
                </CardContent>
                </Card>

                {/* Amount and Discount Section */}
                <div className="flex justify-between items-center">
                    {/* Amount Display */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">Final Amount:</span>
                        <span className="text-lg font-semibold text-primary">
                            ₱{discountedAmount || rate}
                        </span>
                        {discountedAmount && (
                            <span className="text-sm text-muted-foreground line-through">₱{rate}</span>
                        )}
                    </div>
                    
                    {/* Discount Button */}
                    <Button 
                        type="button"
                        variant="outline"
                        disabled={isAlreadyPaid}
                        className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => {
                            onSuccess(); // Hide the create receipt form
                        }}
                    >
                        Apply Discount
                    </Button>
                </div>

                {/* Only show these fields if NOT resident */}
                {!is_resident && (
                <>
                    <FormField
                    control={form.control}
                    name="inv_serial_num"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Serial No. <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input 
                            {...field} 
                            placeholder="Enter receipt serial number" 
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={isAlreadyPaid}
                            readOnly={isAlreadyPaid}
                            style={isAlreadyPaid ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                            />
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="inv_amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount Paid (₱)</FormLabel>
                        <FormControl>
                            <Input 
                            {...field} 
                            type="number"                                         
                            placeholder="Enter amount" 
                            className="w-full"
                            onChange={(e) => {
                                field.onChange(e.target.value);
                            }}
                            />
                        </FormControl>
                        <FormMessage/>

                        {isAmountInsufficient() && (
                            <div className="text-sm text-red-600 mt-1">
                            Amount paid (₱{form.watch("inv_amount")}) is less than required amount (₱{discountedAmount || rate})
                            </div>
                        )}
                        </FormItem>
                    )}
                    />

                    {purpose && (discountedAmount || rate) && Number(form.watch("inv_amount")) > 0 && 
                    Number(form.watch("inv_amount")) > parseFloat(discountedAmount || rate || "0") && (
                    <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold">Change:</span>
                        <span className="text-green-600 font-semibold">
                            ₱{(
                            (Number(form.watch("inv_amount")) || 0) - 
                            parseFloat(discountedAmount || rate || "0")
                            ).toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                            })}
                        </span>
                        </div>
                    </div>
                    )}
                </>
                )}

                {/* Button */}
                <div className="flex justify-end gap-3 mt-6">
                <Button 
                    type="submit" 
                    disabled={isPending || isAcceptPending || isAcceptNonResPending || isAlreadyPaid || (!is_resident && isAmountInsufficient())}
                    className={isAlreadyPaid ? "opacity-50 cursor-not-allowed" : ""}
                >
                    {isPending || isAcceptPending || isAcceptNonResPending
                    ? "Processing..." 
                    : isAlreadyPaid 
                        ? "Cannot Proceed" 
                        : is_resident 
                        ? "Accept" 
                        : "Create Receipt"}
                </Button>
                </div>
            </form>
            </Form>

        </>
    )
}

export default ReceiptForm;


