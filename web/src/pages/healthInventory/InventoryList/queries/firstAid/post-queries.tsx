import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addFirstAid } from "../../restful-api/firstAid/FirstAidPostAPI";
import { FirstAidType } from "@/form-schema/inventory/lists/inventoryListSchema";

export const useAddFirstAid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { data: FirstAidType }) => {
      return await addFirstAid(params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
    },
    onError: (error: any) => {
      console.error("Error adding first aid:", error);
      throw error; // Re-throw to be caught in the component
    },
  });
};
