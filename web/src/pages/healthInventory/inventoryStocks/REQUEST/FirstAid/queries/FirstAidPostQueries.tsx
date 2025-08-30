// src/services/firstAid/hooks/useFirstAidMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFirstAidStock } from "../restful-api/FirstAidPostAPI";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useSubmitFirstAidStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      console.log("Data being submitted:", data);
      
      const fa_id = data.fa_id?.trim();
      if (!fa_id) {
        throw new Error("Invalid first aid item selection: fa_id is required and cannot be empty");
      }

      const atomicData = { ...data, fa_id };

      // Single API call handles all three operations atomically
      const result = await createFirstAidStock(atomicData);
      return result;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
      queryClient.invalidateQueries({ queryKey: ["inventorylist"] });
      
      navigate(-1);
      showSuccessToast("Added successfully");
      
      console.log("Created records:", data.data);
    },
    onError: (error) => {
      console.error("Failed to add first aid stock:", error);
      showErrorToast(error.message || "Failed to Add");
    },
  });
};