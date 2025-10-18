import { useMutation, useQueryClient } from "@tanstack/react-query";
import {z} from "zod";
import { editAnnualGrossSales, editPurposeAndRate } from "../restful-API/ratesPutAPI";
import { AnnualGrossSalesEditSchema, PurposeAndRatesEditSchema } from "@/form-schema/rates-form-schema";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";


export const useEditAnnualGrossSales = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();
        const router = useRouter();

        return useMutation({
            mutationFn: (values: z.infer<typeof AnnualGrossSalesEditSchema>) => 
            editAnnualGrossSales(values.ags_id, { 
                minRange: values.minRange,
                maxRange: values.maxRange,
                amount: values.amount
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['grossSalesActive'] });
                queryClient.invalidateQueries({ queryKey: ['allGrossSales'] });
        
                toast.success('Record Updated!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.")
            }
        })
}

export const useEditPurposeAndRate = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();
        const router = useRouter();

        return useMutation({
            mutationFn: (values: z.infer<typeof PurposeAndRatesEditSchema>) => 
            editPurposeAndRate(values.pr_id, { 
                purpose: values.purpose,
                amount: values.amount,
                category: values.category
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['personalActive']});
                queryClient.invalidateQueries({ queryKey: ['allPersonal']});
                queryClient.invalidateQueries({ queryKey: ['serviceChargeActive']});
                queryClient.invalidateQueries({ queryKey: ['allServiceCharge']});
                queryClient.invalidateQueries({ queryKey: ['barangayPermitActive']});
                queryClient.invalidateQueries({ queryKey: ['allBarangayPermit']});
        
                toast.success('Record Updated!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.",)
            }
        })
}