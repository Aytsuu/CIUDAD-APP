import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { postWasteTruck } from "../request/truckPostReq";
import { z } from "zod";
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";

export const useAddWasteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (truckData: z.infer<typeof TruckFormSchema>) => {
      return await postWasteTruck(truckData);
    },
    onSuccess: () => {
      toast.success("Waste truck added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add waste truck", {
        description: error.message,
      });
    },
  });
};
