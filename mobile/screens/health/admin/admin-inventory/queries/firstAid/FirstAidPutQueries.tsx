import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFirstAid } from "../../restful-api/firstAid/FirstAidPutAPI";
import { FirstAidType } from "@/form-schema/inventory/lists/inventoryListSchema";

export const useUpdateFirstAid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({fa_id,data,}: {
      fa_id: string; data: FirstAidType; }) => updateFirstAid(fa_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
    },
    onError: (error) => {
      console.error("Error updating medicine:", error);
    },
  });
  
};
