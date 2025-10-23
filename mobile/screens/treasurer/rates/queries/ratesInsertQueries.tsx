import { useMutation, useQueryClient } from "@tanstack/react-query";
import {z} from "zod";
import { addAnnualGrossSales, addPurposeAndRate } from "../restful-API/ratesPostAPI";
import { AnnualGrossSalesSchema, PurposeAndRatesSchema } from "@/form-schema/rates-form-schema";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";

export const useAddAnnualGrossSales = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();
        const router = useRouter();

        return useMutation({
            mutationFn: (values: z.infer<typeof AnnualGrossSalesSchema>) => 
            addAnnualGrossSales(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['grossSalesActive'] });
                queryClient.invalidateQueries({ queryKey: ['allGrossSales'] });
                
                toast.success('Record Submitted!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.");
            }
        })
}

export const useAddPurposeAndRate = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();
        const router = useRouter();

        return useMutation({
            mutationFn: (values: z.infer<typeof PurposeAndRatesSchema>) => 
                addPurposeAndRate(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['purposeRates']});

                toast.success('Record Submitted!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.");
            }
        })
}

