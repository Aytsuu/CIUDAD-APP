import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { wasteColData } from "../request/wasteColPostRequest";
import WasteColSchedSchema from "@/form-schema/waste-col-form-schema";
import { addAssCollector } from "../request/wasteColPostRequest";

type ExtendedWasteColSchema = z.infer<typeof WasteColSchedSchema> & {
  staff: string;
};


export const useCreateWasteSchedule = (onSuccess?: (wc_num: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ExtendedWasteColSchema) =>
      wasteColData(values),
    onSuccess: (wc_num) => {
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      toast.success("Waste collection scheduled successfully", {
        id: "createWaste",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 4000
      });
      if (onSuccess) onSuccess(wc_num);
    },
    onError: (err) => {
      console.error("Error creating schedule:", err);
      toast.error("Failed to create schedule.");
    }
  });
};


export const useAssignCollectors = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wc_num, collectorIds }: { wc_num: number, collectorIds: string[] }) => {
      await Promise.all(
        collectorIds.map(collectorId => 
          addAssCollector(wc_num, collectorId)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      toast.success("Collectors assigned successfully", {
        id: "createWaste",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 3000
      });
    },
    onError: (err) => {
      console.error("Error assigning collectors:", err);
      toast.error("Failed to assign collectors.");
    }
  });
};



