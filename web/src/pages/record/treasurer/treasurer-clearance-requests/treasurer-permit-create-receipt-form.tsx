import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddReceipt } from "@/pages/record/treasurer/Receipts/queries/receipts-insertQueries";
import ReceiptSchema from "@/form-schema/receipt-schema";
import { useAuth } from "@/context/AuthContext";

type AnnualGrossSales = {
    ags_id: number;
    ags_minimum: string;
    ags_maximum: string;
    ags_rate: string;
    ags_date: string;
    ags_is_archive: boolean;
    staff_id: string;
};

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
    ags_id?: number; // Annual Gross Sales ID for business clearance
    business_name?: string; // Business name for permit clearances
    req_amount?: number; // Add req_amount field for business clearance
    gross_sales_amount?: number; // The actual gross sales value entered
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

    // Fetch annual gross sales for business clearance (only active rates)
    // Use same query key and params as permitClearance-form for cache consistency
    const { data: annualGrossSalesResponse } = useQuery<any>({
        queryKey: ["grossSalesActive", 1, 1000, ''],
        queryFn: async () => {
            const response = await api.get('treasurer/annual-gross-sales-active/', {
                params: {
                    page: 1,
                    page_size: 1000,
                    search: ''
                }
            });
            return response.data;
        },
        // Fetch if ags_id exists OR gross_sales_amount exists (business clearance)
        enabled: !!certificateRequest.ags_id || !!certificateRequest.gross_sales_amount,
    });

    // Extract annual gross sales array from response
    const annualGrossSales: AnnualGrossSales[] = useMemo(() => {
        if (Array.isArray(annualGrossSalesResponse)) {
            return annualGrossSalesResponse;
        }
        return annualGrossSalesResponse?.results || [];
    }, [annualGrossSalesResponse]);

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

    // Get matching gross sales rate for business clearance
    const matchingGrossSalesRate = useMemo(() => {
        if (annualGrossSales.length === 0) return null;
        
        // Filter active rates and sort by minimum value
        const activeRates = annualGrossSales
            .filter((ags) => !ags.ags_is_archive)
            .sort((a, b) => parseFloat(a.ags_minimum) - parseFloat(b.ags_minimum));
        
        if (activeRates.length === 0) return null;
        
        // First try to match by ags_id if available
        if (certificateRequest?.ags_id) {
            const matchById = activeRates.find(
                (ags) => ags.ags_id === certificateRequest.ags_id
            );
            if (matchById) return matchById;
        }
        
        // If no ags_id match but has gross_sales_amount, find the range that contains it
        if (certificateRequest?.gross_sales_amount && certificateRequest.gross_sales_amount > 0) {
            const grossSalesValue = certificateRequest.gross_sales_amount;
            
            // Find exact match within a range
            const matchByRange = activeRates.find(
                (ags) => grossSalesValue >= parseFloat(ags.ags_minimum) && 
                         grossSalesValue <= parseFloat(ags.ags_maximum)
            );
            if (matchByRange) return matchByRange;
            
            // If below lowest range, use lowest
            if (grossSalesValue < parseFloat(activeRates[0].ags_minimum)) {
                return activeRates[0];
            }
            
            // If above highest range, use highest
            const highestRate = activeRates[activeRates.length - 1];
            if (grossSalesValue > parseFloat(highestRate.ags_maximum)) {
                return highestRate;
            }
        }
        
        return null;
    }, [certificateRequest?.ags_id, certificateRequest?.gross_sales_amount, annualGrossSales]);

    // Determine if this is a business clearance (uses gross sales rate) or permit (uses pr_rate)
    const isBusinessClearance = !!certificateRequest?.ags_id || !!certificateRequest?.gross_sales_amount;

    // Calculate the correct amount based on type
    const calculatedAmount = useMemo(() => {
        // If ags_id exists, it's a business clearance - use ags_rate
        if (isBusinessClearance && matchingGrossSalesRate) {
            return parseFloat(matchingGrossSalesRate.ags_rate);
        }
        // If no ags_id but has pr_id and selectedPurposeRate, it's a permit - use pr_rate
        else if (selectedPurposeRate && !isBusinessClearance) {
            return selectedPurposeRate.pr_rate;
        }
        // Fallback to req_amount from the request
        return certificateRequest.req_amount || 0;
    }, [isBusinessClearance, matchingGrossSalesRate, selectedPurposeRate, certificateRequest.req_amount]);

    const form = useForm<z.infer<typeof ReceiptSchema>>({
        resolver: zodResolver(ReceiptSchema),
        defaultValues: {
            inv_serial_num: "", 
            inv_amount: "0.00",
            inv_nat_of_collection: "Permit Clearance", 
        }
    });

    // Update form amount when calculated amount changes
    useEffect(() => {
        if (calculatedAmount && calculatedAmount > 0) {
            form.setValue('inv_amount', calculatedAmount.toString());
        } else if (certificateRequest.req_amount && certificateRequest.req_amount > 0) {
            form.setValue('inv_amount', certificateRequest.req_amount.toString());
        }
    }, [calculatedAmount, certificateRequest.req_amount, form]);

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
    
    // Check if request is incomplete (no amount calculated)
    const isIncomplete = calculatedAmount <= 0 && (!certificateRequest.req_amount || certificateRequest.req_amount <= 0);

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
                                    <p className={`text-base font-semibold mt-1 ${
                                        certificateRequest.req_payment_status === "Paid" ? "text-green-600" : "text-yellow-600"
                                    }`}>
                                        {certificateRequest.req_payment_status}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Amount to Pay</label>
                                    <p className="text-base text-blue-600 font-semibold mt-1">
                                        {calculatedAmount > 0 
                                            ? `₱${calculatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                            : certificateRequest.req_amount && certificateRequest.req_amount > 0 
                                                ? `₱${certificateRequest.req_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                                : "No amount calculated"
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
                     {(() => {
                         const amountToPay = calculatedAmount > 0 ? calculatedAmount : (certificateRequest.req_amount || 0);
                         const amountPaid = Number(form.watch("inv_amount")) || 0;
                         
                         if (amountToPay > 0 && amountPaid >= amountToPay) {
                             return (
                                 <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                                     <div className="flex justify-between text-sm border-t pt-2">
                                         <span className="font-semibold">Change:</span>
                                         <span className={`font-semibold ${amountPaid - amountToPay >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                             ₱{(amountPaid - amountToPay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                         </span>
                                     </div>
                                 </div>
                             );
                         }
                         return null;
                     })()}

                    

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