"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { updateScheduler } from "../restful-api/schedulerUpdateAPI";


export const useUpdateScheduler = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ss_id, meridiem } : {ss_id: number, meridiem: "AM" | "PM" }) =>
            updateScheduler(ss_id, meridiem),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedulers'] });
            toast.success("Scheduler updated successfully", {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
            })
        },
        onError: (error) => {
            console.error("Error updating scheduler: ", error);
            toast.error("Failed to update scheduler", {
                icon: <CircleX size={24} className="fill-red-500 stroke-white" />
            })
        }
    })
}