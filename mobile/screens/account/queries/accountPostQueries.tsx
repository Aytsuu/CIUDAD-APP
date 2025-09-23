import api from "@/api/api";
import { useMutation } from "@tanstack/react-query";

export const useAddPersonalModification = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post("profiling/personal/create-modification/", data);
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}