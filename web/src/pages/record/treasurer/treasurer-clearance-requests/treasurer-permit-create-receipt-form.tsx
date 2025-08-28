import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card";
import { useAddReceipt } from "@/pages/record/treasurer/Receipts/queries/receipts-insertQueries";
import ReceiptSchema from "@/form-schema/receipt-schema";



type CertificateRequest = {
    cr_id: string;
    req_type: string;
    req_purpose: string;
    resident_details: {
        per_fname: string;
        per_lname: string;
    };
    req_payment_status: string;
    pr_id?: number; // Purpose and Rate ID
    business_name?: string; // Business name for permit clearances
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


function capitalizeFirst(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


function ReceiptForm({ certificateRequest, onSuccess }: ReceiptFormProps){

    const { mutate: receipt, isPending} = useAddReceipt(onSuccess)

   
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

    // Debug logging
    console.log('Certificate Request Purpose:', certificateRequest.req_purpose);
    console.log('Available Purpose and Rates:', purposeAndRates);
    console.log('Selected Purpose Rate:', selectedPurposeRate);

    const form = useForm<z.infer<typeof ReceiptSchema>>({
        resolver: zodResolver(ReceiptSchema),
        defaultValues: {
            inv_serial_num: "", // Generate a unique default serial number
            inv_amount: selectedPurposeRate ? parseFloat(selectedPurposeRate.pr_rate.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00",
            inv_nat_of_collection: capitalizeFirst(certificateRequest.req_type || ""),
            nrc_id: certificateRequest.cr_id,
        }
    });

    
    useEffect(() => {
        if (selectedPurposeRate) {
            form.setValue('inv_amount', parseFloat(selectedPurposeRate.pr_rate.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
    }, [selectedPurposeRate, form]);

    const onSubmit = (values: z.infer<typeof ReceiptSchema>) => {
        console.log('receipt:', values)
        receipt(values)
    };

    // Check if request is already paid
    const isAlreadyPaid = certificateRequest.req_payment_status === "Paid";

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
                                        {certificateRequest.business_name || `${certificateRequest.resident_details.per_fname} ${certificateRequest.resident_details.per_lname}`}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Request Type</label>
                                    <p className="text-base text-gray-900 font-medium mt-1">
                                        {capitalizeFirst(certificateRequest.req_type)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Purpose</label>
                                    <p className="text-base text-gray-900 font-medium mt-1">{certificateRequest.req_purpose || 'General'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                                    <p className="text-base text-green-600 font-semibold mt-1">{certificateRequest.req_payment_status}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Amount</label>
                                    <p className="text-base text-blue-600 font-semibold mt-1">
                                        {selectedPurposeRate ? `₱${parseFloat(selectedPurposeRate.pr_rate.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₱0.00"}
                                    </p>
                                </div>
                                
                            </div>
                        </CardContent>
                    </Card>

                    {/* Display purpose and rate details */}
                    {/* {selectedPurposeRate && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Rate Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Purpose</label>
                                        <p className="text-sm text-gray-900">{selectedPurposeRate.pr_purpose}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Category</label>
                                        <p className="text-sm text-gray-900">{selectedPurposeRate.pr_category}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Rate</label>
                                        <p className="text-lg font-bold text-green-600">₱{parseFloat(selectedPurposeRate.pr_rate.toString()).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Date Set</label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedPurposeRate.pr_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )} */}

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
                     {selectedPurposeRate && Number(form.watch("inv_amount")) >= parseFloat(selectedPurposeRate.pr_rate.toString()) && (
                         <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                             <div className="flex justify-between text-sm border-t pt-2">
                                 <span className="font-semibold">Change:</span>
                                 <span className={`font-semibold ${(Number(form.watch("inv_amount")) || 0) - parseFloat(selectedPurposeRate.pr_rate.toString()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                     ₱{((Number(form.watch("inv_amount")) || 0) - parseFloat(selectedPurposeRate.pr_rate.toString())).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </span>
                             </div>
                         </div>
                     )}

                    

                    <div className="flex justify-end gap-3 mt-6">
                        {/* <Button 
                            type="button" 
                            variant="outline"
                            onClick={onCancel || (() => navigate(-1))}
                        >
                            Cancel
                        </Button> */}
                                                 <Button 
                             type="submit" 
                             disabled={isPending || isAlreadyPaid}
                             className={isAlreadyPaid ? "opacity-50 cursor-not-allowed" : ""}
                         >
                             {isPending ? "Creating..." : isAlreadyPaid ? "Cannot Create Receipt" : "Create Receipt"}
                         </Button>
                    </div>
                </form>
            </Form>
    )
}

export default ReceiptForm;