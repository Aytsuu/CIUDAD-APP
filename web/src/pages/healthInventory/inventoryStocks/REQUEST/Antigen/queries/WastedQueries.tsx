// Updated useHandleWaste hook with proper async handling
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleVaccineWasteAPI, handleSupplyWasteAPI } from "../restful-api/WastedAPI";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useHandleWaste = () => {
  const queryClient = useQueryClient();

  const handleVaccineWaste = async (record: any, data: any) => {
    if (!record.vacStck_id) {
      throw new Error("Missing vaccine stock ID");
    }

    const response = await handleVaccineWasteAPI(record.vacStck_id, data);
    return response;
  };

  const handleSupplyWaste = async (record: any, data: { wastedAmount: number; staff_id?: string }) => {
    if (!record.imzStck_id) {
      throw new Error("Missing supply stock ID");
    }
    const response = await handleSupplyWasteAPI(record.imzStck_id, data);
    return response;
  };

  const vaccineWasteMutation = useMutation({
    mutationFn: async ({ record, data }: { record: any; data: { wastedAmount: number; staff_id?: string } }) => {
      return handleVaccineWaste(record, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["vaccine_stocks"] });
      queryClient.invalidateQueries({ queryKey: ["waste_records"] });
      showSuccessToast("Recorded successfully");
    },
    onError: (error: any) => {
      showErrorToast(error.message || "Failed to deduct medicine");
    }
  });

  const supplyWasteMutation = useMutation({
    mutationFn: async ({ record, data }: { record: any; data: { wastedAmount: number; staff_id?: string } }) => {
      return handleSupplyWaste(record, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["supply_stocks"] });
      queryClient.invalidateQueries({ queryKey: ["waste_records"] });
      showSuccessToast("Recorded successfully");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to record wasted stock";
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
