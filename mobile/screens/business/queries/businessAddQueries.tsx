import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useAddBusiness = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post('profiling/business/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}

export const useAddBusinessModification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post('profiling/business/modification/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    }, 
    onSuccess: (newData) => {
      queryClient.setQueryData(['modificationRequests'], (old: any[] = []) => [
        ...old,
        newData
      ])
      queryClient.invalidateQueries({queryKey: ['modificationRequests']})
    }
  })
}