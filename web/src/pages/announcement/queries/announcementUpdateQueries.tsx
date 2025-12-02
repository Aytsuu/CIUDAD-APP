import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ann, data} : {
      ann: string
      data: Record<string, any>
    }) => {
      try {
        const res = await api.patch(`announcement/${+ann}/update/`, data)
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements']})
    }
  })
}