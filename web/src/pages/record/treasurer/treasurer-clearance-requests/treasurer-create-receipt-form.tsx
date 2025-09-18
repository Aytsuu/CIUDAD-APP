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
import { useAuth } from '@/context/AuthContext';
import { useAcceptSummonRequest, useCreateServiceChargePaymentRequest, useServiceChargeRate, useUpdateServiceChargeStatus } from "./queries/serviceChargeQueries";
import { Loader2 } from "lucide-react";

// function ReceiptForm({ certificateRequest, onSuccess }: ReceiptFormProps){
function ReceiptForm({
    id,
    purpose,
    rate,
    requester,
    pay_status,
    nat_col,
    is_resident,
    voter_id,
    onSuccess,
    discountedAmount,
    discountReason,
    spay_id
}: {
    id: string;
    purpose: string | undefined;
    rate: string | undefined;
    requester: string;
    pay_status: string;
    nat_col: string;
    is_resident: boolean;
    voter_id?: string | number | null;
    onSuccess: () => void;
    discountedAmount?: string;
    discountReason?: string;
    spay_id?: number;
}){
    const { user } = useAuth();
    const staffId = user?.staff?.staff_id;
    const { mutate: receipt, isPending} = useAddPersonalReceipt(onSuccess)
    const { mutate: acceptReq, isPending: isAcceptPending} = useAcceptRequest()
    const { mutate: acceptNonResReq, isPending: isAcceptNonResPending} = useAcceptNonResRequest()
    const { data: scRate } = useServiceChargeRate();
    const { mutateAsync: createScPayReq } = useCreateServiceChargePaymentRequest();
    const { mutateAsync: acceptSummon } = useAcceptSummonRequest();
    const { mutateAsync: updateServiceChargeStatus } = useUpdateServiceChargeStatus();

   console.log('stat', pay_status, 'staffId', staffId)
   // Derive resident status defensively: certificate flow (nat_col === 'Certificate') with null voter_id should be resident (paid)
   const effectiveIsResident = Boolean(is_resident || (nat_col === 'Certificate' && voter_id === null));
   console.log('DEBUG voter_id value:', voter_id, 'type:', typeof voter_id, 'is_resident (prop):', is_resident, 'effectiveIsResident:', effectiveIsResident)
   const isFree = Boolean(effectiveIsResident && voter_id !== null && voter_id !== undefined);
    const ReceiptSchema = useMemo(() => {
        return createReceiptSchema(discountedAmount || rate);
    }, [discountedAmount, rate]);


    const form = useForm<z.infer<typeof ReceiptSchema>>({
        resolver: zodResolver(ReceiptSchema),
        defaultValues: {
            inv_serial_num: effectiveIsResident ? "N/A" : "", 
            inv_amount: effectiveIsResident ? (isFree ? "0" : (rate || "0")) : "",
            inv_nat_of_collection: nat_col,
            id: id.toString(), 
            cr_id: effectiveIsResident ? id.toString() : undefined,
            nrc_id: !effectiveIsResident ? id.toString() : undefined,
        }
    });

    const onSubmit = async () => {
        
        try {
            console.log('[Receipt onSubmit] context:', { id, is_resident, effectiveIsResident, voter_id, isFree, nat_col, staffId, purpose, rate });
            
            if (nat_col === 'Service Charge'){
                // Check if payment request already exists
                if (spay_id) {
                    console.log('[Receipt onSubmit] Payment request already exists with spay_id:', spay_id);
                    // Just update the existing payment request status to Paid
                    console.log('[Receipt onSubmit] updating service charge status to Paid');
                    await updateServiceChargeStatus({ 
                        sr_id: id, 
                        data: { 
                            status: "Paid" 
                        } 
                    });
                } else {
                    // Create new payment request only if it doesn't exist
                    const prId = scRate?.pr_id;
                    const amount = scRate?.pr_rate != null ? Number(scRate.pr_rate) : undefined;
                    if (prId == null){
                        console.warn('[Receipt onSubmit] Service Charge rate not found; skipping payment request creation');
                    } else {
                        console.log('[Receipt onSubmit] creating ServiceChargePaymentRequest with', { sr_id: id, pr_id: prId, spay_amount: amount });
                        await createScPayReq({ sr_id: id.toString(), pr_id: prId, spay_amount: amount });
                        // Auto-mark summon as Accepted
                        await acceptSummon(id.toString());
                        
                        // Update status to "Paid" - backend will generate sr_code automatically
                        console.log('[Receipt onSubmit] updating service charge status to Paid');
                        await updateServiceChargeStatus({ 
                            sr_id: id, 
                            data: { 
                                status: "Paid" 
                            } 
                        });
                    }
                }
            } else {
                // Certificate flow
                if (effectiveIsResident){
                    console.log('[Receipt onSubmit] calling acceptReq (resident) with cr_id:', id);
                    await acceptReq(id)
                } else {
                    // For non-resident requests, use the acceptNonResReq mutation
                    console.log('[Receipt onSubmit] calling acceptNonResReq (non-resident) with nrc_id:', id, 'discountReason:', discountReason);
                    await acceptNonResReq({nrc_id: id, discountReason: discountReason})
                }
            }
            // Create invoice after status update
            const values = form.getValues();
            const payload: any = {
                inv_date: new Date().toISOString(),
                inv_amount: parseFloat(values.inv_amount || (discountedAmount || rate || '0')),
                inv_nat_of_collection: values.inv_nat_of_collection,
                inv_serial_num: values.inv_serial_num || 'N/A',
            };
            
            // Add the appropriate ID field based on the type
            if (nat_col === 'Service Charge') {
                if (!spay_id) {
                    console.warn('[Receipt onSubmit] Cannot create invoice for service charge without spay_id');
                    return;
                }
                payload.spay_id = spay_id;
                console.log('[Receipt onSubmit] Added spay_id to payload:', spay_id);
            } else if (effectiveIsResident) {
                payload.cr_id = id.toString();
            } else {
                payload.nrc_id = Number(id);
            }
            
            // Clean up undefined/empty values
            Object.keys(payload).forEach((k) => (payload[k] === undefined || payload[k] === '') && delete payload[k]);
            console.log('[Receipt onSubmit] Final payload before sending:', payload);
            console.log('[Receipt onSubmit] spay_id value:', spay_id, 'type:', typeof spay_id);
            await receipt(payload as any);

            console.log('Receipt mutation called successfully');
            
            // Call onSuccess callback to refresh data
            onSuccess();
        } catch (error) {
            console.error('Error in onSubmit:', error);
        }
    };

  

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
                        <p className="text-base text-gray-900 font-medium mt-1">{nat_col === 'Service Charge' ? 'Summon' : nat_col}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Purpose</label>
                        <p className="text-base text-gray-900 font-medium mt-1">{purpose}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Payment Status</label>
                        <p className="text-base text-green-600 font-semibold mt-1">{isFree ? 'Free (Registered Voter)' : pay_status}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Amount</label>
                        <p className="text-base text-primary font-semibold mt-1">{`₱${isFree ? '0' : rate}`}</p>
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
                    
                    {/* Discount Button (hidden for free/voter requests) */}
                    {!isFree && !isAlreadyPaid && (
                        <Button 
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => {
                                onSuccess(); // Hide the create receipt form
                            }}
                        >
                            Apply Discount
                        </Button>
                    )}
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
                    {isPending || isAcceptPending || isAcceptNonResPending ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Processing...</span>
                        </div>
                    ) : isAlreadyPaid ? (
                        "Cannot Proceed"
                    ) : is_resident ? (
                        "Accept"
                    ) : (
                        "Create Receipt"
                    )}
                </Button>
                </div>
            </form>
            </Form>

        </>
    )
}

export default ReceiptForm;



