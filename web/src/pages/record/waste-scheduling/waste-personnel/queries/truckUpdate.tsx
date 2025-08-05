import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putWasteTruck } from "../request/truckPutReq";
import { WasteTruck, Truck } from "../waste-personnel-types";

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

      queryClient.setQueryData<Truck[]>(["trucks"], (old = []) =>
        old.map((t: Truck) =>
          t.truck_id === variables.truck_id
            ? { ...t, ...variables.truckData }
            : t
        )
      );

      return { previousTrucks };
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousTrucks) {
        queryClient.setQueryData(["wasteTrucks"], context.previousTrucks);
      }
      toast.error("Failed to update truck", {
        description: error.message,
        duration: 2000,
      });
    },
    onSuccess: (updatedData, variables) => {
      toast.success("Truck updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
    },
  });
};
