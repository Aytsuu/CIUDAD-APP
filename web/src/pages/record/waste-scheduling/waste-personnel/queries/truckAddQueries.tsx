import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { postWasteTruck } from "../request/truckPostReq";
import { z } from "zod";
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";

// Type definitions
export type WastePersonnelInput = {
  wstp_id?: number;
  // staff_id: number;
};

export type WasteTruckInput = {
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: string;
  truck_status?: string;
  truck_last_maint: string;
};

export const useAddWasteTruck = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (truckData: z.infer<typeof TruckFormSchema>) => {
      // You can just pass truckData directly if postWasteTruck handles formatting
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
