import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addFirstAid } from "../../restful-api/firstAid/FirstAidPostAPI";
import { FirstAidType } from "@/form-schema/inventory/lists/inventoryListSchema";


export const useAddFirstAid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FirstAidType) => addFirstAid(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
    },
  });
};
