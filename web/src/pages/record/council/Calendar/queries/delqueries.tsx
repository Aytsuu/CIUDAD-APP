import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { delEvent_meetingreq } from "../api/delreq";

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

export const useDeleteCouncilEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ce_id: number) => delEvent_meetingreq(ce_id),
    onMutate: async (ce_id) => {
      await queryClient.cancelQueries({ queryKey: ['councilEvent'] });
      const previousEntry = queryClient.getQueryData<CouncilEventInfo[]>(['councilEvent']);
      queryClient.setQueryData<CouncilEventInfo[]>(["councilEvent"], (old = []) => 
  old.filter((truck: CouncilEventInfo) => truck.ce_id !== ce_id)
);

      return { previousEntry };
    },
    onError: (error: Error, ce_id, context) => {
      if (context?.previousEntry) {
        queryClient.setQueryData(['councilEvent'], context.previousEntry);
      }
      toast.error("Failed to delete schedule", { description: error.message, duration: 2000 });
    },
    onSuccess: (_, ce_id) => {
      toast.success("Schedule deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["councilEvent"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['councilEvent'] });
    }
  });
};