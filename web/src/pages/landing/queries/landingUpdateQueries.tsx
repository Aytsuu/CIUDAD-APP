import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateLandingPage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.patch(`landing/update/1/`, data)
        return res.data;
      } catch (err) {
        console.error(err)
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingData'] })
    }
  })
}