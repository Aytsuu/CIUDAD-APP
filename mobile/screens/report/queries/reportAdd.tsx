import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useAddIncidentReport = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post('report/ir/create/', data);
        return res.data;
      } catch (err) {
        console.log(err)
        throw err;
      }
    }
  })
}