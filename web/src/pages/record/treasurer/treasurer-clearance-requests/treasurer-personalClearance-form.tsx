import { Button } from "@/components/ui/button/button"
import { ResidentFormSchema, NonResidentFormSchema } from "@/form-schema/personalClearance-schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { createPersonalClearance, createNonResidentPersonalClearance } from "@/pages/record/treasurer/treasurer-clearance-requests/restful-api/personalClearancePostApi";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ComboboxInput } from "../../../../components/ui/form/form-combo-box-search"; 
import { useGetResidents } from "@/pages/record/treasurer/treasurer-clearance-requests/queries/CertClearanceFetchQueries";
import { useGetPurposeAndRate } from "../Rates/queries/RatesFetchQueries";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useAuth } from "@/context/AuthContext";

interface PersonalClearanceFormProps {
    onSuccess?: () => void;
}

function PersonalClearanceForm({ onSuccess }: PersonalClearanceFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResident, setIsResident] = useState(true); // Default to resident
    const [selectedIsSenior, setSelectedIsSenior] = useState<boolean>(false);
    const [selectedHasDisability, setSelectedHasDisability] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    // Try multiple ways to get staff_id
    const getStaffId = () => {
        if (!user?.staff) return undefined;
        
        // Try different possible field names
        const staff = user.staff;
        let staffId = staff.staff_id || staff.id || staff.staffId || staff.staff_ID;
        
        // Handle truncated staff_id by padding with zeros
        if (staffId && typeof staffId === 'string') {
            // If staff_id is less than 11 digits, pad with leading zeros
            if (staffId.length < 11) {
                staffId = staffId.padStart(11, '0');
            }
        }
        
        return staffId;
    };
    
    const staffId = getStaffId();
    
    const { data: residents = [], isLoading: residentLoading} = useGetResidents()
    
    
    const { data: purposes = [], isLoading: _purposesLoading} = useGetPurposeAndRate()


    const purposeOptions = purposes
    .filter(purposes => purposes.pr_is_archive === false)
    .filter(purposes => purposes.pr_category === 'Personal')
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
            last_name: "",
            first_name: "",
            middle_name: "",
            purpose: "", 
            address: "",
            birthdate: "",
        },
    });

    const onSubmitResident = async (values: z.infer<typeof ResidentFormSchema>) => {
        try {   
            setIsSubmitting(true);
            
            if (!staffId) {
                showErrorToast("Missing staff ID. Please re-login and try again.");
                return;
            }

            // Validate staff_id format
            if (staffId.length !== 11) {
                showErrorToast(`Invalid staff ID format. Expected 11 digits, got ${staffId.length}. Please re-login and try again.`);
                console.error(`Invalid staff ID format: ${staffId} (length: ${staffId.length})`);
                return;
            }

            // Validate that a resident is selected
            if (!values.rp_id) {
                showErrorToast("Please select a resident from the list.");
                return;
            }

            // Validate that a purpose is selected
            if (!values.purpose) {
                showErrorToast("Please select a purpose.");
                return;
            }

            const payload = {
                ...values   
            };
            
            
            await createPersonalClearance(payload, staffId);
            if (onSuccess) onSuccess();
            showSuccessToast("Personal clearance created successfully!");
            
            residentForm.reset();
            await queryClient.invalidateQueries({ queryKey: ["residentReq"] });
            
        } catch (error: any) {
            console.error('Error creating personal clearance:', error);
            showErrorToast(error.message || "Failed to create personal clearance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to format requester name in all capital letters
    const formatRequesterName = (lastName: string, firstName: string, middleName?: string): string => {
        const nameParts = [lastName, firstName];
        if (middleName && middleName.trim()) {
            nameParts.push(middleName);
        }
        return nameParts.join(', ').toUpperCase();
    };

    const onSubmitNonResident = async (values: z.infer<typeof NonResidentFormSchema>) => {
        try {   
            setIsSubmitting(true);
            
            if (!staffId) {
                showErrorToast("Missing staff ID. Please re-login and try again.");
                return;
            }

            // Combine name fields into requester field using helper function
            const requester = formatRequesterName(values.last_name, values.first_name, values.middle_name);

            const payload = {
                requester: requester,
                purpose: values.purpose,
                address: values.address,
                birthdate: values.birthdate,
            };
            
            await createNonResidentPersonalClearance(payload, staffId);
            showSuccessToast("Personal clearance created successfully!");
            
            nonResidentForm.reset();
            await queryClient.invalidateQueries({ queryKey: ["nonResidentReq"] });
            
            if (onSuccess) onSuccess();
            
        } catch (error) {
            console.error('Error creating personal clearance:', error);
            showErrorToast("Failed to create personal clearance. Please try again.");
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
                                                onSelect={async (value: string, item: any) => {
                                                    // Validate that we have a valid rp_id
                                                    if (!item?.rp_id) {
                                                        showErrorToast("Invalid resident selected. Please try again.");
                                                        return;
                                                    }
                                                    
                                                    // Set the display value for the field
                                                    field.onChange(value);
                                                    // Set the actual rp_id for form submission
                                                    residentForm.setValue('rp_id', item.rp_id);
                                                    
                                                // helper to compute and set flags
                                                const computeAndSet = (dobValue: any, disabilityValue: any) => {
                                                    const dobStr = dobValue ? String(dobValue) : '';
                                                    let isSenior = false;
                                                    if (dobStr) {
                                                        try {
                                                            const dob = new Date(dobStr);
                                                            if (!isNaN(dob.getTime())) {
                                                                const today = new Date();
                                                                let age = today.getFullYear() - dob.getFullYear();
                                                                const m = today.getMonth() - dob.getMonth();
                                                                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                                                                isSenior = age >= 60;
                                                            }
                                                        } catch {}
                                                    }
                                                    const disabilityRaw = disabilityValue;
                                                    const hasDisability = disabilityRaw !== null && disabilityRaw !== undefined && String(disabilityRaw).trim() !== '';
                                                    setSelectedIsSenior(isSenior);
                                                    setSelectedHasDisability(hasDisability);
                                                };

                                                // Prefer full resident record from the existing residents list
                                                const full = (Array.isArray(residents) ? residents : []).find((r: any) => String(r?.rp_id) === String(item?.rp_id));
                                                if (full) {
                                                    computeAndSet((full as any)?.per_dob, (full as any)?.per_disability);
                                                } else {
                                                    computeAndSet((item as any)?.per_dob, (item as any)?.per_disability);
                                                }
                                                const hasDob = (((full as any)?.per_dob ?? (item as any)?.per_dob)) && String(((full as any)?.per_dob ?? (item as any)?.per_dob)).trim() !== '';
                                                const hasDis = (((full as any)?.per_disability ?? (item as any)?.per_disability)) && String(((full as any)?.per_disability ?? (item as any)?.per_disability)).trim() !== '';
                                                }}
                                                onCustomInput={(value: string) => {
                                                    field.onChange(value);
                                                    residentForm.setValue('rp_id', '');
                                                    setSelectedIsSenior(false);
                                                    setSelectedHasDisability(false);
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
                            {(selectedIsSenior || selectedHasDisability) && (
                                <div className="text-xs text-green-700 mt-2">
                                    Eligible for free: {selectedIsSenior ? 'Senior' : ''}{selectedIsSenior && selectedHasDisability ? ' • ' : ''}{selectedHasDisability ? 'PWD' : ''}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button 
                                disabled={isSubmitting || !residentForm.watch('rp_id') || !residentForm.watch('purpose')}
                                type="submit"
                            >
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
                        
                            <FormInput
                                name="last_name"
                                label="Last Name"
                                control={nonResidentForm.control}
                            />
                           <FormInput
                                name="first_name"
                                label="First Name"
                                control={nonResidentForm.control}
                            />
                            <FormInput
                                name="middle_name"
                                label="Middle Name (Optional)"
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
                                max={new Date().toISOString().split('T')[0]}
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