import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useUpdateTemplate = () => {
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
    }
  })
}