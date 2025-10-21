import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { addHearingMinutes, addSummonDate, addSummonTimeSlots, addSchedule, addRemarks } from "../requestAPI/summonPostAPI";
import z from "zod"
import SummonSchema from "@/form-schema/summon-schema";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";


export const useAddSummonSchedule = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

     return useMutation({
            mutationFn: (data: {status_type: string, values: z.infer<typeof SummonSchema>}) => addSchedule(data.values, data.status_type),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
                queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
                queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })


                toast.loading('Submitting Record...', {id: "createCase"});
        
                toast.success('Record Submitted!', {
                    id: "createCase",
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

export const useAddSummonDates = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (values: {newDates: string[]; oldDates: {
            sd_id: number;
            sd_is_checked: boolean;
        }[]}) => addSummonDate(values.newDates, values.oldDates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonDates'] });
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error updating dates:", err);
            toast.error(
                "Failed to update dates. Please try again.",
                { duration: 2000 }
            );
        }
    })
}

export const useAddSummonTimeSlots = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (timeSlots: Array<{
            sd_id: number;
            st_start_time: string;
            st_is_booked?: boolean;
        }>) => addSummonTimeSlots(timeSlots),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonTimeSlots'] });
            onSuccess?.();
            toast.success("Time slots saved successfully", { duration: 2000 });
        },
        onError: (err) => {
            console.error("Error saving time slots:", err);
            toast.error(
                "Failed to save time slots. Please try again.",
                { duration: 2000 }
            );
        }
    });
}


export const useAddHearingMinutes = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            hs_id: string;
            sc_id: string;
            status_type: string;
            file: { name: string; type: string; file: string | undefined}[];
        }) => {
            return addHearingMinutes(data.hs_id, data.sc_id, data.status_type, data.file);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })

            showSuccessToast('Hearing Minutes uploaded successfully!')
            onSuccess?.();
        },
        onError: (err: Error) => {
            console.error("Upload error:", err);
            showErrorToast( "Failed to upload documents. Please try again.")
        }
    });
}


export const useAddRemarks = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            hs_id: string;
            st_id: string | number;
            sc_id: string;
            remarks: string;
            close: boolean
            status_type: string;
            files: { name: string; type: string; file: string | undefined}[];
            staff_id: string;
        }) => {
            return addRemarks(data.hs_id, data.st_id, data.sc_id, data.remarks, data.close, data.status_type, data.files, data.staff_id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })

            showSuccessToast('Remarks added successfully!')
            onSuccess?.();
        },
        onError: (err: Error) => {
            console.error("Upload error:", err);
            showErrorToast( "Failed to add remarks. Please try again.")
        }
    });
}
















// export const useAddSuppDoc = (onSuccess?: () => void) => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: async (data: {
//             ss_id: string;
//             sr_id: string;
//             file: { name: string; type: string; file: string | undefined}[];
//             reason: string;
//         }) => {
//             return addSuppDoc(data.ss_id, data.sr_id,  data.file, data.reason);
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['serviceChargeDetails'] });

//             showSuccessToast('Documents uploaded successfully!')
//             onSuccess?.();
//         },
//         onError: (err: Error) => {
//             console.error("Upload error:", err);
//             showErrorToast( "Failed to upload documents. Please try again.")
//         }
//     });
// }

