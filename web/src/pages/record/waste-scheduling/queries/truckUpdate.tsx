import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putWasteTruck } from "../request/truckPutReq";
import { WasteTruck } from "./truckDelQueries";

export type Truck = {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: number;
  truck_status: string;
  truck_last_maint: string;
  // staff_id?: number;
};

export const useUpdateWasteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ truck_id, truckData }: { truck_id: number; truckData: Partial<WasteTruck> }) =>
      putWasteTruck(truck_id, truckData),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['wasteTrucks'] });
      const previousTrucks = queryClient.getQueryData<WasteTruck[]>(['wasteTrucks']);

      queryClient.setQueryData<Truck[]>(["trucks"], (old = []) => 
  old.map((t: Truck) => t.truck_id === variables.truck_id ? { ...t, ...updatedData } : t)
);

      return { previousTrucks };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      toast.error("Failed to update truck", { description: error.message, duration: 2000 });
    },
    onSuccess: (updatedData, variables) => {
      toast.success("Truck updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ['wasteTrucks'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteTrucks'] });
    }
  });
};