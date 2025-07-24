import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({data, type} : {
      data: Record<string, any>, 
      type: string
    }) => {
      try {
        const res = await api.put(`report/template/${type}/update/`, data)
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['reportTemplate'], (old: any[] = []) => {
        old.map((template) => {
          if(template.rte_id == updated.rte_id) {
            return {
              ...template,
              updated
            }
          }
          return template;
        })
      })
      queryClient.invalidateQueries({queryKey: ['reportTemplate']})
    }
  })
}