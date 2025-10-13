import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import PermitClearanceFormSchema from "@/form-schema/permitClearance-schema";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { createPermitClearance } from "@/pages/record/treasurer/treasurer-clearance-requests/restful-api/permitClearancePostAPI";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ComboboxInput } from "../../../../components/ui/form/form-combo-box-search";
import { useGetBusinesses, useGetPermitPurposes } from "@/pages/record/treasurer/treasurer-clearance-requests/queries/permitClearanceFetchQueries";
import { useGetResidents } from "@/pages/record/treasurer/treasurer-clearance-requests/queries/CertClearanceFetchQueries";
import { useGetAnnualGrossSalesActive, type AnnualGrossSales } from "../Rates/queries/RatesFetchQueries";

interface PermitClearanceFormProps {
    onSuccess?: () => void;
}

function PermitClearanceForm({ onSuccess }: PermitClearanceFormProps) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    const staffId = user?.staff?.staff_id as string | undefined;
    
    
    
    const { data: businesses = [], isLoading: businessLoading } = useGetBusinesses();
    const { data: permitPurposes = [], isLoading: purposesLoading } = useGetPermitPurposes();
    const { data: residents = [], isLoading: residentLoading} = useGetResidents();
    const { data: grossSales = { results: [], count: 0 }, isLoading: _grossSalesLoading } = useGetAnnualGrossSalesActive();
    

    
    const form = useForm<z.infer<typeof PermitClearanceFormSchema>>({
        resolver: zodResolver(PermitClearanceFormSchema),
        defaultValues: {
            serialNo: "",
            businessName: "", 
            requestor: "",
            address: "",
            grossSales: "",
            purposes: "", 
            rp_id: "",
        },
    })

    
    const getBusinessById = (businessId: string) => {
        return businesses.find((business: any) => business.bus_id === businessId);
    }

    // Function to get business address when business is selected
    const getBusinessAddress = (businessId: string) => {
        const selectedBusiness = getBusinessById(businessId);
        return selectedBusiness?.bus_location || selectedBusiness?.address || '';
    }

    // Function to get business display name
    const getBusinessDisplayName = (businessId: string) => {
        const selectedBusiness = getBusinessById(businessId);
        return selectedBusiness?.bus_name || '';
    }

    // Function to get matching annual gross sales rate based on business ID
    const getMatchingGrossSalesRate = (businessId: string) => {
        const selectedBusiness = getBusinessById(businessId);
        
        if (!selectedBusiness || !selectedBusiness.bus_gross_sales) {
            return null;
        }
        
        const businessGrossSales = Number(selectedBusiness.bus_gross_sales);
        
        // Filter only active (non-archived) rates
        const activeRates = grossSales?.results?.filter((rate: AnnualGrossSales) => !rate.ags_is_archive) || [];
        
        // Find exact matching annual gross sales range
        const matchingRate = activeRates.find((rate: AnnualGrossSales) => 
            businessGrossSales >= Number(rate.ags_minimum) && 
            businessGrossSales <= Number(rate.ags_maximum)
        );
        
        if (matchingRate) {
            return {
                id: matchingRate.ags_id.toString(),
                name: `₱${Number(matchingRate.ags_minimum).toLocaleString()} - ₱${Number(matchingRate.ags_maximum).toLocaleString()}`,
                rate: matchingRate.ags_rate
            };
        }
        
        const sortedRates = [...activeRates].sort((a, b) => Number(a.ags_minimum) - Number(b.ags_minimum));
        
        for (const rate of sortedRates) {
            const min = Number(rate.ags_minimum);
            const max = Number(rate.ags_maximum);
            
            if (businessGrossSales < min && Math.abs(businessGrossSales - min) <= 1) {
                return {
                    id: rate.ags_id.toString(),
                    name: `₱${min.toLocaleString()} - ₱${max.toLocaleString()} (Closest Range)`,
                    rate: rate.ags_rate
                };
            }
        }
        
        // If business exceeds highest range, use highest available
        const highestRate = activeRates.reduce((highest, current) => 
            Number(current.ags_maximum) > Number(highest.ags_maximum) ? current : highest
        , activeRates[0]);
        
        if (highestRate && businessGrossSales > Number(highestRate.ags_maximum)) {
            return {
                id: highestRate.ags_id.toString(),
                name: `₱${Number(highestRate.ags_minimum).toLocaleString()} - ₱${Number(highestRate.ags_maximum).toLocaleString()}`,
                rate: highestRate.ags_rate
            };
        }
        
        return null;
    }

    const onSubmit = async (values: z.infer<typeof PermitClearanceFormSchema>) => {
        try {
            setIsSubmitting(true);
            
            if (!staffId) {
                showErrorToast("Missing staff ID. Please re-login and try again.");
                return;
            }

            const payload = {
                ...values
            };
            
            await createPermitClearance(payload, staffId);
            
            showSuccessToast("Permit clearance created successfully!");
            
            form.reset();
            await queryClient.invalidateQueries({ queryKey: ["permitClearances"] });
            
            if (onSuccess) {
                onSuccess();
            }
            
        } catch (error) {
            console.error('Error creating permit clearance:', error);
            showErrorToast("Failed to create permit clearance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return(
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col max-w-3xl mx-auto gap-7">
                    <FormField
                        control={form.control}
                        name="serialNo"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Serial No. </FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" placeholder="e.g.(123456)" className="w-full"></Input>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}>
                    </FormField>

                    <FormField
                        control={form.control}
                        name="businessName"
                        render={({field}) =>(
                            <FormItem>
                                <FormLabel>Business Name</FormLabel>
                                <FormControl>
                                    <ComboboxInput
                                        value={getBusinessDisplayName(field.value) || field.value}
                                        options={businesses}
                                        isLoading={businessLoading}
                                        label=""
                                        placeholder="Search business"
                                        emptyText="No businesses found"
                                        onSelect={(_value: string, selectedOption: any) => {
                                            const businessId = selectedOption?.bus_id || '';
                                            
                                            // Store the business ID in the field (not the display name)
                                            field.onChange(businessId);
                                            
                                            const selectedBusiness = getBusinessById(businessId);
                                            
                                            if (selectedBusiness) {
                                                const address = selectedBusiness.bus_location || selectedBusiness.address || '';
                                                form.setValue("address", address);
                                                
                                                // Fetch business owner using br_id or rp_id
                                                const fetchBusinessOwner = async () => {
                                                    try {
                                                        let ownerInfo = null;
                                                        let ownerRpId = null;
                                                        
                                                        // First, try to get owner from the business data directly
                                                        if (selectedBusiness.requestor) {
                                                            ownerInfo = selectedBusiness.requestor;
                                                            
                                                            // If we have rp_id, use it directly
                                                            if (selectedBusiness.rp_id) {
                                                                ownerRpId = selectedBusiness.rp_id;
                                                            }
                                                        }
                                                        // If no direct requestor info, try to find in residents list
                                                        else if (selectedBusiness.rp_id || selectedBusiness.rp) {
                                                            const residentId = selectedBusiness.rp_id || selectedBusiness.rp;
                                                            
                                                            // Find the resident in the residents list
                                                            const owner = residents.find((resident: any) => 
                                                                resident.rp_id === residentId
                                                            );
                                                            
                                                            if (owner) {
                                                                ownerInfo = owner.full_name;
                                                                ownerRpId = owner.rp_id;
                                                            }
                                                        }
                                                        // Try br_id as fallback
                                                        else if (selectedBusiness.br_id) {
                                                            // Find the resident in the residents list using br_id
                                                            const owner = residents.find((resident: any) => 
                                                                resident.rp_id === selectedBusiness.br_id
                                                            );
                                                            if (owner) {
                                                                ownerInfo = owner.full_name;
                                                                ownerRpId = owner.rp_id;
                                                            }
                                                        }
                                                        
                                                        // Set the requestor field and rp_id
                                                        if (ownerInfo) {
                                                            form.setValue("requestor", ownerInfo);
                                                            if (ownerRpId) {
                                                                form.setValue('rp_id', ownerRpId);
                                                            }
                                                        } else {
                                                            // Clear the fields and let user manually select
                                                            form.setValue("requestor", "");
                                                            form.setValue('rp_id', "");
                                                        }
                                                    } catch (error) {
                                                        console.error("Error fetching business owner:", error);
                                                        form.setValue("requestor", "");
                                                        form.setValue('rp_id', "");
                                                    }
                                                };
                                                
                                                fetchBusinessOwner();

                                                // Auto-match gross sales rate using business ID
                                                const matchingRate = getMatchingGrossSalesRate(businessId);
                                                if (matchingRate) {
                                                    form.setValue("grossSales", matchingRate.id.toString());
                                                }
                                            }
                                        }}
                                        onCustomInput={(value: string) => {
                                            // For custom input, we'll store the display value
                                            field.onChange(value);
                                        }}
                                        displayKey="bus_name"
                                        valueKey="bus_id"
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}>
                    </FormField>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                        <FormField
                            control={form.control}
                            name="grossSales"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Annual Gross Sales</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            value={getMatchingGrossSalesRate(form.watch("businessName"))?.name || ''}
                                            placeholder="Select a business to auto-fill the rate" 
                                            className="w-full bg-gray-50" 
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="grossSales"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount to be Paid</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            value={getMatchingGrossSalesRate(form.watch("businessName"))?.rate ? 
                                                `₱${Number(getMatchingGrossSalesRate(form.watch("businessName"))?.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                                                ''
                                            }
                                            placeholder="Select a business to auto-fill the rate" 
                                            className="w-full bg-gray-50" 
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Requestor field - full width */}
                    <FormField
                        control={form.control}
                        name="requestor"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Requestor:</FormLabel>
                                <FormControl>
                                  
                                    <ComboboxInput
                                         value={field.value}
                                         options={residents}
                                         isLoading={residentLoading}
                                         label=""
                                         placeholder={form.watch("businessName") ? 
                                             "No owner found for this business - please select manually" : 
                                             "Search resident by name"
                                         }
                                         emptyText="No residents found"
                                         onSelect={(value: string, item: any) => {
                                             field.onChange(value);
                                             form.setValue('rp_id', item?.rp_id || '');
                                         }}
                                         onCustomInput={(value: string) => {
                                             field.onChange(value);
                                             form.setValue('rp_id', '');
                                         }}
                                         displayKey="full_name"
                                         valueKey="full_name"
                                         additionalDataKey="rp_id" 
                                     />
                                
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Display business address automatically */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Business Address</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        value={getBusinessAddress(form.watch("businessName")) || field.value}
                                        placeholder="Selecting a business will auto-fill the address." 
                                        className="w-full bg-gray-50" 
                                        readOnly
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="relative mb-8">       
                        <FormField
                             control={form.control}
                             name="purposes"
                             render={({ field }) => {
                                 // Find the selected purpose to get its name for display
                                 const selectedPurpose = permitPurposes.find((purpose: any) => 
                                     purpose.pr_id?.toString() === field.value?.toString()
                                 );
                                 const displayValue = selectedPurpose?.pr_purpose || '';
                                 
                                 return (
                                     <FormItem>
                                         <FormLabel>Select purpose(s):</FormLabel>
                                         <FormControl>
                                             <div className="[&_[data-radix-popper-content-wrapper]]:!w-[400px] [&_[data-radix-popper-content-wrapper]_div]:!w-full [&_[data-radix-popper-content-wrapper]]:!z-[9999] [&_[data-radix-popper-content-wrapper]]:!top-full [&_[data-radix-popper-content-wrapper]]:!bottom-auto [&_[data-radix-popper-content-wrapper]]:!transform-none [&_[data-radix-popper-content-wrapper]]:!position-absolute [&_[data-radix-popper-content-wrapper]]:!left-0 [&_[data-radix-popper-content-wrapper]]:!right-0">
                                                <ComboboxInput
                                                     value={displayValue}
                                                     options={permitPurposes
                                                         .filter((purpose: any) => purpose.pr_category === 'Business Permit' || purpose.pr_category === 'Barangay Permit')
                                                         .map((purpose: any) => ({
                                                             id: purpose.pr_id,
                                                             name: purpose.pr_purpose
                                                         }))}
                                                     isLoading={purposesLoading}
                                                     label=""
                                                     placeholder="Select purpose..."
                                                     emptyText="No purposes found"
                                                     onSelect={(value: string, selectedOption: any) => {
                                                         const purposeId = selectedOption?.id || selectedOption?.pr_id || '';
                                                         field.onChange(purposeId.toString());
                                                     }}
                                                     onCustomInput={(value: string) => {
                                                         // For custom input, store the display value
                                                         field.onChange(value);
                                                     }}
                                                     displayKey="name"
                                                     valueKey="id"
                                                 />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="mt-2" />
                                    </FormItem>
                                 );
                             }}
                        />
                     </div>

                    <div className="flex justify-end">
                        <Button disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Proceed"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default PermitClearanceForm