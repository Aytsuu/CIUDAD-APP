import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { putWasteTruck } from "../request/truckPutReq";
import { WasteTruck, Trucks } from "../waste-personnel-types";

export const useUpdateWasteTruck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      truck_id,
      truckData,
    }: {
      truck_id: number;
      truckData: Partial<WasteTruck>;
    }) => putWasteTruck(truck_id, truckData),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["wasteTrucks"] });
      const previousTrucks = queryClient.getQueryData<WasteTruck[]>([
        "wasteTrucks",
      ]);

      queryClient.setQueryData<Trucks[]>(["trucks"], (old = []) =>
        old.map((t: Trucks) =>
          t.truck_id === variables.truck_id
            ? { ...t, ...variables.truckData }
            : t
        )
      );

      return { previousTrucks };
    },

    onError: (_error: Error, _variables, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(["wasteTrucks"], context.previousTrucks);
      }
      showErrorToast("Failed to update truck");
    },
    onSuccess: (_updatedData, _variables) => {
      showSuccessToast("Truck updated successfully");
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
};