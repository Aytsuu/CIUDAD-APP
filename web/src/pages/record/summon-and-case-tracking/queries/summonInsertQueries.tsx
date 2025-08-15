import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { addCaseActivity, addSuppDoc, addSummonDate, addSummonTimeSlots } from "../requestAPI/summonPostAPI";
import z from "zod"
import SummonSchema from "@/form-schema/summon-schema";
import { MediaUploadType } from "@/components/ui/media-upload";

export const useAddCaseActivity = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

     return useMutation({
            mutationFn: (values: z.infer<typeof SummonSchema>) => addCaseActivity(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['caseDetails'] });

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

export const useAddSuppDoc = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: { 
            ca_id: string; 
            description: string;
            media: MediaUploadType[number];
        }) => addSuppDoc(values.ca_id, values.media, values.description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppDocs'] });
            toast.success('Document added successfully!', {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error adding document:", err);
            toast.error(
                "Failed to add document. Please try again.",
                { duration: 2000 }
            );
        }
    });
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
            st_end_time: string;
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