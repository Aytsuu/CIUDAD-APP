import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateIR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
      ir_id,
    }: {
      data: Record<string, any>;
      ir_id: string;
    }) => {
      try {
        const res = await api.patch(`report/ir/${ir_id}/update/`, data);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (newData, variables) => {
      // Optimistic updates
      const {ir_id} = variables
      queryClient.invalidateQueries({queryKey: ['incidentReports']})
      queryClient.invalidateQueries({queryKey: ['IRInfo']})
      queryClient.setQueryData(['IRInfo', ir_id], (old: any) => ({
        ...old,
        ...newData
      }))
    }
  });
};