import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useUpdateAR = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({data, ar_id} : {
      data: Record<string, any>, 
      ar_id: string
    }) => {
      try {
        const res = await api.patch(`report/ar/${ar_id}/update/`, data)
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['ARInfo'], (old: any) => ({
        ...old,
        status: updated.ar_status
      }))
      queryClient.invalidateQueries({queryKey: ['ARInfo']})
    }
  })
}

export const useUpdateWAR = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({data, war_id} : {
      data: Record<string, any>, 
      war_id: string
    }) => {
      try {
        const res = await api.patch(`report/war/${war_id}/update/`, data)
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['WARInfo'], (old: any) => ({
        ...old,
        status: updated.war_status
      }))
      queryClient.invalidateQueries({queryKey: ['WARInfo']});
    }
  })
}

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({data, type} : {
      data: Record<string, any>, 
      type: string
    }) => {
      try {
        const res = await api.patch(`report/template/${type}/update/`, data)
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