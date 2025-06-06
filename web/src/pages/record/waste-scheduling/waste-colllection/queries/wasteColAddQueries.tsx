import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { wasteColData } from "../request/wasteColPostRequest";
import { wasteAssData } from "../request/wasteColPostRequest";
import WasteColSchedSchema from "@/form-schema/waste-col-form-schema";



export const useCreateWasteSchedule = (onSuccess?: (wc_num: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: z.infer<typeof WasteColSchedSchema>) =>
      wasteColData(values),
    onSuccess: (wc_num) => {
      queryClient.invalidateQueries({ queryKey: ['wasteColData'] });

      toast.success("Waste collection scheduled successfully", {
        id: "createSchedule",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000
      });

      if (onSuccess) onSuccess(wc_num);
    },
    onError: (err) => {
      console.error("Error creating schedule:", err);
      toast.error("Failed to create schedule. Please try again.");
    }
  });
};



export const useCreateWasteAssignment = () => {
  return useMutation({
    mutationFn: (data: any) => wasteAssData(data),
    onSuccess: () => {
      toast.success("Waste collection assigned successfully", {
        icon: "✅",
        duration: 6000
      });
    },
    onError: (err) => {
      console.error("Error creating assignment:", err);
      toast.error("Failed to create assignment.");
    }
  });
};
