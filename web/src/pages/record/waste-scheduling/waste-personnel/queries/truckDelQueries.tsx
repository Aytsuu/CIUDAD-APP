import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { delWasteTruck, restoreWasteTruck } from "../request/truckDelReq";
import { WasteTruck } from "../waste-personnel-types";

// Hook for deleting/archiving Waste Truck
export const useDeleteWasteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ truck_id, permanent = false }: { truck_id: number; permanent?: boolean }) => 
      delWasteTruck(truck_id, permanent),
    onMutate: async ({ truck_id, permanent }) => {
      await queryClient.cancelQueries({ queryKey: ['wasteTrucks'] });
      const previousTrucks = queryClient.getQueryData<WasteTruck[]>(['wasteTrucks']);
      
      if (permanent) {
        // Remove from cache if permanent delete
        queryClient.setQueryData<WasteTruck[]>(["wasteTrucks"], (old = []) => 
          old.filter((truck: WasteTruck) => truck.truck_id !== truck_id)
        );
      } else {
        // Update archive status in cache for soft delete
        queryClient.setQueryData<WasteTruck[]>(["wasteTrucks"], (old = []) => 
          old.map((truck: WasteTruck) => 
            truck.truck_id === truck_id ? { ...truck, truck_is_archive: true } : truck
          )
        );
      }

      return { previousTrucks };
    },
    onError: (error: Error, { truck_id }, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      toast.error("Failed to process waste truck", { 
        description: error.message, 
        duration: 2000 
      });
    },
    onSuccess: (_, { truck_id, permanent }) => {
      toast.success(`Waste truck ${permanent ? "deleted" : "archived"} successfully`, {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wasteTrucks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteTrucks'] });
    }
  });
};

export const useRestoreWasteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (truck_id: number) => restoreWasteTruck(truck_id),
    onMutate: async (truck_id) => {
      await queryClient.cancelQueries({ queryKey: ['wasteTrucks'] });
      const previousTrucks = queryClient.getQueryData<WasteTruck[]>(['wasteTrucks']);
      
      queryClient.setQueryData<WasteTruck[]>(["wasteTrucks"], (old = []) => 
        old.map((truck: WasteTruck) => 
          truck.truck_id === truck_id ? { ...truck, truck_is_archive: false } : truck
        )
      );

      return { previousTrucks };
    },
    onError: (error: Error, truck_id, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      toast.error("Failed to restore waste truck", { 
        description: error.message, 
        duration: 2000 
      });
    },
    onSuccess: (_, truck_id) => {
      toast.success("Waste truck restored successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["wasteTrucks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteTrucks'] });
    }
  });
};