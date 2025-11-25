import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
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
    onError: (_error: Error, _truck_id , context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      showErrorToast("Failed to process waste truck");
    },
    onSuccess: (_, { permanent }) => {
      showSuccessToast(`Truck ${permanent ? "deleted" : "marked as disposed"} successfully`);
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
    onError: (_error: Error, _truck_id, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(['wasteTrucks'], context.previousTrucks);
      }
      showErrorToast("Failed to restore waste truck");
    },
    onSuccess: (_, _truck_id) => {
      showSuccessToast("Waste truck restored successfully");
      queryClient.invalidateQueries({ queryKey: ["wasteTrucks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteTrucks'] });
    }
  });
};