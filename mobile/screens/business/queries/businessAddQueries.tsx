import { api } from "@/api/api";
import { useMutation } from "@tanstack/react-query";

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
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post('profiling/business/modification/create/', data);
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}