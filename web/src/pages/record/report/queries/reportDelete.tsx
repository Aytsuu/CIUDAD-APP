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
        console.error(err);
        throw err;
      }
    }, 
    onSuccess: (_data, variables) => {
      const arf_id  = variables;
      queryClient.setQueryData(['ARInfo'], (old: any) => ({
        ...old,
        ar_files: old.ar_files.filter((file: any) => file.arf_id !== arf_id)
      }))
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
        console.error(err);
        throw err;
      }
    }, 
    onSuccess: (_data, variables) => {
      const warf_id  = variables;
      queryClient.setQueryData(['WARInfo'], (old: any) => ({
        ...old,
        war_files: old.war_files.filter((file: any) => file.warf_id !== warf_id)
      }))
      queryClient.invalidateQueries({queryKey: ['ARInfo']});
    }
  })
}