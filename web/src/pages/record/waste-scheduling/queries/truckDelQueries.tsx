import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { delWasteTruck} from "../request/truckDelReq";

// Type definitions
export type WastePersonnel = {
  wstp_id: number;
  // staff_id: number;
};

export type WasteTruck = {
  truck_id: number;
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status: string;
  truck_last_maint: string;
  // staff_id: number;
};

// Hook for deleting Waste Truck
export const useDeleteWasteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (truck_id: number) => delWasteTruck(truck_id),
    onMutate: async (truck_id) => {
      await queryClient.cancelQueries({ queryKey: ['wasteTrucks'] });
      const previousTrucks = queryClient.getQueryData<WasteTruck[]>(['wasteTrucks']);
      queryClient.setQueryData<WasteTruck[]>(["wasteTrucks"], (old = []) => 
  old.filter((truck: WasteTruck) => truck.truck_id !== truck_id)
);

      return { previousTrucks };
    },
    onError: (error: Error, truck_id, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      toast.error("Failed to delete waste truck", { description: error.message, duration: 2000 });
    },
    onSuccess: (_, truck_id) => {
      toast.success("Waste truck deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
    }
  });
};