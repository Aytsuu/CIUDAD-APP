import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddReceipt } from "@/pages/record/treasurer/Receipts/queries/receipts-insertQueries";
import ReceiptSchema from "@/form-schema/receipt-schema";
import { useAuth } from "@/context/AuthContext";


type CertificateRequest = {
    cr_id?: string;
    bpr_id?: string; // Add bpr_id for permit clearances
    req_type: string;
    req_purpose: string;
    resident_details: {
        per_fname: string;
        per_lname: string;
    };
    req_payment_status: string;
    pr_id?: number; // Purpose and Rate ID
    business_name?: string; // Business name for permit clearances
    req_amount?: number; // Add req_amount field for business clearance
    // req_sales_proof field removed
};


type PurposeAndRate = {
    pr_id: number;
    pr_purpose: string;
    pr_rate: number;
    pr_category: string;
    pr_date: string;
    pr_is_archive: boolean;
};


interface ReceiptFormProps {    
    certificateRequest: CertificateRequest;
    onSuccess: () => void;
    onCancel?: () => void;
}




function ReceiptForm({ certificateRequest, onSuccess }: ReceiptFormProps){

    const { mutate: receipt, isPending} = useAddReceipt(onSuccess)
    const { user } = useAuth();
    const staffId = user?.staff?.staff_id as string | undefined;

    const { data: purposeAndRates = [] } = useQuery<PurposeAndRate[]>({
        queryKey: ["purpose-and-rates"],
        queryFn: async () => {
            const response = await api.get('treasurer/purpose-and-rate/');
            return response.data;
        },
    });

    // Get purpose and rate details for the certificate request
    const selectedPurposeRate = certificateRequest?.pr_id ? 
        purposeAndRates.find(rate => rate.pr_id === certificateRequest.pr_id) : 
        purposeAndRates.find(rate => 
            rate.pr_purpose.toLowerCase() === certificateRequest.req_purpose.toLowerCase()
        ) || 
        purposeAndRates.find(rate => 
            rate.pr_category.toLowerCase() === 'permit clearance' &&
            rate.pr_purpose.toLowerCase().includes(certificateRequest.req_purpose.toLowerCase())
        );

    const form = useForm<z.infer<typeof ReceiptSchema>>({
        resolver: zodResolver(ReceiptSchema),
        defaultValues: {
            inv_serial_num: "", 
            inv_amount: certificateRequest.req_amount && certificateRequest.req_amount > 0 ? certificateRequest.req_amount.toString() : "0.00",
            inv_nat_of_collection: "Permit Clearance", 
        }
    });

    
    useEffect(() => {
        if (certificateRequest.req_amount && certificateRequest.req_amount > 0) {
            form.setValue('inv_amount', certificateRequest.req_amount.toString());
        }
    }, [certificateRequest.req_amount, form]);

    const onSubmit = (values: z.infer<typeof ReceiptSchema>) => {
        if (!staffId) {
            return;
        }
        
        // Add additional fields needed for business clearance
        const receiptData = {
            ...values,
            inv_nat_of_collection: "Permit Clearance", // Ensure this is set correctly
            bpr_id: certificateRequest.bpr_id || certificateRequest.cr_id, // Use bpr_id if available, otherwise cr_id
            nrc_id: null, // Set to null for business clearance
            staff_id: staffId,
        };
        
        receipt(receiptData);
    };

    // Check if request is already paid
    const isAlreadyPaid = certificateRequest.req_payment_status === "Paid";
    
    // Check if request is incomplete (no business linked or no amount)
    const isIncomplete = !certificateRequest.req_amount || certificateRequest.req_amount <= 0;

    return(
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

                    {/* Warning message if request is incomplete */}
                    {isIncomplete && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-red-800">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <p className="font-medium">This permit clearance request is incomplete. No business is linked and no amount is calculated. Please complete the request first before creating a receipt.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Display certificate details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Certificate Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Business Name</label>
                                    <p className="text-base text-gray-900 font-medium mt-1">
                                        {certificateRequest.business_name && 
                                         certificateRequest.business_name !== "N/A" && 
                                         certificateRequest.business_name !== "Unknown Business" &&
                                         certificateRequest.business_name !== "No Business Linked"
                                            ? certificateRequest.business_name 
                                            : "No Business Linked - Please link a business first"
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Purpose</label>
                                    <p className="text-base text-gray-900 font-medium mt-1">
                                        {selectedPurposeRate ? selectedPurposeRate.pr_purpose : certificateRequest.req_purpose || 'General'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                                    <p className="text-base text-green-600 font-semibold mt-1">{certificateRequest.req_payment_status}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Amount</label>
                                    <p className="text-base text-blue-600 font-semibold mt-1">
                                        {certificateRequest.req_amount && certificateRequest.req_amount > 0 
                                            ? `₱${certificateRequest.req_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                            : "No amount calculated - Business not linked or purpose not selected"
                                        }
                                    </p>
                                </div>
                                
                            </div>
                        </CardContent>
                    </Card>    

                    <FormField
                        control={form.control}
                        name="inv_serial_num"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Serial No. <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="text"
                                        placeholder="Enter receipt serial number" 
                                        onChange={(e) => field.onChange(e.target.value)}
                                        className="font-mono"
                                        disabled={isAlreadyPaid || isIncomplete}
                                        readOnly={isAlreadyPaid || isIncomplete}
                                        style={isAlreadyPaid || isIncomplete ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
                                    />
                                </FormControl>
                             
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Hidden field for inv_nat_of_collection */}
                    <FormField
                        control={form.control}
                        name="inv_nat_of_collection"
                        render={({field})=>(
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="hidden"
                                        value="Permit Clearance"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                     <FormField
                        control={form.control}
                        name="inv_amount"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Amount Paid (₱)</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="number" 
                                        step="0.01" 
                                        
                                        placeholder="Enter amount" 
                                        className="w-full"
                                        disabled={isAlreadyPaid || isIncomplete}
                                        onChange={(e) => {
                                            const amountPaid = parseFloat(e.target.value);
                                            field.onChange(amountPaid);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                {/* Display amount details (only when paid >= rate) */}
                     {certificateRequest.req_amount && Number(form.watch("inv_amount")) >= certificateRequest.req_amount && (
                         <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                             <div className="flex justify-between text-sm border-t pt-2">
                                 <span className="font-semibold">Change:</span>
                                 <span className={`font-semibold ${(Number(form.watch("inv_amount")) || 0) - certificateRequest.req_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                     ₱{((Number(form.watch("inv_amount")) || 0) - certificateRequest.req_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </span>
                             </div>
                         </div>
                     )}

                    

                    <div className="flex justify-end gap-3 mt-6">
        
                                                 <Button 
                             type="submit" 
                             disabled={isPending || isAlreadyPaid || isIncomplete}
                             className={isAlreadyPaid || isIncomplete ? "opacity-50 cursor-not-allowed" : ""}
                         >
                             {isPending ? "Creating..." : isAlreadyPaid ? "Cannot Create Receipt" : isIncomplete ? "Request Incomplete" : "Create Receipt"}
                         </Button>
                    </div>
                </form>
            </Form>
    )
}

export default ReceiptForm;