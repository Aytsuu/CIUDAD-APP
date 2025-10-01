import { useMutation, useQueryClient } from "@tanstack/react-query";
import {z} from "zod";
import { editAnnualGrossSales, editPurposeAndRate } from "../restful-API/RatesPutAPI";
import { AnnualGrossSalesEditSchema, PurposeAndRatesEditSchema } from "@/form-schema/treasurer/rates-edit-form-schema";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";


export const useEditAnnualGrossSales = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof AnnualGrossSalesEditSchema>) => 
            editAnnualGrossSales(values.ags_id, { 
                minRange: values.minRange,
                maxRange: values.maxRange,
                amount: values.amount,
                staff_id: values.staff_id
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['grossSalesActive'] });
                queryClient.invalidateQueries({ queryKey: ['allGrossSales'] });

                showSuccessToast("Record Updated!")
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                showErrorToast(
                    "Failed to submit record. Please check the input data and try again."
                );
            }
        })
}

export const useEditPurposeAndRate = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof PurposeAndRatesEditSchema>) => 
            editPurposeAndRate(values.pr_id, { 
                purpose: values.purpose,
                amount: values.amount,
                category: values.category,
                staff_id: values.staff_id
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['personalActive']});
                queryClient.invalidateQueries({ queryKey: ['allPersonal']});
                queryClient.invalidateQueries({ queryKey: ['serviceChargeActive']});
                queryClient.invalidateQueries({ queryKey: ['allServiceCharge']});
                queryClient.invalidateQueries({ queryKey: ['barangayPermitActive']});
                queryClient.invalidateQueries({ queryKey: ['allBarangayPermit']});
                
                showSuccessToast("Record Updated!")
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                showErrorToast(
                    "Failed to submit record. Please check the input data and try again."
                );
            }
        })
}