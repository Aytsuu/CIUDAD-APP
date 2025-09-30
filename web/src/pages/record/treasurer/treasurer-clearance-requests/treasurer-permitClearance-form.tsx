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
import { useGetAnnualGrossSales } from "../Rates/queries/RatesFetchQueries";



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
    const { data: grossSales = [], isLoading: _grossSalesLoading } = useGetAnnualGrossSales();
    
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
            businessName: "",
            businessId: "",
            requestor: "",
            address: "",
            grossSales: "",
            purposes: "",
            purposeId: "",
            rp_id: "",
        },
    })

    // Function to get business address when business is selected
    const getBusinessAddress = (businessValue: string) => {
        console.log("getBusinessAddress called with businessValue:", businessValue);
        console.log("Available businesses:", businesses);
        
        
        let selectedBusiness = businesses.find((business: any) => business.bus_id === businessValue);
        
        // If not found by ID, try to find by name
        if (!selectedBusiness) {
            selectedBusiness = businesses.find((business: any) => business.bus_name === businessValue);
        }
        
        console.log("Selected business:", selectedBusiness);
        
        const address = selectedBusiness?.bus_location || selectedBusiness?.address || '';
        console.log("Resolved address:", address);
        
        return address;
    }

    // Function to get matching annual gross sales rate based on business gross sales
    const getMatchingGrossSalesRate = (businessValue: string) => {
        console.log("getMatchingGrossSalesRate called with:", businessValue);
        console.log("Available businesses:", businesses);
        console.log("Available gross sales rates:", grossSales);
        
        const selectedBusiness = businesses.find((business: any) => 
            business.bus_id === businessValue || business.bus_name === businessValue
        );
        
        console.log("Selected business for gross sales:", selectedBusiness);
        
        if (!selectedBusiness || !selectedBusiness.bus_gross_sales) {
            console.log("No business found or no gross sales data");
            return null;
        }
        
        const businessGrossSales = Number(selectedBusiness.bus_gross_sales);
        console.log("Business gross sales:", businessGrossSales);
        
        // Find matching annual gross sales range
        const matchingRate = grossSales.find((rate: any) => 
            rate.ags_is_archive === false &&
            businessGrossSales >= rate.ags_minimum && 
            businessGrossSales <= rate.ags_maximum
        );
        
        console.log("Matching rate found:", matchingRate);
        
        return matchingRate ? {
            id: matchingRate.ags_id.toString(),
            name: `₱${matchingRate.ags_minimum} - ₱${matchingRate.ags_maximum}`,
            rate: matchingRate.ags_rate
        } : null;
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
            console.log("Business ID from form:", payload.businessId);
            console.log("Business Name from form:", payload.businessName);
            console.log("Purposes from form:", payload.purposes);
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
                                        value={field.value}
                                        options={businesses}
                                        isLoading={businessLoading}
                                        label=""
                                        placeholder="Search business"
                                        emptyText="No businesses found"
                                        onSelect={(value: string, selectedOption: any) => {
                                            console.log("Business selected with value:", value);
                                            console.log("Selected option:", selectedOption);
                                            
                                            // Get the actual business ID from selectedOption (like rp_id pattern)
                                            const businessId = selectedOption?.bus_id || '';
                                            const businessName = selectedOption?.bus_name || value;
                                            
                                            console.log("Business ID:", businessId);
                                            console.log("Business Name:", businessName);
                                            
                                            // Store business name in the display field
                                            field.onChange(businessName);
                                            
                                            // Store business ID separately
                                            form.setValue("businessId", businessId);
                                            console.log("Set businessId to:", businessId);
                                            
                                            // Find the selected business using the actual ID
                                            const selectedBusiness = businesses.find((business: any) => business.bus_id === businessId);
                                            
                                            console.log("Found selected business:", selectedBusiness);
                                            if (selectedBusiness) {
                                                const address = selectedBusiness.bus_location || selectedBusiness.address || '';
                                                form.setValue("address", address);
                                                
                                                const requestor = selectedBusiness.requestor || '';
                                                form.setValue("requestor", requestor);

                                                // Store the business gross sales amount as string
                                                const businessGrossSales = selectedBusiness.bus_gross_sales || '';
                                                form.setValue("businessGrossSales", businessGrossSales.toString());
                                                console.log("Set business gross sales to:", businessGrossSales.toString());

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

                    {/* Hidden field for businessId */}
                    <FormField
                        control={form.control}
                        name="businessId"
                        render={({field}) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <Input {...field} type="hidden" />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Hidden field for purposeId */}
                    <FormField
                        control={form.control}
                        name="purposeId"
                        render={({field}) => (
                            <FormItem className="hidden">
                                <FormControl>
                                    <input {...field} type="hidden" />
                                </FormControl>
                            </FormItem>
                        )}
                    />

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
                                                  value={field.value || ''}
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
                                                      
                                                      // Get the purpose ID from selectedOption (like business selection)
                                                      const purposeId = selectedOption?.id || selectedOption?.pr_id || '';
                                                      const purposeName = selectedOption?.name || selectedOption?.pr_purpose || value;
                                                      
                                                      console.log("- purposeId:", purposeId);
                                                      console.log("- purposeName:", purposeName);
                                                      
                                                      // Set the field value to the purpose name (what user sees)
                                                      field.onChange(purposeName);
                                                      
                                                      // Store the purpose ID in the hidden field for backend submission
                                                      form.setValue("purposeId", purposeId.toString());
                                                      console.log("Set purposeId to:", purposeId.toString());
                                                      console.log("Current form values:", form.getValues());
                                                  }}
                                                  onCustomInput={(value: string) => {
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