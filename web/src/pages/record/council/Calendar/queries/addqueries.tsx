import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { postEvent_meetingreq } from "../api/postreq";
import { z } from "zod";
import AddEventFormSchema from "@/form-schema/council/addevent-schema.ts";


export type CouncilEventInfo = {
    ce_id: number,
    ce_title: string,
    ce_date: string,
    ce_place: string,
    ce_type: string,
    ce_time: string,
    ce_description: string,
    staff: string,
}

export const useAddCouncilEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: z.infer<typeof AddEventFormSchema>) => {
      return await postEvent_meetingreq(eventData);
    },
    onSuccess: () => {
      toast.success("Schedule added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["councilEvent"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add schedule", {
        description: error.message,
      });
    },
  });
};