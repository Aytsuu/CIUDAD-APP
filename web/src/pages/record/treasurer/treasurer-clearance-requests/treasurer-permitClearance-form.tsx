import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"
import PermitClearanceFormSchema from "@/form-schema/permitClearance-schema";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
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
    
    
    // Add error handling for the queries
    const { data: businesses = [], isLoading: businessLoading, error: businessError } = useGetBusinesses();
    const { data: permitPurposes = [], isLoading: purposesLoading, error: purposesError } = useGetPermitPurposes();
    const { data: residents = [], isLoading: residentLoading} = useGetResidents();
    const { data: grossSales = { results: [], count: 0 }, isLoading: _grossSalesLoading } = useGetAnnualGrossSalesActive();
    
    // Log any errors
    if (businessError) {
        console.error("Business loading error:", businessError);
    }
    if (purposesError) {
        console.error("Purposes loading error:", purposesError);
    }

    
    const form = useForm<z.infer<typeof PermitClearanceFormSchema>>({
        resolver: zodResolver(PermitClearanceFormSchema),
        defaultValues: {
            serialNo: "",
            businessName: "", // Will store business ID, but display business name
            requestor: "",
            address: "",
            grossSales: "",
            purposes: "", // Will store purpose ID, but display purpose name
            rp_id: "",
        },
    })

    // Helper function to get business by ID
    const getBusinessById = (businessId: string) => {
        return businesses.find((business: any) => business.bus_id === businessId);
    }

    // Helper function to get purpose by ID  
    const getPurposeById = (purposeId: string) => {
        return permitPurposes.find((purpose: any) => purpose.pr_id === purposeId);
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

    // Function to get purpose display name
    const getPurposeDisplayName = (purposeId: string) => {
        const selectedPurpose = getPurposeById(purposeId);
        return selectedPurpose?.pr_purpose || '';
    }

    // Function to get matching annual gross sales rate based on business ID
    const getMatchingGrossSalesRate = (businessId: string) => {
        console.log("getMatchingGrossSalesRate called with businessId:", businessId);
        
        const selectedBusiness = getBusinessById(businessId);
        console.log("Selected business for gross sales:", selectedBusiness);
        
        if (!selectedBusiness || !selectedBusiness.bus_gross_sales) {
            console.log("No business found or no gross sales data");
            return null;
        }
        
        const businessGrossSales = Number(selectedBusiness.bus_gross_sales);
        console.log("Business gross sales:", businessGrossSales);
        
        // Filter only active (non-archived) rates
        const activeRates = grossSales?.results?.filter((rate: AnnualGrossSales) => !rate.ags_is_archive) || [];
        console.log("Active rates:", activeRates);
        console.log("Looking for gross sales amount:", businessGrossSales);
        
        // Find exact matching annual gross sales range
        let matchingRate = activeRates.find((rate: AnnualGrossSales) => 
            businessGrossSales >= Number(rate.ags_minimum) && 
            businessGrossSales <= Number(rate.ags_maximum)
        );
        
        console.log("Exact matching rate found:", matchingRate);
        
        if (matchingRate) {
            return {
                id: matchingRate.ags_id.toString(),
                name: `₱${Number(matchingRate.ags_minimum).toLocaleString()} - ₱${Number(matchingRate.ags_maximum).toLocaleString()}`,
                rate: matchingRate.ags_rate
            };
        }
        
        
        console.log("No exact match found. Looking for closest range...");
        
       
        const sortedRates = [...activeRates].sort((a, b) => Number(a.ags_minimum) - Number(b.ags_minimum));
        
        
        for (const rate of sortedRates) {
            const min = Number(rate.ags_minimum);
            const max = Number(rate.ags_maximum);
            
           
            if (businessGrossSales < min && Math.abs(businessGrossSales - min) <= 1) {
                console.log(`Using closest range: ${min} - ${max} for gross sales: ${businessGrossSales}`);
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
            console.log("Business gross sales exceeds highest rate range. Using highest available rate.");
            return {
                id: highestRate.ags_id.toString(),
                name: `₱${Number(highestRate.ags_minimum).toLocaleString()} - ₱${Number(highestRate.ags_maximum).toLocaleString()} (Highest Available)`,
                rate: highestRate.ags_rate
            };
        }
        
        console.log("No matching rate found for business gross sales:", businessGrossSales);
        return null;
    }



    const onSubmit = async (values: z.infer<typeof PermitClearanceFormSchema>) => {
        try {
            setIsSubmitting(true);
            
            if (!staffId) {
                toast.error("Missing staff ID. Please re-login and try again.");
                return;
            }

            const payload = {
                ...values
            };
            
            console.log("Permit Clearance Data:", payload);
            console.log("Business ID from form:", payload.businessName); // Now contains business ID
            console.log("Business Name (display):", getBusinessDisplayName(payload.businessName));
            console.log("Purpose ID from form:", payload.purposes); // Now contains purpose ID  
            console.log("Purpose Name (display):", getPurposeDisplayName(payload.purposes));
            console.log("Gross Sales from form:", payload.grossSales);
            console.log("All form values:", form.getValues());
            
         
            await createPermitClearance(payload, staffId);
            console.log("Permit clearance created successfully");
            
            toast.success("Permit clearance created successfully!");
            
      
            form.reset();
            
           
            await queryClient.invalidateQueries({ queryKey: ["permitClearances"] });
            
        
            if (onSuccess) {
                onSuccess();
            }
            
        } catch (error) {
            console.error('Error creating permit clearance:', error);
            toast.error("Failed to create permit clearance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    console.log("PermitClearanceForm rendering", { businesses, permitPurposes, businessLoading, purposesLoading });
    
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
                                        onSelect={(value: string, selectedOption: any) => {
                                            console.log("Business selected with value:", value);
                                            console.log("Selected option:", selectedOption);
                                            
                                            const businessId = selectedOption?.bus_id || '';
                                            console.log("Business ID:", businessId);
                                            
                                            // Store the business ID in the field (not the display name)
                                            field.onChange(businessId);
                                            
                                            const selectedBusiness = getBusinessById(businessId);
                                            console.log("Found selected business:", selectedBusiness);
                                            
                                            if (selectedBusiness) {
                                                const address = selectedBusiness.bus_location || selectedBusiness.address || '';
                                                form.setValue("address", address);
                                                
                                                const requestor = selectedBusiness.requestor || '';
                                                form.setValue("requestor", requestor);

                                                // Auto-match gross sales rate using business ID
                                                const matchingRate = getMatchingGrossSalesRate(businessId);
                                                if (matchingRate) {
                                                    form.setValue("grossSales", matchingRate.id);
                                                    console.log("Auto-matched gross sales rate:", matchingRate);
                                                } else {
                                                    console.log("No matching gross sales rate found for:", selectedBusiness.bus_gross_sales);
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


                    <div className="grid grid-cols-2 gap-5 w-full">
                        <FormField
                            control={form.control}
                            name="grossSales"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Annual Gross Sales Rate</FormLabel>
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
                                         placeholder="Search resident by name"
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
                        )}>
                        </FormField>        
                    </div>

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
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>Select purpose(s):</FormLabel>
                                      <FormControl>
                                          <div className="[&_[data-radix-popper-content-wrapper]]:!w-[400px] [&_[data-radix-popper-content-wrapper]_div]:!w-full [&_[data-radix-popper-content-wrapper]]:!z-[9999] [&_[data-radix-popper-content-wrapper]]:!top-full [&_[data-radix-popper-content-wrapper]]:!bottom-auto [&_[data-radix-popper-content-wrapper]]:!transform-none [&_[data-radix-popper-content-wrapper]]:!position-absolute [&_[data-radix-popper-content-wrapper]]:!left-0 [&_[data-radix-popper-content-wrapper]]:!right-0">
                                             <ComboboxInput
                                                  value={getPurposeDisplayName(field.value) || field.value}
                                                  options={permitPurposes
                                                      .filter((purpose: any) => purpose.pr_category === 'Business Permit')
                                                      .map((purpose: any) => ({
                                                          id: purpose.pr_id,
                                                          name: purpose.pr_purpose
                                                      }))}
                                                  isLoading={purposesLoading}
                                                  label=""
                                                  placeholder="Select purpose..."
                                                  emptyText="No purposes found"
                                                  onSelect={(value: string, selectedOption: any) => {
                                                      console.log("Purpose selection debug:");
                                                      console.log("- value:", value);
                                                      console.log("- selectedOption:", selectedOption);
                                                      
                                                      // Get the purpose ID from selectedOption
                                                      const purposeId = selectedOption?.id || selectedOption?.pr_id || '';
                                                      console.log("- purposeId:", purposeId);
                                                      
                                                      // Store the purpose ID in the field (not the display name)
                                                      field.onChange(purposeId.toString());
                                                      console.log("Set purposes field to purposeId:", purposeId.toString());
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
                             )}
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