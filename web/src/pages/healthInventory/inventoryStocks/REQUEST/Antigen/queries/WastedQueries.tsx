// Updated useHandleWaste hook with proper async handling
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleVaccineWasteAPI, handleSupplyWasteAPI } from "../restful-api/WastedAPI";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useHandleWaste = () => {
  const queryClient = useQueryClient();

  const handleVaccineWaste = async (record: any, data: any) => {
    if (!record.vacStck_id) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Missing vaccine stock ID");
      }
      return;
    }

    const response = await handleVaccineWasteAPI(record.vacStck_id, data);
    return response;
  };

  const handleSupplyWaste = async (record: any, data: { wastedAmount: number; staff_id?: string; action_type: string }) => {
    if (!record.imzStck_id) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Missing supply stock ID");
      }
      return;
    }
    const response = await handleSupplyWasteAPI(record.imzStck_id, data);
    return response;
  };

  const vaccineWasteMutation = useMutation({
    mutationFn: async ({ record, data }: { record: any; data: { wastedAmount: number; staff_id?: string; action_type: string } }) => {
      return handleVaccineWaste(record, data);
    },
    onSuccess: ( variables) => {
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["vaccine_stocks"] });
      queryClient.invalidateQueries({ queryKey: ["waste_records"] });
      
      const actionType = variables.data.action_type;
      const message = actionType === "administered" 
        ? "Successfully recorded administered doses" 
        : "Successfully recorded wasted doses";
      showSuccessToast(message);
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      showErrorToast(error.message || "Failed to process vaccine");
    }
  });

  const supplyWasteMutation = useMutation({
    mutationFn: async ({ record, data }: { record: any; data: { wastedAmount: number; staff_id?: string; action_type: string } }) => {
      return handleSupplyWaste(record, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["supply_stocks"] });
      queryClient.invalidateQueries({ queryKey: ["waste_records"] });
      
      // const actionType = variables.data.action_type;
     
      showSuccessToast("Successfully recorded ");
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      const errorMessage = error?.response?.data?.message || "Failed to process supply";
      showErrorToast(errorMessage);
    }
  });

  return {
    // Return mutateAsync for proper promise handling
    handleVaccineWaste: vaccineWasteMutation.mutateAsync,
    handleSupplyWaste: supplyWasteMutation.mutateAsync,
    vaccineWasteMutation,
    supplyWasteMutation
  };
};