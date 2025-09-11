import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFirstAid } from "../../restful-api/firstAid/FirstAidPutAPI";

export const useUpdateFirstAid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { fa_id: string; data: Record<string, any> }) => {
      return await updateFirstAid(params.fa_id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
    },
    onError: (error: any) => {
      console.error("Error updating first aid:", error);
      throw error;
    }
  });
};
