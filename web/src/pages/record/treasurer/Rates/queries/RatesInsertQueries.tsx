import { useMutation, useQueryClient } from "@tanstack/react-query";
import {z} from "zod";
import { addAnnualGrossSales, addPurposeAndRate } from "../restful-API/RatesPostAPI";
import { AnnualGrossSalesSchema, PurposeAndRatesSchema } from "@/form-schema/treasurer/rates-form-schema";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";

export const useAddAnnualGrossSales = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof AnnualGrossSalesSchema>) => 
            addAnnualGrossSales(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['grossSales'] });

                showSuccessToast('Record Submitted!')
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                showErrorToast("Failed to submit record. Please check the input data and try again.")
            }
        })
}

export const useAddPurposeAndRate = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof PurposeAndRatesSchema>) => 
                addPurposeAndRate(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['purposeRates']});        
                showSuccessToast('Record Submitted!')
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                showErrorToast("Failed to submit record. Please check the input data and try again.")
            }
        })
}

