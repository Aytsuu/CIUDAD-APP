import { api } from "@/api/api";
import { useMutation } from "@tanstack/react-query";

export const useAddBusiness = () => {
  return useMutation({
    mutationFn: async ({data} :  {
      data: Record<string, any>
    }) => {
      try {
        const res = await api.post('profiling/business/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}