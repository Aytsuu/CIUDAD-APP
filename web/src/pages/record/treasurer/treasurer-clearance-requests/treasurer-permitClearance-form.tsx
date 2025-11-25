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
            businessName: "", 
            requestor: "",
            address: "",
            grossSales: "",
            purposes: "", 
            rp_id: "",
            manualGrossSales: "",
        },
    })

    // Check if selected purpose is Business Clearance (Barangay Clearance category)
    const isBusinessClearance = () => {
        const selectedPurposeId = form.watch("purposes");
        if (!selectedPurposeId) return false;
        
        const selectedPurpose = permitPurposes.find((purpose: any) => 
            purpose.pr_id?.toString() === selectedPurposeId.toString()
        );
        
        if (!selectedPurpose) return false;
        
        // Only return true for "Barangay Clearance" category (requires gross sales)
        return selectedPurpose.pr_category === 'Barangay Clearance';
    }

    // Check if selected purpose is Barangay Permit (uses pr_rate directly)
    const isBarangayPermit = () => {
        const selectedPurposeId = form.watch("purposes");
        if (!selectedPurposeId) return false;
        
        const selectedPurpose = permitPurposes.find((purpose: any) => 
            purpose.pr_id?.toString() === selectedPurposeId.toString()
        );
        
        if (!selectedPurpose) return false;
        
        return selectedPurpose.pr_category === 'Barangay Permit';
    }

    // Get the pr_rate from selected purpose (for Barangay Permit)
    const getSelectedPurposeRate = () => {
        const selectedPurposeId = form.watch("purposes");
        if (!selectedPurposeId) return null;
        
        const selectedPurpose = permitPurposes.find((purpose: any) => 
            purpose.pr_id?.toString() === selectedPurposeId.toString()
        );
        
        return selectedPurpose?.pr_rate || null;
    }

    // Helper function to find matching gross sales rate from manual input
    const findMatchingGrossSalesRateFromInput = (inputValue: string) => {
        const numericValue = parseFloat(inputValue);
        if (isNaN(numericValue)) return null;
        
        const activeRates = grossSales?.results?.filter((rate: AnnualGrossSales) => !rate.ags_is_archive) || [];
        
        if (activeRates.length === 0) return null;
        
        // Find exact match within a range
        const exactMatch = activeRates.find((rate: AnnualGrossSales) => 
            numericValue >= Number(rate.ags_minimum) && 
            numericValue <= Number(rate.ags_maximum)
        );
        
        if (exactMatch) {
            return {
                id: exactMatch.ags_id.toString(),
                name: `₱${Number(exactMatch.ags_minimum).toLocaleString()} - ₱${Number(exactMatch.ags_maximum).toLocaleString()}`,
                rate: exactMatch.ags_rate
            };
        }
        
        // Find closest range
        let closestRange: AnnualGrossSales | null = null;
        let minDistance = Infinity;
        
        for (const rate of activeRates) {
            const rangeMin = Number(rate.ags_minimum);
            const rangeMax = Number(rate.ags_maximum);
            const rangeMid = (rangeMin + rangeMax) / 2;
            const distance = Math.abs(numericValue - rangeMid);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestRange = rate;
            }
        }
        
        if (closestRange) {
            return {
                id: closestRange.ags_id.toString(),
                name: `₱${Number(closestRange.ags_minimum).toLocaleString()} - ₱${Number(closestRange.ags_maximum).toLocaleString()}`,
                rate: closestRange.ags_rate
            };
        }
        
        // If exceeds highest range, use highest available
        if (activeRates.length > 0) {
            const highestRate = activeRates.reduce((highest: AnnualGrossSales, current: AnnualGrossSales) => 
                Number(current.ags_maximum) > Number(highest.ags_maximum) ? current : highest
            , activeRates[0]);
            
            if (highestRate && numericValue > Number(highestRate.ags_maximum)) {
                return {
                    id: highestRate.ags_id.toString(),
                    name: `₱${Number(highestRate.ags_minimum).toLocaleString()} - ₱${Number(highestRate.ags_maximum).toLocaleString()}`,
                    rate: highestRate.ags_rate
                };
            }
        }
        
        return null;
    }

    
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

            // Validate Business Clearance specific fields
            if (isBusinessClearance()) {
                if (!values.manualGrossSales || values.manualGrossSales.trim() === '') {
                    showErrorToast("Please enter the annual gross sales amount for Business Clearance.");
                    setIsSubmitting(false);
                    return;
                }
                
                const matchingRate = findMatchingGrossSalesRateFromInput(values.manualGrossSales);
                if (!matchingRate) {
                    showErrorToast("No valid gross sales range found for the entered amount.");
                    setIsSubmitting(false);
                    return;
                }
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
                             name="purposes"
                             render={({ field }) => {
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
                                                         .filter((purpose: any) => 
                                                             purpose.pr_category === 'Barangay Permit' ||
                                                             purpose.pr_category === 'Barangay Clearance'
                                                         )
                                                         .map((purpose: any) => ({
                                                             id: purpose.pr_id,
                                                             name: purpose.pr_purpose
                                                         }))}
                                                     isLoading={purposesLoading}
                                                     label=""
                                                     placeholder="Select purpose..."
                                                     emptyText="No purposes found"
                                                     onSelect={(_value: string, selectedOption: any) => {
                                                         const purposeId = selectedOption?.id || selectedOption?.pr_id || '';
                                                         field.onChange(purposeId.toString());
                                                         
                                                         // Clear manual gross sales when switching purposes
                                                         if (!isBusinessClearance()) {
                                                             form.setValue("manualGrossSales", "");
                                                         }
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

                    <FormField
                        control={form.control}
                        name="businessName"
                        render={({field}) => {
                            const isClearanceMode = isBusinessClearance();
                            const currentValue = field.value || "";
                            const isBusinessId = currentValue && currentValue.startsWith('BUS-');
                            
                            return (
                                <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        {isClearanceMode ? (
                                            // For Business Clearance, allow both selection and manual entry
                                            <ComboboxInput
                                                value={isBusinessId ? getBusinessDisplayName(currentValue) : currentValue}
                                                options={businesses}
                                                isLoading={businessLoading}
                                                label=""
                                                placeholder="Search business or type business name"
                                                emptyText="No businesses found - you can type a business name"
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
                                                                    } else {
                                                                        // Owner name found but no rp_id - likely non-resident
                                                                        form.setValue('rp_id', "");
                                                                    }
                                                                } else {
                                                                    // No owner found - clear rp_id but keep requestor empty for manual entry
                                                                    // User can now enter either a resident or non-resident name
                                                                    form.setValue("requestor", "");
                                                                    form.setValue('rp_id', "");
                                                                }
                                                            } catch (error) {
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
                                                    // For custom input in Business Clearance mode, store the business name directly
                                                    // Always update the field value - handle empty strings explicitly
                                                    const newValue = value === undefined || value === null ? "" : value;
                                                    field.onChange(newValue);
                                                    
                                                    // Clear address and gross sales when manually entering business name or clearing it
                                                    form.setValue("address", "");
                                                    form.setValue("grossSales", "");
                                                    form.setValue("manualGrossSales", "");
                                                }}
                                                displayKey="bus_name"
                                                valueKey="bus_id"
                                            />
                                        ) : (
                                            // For regular permits, only allow selection from existing businesses
                                            <ComboboxInput
                                                value={getBusinessDisplayName(currentValue) || currentValue}
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
                                                                    } else {
                                                                        // Owner name found but no rp_id - likely non-resident
                                                                        form.setValue('rp_id', "");
                                                                    }
                                                                } else {
                                                                    // No owner found - clear rp_id but keep requestor empty for manual entry
                                                                    // User can now enter either a resident or non-resident name
                                                                    form.setValue("requestor", "");
                                                                    form.setValue('rp_id', "");
                                                                }
                                                            } catch (error) {
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
                                        )}
                                    </FormControl>
                                    <FormMessage/>
                                    {isClearanceMode && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            You can select an existing business or type a new business name for non-resident businesses
                                        </p>
                                    )}
                                </FormItem>
                            );
                        }}
                    />


                    {/* Manual Gross Sales Input - Only for Business Clearance (Barangay Clearance category) */}
                    {isBusinessClearance() && (
                        <FormField
                            control={form.control}
                            name="manualGrossSales"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Annual Gross Sales Amount</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="number"
                                            placeholder="Enter annual gross sales amount" 
                                            className="w-full" 
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                // Auto-calculate and set the matching rate
                                                const matchingRate = findMatchingGrossSalesRateFromInput(e.target.value);
                                                if (matchingRate) {
                                                    form.setValue("grossSales", matchingRate.id);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Enter the annual gross sales amount to calculate the applicable rate
                                    </p>
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Gross Sales Range and Amount - Only for Business Clearance (Barangay Clearance category) */}
                    {isBusinessClearance() && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                            <FormField
                                control={form.control}
                                name="grossSales"
                                render={({ field }) => {
                                    const businessId = form.watch("businessName");
                                    const manualGrossSales = form.watch("manualGrossSales");
                                    
                                    // For Business Clearance with manual input, use manual calculation
                                    // Otherwise, use business-based calculation
                                    const matchingRate = manualGrossSales
                                        ? findMatchingGrossSalesRateFromInput(manualGrossSales)
                                        : getMatchingGrossSalesRate(businessId);
                                    
                                    return (
                                        <FormItem>
                                            <FormLabel>Annual Gross Sales Range</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    value={matchingRate?.name || ''}
                                                    placeholder="Enter gross sales amount above"
                                                    className="w-full bg-gray-50" 
                                                    readOnly
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="grossSales"
                                render={({ field }) => {
                                    const businessId = form.watch("businessName");
                                    const manualGrossSales = form.watch("manualGrossSales");
                                    
                                    // For Business Clearance with manual input, use manual calculation
                                    // Otherwise, use business-based calculation
                                    const matchingRate = manualGrossSales
                                        ? findMatchingGrossSalesRateFromInput(manualGrossSales)
                                        : getMatchingGrossSalesRate(businessId);
                                    
                                    return (
                                        <FormItem>
                                            <FormLabel>Amount to be Paid</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    value={matchingRate?.rate ? 
                                                        `₱${Number(matchingRate.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                                                        ''
                                                    }
                                                    placeholder="Enter gross sales amount above"
                                                    className="w-full bg-gray-50" 
                                                    readOnly
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>
                    )}

                    {/* Amount to be Paid - Only for Barangay Permit (uses pr_rate directly) */}
                    {isBarangayPermit() && (
                        <FormField
                            control={form.control}
                            name="grossSales"
                            render={({ field }) => {
                                const purposeRate = getSelectedPurposeRate();
                                
                                return (
                                    <FormItem>
                                        <FormLabel>Amount to be Paid</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field} 
                                                value={purposeRate ? 
                                                    `₱${Number(purposeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                                                    ''
                                                }
                                                placeholder="Select a purpose to see the amount"
                                                className="w-full bg-gray-50" 
                                                readOnly
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    )}

                    {/* Requestor field - full width */}
                    <FormField
                        control={form.control}
                        name="requestor"
                        render={({ field }) => {
                            const isNonResident = !form.watch("rp_id") && field.value;
                            return (
                                <FormItem className="flex flex-col">
                                    <FormLabel>
                                        Requestor:
                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                            (Resident or Non-Resident)
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <ComboboxInput
                                                value={field.value}
                                                options={residents}
                                                isLoading={residentLoading}
                                                label=""
                                                placeholder={form.watch("businessName") ? 
                                                    "Search resident or type name for non-resident" : 
                                                    "Search resident by name or type name for non-resident"
                                                }
                                                emptyText="No residents found - you can type a name for non-residents"
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
                                            {isNonResident && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                                                    Non-resident requestor - name will be saved without resident profile
                                                </p>
                                            )}
                                            {field.value && form.watch("rp_id") && (
                                                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                                                    Resident
                                                </p>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Tip: Type a name directly if the business owner is not a resident of this barangay
                                    </p>
                                </FormItem>
                            );
                        }}
                    />

                    {/* Display business address - editable for Business Clearance */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({field}) => {
                            const businessId = form.watch("businessName");
                            const isEditable = isBusinessClearance() && (!businessId || !businessId.startsWith('BUS-'));
                            const addressValue = isEditable ? field.value : (getBusinessAddress(businessId) || field.value);
                            
                            return (
                                <FormItem>
                                    <FormLabel>Business Address</FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            value={addressValue}
                                            placeholder={isBusinessClearance() ? 
                                                "Enter business address" : 
                                                "Selecting a business will auto-fill the address."
                                            } 
                                            className={isEditable ? "w-full" : "w-full bg-gray-50"} 
                                            readOnly={!isEditable}
                                            onChange={(e) => {
                                                if (isEditable) {
                                                    field.onChange(e.target.value);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            );
                        }}
                    />

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