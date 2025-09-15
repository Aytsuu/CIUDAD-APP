import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateComplaint } from "../restful-api/complaint-api";

export const useUpdateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ compId, payload }: { compId: number; payload: any }) =>
      updateComplaint(compId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },

    onError: (error: any) => {
      console.error("Failed to update complaint:", error);
    },
  });
};