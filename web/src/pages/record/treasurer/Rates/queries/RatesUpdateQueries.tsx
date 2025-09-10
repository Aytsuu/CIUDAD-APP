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
                amount: values.amount
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['grossSales'] });
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
                category: values.category
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['purposeRates'] });
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