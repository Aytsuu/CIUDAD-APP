import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { postWasteTruck } from "../request/truckPostReq";
import { z } from "zod"; // Add this import
import TruckFormSchema from "@/form-schema/waste-truck-form-schema";

// Type definitions
export type WastePersonnelInput = {
  wstp_id?: number;
  // staff_id: number;
};

export type WasteTruckInput = {
  truck_plate_num: string;
  truck_model: string;
  truck_capacity: number;
  truck_status?: string;
  truck_last_maint: string;
  // staff_id: number;
};

export const useAddWasteTruck = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (truckData: z.infer<typeof TruckFormSchema>) => {
      const payload = {
        ...truckData,
        truck_capacity: Number(truckData.truck_capacity),
        truck_status: truckData.truck_status || "Operational",
      };

      const response = await fetch('/waste/waste-trucks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add truck');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Waste truck added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      queryClient.invalidateQueries({ queryKey: ["wasteTrucks"] });
      navigate("/waste-personnel/");
    },
    onError: (error: Error) => {
      toast.error("Failed to add waste truck", { description: error.message });
    },
  });
}
