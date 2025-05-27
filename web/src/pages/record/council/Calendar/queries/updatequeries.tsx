import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putEvent_meetingreq } from "../api/putreq";
import { CouncilEventInfo } from "./addqueries";

export type EventInfo = {
    ce_id: number,
    ce_title: string,
    ce_date: string,
    ce_place: string,
    ce_type: string,
    ce_time: string,
    ce_description: string,
    staff: string[],
}

export const useUpdateCouncilEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ce_id,
      eventData,
    }: {
      ce_id: number;
      eventData: Partial<CouncilEventInfo>;
    }) => putEvent_meetingreq(ce_id, eventData),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["councilEvent"] });
      const previousEntry = queryClient.getQueryData<CouncilEventInfo[]>([
        "councilEvent",
      ]);

      queryClient.setQueryData<EventInfo[]>(["councilEvent"], (old = []) =>
        old.map((t: EventInfo) =>
          t.ce_id === variables.ce_id
            ? { ...t, ...variables.eventData }
            : t
        )
      );

      return { previousEntry };
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(["councilEvent"], context.previousEntry);
      }
      toast.error("Failed to update schedule", {
        description: error.message,
        duration: 2000,
      });
    },
    onSuccess: (updatedData, variables) => {
      toast.success("Schedule updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["councilEvent"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["councilEvent"] });
    },
  });
};