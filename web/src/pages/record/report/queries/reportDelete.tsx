import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteARFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (arf_id: string) => {
      try {
        const res = await api.delete(`report/ar/file/${arf_id}/delete/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    }, 
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['ARInfo']});
    }
  })
}

export const useDeleteWARFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (warf_id: string) => {
      try {
        const res = await api.delete(`report/war/file/${warf_id}/delete/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    }, 
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['ARInfo']});
    }
  })
}