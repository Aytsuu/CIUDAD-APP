import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import {z} from "zod";
import { editAnnualGrossSales, editPurposeAndRate } from "../restful-API/RatesPutAPI";
import { AnnualGrossSalesEditSchema, PurposeAndRatesEditSchema } from "@/form-schema/treasurer/rates-edit-form-schema";


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
        
                toast.success('Record Updated!', {
                    id: "editGrossSales",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error(
                    "Failed to submit record. Please check the input data and try again.",
                    { duration: 2000 }
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
                toast.success('Record Updated!', {
                    id: "editPurposeRates",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error(
                    "Failed to submit record. Please check the input data and try again.",
                    { duration: 2000 }
                );
            }
        })
}