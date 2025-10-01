import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import {z} from "zod";
import { addAnnualGrossSales, addPurposeAndRate } from "../restful-API/RatesPostAPI";
import { AnnualGrossSalesSchema, PurposeAndRatesSchema } from "@/form-schema/treasurer/rates-form-schema";

export const useAddAnnualGrossSales = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof AnnualGrossSalesSchema>) => 
            addAnnualGrossSales(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['grossSalesActive'] });
                queryClient.invalidateQueries({ queryKey: ['allGrossSales'] });

                toast.loading('Submitting Record...', {id: "addGrossSales"});
        
                toast.success('Record Submitted!', {
                    id: "addGrossSales",
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

export const useAddPurposeAndRate = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof PurposeAndRatesSchema>) => 
                addPurposeAndRate(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['personalActive']});
                queryClient.invalidateQueries({ queryKey: ['allPersonal']});
                queryClient.invalidateQueries({ queryKey: ['serviceChargeActive']});
                queryClient.invalidateQueries({ queryKey: ['allServiceCharge']});
                queryClient.invalidateQueries({ queryKey: ['businessPermitActive']});
                queryClient.invalidateQueries({ queryKey: ['allBusinessPermit']});

                toast.loading('Submitting Record...', {id: "addPurposeRate"});
        
                toast.success('Record Submitted!', {
                    id: "addPurposeRate",
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

