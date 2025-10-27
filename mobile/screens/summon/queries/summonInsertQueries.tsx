import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHearingMinutes, addSummonDate, addSummonTimeSlots, addSchedule, addRemarks } from "../requestAPI/summonPostAPI";
import z from "zod"
import SummonSchema from "@/form-schema/summon-schema";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";


export const useAddSummonSchedule = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext()
    const router = useRouter()

     return useMutation({
            mutationFn: (data: {status_type: string, values: z.infer<typeof SummonSchema>}) => addSchedule(data.values, data.status_type),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
                queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
                queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
                queryClient.invalidateQueries({ queryKey: ['luponCases'] })
                queryClient.invalidateQueries({ queryKey: ['councilCases'] })
                queryClient.invalidateQueries({ queryKey: ['summonCases'] })
        
                toast.success('Record Submitted!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.")
            }
        })
}


export const useAddHearingMinutes = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext()
    const router = useRouter()

    return useMutation({
        mutationFn: async (data: {
            hs_id: string;
            sc_id: string;
            status_type: string;
            file: { name: string | undefined; type: string | undefined; file: string | undefined}[];
        }) => {
            return addHearingMinutes(data.hs_id, data.sc_id, data.status_type, data.file);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            queryClient.invalidateQueries({ queryKey: ['councilCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })

            toast.success('Hearing Minutes uploaded successfully!')
            onSuccess?.();
            router.back();
        },
        onError: (err: Error) => {
            console.error("Upload error:", err);
            toast.error( "Failed to upload documents. Please try again.")
        }
    });
}


export const useAddRemarks = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext()
    const router = useRouter()

    return useMutation({
        mutationFn: async (data: {
            hs_id: string;
            st_id: string | number;
            sc_id: string;
            remarks: string;
            close: boolean
            status_type: string;
            staff_id: string;
            files: { name: string | undefined; type: string | undefined; file: string | undefined}[];
        }) => {
            return addRemarks(data.hs_id, data.st_id, data.sc_id, data.remarks, data.close, data.status_type, data.files, data.staff_id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            queryClient.invalidateQueries({ queryKey: ['councilCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })

            toast.success('Remarks added successfully!')
            onSuccess?.();
            router.back()
        },
        onError: (err: Error) => {
            console.error("Upload error:", err);
            toast.error( "Failed to add remarks. Please try again.")
        }
    });
}


