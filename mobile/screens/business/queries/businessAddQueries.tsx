import { api } from "@/api/api";
import { useMutation } from "@tanstack/react-query";

export const useAddBusiness = () => {
  return useMutation({
    mutationFn: async ({data, signal} :  {
      data: Record<string, any>
      signal?: AbortSignal 
    }) => {
      try {
        const res = await api.post('profiling/business/create/', data, {
          signal
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}