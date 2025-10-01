import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { delWasteTruck, restoreWasteTruck } from "../request/truckDelReq";
import { WasteTruck } from "../waste-personnel-types";

export const useDeleteWasteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ truck_id, permanent = false }: { truck_id: number; permanent?: boolean }) => 
      delWasteTruck(truck_id, permanent),
    onMutate: async ({ truck_id, permanent }) => {
      await queryClient.cancelQueries({ queryKey: ['wasteTrucks'] });
      const previousTrucks = queryClient.getQueryData<WasteTruck[]>(['wasteTrucks']);
      
      if (permanent) {
        queryClient.setQueryData<WasteTruck[]>(["wasteTrucks"], (old = []) => 
          old.filter((truck: WasteTruck) => truck.truck_id !== truck_id)
        );
      } else {
        queryClient.setQueryData<WasteTruck[]>(["wasteTrucks"], (old = []) => 
          old.map((truck: WasteTruck) => 
            truck.truck_id === truck_id ? { ...truck, truck_is_archive: true } : truck
          )
        );
      }

      return { previousTrucks };
    },
    onError: (error: Error, _truck_id , context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      toast.error("Failed to process waste truck", { 
        description: error.message, 
        duration: 2000 
      });
    },
    onSuccess: (_, { permanent }) => {
      toast.success(`Truck ${permanent ? "deleted" : "marked as disposed"} successfully`, {
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
    onError: (error: Error, _truck_id, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      toast.error("Failed to restore waste truck", { 
        description: error.message, 
        duration: 2000 
      });
    },
    onSuccess: (_, _truck_id) => {
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