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
import { FormSelect } from "@/components/ui/form/form-select";



interface PermitClearanceFormProps {
    onSuccess?: () => void;
}

function PermitClearanceForm({ onSuccess }: PermitClearanceFormProps) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();
    
    
    // Add error handling for the queries
    const { data: businesses = [], isLoading: businessLoading, error: businessError } = useGetBusinesses();
    const { data: permitPurposes = [], isLoading: purposesLoading, error: purposesError } = useGetPermitPurposes();
    const { data: residents = [], isLoading: residentLoading} = useGetResidents();
    const { data: grossSales = [], isLoading: grossSalesLoading } = useGetAnnualGrossSales();
    
    // Log any errors
    if (businessError) {
        console.error("Business loading error:", businessError);
    }
    if (purposesError) {
        console.error("Purposes loading error:", purposesError);
    }

    // fetches only records where the archive status is false
    const annualGrossSalesOptions = grossSales
    .filter(grossSales => grossSales.ags_is_archive === false)
    .map(grossSales => ({
        id: grossSales.ags_id.toString(),
        name: `₱${grossSales.ags_minimum} - ₱${grossSales.ags_maximum}`
    }));
    
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
        
        const address = selectedBusiness?.address || selectedBusiness?.bus_street || '';
        console.log("Resolved address:", address);
        
        return address;
    }

    // Function to get business requestor when business is selected
    const getBusinessRequestor = (businessValue: string) => {
        console.log("getBusinessRequestor called with businessValue:", businessValue);
        
        // Try to find by ID first
        let selectedBusiness = businesses.find((business: any) => business.bus_id === businessValue);
        
        // If not found by ID, try to find by name
        if (!selectedBusiness) {
            selectedBusiness = businesses.find((business: any) => business.bus_name === businessValue);
        }
        
        console.log("Selected business for requestor:", selectedBusiness);
        
        const requestor = selectedBusiness?.requestor || '';
        console.log("Resolved requestor:", requestor);
        
        return requestor;
    }

    const onSubmit = async (values: z.infer<typeof PermitClearanceFormSchema>) => {
        try {
            setIsSubmitting(true);
            
          
            const staffId = "00006250722"; // Hardcoded staff ID
            
            const payload = {
                ...values,
                staff: staffId  
            };
            
            console.log("Permit Clearance Data:", payload);
            
         
            await createPermitClearance(payload);
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
                                            field.onChange(value);
                                            
                                           
                                            let selectedBusiness = businesses.find((business: any) => business.bus_id === value);
                                            
                                          
                                            if (!selectedBusiness) {
                                                selectedBusiness = businesses.find((business: any) => business.bus_name === value);
                                            }
                                            
                                            console.log("Found selected business:", selectedBusiness);
                                            if (selectedBusiness) {
                                               
                                                const address = selectedBusiness.address || selectedBusiness.bus_street || '';
                                              
                                                form.setValue("address", address);
                                                
                                               
                                                const requestor = selectedBusiness.requestor || '';
                                              
                                                form.setValue("requestor", requestor);
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

                    <div className="grid grid-cols-2 gap-5 w-full">
                        <FormSelect
                            control={form.control}
                            name="grossSales"
                            options={annualGrossSalesOptions}
                            // isLoading={grossSalesLoading}
                            label="Annual Gross Sales"
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
                                                      .filter((purpose: any) => purpose.pr_category === 'Permit Clearance')
                                                      .map((purpose: any) => ({
                                                          id: purpose.pr_id,
                                                          name: purpose.pr_purpose
                                                      }))}
                                                  isLoading={purposesLoading}
                                                  label=""
                                                  placeholder="Select purpose..."
                                                  emptyText="No purposes found"
                                                  onSelect={(value: string, _: any) => {
                                                      field.onChange(value);
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