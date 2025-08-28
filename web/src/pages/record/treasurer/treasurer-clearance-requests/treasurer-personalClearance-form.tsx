// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button/button"
// import { ResidentFormSchema, NonResidentFormSchema } from "@/form-schema/personalClearance-schema";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// // import { useAuth } from "@/context/AuthContext";
// import { toast } from "sonner";
// import { createPersonalClearance } from "@/pages/record/treasurer/treasurer-clearance-requests/restful-api/personalClearancePostApi";
// import { useState } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { ComboboxInput } from "../../../../components/ui/form/form-combo-box-search"; 
// import { useGetResidents } from "@/pages/record/treasurer/treasurer-clearance-requests/queries/CertClearanceFetchQueries";
// import { useGetPurposeAndRate } from "../Rates/queries/RatesFetchQueries";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { FormInput } from "@/components/ui/form/form-input";

// interface PersonalClearanceFormProps {
//     onSuccess?: () => void;
// }

// function PersonalClearanceForm({ onSuccess }: PersonalClearanceFormProps) {
//     // const { user } = useAuth();
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const queryClient = useQueryClient();
//     const { data: residents = [], isLoading: residentLoading} = useGetResidents()
//     const { data: purposes = [], isLoading: purposesLoading} = useGetPurposeAndRate()

//     const purposeOptions = purposes
//     .filter(purposes => purposes.pr_is_archive === false)
//     .filter(purposes => purposes.pr_category === 'Personal And Others')
//     .map(purposes => ({
//         id: purposes.pr_id.toString(),
//         name: `${purposes.pr_purpose}`
//     }));

//     const residentForm = useForm<z.infer<typeof ResidentFormSchema>>({
//         resolver: zodResolver(ResidentFormSchema),
//         defaultValues: {
//             requester: "",
//             purpose: "", 
//             rp_id: ""
//         },
//     });

//     const nonResidentForm = useForm<z.infer<typeof NonResidentFormSchema>>({
//         resolver: zodResolver(NonResidentFormSchema),
//         defaultValues: {
//             serialNo: "",
//             requester: "",
//             purpose: "", 
//             address: ""
//         },
//     });

//     // Debounced search for residents
//     // const onSubmit = async (values: z.infer<typeof PersonalClearanceFormSchema>) => {
//     //     try {   
//     //         setIsSubmitting(true);
            
//     //         const payload = {
//     //             ...values,
//     //         };
            
//     //         console.log(payload)
//     //         await createPersonalClearance(payload);
//     //         toast.success("Personal clearance created successfully!");
            
//     //         form.reset();
//     //         await queryClient.invalidateQueries({ queryKey: ["personalClearances"] });
            
//     //         if (onSuccess) onSuccess();
            
//     //     } catch (error) {
//     //         console.error('Error creating personal clearance:', error);
//     //         toast.error("Failed to create personal clearance. Please try again.");
//     //     } finally {
//     //         setIsSubmitting(false);
//     //     }
//     // };

//     const onSubmit = () => {

//     }

//     return (
//         <Form {...residentForm}>
//             <form onSubmit={residentForm.handleSubmit(onSubmit)} className="flex flex-col gap-7">
//                 <div className="flex flex-col gap-5">
    
//                     <FormField
//                         control={residentForm.control}
//                         name="requester"
//                         render={({ field }) => (
//                             <FormItem className="flex flex-col">
//                                 <FormLabel>Requester:</FormLabel>
//                                 <FormControl>
//                                     <ComboboxInput
//                                          value={field.value}
//                                          options={residents}
//                                          isLoading={residentLoading}
//                                          label=""
//                                          placeholder="Search resident by name"
//                                          emptyText="No residents found"
//                                          onSelect={(value: string, item: any) => {
//                                              field.onChange(value);
//                                              residentForm.setValue('rp_id', item?.rp_id || '');
//                                          }}
//                                          onCustomInput={(value: string) => {
//                                              field.onChange(value);
//                                              residentForm.setValue('rp_id', '');
//                                          }}
//                                          displayKey="full_name"
//                                          valueKey="full_name"
//                                          additionalDataKey="rp_id" 
//                                      />
                                
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </div>

//                 <div>
//                     <FormSelect
//                         control={residentForm.control}
//                         name="purpose"
//                         label="Purpose"
//                         options={purposeOptions}
//                     />
//                 </div>

//                 <div className="flex justify-end">
//                     <Button disabled={isSubmitting}>
//                         {isSubmitting ? "Creating..." : "Proceed"}
//                     </Button>
//                 </div>
//             </form>
//         </Form>
//     );

//     return (
//         <Form {...nonResidentForm}>
//             <form onSubmit={nonResidentForm.handleSubmit(onSubmit)} className="flex flex-col gap-7">
//                 <div className="flex flex-col gap-5">
//                     <FormField
//                         control={nonResidentForm.control}
//                         name="serialNo"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Receipt Serial No.:</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="e.g.(123456)" type="number" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                   <FormInput
//                     name="requester"
//                     label="Requester"
//                     control={nonResidentForm.control}
//                   />

//                   <FormInput
//                     name="address"
//                     label="Address"
//                     control={nonResidentForm.control}
//                   />
//                 </div>

//                 <div>
//                     <FormSelect
//                         control={nonResidentForm.control}
//                         name="purpose"
//                         label="Purpose"
//                         options={purposeOptions}
//                     />
//                 </div>

//                 <div className="flex justify-end">
//                     <Button disabled={isSubmitting}>
//                         {isSubmitting ? "Creating..." : "Proceed"}
//                     </Button>
//                 </div>
//             </form>
//         </Form>
//     );
// }

// export default PersonalClearanceForm;

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { ResidentFormSchema, NonResidentFormSchema } from "@/form-schema/personalClearance-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner";
import { createPersonalClearance, createNonResidentPersonalClearance } from "@/pages/record/treasurer/treasurer-clearance-requests/restful-api/personalClearancePostApi";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ComboboxInput } from "../../../../components/ui/form/form-combo-box-search"; 
import { useGetResidents } from "@/pages/record/treasurer/treasurer-clearance-requests/queries/CertClearanceFetchQueries";
import { useGetPurposeAndRate } from "../Rates/queries/RatesFetchQueries";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";

interface PersonalClearanceFormProps {
    onSuccess?: () => void;
}

function PersonalClearanceForm({ onSuccess }: PersonalClearanceFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResident, setIsResident] = useState(true); // Default to resident
    const queryClient = useQueryClient();
    const { data: residents = [], isLoading: residentLoading} = useGetResidents()
    const { data: purposes = [], isLoading: purposesLoading} = useGetPurposeAndRate()

    const purposeOptions = purposes
    .filter(purposes => purposes.pr_is_archive === false)
    .filter(purposes => purposes.pr_category === 'Personal And Others')
    .map(purposes => ({
        id: purposes.pr_id.toString(),
        name: `${purposes.pr_purpose}`
    }));

    const residentForm = useForm<z.infer<typeof ResidentFormSchema>>({
        resolver: zodResolver(ResidentFormSchema),
        defaultValues: {
            requester: "",
            purpose: "", 
            rp_id: ""
        },
    });

    const nonResidentForm = useForm<z.infer<typeof NonResidentFormSchema>>({
        resolver: zodResolver(NonResidentFormSchema),
        defaultValues: {
            requester: "",
            purpose: "", 
            address: "",
            birthdate: "",
        },
    });

    const onSubmitResident = async (values: z.infer<typeof ResidentFormSchema>) => {
        try {   
            setIsSubmitting(true);
            
            const payload = {
                ...values   
            };
            
            console.log(payload)
            await createPersonalClearance(payload);
            toast.success("Personal clearance created successfully!");
            
            residentForm.reset();
            await queryClient.invalidateQueries({ queryKey: ["personalClearances"] });
            
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error('Error creating personal clearance:', error);
            toast.error("Failed to create personal clearance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitNonResident = async (values: z.infer<typeof NonResidentFormSchema>) => {
        try {   
            setIsSubmitting(true);
            
            const payload = {
                ...values,
            };
            
            console.log(payload)
            await createNonResidentPersonalClearance(payload);
            toast.success("Personal clearance created successfully!");
            
            nonResidentForm.reset();
            await queryClient.invalidateQueries({ queryKey: ["nonResidentReq"] });
            
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error('Error creating personal clearance:', error);
            toast.error("Failed to create personal clearance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Toggle Button */}
            <div className="flex justify-center gap-2">
                    <Button
                        type="button"
                        variant={isResident ? "default" : "outline"}
                        onClick={() => setIsResident(true)}
                        className="px-4 py-2"
                    >
                        Resident
                    </Button>
                    <Button
                        type="button"
                        variant={!isResident ? "default" : "outline"}
                        onClick={() => setIsResident(false)}
                        className="px-4 py-2"
                    >
                        Non-Resident
                    </Button>
            </div>

            {/* Resident Form */}
            {isResident && (
                <Form {...residentForm}>
                    <form onSubmit={residentForm.handleSubmit(onSubmitResident)} className="flex flex-col gap-7">
                        <div className="flex flex-col gap-5">
                            <FormField
                                control={residentForm.control}
                                name="requester"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Requester:</FormLabel>
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
                                                    residentForm.setValue('rp_id', item?.rp_id || '');
                                                }}
                                                onCustomInput={(value: string) => {
                                                    field.onChange(value);
                                                    residentForm.setValue('rp_id', '');
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
                        </div>

                        <div>
                            <FormSelect
                                control={residentForm.control}
                                name="purpose"
                                label="Purpose"
                                options={purposeOptions}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Proceed"}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}

            {/* Non-Resident Form */}
            {!isResident && (
                <Form {...nonResidentForm}>
                    <form onSubmit={nonResidentForm.handleSubmit(onSubmitNonResident)} className="flex flex-col gap-7">
                        <div className="flex flex-col gap-5">
                            {/* <FormField
                                control={nonResidentForm.control}
                                name="serialNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Receipt Serial No.:</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g.(123456)" type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /> */}

                            <FormInput
                                name="requester"
                                label="Requester"
                                control={nonResidentForm.control}
                            />

                            <FormInput
                                name="address"
                                label="Address"
                                control={nonResidentForm.control}
                            />

                            <FormDateTimeInput
                                type="date"
                                control = {nonResidentForm.control}
                                name="birthdate"
                                label = "Birthdate"
                            />
                        </div>

                        <div>
                            <FormSelect
                                control={nonResidentForm.control}
                                name="purpose"
                                label="Purpose"
                                options={purposeOptions}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Proceed"}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
}

export default PersonalClearanceForm;