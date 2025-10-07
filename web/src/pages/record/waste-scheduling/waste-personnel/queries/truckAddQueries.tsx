import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
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
      showSuccessToast("Waste truck added successfully");
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
    onError: () => {
      showErrorToast("Failed to add waste truck");
    },
  });
};